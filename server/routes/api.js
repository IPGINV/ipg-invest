const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { asyncHandler } = require('./utils');

const router = express.Router();

const CACHE_TTL = 5 * 60 * 1000;
const cache = { data: null, expiresAt: 0 };

const toPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const fetchGoldFromGoldApi = async () => {
  const urls = [
    'https://api.gold-api.com/price/XAU',
    'https://api.gold-api.com/price/XAU/USD'
  ];
  for (const url of urls) {
    try {
      const response = await axios.get(url, { timeout: 7000 });
      const price = toPositiveNumber(response?.data?.price);
      if (price) return { price, source: 'gold-api' };
    } catch (error) {
      // try next provider URL
    }
  }
  throw new Error('gold-api unavailable');
};

const fetchGoldFromStooq = async () => {
  const response = await axios.get('https://stooq.com/q/l/?s=xauusd&i=d', { timeout: 7000 });
  const line = String(response?.data || '').trim().split('\n')[1] || '';
  const parts = line.split(',');
  // Format: SYMBOL,DATE,TIME,OPEN,HIGH,LOW,CLOSE,VOLUME
  const close = parts[6];
  const price = toPositiveNumber(close);
  if (!price) throw new Error('stooq invalid response');
  return { price, source: 'stooq' };
};

const fetchGoldFromMetalPrice = async () => {
  const apiKey = process.env.METAL_PRICE_API_KEY;
  if (!apiKey) throw new Error('metalprice api key is not configured');
  const response = await axios.get(
    `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU`,
    { timeout: 7000 }
  );
  const result = response?.data || {};
  const xauRate = toPositiveNumber(result?.rates?.XAU);
  if (!xauRate) throw new Error('invalid metalprice response');
  return { price: 1 / xauRate, source: 'metalpriceapi' };
};

const fetchFxRates = async () => {
  const providers = [
    'https://open.er-api.com/v6/latest/USD',
    'https://api.exchangerate-api.com/v4/latest/USD'
  ];
  for (const url of providers) {
    try {
      const response = await axios.get(url, { timeout: 7000 });
      const rates = response?.data?.rates || {};
      const aed = toPositiveNumber(rates.AED);
      const rub = toPositiveNumber(rates.RUB);
      if (aed && rub) {
        return { AED: Number(aed.toFixed(2)), RUB: Number(rub.toFixed(2)) };
      }
    } catch (error) {
      // try next rates provider
    }
  }
  return { AED: 3.67, RUB: 98.5 };
};

const getGoldData = async () => {
  const goldProviders = [fetchGoldFromGoldApi, fetchGoldFromStooq, fetchGoldFromMetalPrice];
  let goldPrice = null;
  let source = 'fallback';
  for (const provider of goldProviders) {
    try {
      const result = await provider();
      const price = toPositiveNumber(result?.price);
      if (price) {
        goldPrice = price;
        source = result?.source || source;
        break;
      }
    } catch (error) {
      // try next provider
    }
  }

  if (!goldPrice) {
    throw new Error('all gold providers failed');
  }

  const fxRates = await fetchFxRates();
  return {
    goldPrice: Number(goldPrice.toFixed(2)),
    yearlyGrowth: 8.4,
    currencyRates: fxRates,
    source,
    timestamp: new Date().toISOString()
  };
};

router.get(
  '/market-data',
  asyncHandler(async (req, res) => {
    if (cache.data && cache.expiresAt > Date.now()) {
      return res.json(cache.data);
    }
    try {
      const data = await getGoldData();
      cache.data = data;
      cache.expiresAt = Date.now() + CACHE_TTL;
      return res.json(data);
    } catch (err) {
      if (cache.data) return res.json(cache.data);
      return res.json({
        goldPrice: 2050.5,
        yearlyGrowth: 8.4,
        currencyRates: { AED: 3.67, RUB: 98.5 },
        timestamp: new Date().toISOString()
      });
    }
  })
);

router.post(
  '/investments/calculate',
  asyncHandler(async (req, res) => {
    const { initialInvestment, cycles, reinvestmentEnabled, reinvestmentPercentage } = req.body || {};
    if (
      !Number.isFinite(initialInvestment) ||
      initialInvestment < 100 ||
      initialInvestment > 10000000
    ) {
      return res.status(400).json({ error: 'Invalid investment amount' });
    }
    if (!Number.isInteger(cycles) || cycles < 1 || cycles > 14) {
      return res.status(400).json({ error: 'Invalid cycle count' });
    }
    if (
      typeof reinvestmentEnabled !== 'boolean' ||
      !Number.isFinite(reinvestmentPercentage) ||
      reinvestmentPercentage < 0 ||
      reinvestmentPercentage > 100
    ) {
      return res.status(400).json({ error: 'Invalid reinvestment parameters' });
    }

    const stages = [];
    let principal = initialInvestment;
    let totalGains = 0;
    let reinvestedTotal = 0;
    let withdrawnTotal = 0;
    const cycleRate = 0.068;
    const cycleDays = 26;

    for (let i = 1; i <= cycles; i += 1) {
      const gainAmount = principal * cycleRate;
      totalGains += gainAmount;
      const reinvested = reinvestmentEnabled ? gainAmount * (reinvestmentPercentage / 100) : 0;
      const withdrawn = gainAmount - reinvested;
      reinvestedTotal += reinvested;
      withdrawnTotal += withdrawn;
      const principalAtStart = principal;
      const principalAtEnd = principal + gainAmount;
      principal = principal + reinvested;
      const totalValue = principal + withdrawnTotal;
      stages.push({
        stageNumber: i,
        dayStart: (i - 1) * cycleDays + 1,
        dayEnd: i * cycleDays,
        principalAtStart,
        gainAmount,
        principalAtEnd,
        reinvested,
        totalValue
      });
    }

    const finalValue = principal + withdrawnTotal;
    const roi = initialInvestment > 0 ? ((finalValue - initialInvestment) / initialInvestment) * 100 : 0;

    return res.json({
      success: true,
      calculationId: `calc_${crypto.randomBytes(6).toString('hex')}`,
      data: {
        input: {
          initialInvestment,
          cycles,
          reinvestmentEnabled,
          reinvestmentPercentage
        },
        stages,
        totalInvested: initialInvestment + reinvestedTotal,
        totalGains,
        finalValue,
        roi
      }
    });
  })
);

module.exports = router;
