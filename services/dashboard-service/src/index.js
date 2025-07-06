const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3010;

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

// Verificar conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.stack);
  } else {
    console.log('Conexión exitosa a la base de datos');
    release();
  }
});

// Endpoint para obtener los productos más vendidos
app.get('/api/dashboard/ventas', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT 
        p.nombre as label,
        COUNT(*) as value
      FROM pedido_platos pp
      JOIN platos p ON pp.plato_id = p.id
      JOIN pedidos ped ON pp.pedido_id = ped.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (fecha_inicio) {
      query += ` AND ped.hora_pedido::date >= $${paramCount}`;
      queryParams.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND ped.hora_pedido::date <= $${paramCount}`;
      queryParams.push(fecha_fin);
      paramCount++;
    }

    query += `
      GROUP BY p.nombre
      ORDER BY value DESC
      LIMIT 10
    `;
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Endpoint para obtener los ingresos (diarios, semanales o mensuales)
app.get('/api/dashboard/ingresos', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, periodo } = req.query;
    let query = '';
    
    const queryParams = [];
    let paramCount = 1;

    // Base del WHERE para filtros de fecha
    let whereClause = 'WHERE 1=1';
    if (fecha_inicio) {
      whereClause += ` AND p.hora_pedido::date >= $${paramCount}`;
      queryParams.push(fecha_inicio);
      paramCount++;
    }
    if (fecha_fin) {
      whereClause += ` AND p.hora_pedido::date <= $${paramCount}`;
      queryParams.push(fecha_fin);
      paramCount++;
    }

    // Diferentes agrupaciones según el período seleccionado
    switch(periodo) {
      case 'diario':
        query = `
          SELECT 
            TO_CHAR(p.hora_pedido::date, 'YYYY-MM-DD') as label,
            ROUND(SUM(pp.cantidad * pp.precio)::numeric, 2) as value
          FROM pedidos p
          JOIN pedido_platos pp ON p.id = pp.pedido_id
          ${whereClause}
          GROUP BY p.hora_pedido::date
          ORDER BY p.hora_pedido::date DESC
          LIMIT 30
        `;
        break;
      
      case 'semanal':
        query = `
          SELECT 
            TO_CHAR(date_trunc('week', p.hora_pedido), 'YYYY-MM-DD') || ' - ' ||
            TO_CHAR(date_trunc('week', p.hora_pedido) + INTERVAL '6 days', 'YYYY-MM-DD') as label,
            ROUND(SUM(pp.cantidad * pp.precio)::numeric, 2) as value
          FROM pedidos p
          JOIN pedido_platos pp ON p.id = pp.pedido_id
          ${whereClause}
          GROUP BY date_trunc('week', p.hora_pedido)
          ORDER BY date_trunc('week', p.hora_pedido) DESC
          LIMIT 12
        `;
        break;
      
      case 'mensual':
      default:
        query = `
          SELECT 
            TO_CHAR(date_trunc('month', p.hora_pedido), 'YYYY-MM') as label,
            ROUND(SUM(pp.cantidad * pp.precio)::numeric, 2) as value
          FROM pedidos p
          JOIN pedido_platos pp ON p.id = pp.pedido_id
          ${whereClause}
          GROUP BY date_trunc('month', p.hora_pedido)
          ORDER BY date_trunc('month', p.hora_pedido) DESC
          LIMIT 12
        `;
        break;
    }
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Endpoint para obtener la distribución de pedidos por hora
app.get('/api/dashboard/horarios', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT 
        EXTRACT(HOUR FROM hora_pedido)::integer as label,
        COUNT(*) as value
      FROM pedidos
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (fecha_inicio) {
      query += ` AND hora_pedido::date >= $${paramCount}`;
      queryParams.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND hora_pedido::date <= $${paramCount}`;
      queryParams.push(fecha_fin);
      paramCount++;
    }

    query += `
      GROUP BY label
      ORDER BY label
    `;
    
    const result = await pool.query(query, queryParams);
    
    // Asegurar que tenemos todas las horas del día (0-23)
    const horasPorDia = Array.from({ length: 24 }, (_, i) => ({
      label: i.toString(),
      value: 0
    }));
    
    // Llenar con datos reales
    result.rows.forEach(row => {
      horasPorDia[row.label].value = parseInt(row.value);
    });
    
    res.json(horasPorDia);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Endpoint para reportes con filtros
app.get('/api/reportes', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, producto, cliente } = req.query;
    
    let query = `
      SELECT 
        p.hora_pedido::date as fecha,
        c.nombre as cliente,
        pl.nombre as producto,
        pp.cantidad,
        pp.precio as precio_unitario,
        (pp.cantidad * pp.precio) as total
      FROM pedidos p
      JOIN pedido_platos pp ON p.id = pp.pedido_id
      JOIN platos pl ON pp.plato_id = pl.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
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

    if (producto) {
      query += ` AND pl.nombre ILIKE $${paramCount}`;
      queryParams.push(`%${producto}%`);
      paramCount++;
    }

    if (cliente) {
      query += ` AND c.nombre ILIKE $${paramCount}`;
      queryParams.push(`%${cliente}%`);
      paramCount++;
    }

    query += ` ORDER BY p.hora_pedido DESC`;
    
    const result = await pool.query(query, queryParams);
    console.log('Resultado de reportes:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Endpoint para obtener lista de productos
app.get('/api/productos', async (req, res) => {
  try {
    const query = `
      SELECT id, nombre
      FROM platos
      ORDER BY nombre ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Endpoint metodos de pago
app.get('/api/dashboard/ingresos-metodo-pago', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const queryParams = [];
    let whereClause = 'WHERE 1=1';
    let paramCount = 1;

    if (fecha_inicio) {
      whereClause += ` AND p.hora_pedido::date >= $${paramCount++}`;
      queryParams.push(fecha_inicio);
    }

    if (fecha_fin) {
      whereClause += ` AND p.hora_pedido::date <= $${paramCount++}`;
      queryParams.push(fecha_fin);
    }

    const query = `
      SELECT m.nombre AS label,
             ROUND(SUM(p.total)::numeric, 2) AS value
      FROM pedidos p
      JOIN payment_methods m ON p.payment_method = m.id
      ${whereClause}
      GROUP BY m.nombre
      ORDER BY value DESC;
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ingresos por método de pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servicio de dashboard ejecutándose en el puerto ${port}`);
}); 