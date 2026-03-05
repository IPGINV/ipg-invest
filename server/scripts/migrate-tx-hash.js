require('dotenv').config();
const { query } = require('../db');

async function run() {
  try {
    await query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(512) NULL
    `);
    console.log('Migration migrate-add-tx-hash: done');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

run();
