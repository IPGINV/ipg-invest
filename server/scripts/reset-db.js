const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const buildConfig = () => ({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'ipg'
});

const main = async () => {
  const pool = new Pool(buildConfig());
  
  try {
    console.log('Dropping and recreating schema...');
    
    // Drop schema cascade (удалит все таблицы, типы, функции)
    await pool.query('DROP SCHEMA IF EXISTS ipg CASCADE');
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA IF NOT EXISTS public');
    
    // Создаем schema ipg
    await pool.query('CREATE SCHEMA IF NOT EXISTS ipg');
    
    console.log('Schema reset complete');
    
    // Теперь применяем полную схему
    const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying full schema...');
    await pool.query(schemaSql);
    
    console.log('✅ Database reset and schema applied successfully!');
  } catch (err) {
    console.error('Failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
};

main()
  .catch((err) => {
    console.error('Database reset failed:', err);
    process.exitCode = 1;
  });
