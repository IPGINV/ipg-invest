const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { asyncHandler, parseLimit } = require('./utils');
const { withInvestorDisplayId } = require('../services/investorDisplayId');
const { adminMiddleware, ownerOrAdminMiddleware } = require('../middleware/auth');
const { calculateUserYield } = require('../services/yieldCalculator');
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
              , email_verified, onboarding_step, pending_expires_at, phone, password_plain
       FROM users
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { computeInvestorDisplayId } = require('../services/investorDisplayId');
    const isAdmin = req.user?.role === 'admin';
    const withDisplay = await Promise.all(rows.map(async (u) => {
      const displayId = await computeInvestorDisplayId(u.id);
      const out = { ...u, investor_display_id: displayId };
      if (!isAdmin) delete out.password_plain;
      return out;
    }));
    res.json(withDisplay);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, investor_id, email, full_name, registration_date, status, passport_file_path, telegram_id, crypto_wallet
              , email_verified, onboarding_step, pending_expires_at, phone, password_plain
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const user = await withInvestorDisplayId(rows[0]);
    if (req.user?.role !== 'admin') delete user.password_plain;
    res.json(user);
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
    const passwordPlain = String(password || '');
    const { rows } = await query(
      `INSERT INTO users (investor_id, email, password_hash, password_plain, full_name, passport_file_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, investor_id, email, full_name, registration_date, status`,
      [
        investorId,
        email,
        passwordHash,
        passwordPlain,
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
    const passwordPlain = String(password || '');
    const { rows } = await query(
      `INSERT INTO users (
        investor_id, email, password_hash, password_plain, full_name, passport_file_path,
        email_verified, status, registration_method
      ) VALUES ($1, $2, $3, $4, $5, $6, true, 'active', 'admin')
      RETURNING id, investor_id, email, full_name, registration_date, status`,
      [
        investorId,
        email,
        passwordHash,
        passwordPlain,
        full_name,
        passport_file_path || ''
      ]
    );

    res.status(201).json(rows[0]);
  })
);

router.post(
  '/:id/accrue-yield',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { rows: userRows } = await query(`SELECT id FROM users WHERE id = $1`, [userId]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });

    const yieldData = await calculateUserYield(Number(userId));
    const { rows: accruedRows } = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE user_id = $1 AND type = 'PROFIT_ACCRUAL' AND status = 'completed'`,
      [userId]
    );
    const alreadyAccrued = Number(accruedRows[0]?.total || 0);
    const toAccrue = Math.max(0, Math.round((yieldData.profit - alreadyAccrued) * 100) / 100);
    if (toAccrue <= 0) {
      return res.json({
        success: true,
        accrued: 0,
        message: 'Нечего начислять: доходность уже зачислена или отсутствует'
      });
    }

    await query(
      `INSERT INTO transactions (user_id, type, amount, status, comment)
       VALUES ($1, 'PROFIT_ACCRUAL', $2, 'completed', $3)`,
      [userId, toAccrue, `Доходность за ${yieldData.cyclesApplied} циклов (расчёт от ${new Date().toISOString().slice(0, 10)})`]
    );
    await query(
      `INSERT INTO balances (user_id, currency, amount)
       VALUES ($1, 'USD', $2)
       ON CONFLICT (user_id, currency) DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
      [userId, toAccrue]
    );

    res.json({
      success: true,
      accrued: toAccrue,
      cyclesApplied: yieldData.cyclesApplied
    });
  })
);

router.delete(
  '/:id',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { rows: userRows } = await query(`SELECT id FROM users WHERE id = $1`, [userId]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });

    try {
      await query(`DELETE FROM admin_logs WHERE target_user_id = $1`, [userId]);
      const { rows: piRows } = await query(`SELECT intent_id FROM payment_intents WHERE user_id = $1`, [userId]);
      for (const r of piRows) {
        await query(`DELETE FROM payment_events WHERE intent_id = $1`, [r.intent_id]);
      }
      await query(`DELETE FROM payment_intents WHERE user_id = $1`, [userId]);
      await query(`DELETE FROM user_documents WHERE user_id = $1`, [userId]);
      await query(`DELETE FROM user_verifications WHERE user_id = $1`, [userId]);
      await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
      await query(`DELETE FROM transactions WHERE user_id = $1`, [userId]);
      await query(`DELETE FROM balances WHERE user_id = $1`, [userId]);
      await query(`DELETE FROM contracts WHERE user_id = $1`, [userId]);
      await query(`DELETE FROM users WHERE id = $1`, [userId]);
    } catch (err) {
      if (err?.code === '23503') {
        return res.status(400).json({ error: 'Cannot delete: user has dependent records' });
      }
      throw err;
    }
    res.json({ success: true, message: 'Investor deleted' });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { email, full_name, status, passport_file_path, telegram_id, crypto_wallet, password } = req.body || {};
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const passwordPlain = password ? String(password) : null;
    const { rows } = await query(
      `UPDATE users
       SET
         email = COALESCE($1, email),
         full_name = COALESCE($2, full_name),
         status = COALESCE($3, status),
         passport_file_path = COALESCE($4, passport_file_path),
         telegram_id = COALESCE($5, telegram_id),
         crypto_wallet = COALESCE($6, crypto_wallet),
         password_hash = COALESCE($7, password_hash),
         password_plain = COALESCE($8, password_plain)
       WHERE id = $9
       RETURNING id, investor_id, email, full_name, registration_date, status`,
      [email, full_name, status, passport_file_path, telegram_id, crypto_wallet, passwordHash, passwordPlain, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  })
);

router.post(
  '/:id/kyc',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== 'admin' && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { surname, name, email, phone } = req.body || {};
    const fullName = [surname, name].filter(Boolean).join(' ').trim();
    const { rows } = await query(
      `UPDATE users
       SET full_name = CASE WHEN $1 <> '' THEN $1 ELSE full_name END,
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           onboarding_step = 'kyc_submitted'
       WHERE id = $4
       RETURNING id, full_name, email, phone, onboarding_step`,
      [fullName, email || null, phone || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: rows[0] });
  })
);

router.get(
  '/:id/documents',
  ownerOrAdminMiddleware('id'),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, user_id, doc_type, file_url, status, reviewer_comment, uploaded_at, reviewed_at
       FROM user_documents WHERE user_id = $1 ORDER BY uploaded_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  })
);

router.post(
  '/:id/confirm-documents',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { rows: userRows } = await query(`SELECT id, email_verified FROM users WHERE id = $1`, [userId]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });
    const { rows: docRows } = await query(
      `SELECT id FROM user_documents WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    if (!docRows.length) return res.status(400).json({ error: 'No documents uploaded. Confirm when investor has uploaded documents.' });

    await query(
      `UPDATE user_documents SET status = 'approved', reviewed_at = NOW() WHERE user_id = $1`,
      [userId]
    );
    await query(
      `INSERT INTO user_verifications (user_id, type, status, verified_at, metadata)
       VALUES ($1, 'documents', 'verified', NOW(), '{}')
       ON CONFLICT (user_id, type) DO UPDATE SET status = 'verified', verified_at = NOW(), updated_at = NOW()`,
      [userId]
    );
    await query(
      `UPDATE users SET email_verified = true, onboarding_step = 'completed', onboarding_completed_at = NOW() WHERE id = $1`,
      [userId]
    );
    res.json({ success: true, message: 'Верификация подтверждена. Инвестор — Верифицированный платинум.' });
  })
);

router.post(
  '/:id/reject-documents',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { rows: userRows } = await query(`SELECT id FROM users WHERE id = $1`, [userId]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });
    const { rows: docRows } = await query(
      `SELECT id FROM user_documents WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    if (!docRows.length) return res.status(400).json({ error: 'Нет загруженных документов для отклонения.' });

    await query(
      `UPDATE user_documents SET status = 'rejected', reviewed_at = NOW() WHERE user_id = $1`,
      [userId]
    );
    await query(
      `INSERT INTO user_verifications (user_id, type, status, metadata, updated_at)
       VALUES ($1, 'documents', 'rejected', '{}', NOW())
       ON CONFLICT (user_id, type) DO UPDATE SET status = 'rejected', verified_at = NULL, updated_at = NOW()`,
      [userId]
    );
    res.json({ success: true, message: 'Верификация отклонена. Инвестор может загрузить документы заново.' });
  })
);

router.post(
  '/:id/documents',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== 'admin' && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { file_url, doc_type } = req.body || {};
    if (!file_url) {
      return res.status(400).json({ error: 'file_url is required' });
    }

    const { rows } = await query(
      `UPDATE users
       SET passport_file_path = $1,
           onboarding_step = CASE
             WHEN onboarding_step IN ('registered', 'email_verified') THEN 'documents_uploaded'
             ELSE onboarding_step
           END
       WHERE id = $2
       RETURNING id, passport_file_path, onboarding_step`,
      [file_url, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    try {
      await query(
        `INSERT INTO user_documents (user_id, doc_type, file_url, status, uploaded_at)
         VALUES ($1, $2, $3, 'uploaded', NOW())`,
        [req.params.id, doc_type || 'passport', file_url]
      );
      await query(
        `INSERT INTO user_verifications (user_id, type, status, metadata, verified_at)
         VALUES ($1, 'documents', 'uploaded', jsonb_build_object('doc_type', $2), NULL)
         ON CONFLICT (user_id, type) DO UPDATE
         SET status = 'uploaded',
             metadata = jsonb_build_object('doc_type', $2),
             updated_at = NOW()`,
        [req.params.id, doc_type || 'passport']
      );
    } catch (error) {
      if (error?.code !== '42P01') {
        throw error;
      }
    }

    res.status(201).json({ success: true, document: rows[0] });
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
    const nextPlain = String(new_password || '');
    await query(
      `UPDATE users SET password_hash = $1, password_plain = $2 WHERE id = $3`,
      [nextHash, nextPlain, req.params.id]
    );

    res.json({ success: true });
  })
);

module.exports = router;
