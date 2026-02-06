const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const splitStatements = (sql) => {
  const statements = [];
  let current = '';
  let inDollar = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (char === '$' && next === '$') {
      inDollar = !inDollar;
      current += '$$';
      i += 1;
      continue;
    }

    if (char === ';' && !inDollar) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
};

const IGNORE_CODES = new Set([
  '42P06', // duplicate_schema
  '42P07', // duplicate_table / duplicate_relation
  '42710', // duplicate_object (type, trigger)
  '42723'  // duplicate_function
]);

const buildConfig = (databaseOverride) => ({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: databaseOverride || process.env.PGDATABASE
});

const ensureDatabaseExists = async () => {
  if (process.env.DATABASE_URL) {
    return;
  }

  const targetDb = process.env.PGDATABASE || 'ipg';
  const adminPool = new Pool(buildConfig('postgres'));
  try {
    await adminPool.query(`CREATE DATABASE ${targetDb}`);
    console.log(`Created database ${targetDb}`);
  } catch (err) {
    if (err && err.code !== '42P04') {
      throw err;
    }
  } finally {
    await adminPool.end();
  }
};

const main = async () => {
  const statements = splitStatements(schemaSql);
  console.log(`Applying schema: ${statements.length} statements`);

  await ensureDatabaseExists();
  const pool = new Pool(buildConfig());

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      if (err && IGNORE_CODES.has(err.code)) {
        continue;
      }
      console.error('Failed statement:', statement.slice(0, 200));
      throw err;
    }
  }

  console.log('Schema applied');
  await pool.end();
};

main()
  .catch((err) => {
    console.error('Schema apply failed:', err);
    process.exitCode = 1;
  });
