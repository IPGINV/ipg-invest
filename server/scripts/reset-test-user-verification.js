/**
 * Reset verification status for the test account (test@example.com).
 * Run from server directory: node scripts/reset-test-user-verification.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query, pool } = require('../db');

const TEST_EMAIL = 'test@example.com';

async function main() {
  const userRes = await query(
    `SELECT id, investor_id, email FROM users WHERE email = $1 LIMIT 1`,
    [TEST_EMAIL]
  );

  if (!userRes.rows.length) {
    console.log(`Test user not found: ${TEST_EMAIL}`);
    process.exitCode = 1;
    return;
  }

  const userId = userRes.rows[0].id;
  const investorId = userRes.rows[0].investor_id;

  // Reset users table
  await query(
    `UPDATE users
     SET email_verified = false,
         status = 'pending',
         onboarding_step = 'registered',
         pending_expires_at = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  );

  // Reset user_verifications (email, telegram) to pending
  await query(
    `UPDATE user_verifications
     SET status = 'pending',
         verified_at = NULL,
         token = NULL,
         expires_at = NULL,
         updated_at = NOW()
     WHERE user_id = $1 AND type IN ('email', 'telegram')`,
    [userId]
  );

  // If no rows in user_verifications, insert pending records
  const uvCheck = await query(
    `SELECT 1 FROM user_verifications WHERE user_id = $1 AND type = 'email'`,
    [userId]
  );
  if (!uvCheck.rows.length) {
    await query(
      `INSERT INTO user_verifications (user_id, type, status, metadata)
       VALUES ($1, 'email', 'pending', '{"source":"reset"}'::jsonb)
       ON CONFLICT (user_id, type) DO UPDATE SET status = 'pending', verified_at = NULL, updated_at = NOW()`,
      [userId]
    );
    await query(
      `INSERT INTO user_verifications (user_id, type, status, metadata)
       VALUES ($1, 'telegram', 'pending', '{"source":"reset"}'::jsonb)
       ON CONFLICT (user_id, type) DO UPDATE SET status = 'pending', verified_at = NULL, updated_at = NOW()`,
      [userId]
    );
  }

  console.log(`Verification reset for test account: ${TEST_EMAIL} (ID: ${userId}, ${investorId})`);
}

main()
  .catch((err) => {
    console.error('Failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
