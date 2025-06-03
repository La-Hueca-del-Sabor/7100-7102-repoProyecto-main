require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Conexión a PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'host.docker.internal',
  database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
  password: process.env.POSTGRES_PASSWORD || 'Shadin2001',
  port: process.env.POSTGRES_PORT || 5432,
});

// Middleware para verificar rol de mesero (role_id = 2)
const isMesero = (req, res, next) => {
  if (req.user && req.user.role_id === 2) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado: Se requiere rol de mesero' });
  }
};

// Obtener menú
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, precio FROM platos WHERE stock_disponible > 0'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener pedidos
app.get('/api/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const { mesa, cliente_nombre, cliente_telefono, platos, notas } = req.body;

    if (!platos || !Array.isArray(platos)) {
      return res.status(400).json({ error: 'Formato de platos inválido' });
    }

    const stockValido = await verificarStock(platos);

    if (!stockValido.valido) {
      return res.status(409).json({
        error: 'Stock insuficiente',
        itemsSinStock: stockValido.itemsSinStock
      });
    }

    // 1️⃣ Primero, insertar cliente (o usar un cliente existente si aplica)
    const nuevoClienteResult = await pool.query(
      `INSERT INTO clientes(nombre, telefono)
       VALUES($1, $2)
       RETURNING id`,
      [cliente_nombre, cliente_telefono]
    );
    const clienteId = nuevoClienteResult.rows[0].id;

    // 2️⃣ Insertar el pedido
    const nuevoPedidoResult = await pool.query(
      `INSERT INTO pedidos(mesa, estado, notas, mesero_id, cliente_id, status_id)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [mesa, 'pendiente', notas, 1, clienteId, 1] // 👈 Aquí `1` para status_id inicial
    );
    

    const nuevoPedido = nuevoPedidoResult.rows[0];

    // 3️⃣ (Opcional) Insertar los platos relacionados (en tabla intermedia)
    // Podrías agregar aquí la inserción a pedido_platos si corresponde.

    res.status(201).json({
      success: true,
      pedido: nuevoPedido
    });
  } catch (error) {
    console.error('Error real del backend:', error);
    res.status(500).json({
      error: 'Error interno',
      debug: error.message
    });
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
    const pedidosResult = await pool.query('SELECT * FROM pedidos');
    res.status(200).json({
      status: 'OK',
      mensaje: 'El servicio está activo y la base de datos responde',
      pedidos: pedidosResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'ERROR',
      mensaje: 'Error al conectar con la base de datos o al obtener pedidos',
      debug: process.env.NODE_ENV === 'development' ? error.stack : null
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Servicio de pedidos corriendo en el puerto ${PORT}`);
});
