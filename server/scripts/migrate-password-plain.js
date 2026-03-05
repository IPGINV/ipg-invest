/**
 * Добавляет колонку password_plain для открытого хранения паролей.
 * Запуск: node scripts/migrate-password-plain.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'ipg'
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO ipg');
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_plain VARCHAR(255)
    `);
    console.log('OK: Column password_plain added (or already exists)');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}
main();
