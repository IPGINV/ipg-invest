const express = require('express');
const crypto = require('crypto');
const { query } = require('../db');
const { asyncHandler, parseLimit } = require('./utils');
const { authMiddleware } = require('../middleware/auth');
const { createPaymentIntent, verifyWebhookSignature } = require('../services/cryptoGateway');
const { settleInternalAmount } = require('../services/paymentSettlement');
const { applyDepositBonuses } = require('../services/depositBonuses');

const router = express.Router();
const gatewayEnabled = () => ['1', 'true', 'yes', 'on'].includes(String(process.env.CRYPTO_GATEWAY_ENABLED || 'true').toLowerCase());
const isAllowedWebhookIp = (ip) => {
  const allowlist = (process.env.CRYPTO_GATEWAY_WEBHOOK_IPS || '').split(',').map((v) => v.trim()).filter(Boolean);
  if (!allowlist.length) return true;
  const normalized = String(ip || '').replace('::ffff:', '').trim();
  return allowlist.includes(normalized);
};

const isVerifiedUser = (user) => Boolean(user.email_verified || (user.telegram_id && String(user.telegram_id).trim()));
const hasSubmittedKyc = (user) => ['kyc_submitted', 'documents_uploaded', 'contact_binding', 'completed'].includes(String(user.onboarding_step || ''));

router.post(
  '/precheck',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!gatewayEnabled()) {
      return res.status(503).json({ error: 'Crypto gateway disabled' });
    }
    const userId = req.user.id;
    const { rows } = await query(
      `SELECT id, email_verified, telegram_id, onboarding_step
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];

    const verified = isVerifiedUser(user);
    if (verified) {
      return res.json({ nextStep: 'gateway_direct', verified: true });
    }

    if (!hasSubmittedKyc(user)) {
      return res.json({ nextStep: 'kyc_required', verified: false });
    }

    return res.json({ nextStep: 'gateway_direct', verified: false, kycSubmitted: true });
  })
);

router.post(
  '/intents',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!gatewayEnabled()) {
      return res.status(503).json({ error: 'Crypto gateway disabled' });
    }
    const userId = req.user.id;
    const { amount, settlementCurrency, asset, network, source } = req.body || {};
    const settlement = settleInternalAmount({ amount, settlementCurrency });
    const normalizedAmount = Number(settlement.amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const { rows: users } = await query(
      `SELECT id, email_verified, telegram_id, onboarding_step
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    if (!isVerifiedUser(users[0]) && !hasSubmittedKyc(users[0])) {
      return res.status(403).json({ error: 'VerificationRequired', nextStep: 'kyc_required' });
    }

    const intentId = `intent_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    let gatewayPayload;
    try {
      gatewayPayload = await createPaymentIntent({
        intentId,
        amount: normalizedAmount,
        currency: settlementCurrency || 'USD',
        asset: asset || 'USDT',
        network: network || 'TRC20',
        callbackUrl: `${process.env.CRYPTO_GATEWAY_CALLBACK_URL || ''}`
      });
    } catch (error) {
      const statusCode = Number(error?.statusCode || 502);
      return res.status(statusCode).json({ error: error.message || 'Failed to create gateway payment' });
    }

    const { rows } = await query(
      `INSERT INTO payment_intents (
        intent_id, provider_payment_id, user_id, expected_fiat_amount,
        settlement_currency, crypto_asset, crypto_network, expected_crypto_amount,
        provider_status, internal_status, payment_url, expires_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, NOW() + INTERVAL '30 minutes', $11::jsonb)
      RETURNING intent_id, provider_payment_id, expected_fiat_amount, settlement_currency, crypto_asset, crypto_network, provider_status, internal_status, payment_url, expires_at`,
      [
        intentId,
        gatewayPayload.providerPaymentId,
        userId,
        normalizedAmount,
        settlement.currency,
        gatewayPayload.asset || asset || 'USDT',
        gatewayPayload.network || network || 'TRC20',
        gatewayPayload.expectedCryptoAmount,
        gatewayPayload.providerStatus,
        gatewayPayload.paymentUrl,
        JSON.stringify({ source: source || 'dashboard', createdBy: 'payments.intents' })
      ]
    );

    res.status(201).json(rows[0]);
  })
);

router.get(
  '/intents/:intentId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!gatewayEnabled()) {
      return res.status(503).json({ error: 'Crypto gateway disabled' });
    }
    const { rows } = await query(
      `SELECT intent_id, provider_payment_id, user_id, expected_fiat_amount, settlement_currency, settled_amount,
              crypto_asset, crypto_network, expected_crypto_amount, paid_crypto_amount,
              provider_status, internal_status, payment_url, expires_at, metadata, created_at, updated_at
       FROM payment_intents
       WHERE intent_id = $1
       LIMIT 1`,
      [req.params.intentId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Intent not found' });
    const intent = rows[0];
    if (req.user.role !== 'admin' && String(req.user.id) !== String(intent.user_id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(intent);
  })
);

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const limit = parseLimit(req.query.limit, 200);
    const { rows } = await query(
      `SELECT intent_id, provider_payment_id, user_id, expected_fiat_amount, settlement_currency, settled_amount,
              crypto_asset, crypto_network, paid_crypto_amount, provider_status, internal_status, created_at, updated_at
       FROM payment_intents
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  })
);

router.post(
  '/webhook',
  express.raw({ type: '*/*' }),
  asyncHandler(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body || {});
    let payload = {};
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const remoteIp = req.ip || req.socket?.remoteAddress || '';
    if (!isAllowedWebhookIp(remoteIp)) {
      return res.status(403).json({ error: 'Webhook IP is not allowed' });
    }

    const signature = req.headers['x-nowpayments-sig'] || req.headers['x-gateway-signature'];
    const signatureValid = verifyWebhookSignature(rawBody, typeof signature === 'string' ? signature : '');
    if (!signatureValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const providerPaymentId = String(payload.payment_id || payload.id || payload.order_id || '');
    const providerStatus = String(payload.payment_status || payload.status || '').toLowerCase();
    const eventFingerprint = `${providerPaymentId}:${providerStatus}:${payload.updated_at || payload.created_at || payload.tx_hash || ''}`;
    const providerEventId = String(payload.event_id || payload.ipn_id || eventFingerprint);
    const paidCryptoAmount = Number(payload.actually_paid || payload.pay_amount || payload.outcome_amount || payload.paid_amount || 0);
    const settledAmount = Number(payload.price_amount || payload.settled_amount || payload.fiat_amount || 0);
    if (!providerEventId || !providerPaymentId) {
      return res.status(400).json({ error: 'Unable to resolve provider event/payment identifiers' });
    }

    const { rows: intentRows } = await query(
      `SELECT intent_id, user_id, expected_fiat_amount, settlement_currency, internal_status
       FROM payment_intents
       WHERE provider_payment_id = $1
       LIMIT 1`,
      [providerPaymentId]
    );
    if (!intentRows.length) return res.status(404).json({ error: 'Payment intent not found' });
    const intent = intentRows[0];

    const existingEvent = await query(
      `SELECT id FROM payment_events WHERE provider_event_id = $1 LIMIT 1`,
      [providerEventId]
    );
    if (existingEvent.rows.length) {
      return res.json({ success: true, duplicate: true });
    }

    await query(
      `INSERT INTO payment_events (provider_event_id, intent_id, provider_status, signature_valid, raw_payload, processed_at)
       VALUES ($1, $2, $3, true, $4::jsonb, NOW())`,
      [providerEventId, intent.intent_id, providerStatus || null, JSON.stringify(payload)]
    );

    const isConfirmed = ['confirmed', 'paid', 'completed', 'finished'].includes(providerStatus);
    const nextInternalStatus = isConfirmed ? 'confirmed' : ['failed', 'expired', 'cancelled', 'refunded'].includes(providerStatus) ? providerStatus : 'pending';
    await query(
      `UPDATE payment_intents
       SET provider_status = $1,
           internal_status = $2,
           paid_crypto_amount = COALESCE($3, paid_crypto_amount),
           settled_amount = COALESCE($4, settled_amount),
           updated_at = NOW()
       WHERE intent_id = $5`,
      [providerStatus || 'unknown', nextInternalStatus, paidCryptoAmount || null, settledAmount || null, intent.intent_id]
    );

    if (isConfirmed && intent.internal_status !== 'confirmed') {
      const settlement = settleInternalAmount({
        amount: settledAmount > 0 ? settledAmount : Number(intent.expected_fiat_amount),
        settlementCurrency: intent.settlement_currency || 'USD'
      });
      const depositAmount = settlement.amount;
      const { rows: depositRows } = await query(
        `INSERT INTO transactions (user_id, type, amount, status, comment)
         VALUES ($1, 'DEPOSIT', $2, 'completed', $3)
         RETURNING id`,
        [intent.user_id, depositAmount, `Crypto gateway deposit (${intent.intent_id})`]
      );
      const depositTxId = depositRows[0]?.id;
      await query(
        `INSERT INTO balances (user_id, currency, amount)
         VALUES ($1, 'USD', $2)
         ON CONFLICT (user_id, currency)
         DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
        [intent.user_id, depositAmount]
      );
      const { rows: contractRows } = await query(
        `SELECT id, amount_invested FROM contracts
         WHERE user_id = $1 AND status = 'active'
         ORDER BY start_date DESC LIMIT 1`,
        [intent.user_id]
      );
      if (contractRows.length) {
        const newTotal = Number(contractRows[0].amount_invested) + depositAmount;
        await query(
          `UPDATE contracts SET amount_invested = $1, updated_at = NOW() WHERE id = $2`,
          [newTotal, contractRows[0].id]
        );
      } else {
        const startDate = new Date().toISOString().slice(0, 10);
        const endDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        await query(
          `INSERT INTO contracts (user_id, amount_invested, start_date, end_date, status)
           VALUES ($1, $2, $3, $4, 'active')`,
          [intent.user_id, depositAmount, startDate, endDate]
        );
      }

      const { rows: firstDepositCheck } = await query(
        `SELECT id
         FROM transactions
         WHERE user_id = $1
           AND type = 'DEPOSIT'
           AND status = 'completed'
         ORDER BY created_at ASC
         LIMIT 1`,
        [intent.user_id]
      );
      const isFirstCompletedDeposit = String(firstDepositCheck[0]?.id || '') === String(depositTxId || '');
      await applyDepositBonuses({
        userId: intent.user_id,
        depositTxId,
        depositAmount,
        isFirstCompletedDeposit
      });
    }

    res.json({ success: true });
  })
);

module.exports = router;
