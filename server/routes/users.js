const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { asyncHandler, parseLimit } = require('./utils');

const router = express.Router();

const generateInvestorId = () => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INV-${random}`;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = parseLimit(req.query.limit, 100);
    const offset = Number(req.query.offset) || 0;
    const { rows } = await query(
      `SELECT id, investor_id, email, full_name, registration_date, status, passport_file_path, telegram_id, crypto_wallet
       FROM users
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, investor_id, email, full_name, registration_date, status, passport_file_path, telegram_id, crypto_wallet
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { email, password, full_name, passport_file_path } = req.body || {};
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password, full_name are required' });
    }

    let investorId = generateInvestorId();
    for (let i = 0; i < 5; i++) {
      const { rows } = await query(
        `SELECT 1 FROM users WHERE investor_id = $1`,
        [investorId]
      );
      if (!rows.length) break;
      investorId = generateInvestorId();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (investor_id, email, password_hash, full_name, passport_file_path)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, investor_id, email, full_name, registration_date, status`,
      [
        investorId,
        email,
        passwordHash,
        full_name,
        passport_file_path || ''
      ]
    );

    res.status(201).json(rows[0]);
  })
);

router.post(
  '/admin-create',
  asyncHandler(async (req, res) => {
    const { email, password, full_name, passport_file_path } = req.body || {};
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password, full_name are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 8 символов' });
    }

    const existing = await query(`SELECT 1 FROM users WHERE email = $1`, [email]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }

    let investorId = generateInvestorId();
    for (let i = 0; i < 5; i++) {
      const { rows } = await query(
        `SELECT 1 FROM users WHERE investor_id = $1`,
        [investorId]
      );
      if (!rows.length) break;
      investorId = generateInvestorId();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (
        investor_id, email, password_hash, full_name, passport_file_path,
        email_verified, status, registration_method
      ) VALUES ($1, $2, $3, $4, $5, true, 'active', 'admin')
      RETURNING id, investor_id, email, full_name, registration_date, status`,
      [
        investorId,
        email,
        passwordHash,
        full_name,
        passport_file_path || ''
      ]
    );

    res.status(201).json(rows[0]);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { email, full_name, status, passport_file_path, telegram_id, crypto_wallet, password } = req.body || {};
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const { rows } = await query(
      `UPDATE users
       SET
         email = COALESCE($1, email),
         full_name = COALESCE($2, full_name),
         status = COALESCE($3, status),
         passport_file_path = COALESCE($4, passport_file_path),
         telegram_id = COALESCE($5, telegram_id),
         crypto_wallet = COALESCE($6, crypto_wallet),
         password_hash = COALESCE($7, password_hash)
       WHERE id = $8
       RETURNING id, investor_id, email, full_name, registration_date, status`,
      [email, full_name, status, passport_file_path, telegram_id, crypto_wallet, passwordHash, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  })
);

router.post(
  '/:id/password',
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }

    const { rows } = await query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(current_password, rows[0].password_hash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid current password' });

    const nextHash = await bcrypt.hash(new_password, 10);
    await query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [nextHash, req.params.id]
    );

    res.json({ success: true });
  })
);

module.exports = router;
