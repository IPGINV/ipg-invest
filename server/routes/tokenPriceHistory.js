const express = require('express');
const { query } = require('../db');
const { asyncHandler, parseLimit } = require('./utils');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = parseLimit(req.query.limit, 200);
    const { rows } = await query(
      `SELECT id, timestamp, price_usd
       FROM token_price_history
       ORDER BY timestamp DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { timestamp, price_usd } = req.body || {};
    if (price_usd === undefined) {
      return res.status(400).json({ error: 'price_usd is required' });
    }
    const { rows } = await query(
      `INSERT INTO token_price_history (timestamp, price_usd)
       VALUES ($1, $2)
       RETURNING id, timestamp, price_usd`,
      [timestamp || new Date().toISOString(), price_usd]
    );
    res.status(201).json(rows[0]);
  })
);

module.exports = router;
