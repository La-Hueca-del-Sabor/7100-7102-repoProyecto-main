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
  password: process.env.POSTGRES_PASSWORD || '123',
  port: process.env.POSTGRES_PORT || 5432,
});

// Obtener pedidos con platos relacionados
app.get('/api/pedidos-detalles', async (req, res) => {
  try {
    const pedidosResult = await pool.query(`
      SELECT p.id, p.mesa, p.estado, p.notas, p.total, p.hora_pedido, c.nombre AS cliente_nombre, c.cedula
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
    `);

    const pedidos = pedidosResult.rows;

    // Para cada pedido, obtener sus platos con precios
    for (const pedido of pedidos) {
      const platosResult = await pool.query(`
        SELECT pp.cantidad, pl.nombre, pl.id as plato_id, pl.precio
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
    const { mesa, cliente_nombre, cedula, platos, notas } = req.body;

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

    // Insertar cliente
    const clienteResult = await pool.query(
      `INSERT INTO clientes(nombre, cedula)
       VALUES($1, $2)
       RETURNING id`,
      [cliente_nombre, cedula]
    );
    const clienteId = clienteResult.rows[0].id;

    // Calcular total del pedido
    let totalPedido = 0;
    for (const plato of platos) {
      const result = await pool.query(
        'SELECT precio FROM platos WHERE id = $1',
        [plato.id]
      );
      if (result.rows.length > 0) {
        const precio = result.rows[0].precio;
        totalPedido += precio * plato.cantidad;
      }
    }

    // Insertar pedido con total
    const pedidoResult = await pool.query(
      `INSERT INTO pedidos(mesa, estado, notas, mesero_id, cliente_id, status_id, total)
       VALUES($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [mesa, 'pendiente', notas, 1, clienteId, 1, totalPedido]
    );
    const pedido = pedidoResult.rows[0];

    // Insertar platos asociados y descontar stock
    for (const plato of platos) {
      await pool.query(
        `INSERT INTO pedido_platos(pedido_id, plato_id, cantidad, precio)
         VALUES($1, $2, $3, (SELECT precio FROM platos WHERE id = $2))`,
        [pedido.id, plato.id, plato.cantidad]
      );
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
app.put('/api/pedidos/:id/cobrar', async (req, res) => {
  const pedidoId = req.params.id;
  const { metodo_pago_id } = req.body;

  if (!metodo_pago_id) {
    return res.status(400).json({ error: 'El método de pago es obligatorio.' });
  }

  try {
    const result = await pool.query(
      `UPDATE pedidos
       SET estado = 'COBRADO',
           hora_pedido = NOW(),
           payment_method = $1
       WHERE id = $2
       RETURNING *`,
      [metodo_pago_id, pedidoId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    res.json({
      mensaje: 'Pedido cobrado exitosamente.',
      pedido: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cobrar pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
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

// PUT: Marcar pedido como entregado
app.put('/api/pedidos/:id/marcar-entregado', async (req, res) => {
  const pedidoId = req.params.id;
  try {
    await pool.query(
      `UPDATE pedidos SET estado = 'ENTREGADO', status_id = 2 WHERE id = $1`,
      [pedidoId]
    );
    res.json({ success: true, mensaje: 'Pedido marcado como entregado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// PUT: Marcar pedido como cobrado
app.put('/api/pedidos/:id/cobrar', async (req, res) => {
  const pedidoId = req.params.id;
  try {
    await pool.query(
      `UPDATE pedidos SET estado = 'COBRADO', status_id = 3 WHERE id = $1`,
      [pedidoId]
    );
    res.json({ success: true, mensaje: 'Pedido marcado como cobrado' });
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



// PUT: Cancelar pedido y restaurar stock
app.put('/api/pedidos/:id/cancelar', async (req, res) => {
  const pedidoId = req.params.id;
  const client = await pool.connect();
  
  try {
    // Verificar el estado actual del pedido
    const estadoResult = await client.query(
      'SELECT estado FROM pedidos WHERE id = $1',
      [pedidoId]
    );

    if (!estadoResult.rows.length) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (estadoResult.rows[0].estado === 'CANCELADO') {
      return res.status(400).json({ error: 'Este pedido ya está cancelado' });
    }

    await client.query('BEGIN');
    
    // Obtener los platos del pedido
    const platosResult = await client.query(
      `SELECT pp.plato_id, pp.cantidad 
       FROM pedido_platos pp 
       WHERE pp.pedido_id = $1`,
      [pedidoId]
    );
    
    // Restaurar el stock de cada plato
    for (const plato of platosResult.rows) {
      await client.query(
        `UPDATE platos 
         SET stock_disponible = stock_disponible + $1 
         WHERE id = $2`,
        [plato.cantidad, plato.plato_id]
      );
    }
    
    // Actualizar estado del pedido
    await client.query(
      `UPDATE pedidos SET estado = 'CANCELADO', status_id = 4 WHERE id = $1`,
      [pedidoId]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, mensaje: 'Pedido cancelado y stock restaurado' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({ error: 'Error al cancelar el pedido' });
  } finally {
    client.release();
  }
});

// Endpoint para obtener lista de métodos de pago
app.get('/api/metodos-pago', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, nombre FROM payment_methods ORDER BY nombre ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Servicio de pedidos corriendo en el puerto ${PORT}`);
});
