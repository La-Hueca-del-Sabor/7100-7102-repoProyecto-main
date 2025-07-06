require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3011;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'host.docker.internal',
  database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
  password: process.env.POSTGRES_PASSWORD || '123',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Endpoint para reporte de pedidos
app.get('/api/reportes/pedidos', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado, cliente, metodo_pago } = req.query;
    let query = `
      SELECT 
        p.hora_pedido,
        c.nombre as cliente_nombre,
        p.mesa,
        p.estado,
        p.total::numeric AS total,

        pm.nombre as metodo_pago
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN payment_methods pm ON p.payment_method = pm.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (fecha_inicio) {
      query += ` AND p.hora_pedido::date >= $${paramCount}`;
      queryParams.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND p.hora_pedido::date <= $${paramCount}`;
      queryParams.push(fecha_fin);
      paramCount++;
    }

    if (estado) {
      query += ` AND p.estado = $${paramCount}`;
      queryParams.push(estado);
      paramCount++;
    }

    if (cliente) {
      query += ` AND (c.nombre ILIKE $${paramCount} OR c.cedula = $${paramCount})`;
      queryParams.push(`%${cliente}%`);
      paramCount++;
    }

    if (metodo_pago) {
      query += ` AND pm.id = $${paramCount}`;
      queryParams.push(metodo_pago);
      paramCount++;
    }

    query += ` ORDER BY p.hora_pedido DESC`;
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en reporte de pedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para reporte de ventas
app.get('/api/reportes/ventas', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, plato_id, metodo_pago } = req.query;
    let query = `
      SELECT 
        pl.nombre as plato,
        SUM(pp.cantidad) as cantidad_total,
        SUM(pp.cantidad * pp.precio)::numeric as total_generado

      FROM pedido_platos pp
      JOIN platos pl ON pp.plato_id = pl.id
      JOIN pedidos p ON pp.pedido_id = p.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (fecha_inicio) {
      query += ` AND p.hora_pedido::date >= $${paramCount}`;
      queryParams.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND p.hora_pedido::date <= $${paramCount}`;
      queryParams.push(fecha_fin);
      paramCount++;
    }

    if (plato_id) {
      query += ` AND pl.id = $${paramCount}`;
      queryParams.push(plato_id);
      paramCount++;
    }

    if (metodo_pago) {
      query += ` AND p.payment_method = $${paramCount}`;
      queryParams.push(metodo_pago);
      paramCount++;
    }

    query += `
      GROUP BY pl.id, pl.nombre
      ORDER BY cantidad_total DESC
    `;
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en reporte de ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para reporte de usuarios
app.get('/api/reportes/usuarios', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, cliente } = req.query;
    let query = `
      SELECT 
        c.nombre as cliente_nombre,
        COUNT(p.id) as total_pedidos,
        SUM(p.total)::numeric as total_gastado,

        MAX(p.hora_pedido) as ultimo_pedido
      FROM clientes c
      LEFT JOIN pedidos p ON c.id = p.cliente_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (fecha_inicio) {
      query += ` AND p.hora_pedido::date >= $${paramCount}`;
      queryParams.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND p.hora_pedido::date <= $${paramCount}`;
      queryParams.push(fecha_fin);
      paramCount++;
    }

    if (cliente) {
      query += ` AND (c.nombre ILIKE $${paramCount} OR c.cedula = $${paramCount})`;
      queryParams.push(`%${cliente}%`);
      paramCount++;
    }

    query += `
      GROUP BY c.id, c.nombre
      ORDER BY total_pedidos DESC
    `;
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en reporte de usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estados
app.get('/api/estados', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, label FROM order_status ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener estados:', error);
      res.status(500).json({ error: 'Error al obtener estados' });
    }
  });
//Metodos de pago
  app.get('/api/metodos-pago', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, nombre FROM payment_methods ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      res.status(500).json({ error: 'Error al obtener métodos de pago' });
    }
  });
  

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`🚀 Servicio de reportes ejecutándose en el puerto ${port}`);
});