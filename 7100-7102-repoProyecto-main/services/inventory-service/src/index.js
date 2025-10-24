require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Kafka } = require('kafkajs');

const app = express();
const port = 3003;

// --- INICIO DE CAMBIOS (KAFKA PRODUCER) ---

const kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const producer = kafka.producer();
const KAFKA_TOPIC = 'inventory-events';

// Función para conectar el productor de Kafka
const connectProducer = async () => {
    try {
        await producer.connect();
        console.log('🚀 Productor de Kafka conectado en inventory-service');
    } catch (error) {
        console.error('❌ Error conectando el productor de Kafka en inventory-service:', error.message);
        // Reintentar conexión después de 5 segundos
        setTimeout(connectProducer, 5000);
    }
};

// Función auxiliar para enviar eventos de inventario
const sendInventoryEvent = async (eventType, platoData) => {
    try {
        await producer.send({
            topic: KAFKA_TOPIC,
            messages: [
                {
                    key: platoData.id.toString(), // Usar el ID del plato como clave
                    value: JSON.stringify({
                        type: eventType, // 'PLATO_AGREGADO', 'PLATO_ACTUALIZADO', 'PLATO_ELIMINADO'
                        plato: platoData
                    })
                }
            ],
        });
        console.log(`✔️ Evento Kafka [${eventType}] enviado para plato ID ${platoData.id}`);
    } catch (kafkaError) {
        console.error(`❌ Error al enviar evento Kafka [${eventType}]:`, kafkaError.message);
        // Si falla, intentar reconectar para el próximo evento
        if (kafkaError.type === 'KAFKA_NOT_CONNECTED_ERROR') {
            console.log('Intentando reconectar productor de Kafka...');
            await connectProducer();
        }
    }
};

// Conectar el productor al iniciar el servicio
connectProducer();

// --- FIN DE CAMBIOS (KAFKA PRODUCER) ---


const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'host.docker.internal',
    database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
    password: process.env.POSTGRES_PASSWORD || '123',
    port: process.env.POSTGRES_PORT || 5432,
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Endpoint para agregar un plato (Modificado)
app.post('/api/inventory/platos', async (req, res) => {
    const { nombre, precio, stock_disponible } = req.body;
    if (!nombre || !precio || !stock_disponible) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO public.platos (nombre, precio, stock_disponible) VALUES ($1, $2, $3) RETURNING *`,
            [nombre, precio, stock_disponible]
        );

        const nuevoPlato = result.rows[0];
        res.status(201).json(nuevoPlato); // Responder al cliente inmediatamente

        // --- AÑADIDO: Enviar evento Kafka (sin esperar) ---
        sendInventoryEvent('PLATO_AGREGADO', nuevoPlato).catch(console.error);
        // --- FIN DE CAMBIO ---

    } catch (error) {
        console.error('❌ Error al agregar plato:', error.message);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Endpoint para actualizar un plato (Modificado)
app.put('/api/inventory/platos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock_disponible } = req.body;

    try {
        const result = await pool.query(
            `UPDATE public.platos
             SET nombre = $1, precio = $2, stock_disponible = $3, actualizado_en = NOW()
             WHERE id = $4 RETURNING *`,
            [nombre, precio, stock_disponible, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Plato no encontrado' });
        }

        const platoActualizado = result.rows[0];
        res.status(200).json(platoActualizado); // Responder al cliente inmediatamente

        // --- AÑADIDO: Enviar evento Kafka (sin esperar) ---
        sendInventoryEvent('PLATO_ACTUALIZADO', platoActualizado).catch(console.error);
        // --- FIN DE CAMBIO ---

    } catch (error) {
        console.error('❌ Error al actualizar plato:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para eliminar un plato (Modificado)
app.delete('/api/inventory/platos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar registros relacionados primero (Buena práctica, aunque la BD ya lo maneje con ON DELETE)
        await pool.query(
            'DELETE FROM pedido_platos WHERE plato_id = $1',
            [id]
        );

        const result = await pool.query(
            'DELETE FROM public.platos WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Plato no encontrado' });
        }

        const platoEliminado = result.rows[0];
        res.status(200).json({
            message: 'Plato y registros relacionados eliminados',
            deleted: platoEliminado
        }); // Responder al cliente inmediatamente

        // --- AÑADIDO: Enviar evento Kafka (sin esperar) ---
        sendInventoryEvent('PLATO_ELIMINADO', platoEliminado).catch(console.error);
        // --- FIN DE CAMBIO ---

    } catch (error) {
        console.error('❌ Error al eliminar plato:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// Endpoint para obtener todos los platos (Sin cambios)
app.get('/api/inventory/platos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.platos ORDER BY actualizado_en DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener platos:', error);
        res.status(500).json({ error: 'Error al obtener los platos' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servicio de inventario ejecutándose en el puerto ${port}`);
});