import { CalculationResult, CalculationStage } from '../types';
import { CYCLE_GAIN_RATE, CYCLE_DAYS } from '../constants';

export const calculateInvestment = (
  initialInvestment: number,
  cycles: number,
  reinvestmentEnabled: boolean,
  reinvestmentPercentage: number
): CalculationResult => {
  const stages: CalculationStage[] = [];
  let currentPrincipal = initialInvestment;
  let totalWithdrawn = 0;
  let totalGains = 0;

  // Initial state (Day 0)
  // We can track day 0 if needed, but the requirement table starts at Cycle 1

  for (let i = 1; i <= cycles; i++) {
    const gainAmount = currentPrincipal * CYCLE_GAIN_RATE;
    totalGains += gainAmount;

    let reinvested = 0;
    let withdrawn = 0;

    if (reinvestmentEnabled) {
      reinvested = gainAmount * (reinvestmentPercentage / 100);
      withdrawn = gainAmount - reinvested;
    } else {
      withdrawn = gainAmount;
    }

    const principalAtStart = currentPrincipal;
    const principalAtEnd = currentPrincipal + reinvested;
    
    currentPrincipal = principalAtEnd;
    totalWithdrawn += withdrawn;

    stages.push({
      stageNumber: i,
      dayStart: (i - 1) * CYCLE_DAYS,
      dayEnd: i * CYCLE_DAYS,
      principalAtStart,
      gainAmount,
      principalAtEnd,
      reinvested,
      withdrawn,
      totalValue: currentPrincipal + totalWithdrawn // Total value generated (current assets + cash out)
    });
  }

  const roi = ((currentPrincipal + totalWithdrawn - initialInvestment) / initialInvestment) * 100;
  const multiplier = (currentPrincipal + totalWithdrawn) / initialInvestment;

  return {
    stages,
    totalInvested: initialInvestment, // This is initial cash injection
    totalGains,
    totalWithdrawn,
    finalValue: currentPrincipal, // Current active portfolio value
    roi,
    multiplier
  };
};