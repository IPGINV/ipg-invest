const express = require('express');
const { query } = require('../db');
const { asyncHandler, parseLimit } = require('./utils');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const limit = parseLimit(req.query.limit, 100);
    if (userId) {
      const { rows } = await query(
        `SELECT id, user_id, amount_invested, start_date, end_date, status, final_profit
         FROM contracts
         WHERE user_id = $1
         ORDER BY start_date DESC
         LIMIT $2`,
        [userId, limit]
      );
      return res.json(rows);
    }
    const { rows } = await query(
      `SELECT id, user_id, amount_invested, start_date, end_date, status, final_profit
       FROM contracts
       ORDER BY start_date DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { user_id, amount_invested, start_date, end_date, status, final_profit } = req.body || {};
    if (!user_id || amount_invested === undefined || !start_date || !end_date) {
      return res.status(400).json({ error: 'user_id, amount_invested, start_date, end_date are required' });
    }
    const { rows } = await query(
      `INSERT INTO contracts (user_id, amount_invested, start_date, end_date, status, final_profit)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, amount_invested, start_date, end_date, status, final_profit`,
      [user_id, amount_invested, start_date, end_date, status || 'active', final_profit || null]
    );
    res.status(201).json(rows[0]);
  })
);

module.exports = router;
