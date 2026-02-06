const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

pool.on('connect', (client) => {
  client.query('SET search_path TO ipg').catch(() => {});
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
