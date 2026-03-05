const crypto = require('crypto');
const axios = require('axios');

const provider = String(process.env.CRYPTO_GATEWAY_PROVIDER || 'mock').toLowerCase();
const providerBase = process.env.CRYPTO_GATEWAY_BASE_URL || 'https://api.nowpayments.io/v1';
const allowMockFallback = ['1', 'true', 'yes', 'on'].includes(String(process.env.CRYPTO_GATEWAY_ALLOW_MOCK_FALLBACK || 'true').toLowerCase());
const mockPayUrlBase = process.env.CRYPTO_GATEWAY_MOCK_PAY_URL_BASE || process.env.PAYMENT_SUCCESS_URL || 'https://ipg-invest.ae/payment-success';

const parseList = (value, fallback = []) => {
  const list = String(value || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return list.length ? list : fallback;
};

const allowedAssets = parseList(process.env.PAYMENT_COINS, ['usdt', 'trx', 'usdc', 'eth']);
const allowedUsdtNetworks = parseList(process.env.PAYMENT_USDT_NETWORKS, ['trc20', 'erc20']);
const allowedUsdcNetworks = parseList(process.env.PAYMENT_USDC_NETWORKS, ['erc20']);

const mapPayCurrency = (asset, network) => {
  const normalizedAsset = String(asset || 'USDT').toUpperCase();
  const normalizedNetwork = String(network || '').toUpperCase();
  if (normalizedAsset === 'USDT') {
    if (normalizedNetwork === 'TRC20') return 'usdttrc20';
    if (normalizedNetwork === 'ERC20') return 'usdterc20';
    return 'usdt';
  }
  if (normalizedAsset === 'USDC') {
    if (normalizedNetwork === 'ERC20') return 'usdcerc20';
    return 'usdc';
  }
  if (normalizedAsset === 'TRX') return 'trx';
  if (normalizedAsset === 'ETH') return 'eth';
  throw new Error(`Unsupported asset: ${normalizedAsset}`);
};

const validateAssetNetwork = (asset, network) => {
  const normalizedAsset = String(asset || '').toLowerCase();
  const normalizedNetwork = String(network || '').toLowerCase();
  if (!allowedAssets.includes(normalizedAsset)) {
    const err = new Error(`Unsupported payment asset: ${asset}`);
    err.statusCode = 400;
    throw err;
  }
  if (normalizedAsset === 'usdt' && normalizedNetwork && !allowedUsdtNetworks.includes(normalizedNetwork)) {
    const err = new Error(`Unsupported USDT network: ${network}`);
    err.statusCode = 400;
    throw err;
  }
  if (normalizedAsset === 'usdc' && normalizedNetwork && !allowedUsdcNetworks.includes(normalizedNetwork)) {
    const err = new Error(`Unsupported USDC network: ${network}`);
    err.statusCode = 400;
    throw err;
  }
};

const createMockIntent = async ({ intentId, amount, currency, asset, network, callbackUrl }) => {
  const paymentId = `pg_${intentId}`;
  const paymentUrl = `${mockPayUrlBase}?mock=1&payment_id=${encodeURIComponent(paymentId)}&asset=${encodeURIComponent(String(asset || 'USDT'))}&network=${encodeURIComponent(String(network || 'TRC20'))}&amount=${encodeURIComponent(String(amount || 0))}`;
  return {
    providerPaymentId: paymentId,
    paymentUrl,
    providerStatus: 'created',
    expectedCryptoAmount: Number(amount) || 0,
    callbackUrl,
    currency,
    asset,
    network
  };
};

const createNowPaymentsIntent = async ({ intentId, amount, currency, asset, network, callbackUrl }) => {
  validateAssetNetwork(asset, network);
  const apiKey = process.env.CRYPTO_GATEWAY_API_KEY || '';
  if (!apiKey) {
    const err = new Error('CRYPTO_GATEWAY_API_KEY is required for NowPayments');
    err.statusCode = 500;
    throw err;
  }
  const payCurrency = mapPayCurrency(asset, network);
  const payload = {
    price_amount: Number(amount),
    price_currency: String(currency || 'USD').toLowerCase(),
    pay_currency: payCurrency,
    order_id: intentId,
    order_description: `Contract top-up ${intentId}`,
    ipn_callback_url: callbackUrl || process.env.CRYPTO_GATEWAY_CALLBACK_URL || '',
    success_url: process.env.PAYMENT_SUCCESS_URL || undefined,
    cancel_url: process.env.PAYMENT_CANCEL_URL || undefined
  };
  const { data } = await axios.post(`${providerBase}/payment`, payload, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  return {
    providerPaymentId: String(data.payment_id || data.id || intentId),
    paymentUrl: data.invoice_url || data.pay_url || '',
    providerStatus: String(data.payment_status || 'waiting'),
    expectedCryptoAmount: Number(data.pay_amount || 0),
    callbackUrl: payload.ipn_callback_url,
    currency: String(currency || 'USD').toUpperCase(),
    asset: String(asset || 'USDT').toUpperCase(),
    network: String(network || '').toUpperCase(),
    raw: data
  };
};

const createPaymentIntent = async (params) => {
  if (provider === 'nowpayments') {
    try {
      return await createNowPaymentsIntent(params);
    } catch (error) {
      if (!allowMockFallback) {
        throw error;
      }
      return createMockIntent(params);
    }
  }
  return createMockIntent(params);
};

const verifyNowPaymentsSignature = (rawBody, signatureHeader) => {
  const secret = process.env.CRYPTO_GATEWAY_WEBHOOK_SECRET || '';
  if (!secret) return true;
  if (!signatureHeader) return false;
  let parsed;
  try {
    parsed = JSON.parse(rawBody || '{}');
  } catch {
    return false;
  }
  const sortedBody = JSON.stringify(parsed, Object.keys(parsed).sort());
  const digest = crypto.createHmac('sha512', secret).update(sortedBody).digest('hex');
  const provided = String(signatureHeader);
  if (digest.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
};

const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (provider === 'nowpayments') {
    return verifyNowPaymentsSignature(rawBody, signatureHeader);
  }
  const secret = process.env.CRYPTO_GATEWAY_WEBHOOK_SECRET || '';
  if (!secret) return true;
  if (!signatureHeader) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return digest === signatureHeader;
};

module.exports = {
  createPaymentIntent,
  verifyWebhookSignature
};
