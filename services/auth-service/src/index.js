const express = require('express'); //
const { Pool } = require('pg'); //conexion a postgres
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Kafka } = require('kafkajs');
const cors = require('cors'); //comunicacion entre backend y frontend

const app = express();
const port = 3001;

// Configuración de PostgreSQL conexion a la base de datos
const pool = require('../shared/db.js');

// Verificar la conexión a la base de datos
app.get('/db-health', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, password_hash, role_id, creado_en, modificado_en FROM der_users.usuarios;'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ status: 'DB Error', error: err.message });
    }
});




// Configuración de Kafka
const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: [process.env.KAFKA_BROKERS || 'kafka:9092']
});

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000', // Cambia si tu frontend corre en otro puerto o dominio
    credentials: true
}));

app.post('/api/auth/login', async (req, res) => {
    try {
        // Solo se pide email y password
        const email = req.body.email;
        const password = req.body.password;
        // Validar entrada
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
        }

        // Buscar usuario por email y obtener el nombre del rol
        const userResult = await pool.query(
            'SELECT u.id, u.password_hash, u.role_id, r.nombre as role_name FROM der_users.usuarios u JOIN der_users.roles r ON u.role_id = r.id WHERE u.email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas ' });
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }


        if (!user.role_name) {
            return res.status(401).json({ error: 'El usuario no tiene un rol asignado.' });
        }

        const normalizedRoleName = user.role_name.toLowerCase(); // ← se declara antes de usarse

        let perfil = null;
        if (normalizedRoleName === 'gerencia') {
            const perfilResult = await pool.query(
                'SELECT * FROM der_users.gerencia_perfiles WHERE usuario_id = $1',
                [user.id]
            );
            perfil = perfilResult.rows[0] || null;
        } else if (normalizedRoleName === 'mesero') {
            const perfilResult = await pool.query(
                'SELECT * FROM der_users.mesero_perfiles WHERE usuario_id = $1',
                [user.id]
            );
            perfil = perfilResult.rows[0] || null;
        } else if (normalizedRoleName === 'cocina') {
            const perfilResult = await pool.query(
                'SELECT * FROM der_users.cocina_perfiles WHERE usuario_id = $1',
                [user.id]
            );
            perfil = perfilResult.rows[0] || null;
        } else if (normalizedRoleName === 'caja') {
            const perfilResult = await pool.query(
                'SELECT * FROM der_users.caja_perfiles WHERE usuario_id = $1',
                [user.id]
            );
            perfil = perfilResult.rows[0] || null;
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role_id, roleName: normalizedRoleName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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

        res.json({ token, perfil, role: user.role_id, roleName: normalizedRoleName });
    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

//iniciar servidor
app.listen(port, () => {
    console.log(`Servicio de autenticación ejecutándose en el puerto ${port}`);
});