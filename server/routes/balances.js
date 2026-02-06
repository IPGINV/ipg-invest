const express = require('express');
const { query } = require('../db');
const { asyncHandler } = require('./utils');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (userId) {
      const { rows } = await query(
        `SELECT id, user_id, currency, amount
         FROM balances
         WHERE user_id = $1
         ORDER BY currency`,
        [userId]
      );
      return res.json(rows);
    }
    const { rows } = await query(
      `SELECT id, user_id, currency, amount
       FROM balances
       ORDER BY id DESC
       LIMIT 500`
    );
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { user_id, currency, amount } = req.body || {};
    if (!user_id || !currency || amount === undefined) {
      return res.status(400).json({ error: 'user_id, currency, amount are required' });
    }
    const { rows } = await query(
      `INSERT INTO balances (user_id, currency, amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, currency) DO UPDATE SET amount = EXCLUDED.amount
       RETURNING id, user_id, currency, amount`,
      [user_id, currency, amount]
    );
    res.status(201).json(rows[0]);
  })
);

module.exports = router;
