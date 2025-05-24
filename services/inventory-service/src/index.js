require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3003; // Puedes exponer este puerto en docker-compose.yml

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'host.docker.internal',
    database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
    password: process.env.POSTGRES_PASSWORD || 'Shadin2001',
    port: process.env.POSTGRES_PORT || 5432,
});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Endpoint para agregar un plato
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
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error al agregar plato:', error.message);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
// Puedes agregar más endpoints para listar, editar o eliminar platos si lo necesitas


// Endpoint para actualizar un plato
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
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error al actualizar plato:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para eliminar un plato
app.delete('/api/inventory/platos/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Eliminar registros relacionados primero
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
        
        res.status(200).json({ 
            message: 'Plato y registros relacionados eliminados',
            deleted: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error al eliminar plato:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});
// Nuevo endpoint para obtener todos los platos
// Agregar este nuevo endpoint GET
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