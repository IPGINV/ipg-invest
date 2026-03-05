require('dotenv').config();
const { query } = require('../db');

const DEFAULT_CYCLES = [
  { number: 1, date: '2026-02-16', yield_rate: 0.068 },
  { number: 2, date: '2026-03-13', yield_rate: 0.068 },
  { number: 3, date: '2026-04-07', yield_rate: 0.068 },
  { number: 4, date: '2026-05-04', yield_rate: 0.068 },
  { number: 5, date: '2026-05-29', yield_rate: 0.068 },
  { number: 6, date: '2026-06-23', yield_rate: 0.068 },
  { number: 7, date: '2026-07-20', yield_rate: 0.068 },
  { number: 8, date: '2026-08-14', yield_rate: 0.068 },
  { number: 9, date: '2026-09-08', yield_rate: 0.068 },
  { number: 10, date: '2026-10-05', yield_rate: 0.068 },
  { number: 11, date: '2026-10-30', yield_rate: 0.068 },
  { number: 12, date: '2026-11-24', yield_rate: 0.068 },
  { number: 13, date: '2026-12-21', yield_rate: 0.068 },
  { number: 14, date: '2027-01-18', yield_rate: 0.068 },
];

async function run() {
  const forceSeed = process.argv.includes('--force');
  try {
    await query('SET search_path TO ipg');
    await query(`
      CREATE TABLE IF NOT EXISTS investment_cycles (
        id BIGSERIAL PRIMARY KEY,
        cycle_number INT NOT NULL UNIQUE,
        cycle_date DATE NOT NULL,
        yield_rate DECIMAL(10, 6) NOT NULL DEFAULT 0.068,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (yield_rate >= 0 AND yield_rate <= 1)
      )
    `);

    const { rows } = await query(`SELECT id FROM investment_cycles LIMIT 1`);
    if (rows.length > 0 && !forceSeed) {
      console.log('Migration migrate-investment-cycles: table has data, skipping seed (use --force to re-seed)');
      process.exit(0);
      return;
    }

    for (const c of DEFAULT_CYCLES) {
      await query(
        `INSERT INTO investment_cycles (cycle_number, cycle_date, yield_rate)
         VALUES ($1, $2::date, $3)
         ON CONFLICT (cycle_number) DO UPDATE SET cycle_date = EXCLUDED.cycle_date, yield_rate = EXCLUDED.yield_rate, updated_at = CURRENT_TIMESTAMP`,
        [c.number, c.date, c.yield_rate]
      );
    }
    console.log('Migration migrate-investment-cycles: done (table + 14 cycles)');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

run();
