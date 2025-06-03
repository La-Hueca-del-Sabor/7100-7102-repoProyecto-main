require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3002;

// Configuración de PostgreSQL local
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: 'host.docker.internal',
    database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
    password: process.env.POSTGRES_PASSWORD || 'Shadin2001',
    port: 5432,
});

// Verifica conexión con PostgreSQL
(async () => {
    try {
        const res = await pool.query('SELECT username FROM public.usuarios');
        console.log('✅ Nombres de usuarios:', res.rows.map(u => u.username));
    } catch (error) {
        console.error('❌ Error al obtener nombres de usuarios:', error.message);
    }
})();

app.get('/db-health', async (req, res) => {
    try {
        const result = await pool.query('SELECT username FROM public.usuarios');
        res.status(200).json(result.rows.map(u => u.username));
    } catch (err) {
        res.status(500).json({ status: 'DB Error', error: err.message });
    }
});


// Configuración de Kafka
const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: ['localhost:9092']
});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Endpoint de login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
        }

        // Buscar usuario por correo y obtener rol
        const userResult = await pool.query(
            `SELECT u.id, u.password_hash, u.role_id, r.nombre as role_name
             FROM public.usuarios u
             JOIN public.roles r ON u.role_id = r.id
             WHERE u.correo = $1`, [email]
        );

        if (!userResult.rows.length) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const normalizedRoleName = user.role_name?.toLowerCase() || '';
        let perfil = null;

        // Obtener perfil correspondiente según el rol
        const perfilTabla = {
            gerente: 'gerencia_perfiles',
            mesero: 'mesero_perfiles',
            cocina: 'cocina_perfiles',
            caja: 'caja_perfiles'
        }[normalizedRoleName];

        if (perfilTabla) {
            const perfilResult = await pool.query(
                `SELECT * FROM public.${perfilTabla} WHERE usuario_id = $1`, [user.id]
            );
            perfil = perfilResult.rows[0] || null;
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role_id, roleName: normalizedRoleName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Emitir evento Kafka (no debe romper el login si falla)
        try {
            const producer = kafka.producer();
            await producer.connect();
            await producer.send({
                topic: 'auth-events',
                messages: [{
                    value: JSON.stringify({
                        userId: user.id,
                        eventType: 'LOGIN',
                        timestamp: new Date().toISOString()
                    })
                }]
            });
            await producer.disconnect();
        } catch (kafkaError) {
            console.error('❌ Error al enviar evento a Kafka:', kafkaError.message);
            // No lanzar error, solo loguear
        }

        res.json({ token, perfil, role: user.role_id, roleName: normalizedRoleName });
    } catch (error) {
        console.error('❌ Error en el proceso de login:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servicio de autenticación ejecutándose en el puerto ${port}`);
});
