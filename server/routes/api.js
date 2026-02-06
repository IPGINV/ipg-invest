const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { asyncHandler } = require('./utils');

const router = express.Router();

const CACHE_TTL = 5 * 60 * 1000;
const cache = { data: null, expiresAt: 0 };

const getGoldData = async () => {
  const apiKey = process.env.METAL_PRICE_API_KEY || 'd74227f0722d7eb9cf7b1dd6ebc5cad6';
  const response = await axios.get(
    `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,AED,RUB`
  );
  const result = response.data || {};
  if (!result.success || !result.rates) throw new Error('Invalid metalprice response');
  const goldPrice = 1 / result.rates.XAU;
  return {
    goldPrice: Number(goldPrice.toFixed(2)) || 2050.5,
    yearlyGrowth: 8.4,
    currencyRates: {
      AED: Number(result.rates.AED?.toFixed(2)) || 3.67,
      RUB: Number(result.rates.RUB?.toFixed(2)) || 98.5
    },
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
