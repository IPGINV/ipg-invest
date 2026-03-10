const express = require('express');
const { query } = require('../db');
const { asyncHandler, parseLimit } = require('./utils');
const { authMiddleware, adminMiddleware, requireActiveVerifiedUser } = require('../middleware/auth');
const { applyDepositBonuses } = require('../services/depositBonuses');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const limit = parseLimit(req.query.limit, 100);
    if (userId) {
      const { rows } = await query(
        `SELECT id, user_id, type, amount, status, created_at, comment, tx_hash
         FROM transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );
      return res.json(rows);
    }
    const { rows } = await query(
      `SELECT id, user_id, type, amount, status, created_at, comment, tx_hash
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
  requireActiveVerifiedUser,
  asyncHandler(async (req, res) => {
    const { user_id, type, amount, status, comment } = req.body || {};
    if (!user_id || !type || amount === undefined) {
      return res.status(400).json({ error: 'user_id, type, amount are required' });
    }
    const normalizedStatus = status || 'pending';
    const { rows } = await query(
      `INSERT INTO transactions (user_id, type, amount, status, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, type, amount, status, created_at, comment`,
      [user_id, type, amount, normalizedStatus, comment || null]
    );

    let bonuses = [];
    if (type === 'DEPOSIT' && normalizedStatus === 'completed') {
      const firstDepositCheck = await query(
        `SELECT id
         FROM transactions
         WHERE user_id = $1
           AND type = 'DEPOSIT'
           AND status = 'completed'
         ORDER BY created_at ASC
         LIMIT 1`,
        [user_id]
      );

      const isFirstCompletedDeposit = String(firstDepositCheck.rows[0]?.id || '') === String(rows[0].id);
      bonuses = await applyDepositBonuses({
        userId: user_id,
        depositTxId: rows[0].id,
        depositAmount: Number(amount) || 0,
        isFirstCompletedDeposit
      });
    }
    res.status(201).json({ ...rows[0], bonuses, bonus: bonuses[0] || null });
  })
);

/**
 * PATCH /transactions/:id/confirm
 * Admin confirms a pending manual deposit. Credits balance and sets transaction completed.
 */
router.patch(
  '/:id/confirm',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const txId = req.params.id;
    const { amount } = req.body || {};

    const { rows } = await query(
      `SELECT id, user_id, type, amount, status, tx_hash
       FROM transactions
       WHERE id = $1
       LIMIT 1`,
      [txId]
    );

    if (!rows.length) return res.status(404).json({ error: 'Transaction not found' });
    const tx = rows[0];
    if (tx.type !== 'DEPOSIT' || tx.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending DEPOSIT transactions can be confirmed' });
    }

    const confirmedAmount = Number(amount);
    const finalAmount = Number.isFinite(confirmedAmount) && confirmedAmount > 0
      ? confirmedAmount
      : Number(tx.amount);

    await query(
      `UPDATE transactions
       SET status = 'completed',
           amount = $1,
           comment = COALESCE(comment, '') || ' [Confirmed by admin]',
           updated_at = NOW()
       WHERE id = $2`,
      [finalAmount, txId]
    );

    await query(
      `INSERT INTO balances (user_id, currency, amount)
       VALUES ($1, 'USD', $2)
       ON CONFLICT (user_id, currency)
       DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
      [tx.user_id, finalAmount]
    );

    const { rows: contractRows } = await query(
      `SELECT id, amount_invested, start_date, end_date
       FROM contracts
       WHERE user_id = $1 AND status = 'active'
       ORDER BY start_date DESC
       LIMIT 1`,
      [tx.user_id]
    );

    if (contractRows.length) {
      const contract = contractRows[0];
      const newTotal = Number(contract.amount_invested) + finalAmount;
      await query(
        `UPDATE contracts SET amount_invested = $1, updated_at = NOW() WHERE id = $2`,
        [newTotal, contract.id]
      );
    } else {
      const startDate = new Date().toISOString().slice(0, 10);
      const endDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      await query(
        `INSERT INTO contracts (user_id, amount_invested, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [tx.user_id, finalAmount, startDate, endDate]
      );
    }

    const { rows: firstDepositCheck } = await query(
      `SELECT id FROM transactions
       WHERE user_id = $1 AND type = 'DEPOSIT' AND status = 'completed'
       ORDER BY created_at ASC
       LIMIT 1`,
      [tx.user_id]
    );
    const isFirstCompletedDeposit = firstDepositCheck.length && String(firstDepositCheck[0].id) === String(txId);
    const bonuses = await applyDepositBonuses({
      userId: tx.user_id,
      depositTxId: txId,
      depositAmount: finalAmount,
      isFirstCompletedDeposit
    });

    res.json({
      success: true,
      transaction_id: txId,
      amount: finalAmount,
      bonuses,
      bonus: bonuses[0] || null
    });
  })
);

module.exports = router;
