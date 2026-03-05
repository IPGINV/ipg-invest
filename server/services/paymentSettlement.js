const settleInternalAmount = ({ amount, settlementCurrency }) => {
  const numericAmount = Number(amount) || 0;
  const currency = settlementCurrency === 'GHS' ? 'GHS' : 'USD';
  const ghsPerUsd = Number(process.env.GHS_PER_USD || 1);
  if (currency === 'GHS') {
    return {
      currency: 'GHS',
      amount: Number((numericAmount * ghsPerUsd).toFixed(8))
    };
  }
  return {
    currency: 'USD',
    amount: Number(numericAmount.toFixed(8))
  };
};

module.exports = {
  settleInternalAmount
};
