// services/inventory-service/src/db.js
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'Shadin2001',
    database: process.env.POSTGRES_DB || 'la_hueca_del_sabor_db',
    port: 5432
})

module.exports = pool;