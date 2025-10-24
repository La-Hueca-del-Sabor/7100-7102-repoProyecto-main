require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3002;

// Verificar que las variables de entorno estén cargadas
console.log('Verificando variables de entorno:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Configurado' : 'No configurado');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configurado' : 'No configurado');

// Configuración de credenciales de correo
const EMAIL_CONFIG = {
    user: process.env.EMAIL_USER || 'jerminshadin@gmail.com', // Reemplaza esto con tu correo real
    pass: process.env.EMAIL_PASS || 'mswg tiqe rpbh sfdg' // Reemplaza esto con tu contraseña de aplicación real
};

console.log('Configuración de correo:');
console.log('Usuario configurado:', EMAIL_CONFIG.user);
console.log('Contraseña configurada:', EMAIL_CONFIG.pass ? 'Sí' : 'No');

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass
    },
    debug: true,
    logger: true
});

// Verificar la configuración del transporter inmediatamente
transporter.verify(function(error, success) {
    if (error) {
        console.log('Error en la configuración del servidor de correo:', error);
        console.log('Detalles de configuración:');
        console.log('Host:', 'smtp.gmail.com');
        console.log('Puerto:', 465);
        console.log('Usuario configurado:', !!EMAIL_CONFIG.user);
        console.log('Contraseña configurada:', !!EMAIL_CONFIG.pass);
    } else {
        console.log('Servidor de correo está listo para enviar mensajes');
    }
});

// Configuración de PostgreSQL local
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: 'host.docker.internal',
    database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
    password: process.env.POSTGRES_PASSWORD || '123',
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
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
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

// Función para generar token aleatorio
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Función para enviar correo de verificación
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `http://localhost:3000/verify-email/${token}`;

    const mailOptions = {
        from: EMAIL_CONFIG.user,
        to: email,
        subject: 'Verifica tu correo electrónico - La Hueca del Sabor',
        html: `
            <h1>Bienvenido a La Hueca del Sabor</h1>
            <p>Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
            <a href="${verificationLink}">Verificar correo electrónico</a>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error al enviar correo:', error);
        return false;
    }
};

// Endpoint de registro
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombres, correo, password, role_id } = req.body;

        // Validaciones básicas
        if (!nombres || !correo || !password || !role_id) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Verificar si el correo ya existe en usuarios o usuarios_pendientes
        const existingUser = await pool.query(
            `SELECT correo FROM usuarios WHERE correo = $1
             UNION
             SELECT correo FROM usuarios_pendientes WHERE correo = $1`,
            [correo]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Verificar que el rol sea válido (no permitir rol de gerente)
        if (role_id === 1) {
            return res.status(400).json({ error: 'Rol no permitido' });
        }

        const roleExists = await pool.query('SELECT id FROM roles WHERE id = $1', [role_id]);
        if (roleExists.rows.length === 0) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        // Generar hash de la contraseña
        const salt = await bcrypt.genSalt(6);
        const password_hash = await bcrypt.hash(password, salt);

        // Generar token de verificación y fecha de expiración
        const token_verificacion = generateToken();
        const token_expiracion = new Date();
        token_expiracion.setHours(token_expiracion.getHours() + 24);

        console.log('Datos a insertar:', {
            nombres,
            correo,
            role_id,
            token_verificacion,
            token_expiracion
        });

        // Insertar usuario pendiente
        const result = await pool.query(
            `INSERT INTO usuarios_pendientes
             (nombres, correo, password_hash, role_id, token_verificacion, token_expiracion, email_verificado, estado)
             VALUES ($1, $2, $3, $4, $5, $6, FALSE, 'pendiente')
             RETURNING id, token_verificacion, token_expiracion`,
            [nombres, correo, password_hash, role_id, token_verificacion, token_expiracion]
        );

        console.log('Usuario registrado:', result.rows[0]);

        // Enviar correo de verificación
        const emailSent = await sendVerificationEmail(correo, token_verificacion);

        if (!emailSent) {
            // Si falla el envío del correo, eliminamos el registro y devolvemos error
            await pool.query('DELETE FROM usuarios_pendientes WHERE id = $1', [result.rows[0].id]);
            return res.status(500).json({ error: 'Error al enviar el correo de verificación' });
        }

        res.status(201).json({
            message: 'Por favor, verifica tu correo electrónico para completar el registro',
            id: result.rows[0].id
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Endpoint para verificar correo
app.get('/api/auth/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Token recibido:', token);

        // Buscar el usuario pendiente antes de actualizar
        const userCheck = await pool.query(
            `SELECT * FROM usuarios_pendientes
             WHERE token_verificacion = $1`,
            [token]
        );

        console.log('Resultado de búsqueda:', {
            encontrado: userCheck.rows.length > 0,
            token_verificacion: userCheck.rows[0]?.token_verificacion,
            token_expiracion: userCheck.rows[0]?.token_expiracion,
            email_verificado: userCheck.rows[0]?.email_verificado
        });

        // Si no se encuentra el usuario o el token no coincide
        if (userCheck.rows.length === 0) {
            return res.status(400).json({
                error: 'Token inválido o expirado',
                details: 'No se encontró un usuario pendiente con este token'
            });
        }

        // Si el usuario ya está verificado
        if (userCheck.rows[0].email_verificado) {
            return res.status(200).json({
                message: 'El correo ya fue verificado anteriormente. Puedes proceder a iniciar sesión.',
                verified: true
            });
        }

        // Verificar si el token ha expirado
        if (userCheck.rows[0].token_expiracion < new Date()) {
            return res.status(400).json({
                error: 'Token inválido o expirado',
                details: 'El token ha expirado'
            });
        }

        // Si todo está bien, procedemos con la actualización
        await pool.query(
            `UPDATE usuarios_pendientes
             SET email_verificado = TRUE
             WHERE id = $1
             RETURNING id`,
            [userCheck.rows[0].id]
        );

        res.json({
            message: 'Correo verificado exitosamente. Tu solicitud será revisada por un gerente.',
            verified: true
        });

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// Endpoint para obtener usuarios pendientes
app.get('/api/auth/usuarios-pendientes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombres, correo, role_id, fecha_solicitud, email_verificado, estado
       FROM usuarios_pendientes
       ORDER BY fecha_solicitud DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios pendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Endpoint para aceptar un usuario pendiente
app.post('/api/auth/aceptar-usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Iniciar transacción
    await pool.query('BEGIN');

    // Obtener datos del usuario pendiente
    const userResult = await pool.query(
      `SELECT nombres, correo, password_hash, role_id
       FROM usuarios_pendientes
       WHERE id = $1 AND email_verificado = true`,
      [id]
    );

    if (userResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        error: 'Usuario no encontrado',
        details: 'No se encontró el usuario pendiente o no está verificado'
      });
    }

    const usuario = userResult.rows[0];

    // Verificar si ya existe un usuario con el mismo correo
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [usuario.correo]
    );

    if (existingUser.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        error: 'Usuario ya existe',
        details: 'Ya existe un usuario con este correo electrónico'
      });
    }

    // Generar un username único basado en el nombre
    let username = usuario.nombres.toLowerCase().replace(/\s+/g, '.');
    let usernameExists = true;
    let counter = 1;

    while (usernameExists) {
      const testUsername = counter === 1 ? username : `${username}${counter}`;
      const usernameCheck = await pool.query(
        'SELECT id FROM usuarios WHERE username = $1',
        [testUsername]
      );

      if (usernameCheck.rows.length === 0) {
        username = testUsername;
        usernameExists = false;
      } else {
        counter++;
      }
    }

    // Insertar en la tabla de usuarios con los nombres de columna correctos
    const insertResult = await pool.query(
      `INSERT INTO usuarios (username, correo, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [username, usuario.correo, usuario.password_hash, usuario.role_id]
    );

    // Eliminar de usuarios pendientes
    await pool.query(
      'DELETE FROM usuarios_pendientes WHERE id = $1',
      [id]
    );

    // Confirmar transacción
    await pool.query('COMMIT');

    res.json({
      message: 'Usuario aceptado exitosamente',
      userId: insertResult.rows[0].id,
      username: username
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al aceptar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Endpoint para obtener usuarios aceptados
app.get('/api/auth/usuarios-aceptados', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.correo, u.role_id, u.creado_en,
              r.nombre as rol_nombre
       FROM usuarios u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.creado_en DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios aceptados:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Endpoint para solicitar restablecimiento de contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { correo } = req.body;

        // Verificar si el usuario existe
        const userResult = await pool.query(
            'SELECT id FROM usuarios WHERE correo = $1',
            [correo]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: 'No existe una cuenta con este correo electrónico'
            });
        }

        // Generar token de restablecimiento y establecer expiración (24 horas)
        const resetToken = generateToken();
        const tokenExpiracion = new Date();
        tokenExpiracion.setHours(tokenExpiracion.getHours() + 24);

        // Guardar token en la base de datos
        await pool.query(
            `UPDATE usuarios
             SET reset_token = $1, reset_token_expiracion = $2
             WHERE correo = $3`,
            [resetToken, tokenExpiracion, correo]
        );

        // Enviar correo con enlace de restablecimiento
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
        const mailOptions = {
            from: EMAIL_CONFIG.user,
            to: correo,
            subject: 'Restablecimiento de Contraseña - La Hueca del Sabor',
            html: `
                <h1>Restablecimiento de Contraseña</h1>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <a href="${resetLink}">Restablecer Contraseña</a>
                <p>Este enlace expirará en 24 horas.</p>
                <p>Si no solicitaste este restablecimiento, puedes ignorar este correo.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico'
        });

    } catch (error) {
        console.error('Error en solicitud de restablecimiento:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// Endpoint para restablecer contraseña
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verificar token y que no haya expirado
        const userResult = await pool.query(
            `SELECT id FROM usuarios
             WHERE reset_token = $1
             AND reset_token_expiracion > NOW()`,
            [token]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                error: 'Token inválido o expirado',
                message: 'El enlace de restablecimiento es inválido o ha expirado'
            });
        }

        // Generar nuevo hash de contraseña
        const salt = await bcrypt.genSalt(6);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Actualizar contraseña y limpiar token
        await pool.query(
            `UPDATE usuarios
             SET password_hash = $1, reset_token = NULL, reset_token_expiracion = NULL
             WHERE reset_token = $2`,
            [newPasswordHash, token]
        );

        res.json({
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servicio de autenticación ejecutándose en el puerto ${port}`);
});
