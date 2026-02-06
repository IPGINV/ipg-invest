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
        `SELECT id, user_id, type, amount, status, created_at, comment
         FROM transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );
      return res.json(rows);
    }
    const { rows } = await query(
      `SELECT id, user_id, type, amount, status, created_at, comment
       FROM transactions
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { user_id, type, amount, status, comment } = req.body || {};
    if (!user_id || !type || amount === undefined) {
      return res.status(400).json({ error: 'user_id, type, amount are required' });
    }
    const { rows } = await query(
      `INSERT INTO transactions (user_id, type, amount, status, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, type, amount, status, created_at, comment`,
      [user_id, type, amount, status || 'pending', comment || null]
    );
    res.status(201).json(rows[0]);
  })
);

module.exports = router;
