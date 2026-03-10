const express = require('express');
const { query } = require('../db');
const { asyncHandler } = require('./utils');
const { authMiddleware } = require('../middleware/auth');
const { settleInternalAmount } = require('../services/paymentSettlement');

const router = express.Router();

/**
 * POST /deposits/submit
 * User submits tx hash after making manual crypto payment.
 * Creates a pending DEPOSIT transaction. Admin must confirm to credit balance.
 */
router.post(
  '/submit',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { amount, tx_hash } = req.body || {};

    if (!amount || !tx_hash || typeof tx_hash !== 'string') {
      return res.status(400).json({ error: 'amount and tx_hash are required' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const txHashTrimmed = String(tx_hash).trim();
    if (txHashTrimmed.length < 10) {
      return res.status(400).json({ error: 'tx_hash is too short or invalid' });
    }

    const settlement = settleInternalAmount({ amount: parsedAmount, settlementCurrency: 'USD' });
    const ghsAmount = Number(settlement.amount);

    const { rows } = await query(
      `INSERT INTO transactions (user_id, type, amount, status, comment, tx_hash)
       VALUES ($1, 'DEPOSIT', $2, 'pending', $3, $4)
       RETURNING id, user_id, type, amount, status, tx_hash, created_at, comment`,
      [userId, ghsAmount, `Manual deposit pending confirmation (TX: ${txHashTrimmed.substring(0, 16)}...)`, txHashTrimmed]
    );

    try {
      const { rows: userRows } = await query(
        `SELECT email, full_name, investor_id FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      );
      const userMeta = userRows[0] || {};
      const bot = require('../telegram-bot');
      if (typeof bot.notifyOwner === 'function') {
        await bot.notifyOwner(
          [
            'IPG DEPOSIT SUBMITTED',
            `Transaction ID: ${rows[0].id}`,
            `User ID: ${userId}`,
            `Investor ID: ${userMeta.investor_id || '-'}`,
            `Name: ${userMeta.full_name || '-'}`,
            `Email: ${userMeta.email || '-'}`,
            `Amount (settled): ${ghsAmount} ${settlement.currency || 'USD'}`,
            `TX hash: ${txHashTrimmed}`,
            `Time: ${new Date().toISOString()}`
          ].join('\n')
        );
      }
    } catch (error) {
      console.warn('[deposits] owner notification failed:', error?.message || error);
    }

    res.status(201).json({
      success: true,
      transaction: rows[0],
      message: 'Deposit submitted. Administrator will confirm and credit your balance after verification.'
    });
  })
);

module.exports = router;
