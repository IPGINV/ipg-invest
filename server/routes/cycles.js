const express = require('express');
const { query } = require('../db');
const { asyncHandler } = require('./utils');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

/** GET /cycles - list all cycles (public for dashboard) */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, cycle_number, cycle_date, yield_rate, created_at, updated_at
       FROM investment_cycles
       ORDER BY cycle_number ASC`
    );
    res.json(rows);
  })
);

/** POST /cycles - create cycle (admin only) */
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const { cycle_number, cycle_date, yield_rate } = req.body || {};
    if (!cycle_number || !cycle_date) {
      return res.status(400).json({ error: 'cycle_number and cycle_date are required' });
    }
    const num = parseInt(cycle_number, 10);
    if (!Number.isFinite(num) || num < 1) {
      return res.status(400).json({ error: 'cycle_number must be a positive integer' });
    }
    const rate = yield_rate !== undefined
      ? (Number(yield_rate) > 1 ? Number(yield_rate) / 100 : Number(yield_rate))
      : 0.068;
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      return res.status(400).json({ error: 'yield_rate must be between 0 and 100 (%) or 0 and 1' });
    }
    const { rows } = await query(
      `INSERT INTO investment_cycles (cycle_number, cycle_date, yield_rate)
       VALUES ($1, $2::date, $3)
       RETURNING id, cycle_number, cycle_date, yield_rate, created_at, updated_at`,
      [num, cycle_date, rate]
    );
    res.status(201).json(rows[0]);
  })
);

/** PUT /cycles/:id - update cycle (admin only) */
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { cycle_number, cycle_date, yield_rate } = req.body || {};

    const updates = [];
    const values = [];
    let idx = 1;
    if (cycle_number !== undefined) {
      const num = parseInt(cycle_number, 10);
      if (!Number.isFinite(num) || num < 1) {
        return res.status(400).json({ error: 'cycle_number must be a positive integer' });
      }
      updates.push(`cycle_number = $${idx++}`);
      values.push(num);
    }
    if (cycle_date !== undefined) {
      updates.push(`cycle_date = $${idx++}::date`);
      values.push(cycle_date);
    }
    if (yield_rate !== undefined) {
      let rate = Number(yield_rate);
      if (!Number.isFinite(rate) || rate < 0) {
        return res.status(400).json({ error: 'yield_rate must be a positive number' });
      }
      if (rate > 1) rate = rate / 100; // 6.8% -> 0.068
      if (rate > 1) return res.status(400).json({ error: 'yield_rate must be 0–100 (%) or 0–1' });
      updates.push(`yield_rate = $${idx++}`);
      values.push(rate);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'At least cycle_number, cycle_date or yield_rate required' });
    }
    values.push(id);
    const setClause = updates.join(', ');
    const { rows } = await query(
      `UPDATE investment_cycles
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${idx}
       RETURNING id, cycle_number, cycle_date, yield_rate, created_at, updated_at`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Cycle not found' });
    res.json(rows[0]);
  })
);

module.exports = router;
