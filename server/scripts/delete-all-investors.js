require('dotenv').config();
const { query } = require('../db');

async function run() {
  try {
    await query('SET search_path TO ipg');
    
    const { rows } = await query('SELECT id FROM users');
    const count = rows.length;
    
    if (count === 0) {
      console.log('Нет инвесторов для удаления.');
      process.exit(0);
      return;
    }

    await query('DELETE FROM admin_logs');
    await query('DELETE FROM payment_events');
    await query('DELETE FROM payment_intents');
    await query('DELETE FROM user_documents');
    await query('DELETE FROM user_verifications');
    await query('DELETE FROM sessions');
    await query('DELETE FROM transactions');
    await query('DELETE FROM balances');
    await query('DELETE FROM contracts');
    await query('DELETE FROM users');

    console.log(`Удалено инвесторов: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

run();
