const express = require('express');
const cors = require('cors');
const pool = require('../shared/db.js'); // ruta corregida a db.js

const app = express();
app.use(cors());
app.use(express.json());

// Obtener platos
app.get('/db-inventory', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await pool.query(
      'SELECT id, nombre, precio, stock_disponible, actualizado_en FROM der_inventory.platos ORDER BY id;'
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'No Data',
        message: 'No inventory items found'
      });
    }

    res.status(200).json({
      status: 'Success',
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to fetch inventory data',
      error: err.message
    });
  }
});

// Registrar nuevo plato
app.post('/api/platos', async (req, res) => {
  const { nombre, precio, stock_disponible } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO der_inventory.platos (nombre, precio, stock_disponible, actualizado_en) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [nombre, precio, stock_disponible]
    );
    const plato = result.rows[0];

    await pool.query(
      'INSERT INTO der_inventory.disponibilidadplatos (plato_id, fecha, stock, actualizado_en) VALUES ($1, CURRENT_DATE, $2, NOW())',
      [plato.id, stock_disponible]
    );

    res.status(201).json({ message: 'Plato registrado correctamente', plato });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el plato' });
  }
});

const PORT = 3002; // Dentro del contenedor, 3001
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
