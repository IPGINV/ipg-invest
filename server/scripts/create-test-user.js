const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../db');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const LOGIN = 'Test';
const PASSWORD = 'Testtest';
const EMAIL = 'test@example.com';
const FULL_NAME = 'Test User';

const generateInvestorId = () => `INV-TEST-${Date.now()}`;

const main = async () => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const existing = await query(
    `SELECT id FROM users WHERE email = $1 OR telegram_id = $2 LIMIT 1`,
    [EMAIL, LOGIN]
  );

  if (existing.rows.length) {
    const userId = existing.rows[0].id;
    await query(
      `UPDATE users
       SET password_hash = $1,
           full_name = $2,
           status = 'active',
           email_verified = true,
           telegram_id = $3,
           registration_method = 'manual'
       WHERE id = $4`,
      [passwordHash, FULL_NAME, LOGIN, userId]
    );
    console.log(`Updated test user with id ${userId}`);
    return;
  }

  const investorId = generateInvestorId();
  const result = await query(
    `INSERT INTO users (
      investor_id, email, password_hash, full_name,
      email_verified, status, registration_method, telegram_id
    ) VALUES ($1, $2, $3, $4, true, 'active', 'manual', $5)
    RETURNING id`,
    [investorId, EMAIL, passwordHash, FULL_NAME, LOGIN]
  );

  console.log(`Created test user with id ${result.rows[0].id}`);
};

main()
  .catch((err) => {
    console.error('Failed to create test user:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
