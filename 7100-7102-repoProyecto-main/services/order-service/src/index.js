require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const authMiddleware = require('./auth');
const { Kafka } = require('kafkajs');

const app = express();
app.use(bodyParser.json());

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

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

// Endpoint de Health Check (Público)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Obtener pedidos con platos relacionados (Protegido)
app.get('/api/pedidos-detalles', authMiddleware, async (req, res) => { // Aplicar middleware
  try {
    // (Tu código existente para obtener pedidos)
    const pedidosResult = await pool.query(`
      SELECT p.id, p.mesa, p.estado, p.notas, p.total, p.hora_pedido, c.nombre AS cliente_nombre, c.cedula
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.hora_pedido DESC
    `); // Añadido ORDER BY por ejemplo

    const pedidosIds = pedidosResult.rows.map(p => p.id);
    if (pedidosIds.length === 0) {
      return res.json([]); // Si no hay pedidos, devolver array vacío
    }

    const platosResult = await pool.query(`
      SELECT pp.pedido_id, pp.cantidad, pl.nombre, pl.precio
      FROM pedido_platos pp
      JOIN platos pl ON pp.plato_id = pl.id
      WHERE pp.pedido_id = ANY($1::bigint[])
    `, [pedidosIds]);

    const platosPorPedido = platosResult.rows.reduce((acc, plato) => {
      if (!acc[plato.pedido_id]) {
        acc[plato.pedido_id] = [];
      }
      acc[plato.pedido_id].push({
        nombre: plato.nombre,
        cantidad: plato.cantidad,
        precio: plato.precio
      });
      return acc;
    }, {});

    const pedidosConPlatos = pedidosResult.rows.map(pedido => ({
      ...pedido,
      platos: platosPorPedido[pedido.id] || []
    }));

    res.json(pedidosConPlatos);
  } catch (error) {
    console.error('Error al obtener pedidos con detalles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo pedido (Protegido)
app.post('/api/pedidos', authMiddleware, async (req, res) => { // Aplicar middleware
  const { mesa, cliente_nombre, cedula, platos, notas } = req.body;

  // Validación básica
  if (!mesa || !cliente_nombre || !cedula || !platos || !Array.isArray(platos) || platos.length === 0) {
    return res.status(400).json({ error: 'Faltan datos requeridos o el formato es incorrecto.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Buscar o crear cliente
    let clienteResult = await client.query('SELECT id FROM clientes WHERE cedula = $1', [cedula]);
    let clienteId;
    if (clienteResult.rows.length > 0) {
      clienteId = clienteResult.rows[0].id;
      // Opcional: Actualizar nombre si es diferente?
      // await client.query('UPDATE clientes SET nombre = $1, modificado_en = NOW() WHERE id = $2', [cliente_nombre, clienteId]);
    } else {
      clienteResult = await client.query(
        'INSERT INTO clientes (nombre, cedula) VALUES ($1, $2) RETURNING id',
        [cliente_nombre, cedula]
      );
      clienteId = clienteResult.rows[0].id;
    }

    // 2. Calcular total y verificar stock
    let totalPedido = 0;
    const detallesPlatos = [];

    for (const item of platos) {
      const platoResult = await client.query(
        'SELECT precio, stock_disponible FROM platos WHERE id = $1 FOR UPDATE', // Bloquear fila para evitar concurrencia
        [item.id]
      );
      if (platoResult.rows.length === 0) {
        throw new Error(`Plato con ID ${item.id} no encontrado.`);
      }
      const plato = platoResult.rows[0];
      if (plato.stock_disponible < item.cantidad) {
        throw new Error(`Stock insuficiente para el plato ID ${item.id}. Disponible: ${plato.stock_disponible}, Solicitado: ${item.cantidad}`);
      }
      totalPedido += plato.precio * item.cantidad;
      detallesPlatos.push({
        id: item.id,
        cantidad: item.cantidad,
        precio: plato.precio,
        stock_actual: plato.stock_disponible
      });
    }

    // 3. Crear el pedido
    // Asumiendo que status_id 1 es 'pendiente' y estado 'pendiente'
    const statusResult = await client.query("SELECT id FROM order_status WHERE code = 'PENDIENTE'");
    if (statusResult.rows.length === 0) {
        throw new Error("Estado 'PENDIENTE' no encontrado en order_status");
    }
    const statusIdPendiente = statusResult.rows[0].id;

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (cliente_id, mesa, status_id, total, notas, estado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, hora_pedido`,
      [clienteId, mesa, statusIdPendiente, totalPedido, notas, 'pendiente'] // Usar estado 'pendiente'
    );
    const pedidoId = pedidoResult.rows[0].id;
    const horaPedido = pedidoResult.rows[0].hora_pedido;


    // 4. Insertar detalles del pedido y actualizar stock
    for (const detalle of detallesPlatos) {
      await client.query(
        'INSERT INTO pedido_platos (pedido_id, plato_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
        [pedidoId, detalle.id, detalle.cantidad, detalle.precio]
      );
      // Actualizar stock
      await client.query(
        'UPDATE platos SET stock_disponible = stock_disponible - $1, actualizado_en = NOW() WHERE id = $2',
        [detalle.cantidad, detalle.id]
      );
    }

    await client.query('COMMIT');

    // Aquí podrías emitir un evento Kafka 'order-created' si lo necesitas

    res.status(201).json({
      id: pedidoId,
      message: 'Pedido creado exitosamente',
      mesa,
      cliente_nombre,
      total: totalPedido,
      hora_pedido: horaPedido,
      estado: 'pendiente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error interno al crear el pedido', details: error.message });
  } finally {
    client.release();
  }
});


// Marcar pedido como entregado (Protegido)
app.put('/api/pedidos/:id/marcar-entregado', authMiddleware, async (req, res) => { // Aplicar middleware
  const { id } = req.params;
  try {
      // Buscar el ID del estado 'ENTREGADO'
      const statusResult = await pool.query("SELECT id FROM order_status WHERE code = 'ENTREGADO'");
      if (statusResult.rows.length === 0) {
          return res.status(500).json({ error: "Estado 'ENTREGADO' no definido en la base de datos." });
      }
      const statusIdEntregado = statusResult.rows[0].id;

      // Actualizar el pedido
      const result = await pool.query(
          `UPDATE pedidos
           SET estado = 'ENTREGADO', status_id = $1, modificado_en = NOW()
           WHERE id = $2 AND estado = 'pendiente'
           RETURNING *`, // Asegúrate que el estado actual sea 'pendiente'
          [statusIdEntregado, id]
      );

      if (result.rowCount === 0) {
          // Verificar si el pedido no existe o ya no está pendiente
          const checkPedido = await pool.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
          if (checkPedido.rowCount === 0) {
              return res.status(404).json({ error: 'Pedido no encontrado' });
          }
          if (checkPedido.rows[0].estado !== 'pendiente') {
                return res.status(409).json({ error: `El pedido ya no está pendiente (estado actual: ${checkPedido.rows[0].estado})` });
          }
          // Otro caso
          return res.status(409).json({ error: 'No se pudo actualizar el pedido. Puede que ya no esté pendiente.' });
      }

      // Podrías emitir un evento Kafka 'order-status-updated' aquí

      res.json({ message: 'Pedido marcado como entregado', pedido: result.rows[0] });

  } catch (error) {
      console.error('Error al marcar pedido como entregado:', error);
      res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});


// Marcar pedido como cobrado (Protegido)
app.put('/api/pedidos/:id/cobrar', authMiddleware, async (req, res) => { // Aplicar middleware
  const { id } = req.params;
  const { metodo_pago_id } = req.body; // Recibe el ID del método de pago

  if (!metodo_pago_id) {
    return res.status(400).json({ error: 'Debe proporcionar un método de pago (metodo_pago_id).' });
  }

  try {
    // Buscar el ID del estado 'COBRADO'
    const statusResult = await pool.query("SELECT id FROM order_status WHERE code = 'COBRADO'");
    if (statusResult.rows.length === 0) {
      return res.status(500).json({ error: "Estado 'COBRADO' no definido." });
    }
    const statusIdCobrado = statusResult.rows[0].id;

    // Actualizar el pedido
    const result = await pool.query(
      `UPDATE pedidos
       SET estado = 'COBRADO', status_id = $1, payment_method = $2, modificado_en = NOW()
       WHERE id = $3 AND estado = 'ENTREGADO'
       RETURNING *`, // Solo se puede cobrar si está 'ENTREGADO'
      [statusIdCobrado, metodo_pago_id, id]
    );

    if (result.rowCount === 0) {
         // Verificar si el pedido no existe o no está 'ENTREGADO'
         const checkPedido = await pool.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
         if (checkPedido.rowCount === 0) {
             return res.status(404).json({ error: 'Pedido no encontrado' });
         }
         if (checkPedido.rows[0].estado !== 'ENTREGADO') {
            return res.status(409).json({ error: `No se puede cobrar. El pedido debe estar en estado ENTREGADO (estado actual: ${checkPedido.rows[0].estado})` });
         }
         // Otro caso
         return res.status(409).json({ error: 'No se pudo actualizar el pedido. Verifica que esté en estado ENTREGADO.' });
    }

    // Aquí podrías emitir un evento Kafka 'order-paid' o 'order-status-updated'

    res.json({ message: 'Pedido cobrado exitosamente', pedido: result.rows[0] });

  } catch (error) {
    console.error('Error al cobrar pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});


// Endpoint para cancelar un pedido (Protegido)
app.put('/api/pedidos/:id/cancelar', authMiddleware, async (req, res) => { // Aplicar middleware
  const pedidoId = req.params.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar el estado actual del pedido
    const pedidoResult = await client.query('SELECT estado FROM pedidos WHERE id = $1 FOR UPDATE', [pedidoId]);
    if (pedidoResult.rows.length === 0) {
      throw new Error('Pedido no encontrado');
    }
    const estadoActual = pedidoResult.rows[0].estado;

    // Solo permitir cancelar si está 'pendiente'
    if (estadoActual !== 'pendiente') {
      throw new Error(`No se puede cancelar un pedido en estado '${estadoActual}'`);
    }

    // 2. Obtener los platos y cantidades del pedido
    const platosResult = await client.query(
      `SELECT pp.plato_id, pp.cantidad
       FROM pedido_platos pp
       WHERE pp.pedido_id = $1`,
      [pedidoId]
    );

    // 3. Restaurar el stock de cada plato
    for (const plato of platosResult.rows) {
      await client.query(
        `UPDATE platos
         SET stock_disponible = stock_disponible + $1, actualizado_en = NOW()
         WHERE id = $2`,
        [plato.cantidad, plato.plato_id]
      );
    }

    // 4. Actualizar estado del pedido a 'CANCELADO'
     // Buscar el ID del estado 'CANCELADO'
     const statusResult = await client.query("SELECT id FROM order_status WHERE code = 'CANCELADO'");
     if (statusResult.rows.length === 0) {
         throw new Error("Estado 'CANCELADO' no definido.");
     }
     const statusIdCancelado = statusResult.rows[0].id;

    await client.query(
      `UPDATE pedidos SET estado = 'CANCELADO', status_id = $1, modificado_en = NOW() WHERE id = $2`,
      [statusIdCancelado, pedidoId]
    );

    await client.query('COMMIT');

    // Aquí podrías emitir un evento Kafka 'order-cancelled' o 'order-status-updated'

    res.json({ success: true, message: 'Pedido cancelado y stock restaurado' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cancelar pedido:', error);
    // Devolver un código de estado apropiado si no se pudo cancelar debido al estado
    if (error.message.includes('No se puede cancelar un pedido en estado')) {
      res.status(409).json({ error: error.message }); // 409 Conflict
    } else if (error.message === 'Pedido no encontrado') {
      res.status(404).json({ error: error.message }); // 404 Not Found
    } else {
      res.status(500).json({ error: 'Error interno al cancelar el pedido' });
    }
  } finally {
    client.release();
  }
});


// Endpoint para obtener lista de métodos de pago (Público o Protegido según necesidad)
// Si solo lo usa la caja (que ya está logueada), debería estar protegido.
app.get('/api/metodos-pago', authMiddleware, async (req, res) => { // Aplicar middleware (recomendado)
  try {
    const result = await pool.query(`SELECT id, nombre FROM payment_methods ORDER BY nombre ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ error: 'Error interno al obtener métodos de pago' });
  }
});


const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(` Order service running on port ${PORT}`);
});