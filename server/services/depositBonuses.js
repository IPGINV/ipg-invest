const { query } = require('../db');

const FIRST_DEPOSIT_BONUS_RATE = Number(process.env.FIRST_DEPOSIT_BONUS_RATE || 0);
const VOLUME_BONUS_TIERS = [
  { threshold: 50000, tokens: 6 },
  { threshold: 20000, tokens: 3 },
  { threshold: 10000, tokens: 1 }
];

const getVolumeBonusTokens = (depositAmount) => {
  const normalizedAmount = Number(depositAmount) || 0;
  const matchedTier = VOLUME_BONUS_TIERS.find((tier) => normalizedAmount >= tier.threshold);
  return matchedTier ? matchedTier.tokens : 0;
};

const creditBonus = async ({ userId, amount, comment, reason, currency = 'GHS' }) => {
  const normalizedAmount = Number(amount) || 0;
  if (normalizedAmount <= 0) return null;

  const existingBonus = await query(
    `SELECT id
     FROM transactions
     WHERE user_id = $1
       AND type = 'GHS_BONUS'
       AND comment = $2
     LIMIT 1`,
    [userId, comment]
  );

  if (existingBonus.rows.length) {
    return null;
  }

  await query(
    `INSERT INTO balances (user_id, currency, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, currency)
     DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
    [userId, currency, normalizedAmount]
  );

  await query(
    `INSERT INTO transactions (user_id, type, amount, status, comment)
     VALUES ($1, 'GHS_BONUS', $2, 'completed', $3)`,
    [userId, normalizedAmount, comment]
  );

  return {
    amount: normalizedAmount,
    currency,
    reason
  };
};

const applyDepositBonuses = async ({ userId, depositTxId, depositAmount, isFirstCompletedDeposit = false }) => {
  const bonuses = [];
  const normalizedDepositAmount = Number(depositAmount) || 0;

  if (isFirstCompletedDeposit) {
    const firstDepositBonusAmount = Number((normalizedDepositAmount * FIRST_DEPOSIT_BONUS_RATE).toFixed(8));
    const firstDepositBonus = await creditBonus({
      userId,
      amount: firstDepositBonusAmount,
      reason: 'first_deposit',
      comment: `First deposit bonus (${(FIRST_DEPOSIT_BONUS_RATE * 100).toFixed(2)}%) [deposit:${depositTxId}]`
    });
    if (firstDepositBonus) {
      bonuses.push(firstDepositBonus);
    }
  }

  const volumeBonusTokens = getVolumeBonusTokens(normalizedDepositAmount);
  if (volumeBonusTokens > 0) {
    const volumeBonus = await creditBonus({
      userId,
      amount: volumeBonusTokens,
      reason: 'investment_volume',
      comment: `Investment volume bonus (${volumeBonusTokens} GHS for deposit $${normalizedDepositAmount.toLocaleString('en-US')}) [deposit:${depositTxId}]`
    });
    if (volumeBonus) {
      bonuses.push(volumeBonus);
    }
  }

  return bonuses;
};

module.exports = {
  applyDepositBonuses,
  getVolumeBonusTokens
};
