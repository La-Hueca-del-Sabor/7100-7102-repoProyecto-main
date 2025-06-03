require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Conexión
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'host.docker.internal',
  database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
  password: process.env.POSTGRES_PASSWORD || 'Shadin2001',
  port: process.env.POSTGRES_PORT || 5432,
});

// Obtener pedidos con platos relacionados
app.get('/api/pedidos-detalles', async (req, res) => {
  try {
    const pedidosResult = await pool.query(`
      SELECT p.id, p.mesa, p.estado, p.notas, p.hora_pedido, c.nombre AS cliente_nombre
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
    `);

    const pedidos = pedidosResult.rows;

    // Para cada pedido, obtener sus platos
    for (const pedido of pedidos) {
      const platosResult = await pool.query(`
        SELECT pp.cantidad, pl.nombre
        FROM pedido_platos pp
        JOIN platos pl ON pp.plato_id = pl.id
        WHERE pp.pedido_id = $1
      `, [pedido.id]);

      pedido.platos = platosResult.rows;
    }

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener detalles de los pedidos' });
  }
});

// Crear pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const { mesa, cliente_nombre, cliente_telefono, platos, notas } = req.body;

    if (!platos || !Array.isArray(platos)) {
      return res.status(400).json({ error: 'Formato de platos inválido' });
    }

    // Verificar stock
    const stockValido = await verificarStock(platos);
    if (!stockValido.valido) {
      return res.status(409).json({
        error: 'Stock insuficiente',
        itemsSinStock: stockValido.itemsSinStock
      });
    }

    // Insertar cliente (si no existe)
    const clienteResult = await pool.query(
      `INSERT INTO clientes(nombre, telefono)
       VALUES($1, $2)
       RETURNING id`,
      [cliente_nombre, cliente_telefono]
    );
    const clienteId = clienteResult.rows[0].id;

    // Insertar pedido
    const pedidoResult = await pool.query(
      `INSERT INTO pedidos(mesa, estado, notas, mesero_id, cliente_id, status_id)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [mesa, 'pendiente', notas, 1, clienteId, 1]
    );
    const pedido = pedidoResult.rows[0];

    // Insertar platos asociados
    for (const plato of platos) {
      await pool.query(
        `INSERT INTO pedido_platos(pedido_id, plato_id, cantidad, precio)
         VALUES($1, $2, $3, (SELECT precio FROM platos WHERE id = $2))`,
        [pedido.id, plato.id, plato.cantidad]
      );

      // Descontar stock
      await pool.query(
        `UPDATE platos SET stock_disponible = stock_disponible - $1 WHERE id = $2`,
        [plato.cantidad, plato.id]
      );
    }

    res.status(201).json({ success: true, pedido });
  } catch (error) {
    console.error('Error real del backend:', error);
    res.status(500).json({ error: 'Error interno', debug: error.message });
  }
});

// PUT: Marcar pedido como listo
app.put('/api/pedidos/:id/marcar-listo', async (req, res) => {
  const pedidoId = req.params.id;
  try {
    await pool.query(
      `UPDATE pedidos SET estado = 'listo', status_id = 2 WHERE id = $1`,
      [pedidoId]
    );
    res.json({ success: true, mensaje: 'Pedido marcado como listo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// DELETE: Eliminar pedido
app.delete('/api/pedidos/:id', async (req, res) => {
  const pedidoId = req.params.id;
  try {
    await pool.query(`DELETE FROM pedido_platos WHERE pedido_id = $1`, [pedidoId]);
    await pool.query(`DELETE FROM pedidos WHERE id = $1`, [pedidoId]);
    res.json({ success: true, mensaje: 'Pedido eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// Verificar stock
const verificarStock = async (platos) => {
  const itemsSinStock = [];
  try {
    for (const plato of platos) {
      const result = await pool.query(
        'SELECT stock_disponible, nombre FROM platos WHERE id = $1',
        [plato.id]
      );
      if (!result.rows.length || result.rows[0].stock_disponible < plato.cantidad) {
        itemsSinStock.push(result.rows[0]?.nombre || `Plato ID ${plato.id}`);
      }
    }
    return {
      valido: itemsSinStock.length === 0,
      itemsSinStock
    };
  } catch (error) {
    throw new Error(`Error verificación stock: ${error.message}`);
  }
};

// Healthcheck
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', mensaje: 'El servicio está activo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', mensaje: 'Error al conectar con la base de datos' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Servicio de pedidos corriendo en el puerto ${PORT}`);
});
