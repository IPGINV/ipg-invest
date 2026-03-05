const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query } = require('../db');

async function migrateVerifications() {
  await query(
    `INSERT INTO user_verifications (user_id, type, status, verified_at, metadata)
     SELECT
       id,
       'email',
       CASE WHEN email_verified THEN 'verified' ELSE 'pending' END,
       CASE WHEN email_verified THEN NOW() ELSE NULL END,
       jsonb_build_object('source', 'users.email_verified')
     FROM users
     ON CONFLICT (user_id, type) DO UPDATE
     SET status = EXCLUDED.status,
         verified_at = COALESCE(user_verifications.verified_at, EXCLUDED.verified_at),
         metadata = COALESCE(user_verifications.metadata, EXCLUDED.metadata),
         updated_at = NOW()`
  );

  await query(
    `INSERT INTO user_verifications (user_id, type, status, verified_at, metadata)
     SELECT
       id,
       'telegram',
       CASE WHEN telegram_id IS NOT NULL AND telegram_id <> '' THEN 'verified' ELSE 'pending' END,
       CASE WHEN telegram_id IS NOT NULL AND telegram_id <> '' THEN NOW() ELSE NULL END,
       jsonb_build_object('source', 'users.telegram_id')
     FROM users
     ON CONFLICT (user_id, type) DO UPDATE
     SET status = EXCLUDED.status,
         verified_at = COALESCE(user_verifications.verified_at, EXCLUDED.verified_at),
         metadata = COALESCE(user_verifications.metadata, EXCLUDED.metadata),
         updated_at = NOW()`
  );
}

async function migrateDocuments() {
  await query(
    `INSERT INTO user_documents (user_id, doc_type, file_url, status, uploaded_at)
     SELECT
       id,
       'passport',
       passport_file_path,
       'uploaded',
       NOW()
     FROM users
     WHERE passport_file_path IS NOT NULL AND passport_file_path <> ''
     ON CONFLICT DO NOTHING`
  );

  await query(
    `INSERT INTO user_verifications (user_id, type, status, metadata)
     SELECT
       id,
       'documents',
       CASE WHEN passport_file_path IS NOT NULL AND passport_file_path <> '' THEN 'uploaded' ELSE 'pending' END,
       jsonb_build_object('source', 'users.passport_file_path')
     FROM users
     ON CONFLICT (user_id, type) DO UPDATE
     SET status = CASE
         WHEN user_verifications.status IN ('approved', 'verified') THEN user_verifications.status
         ELSE EXCLUDED.status
       END,
       metadata = COALESCE(user_verifications.metadata, EXCLUDED.metadata),
       updated_at = NOW()`
  );
}

async function main() {
  try {
    await migrateVerifications();
    await migrateDocuments();
    console.log('Onboarding migration completed');
  } catch (error) {
    console.error('Onboarding migration failed:', error);
    process.exitCode = 1;
  }
}

main();
