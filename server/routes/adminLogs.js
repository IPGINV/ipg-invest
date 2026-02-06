const express = require('express');
const { query } = require('../db');
const { asyncHandler, parseLimit } = require('./utils');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = parseLimit(req.query.limit, 200);
    const { rows } = await query(
      `SELECT id, timestamp, ip_address, action_type, target_user_id, details
       FROM admin_logs
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
    const { ip_address, action_type, target_user_id, details } = req.body || {};
    if (!ip_address || !action_type || !target_user_id || !details) {
      return res.status(400).json({ error: 'ip_address, action_type, target_user_id, details are required' });
    }
    const { rows } = await query(
      `INSERT INTO admin_logs (ip_address, action_type, target_user_id, details)
       VALUES ($1, $2, $3, $4)
       RETURNING id, timestamp, ip_address, action_type, target_user_id, details`,
      [ip_address, action_type, target_user_id, details]
    );
    res.status(201).json(rows[0]);
  })
);

module.exports = router;
