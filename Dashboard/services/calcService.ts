
import { INVESTMENT_CYCLES_2026, CYCLE_YIELD_RATE } from '../constants';
import { InvestmentCycle } from '../types';

/**
 * Calculates investment profitability based on the number of remaining cycles.
 * Logic: A cycle is included if investment date is at least 24 hours BEFORE the cycle date.
 */
export const calculateProfit = (initialAmount: number, startDateStr: string) => {
  const startDate = parseDate(startDateStr);
  
  let eligibleCycles = 0;
  
  for (const cycle of INVESTMENT_CYCLES_2026) {
    const cycleDate = parseDate(cycle.date);
    const cutoffDate = new Date(cycleDate.getTime() - 24 * 60 * 60 * 1000);
    
    if (startDate < cutoffDate) {
      eligibleCycles++;
    }
  }

  // Compound Interest: A = P(1 + r)^n
  const totalBalance = initialAmount * Math.pow(1 + CYCLE_YIELD_RATE, eligibleCycles);
  const profit = totalBalance - initialAmount;

  return {
    cyclesCount: eligibleCycles,
    totalBalance,
    profit
  };
};

/**
 * Finds the next available cycle based on the current date.
 */
export const getNextCycle = (): InvestmentCycle | null => {
  const now = new Date();
  
  for (const cycle of INVESTMENT_CYCLES_2026) {
    const cycleDate = parseDate(cycle.date);
    const cutoffDate = new Date(cycleDate.getTime() - 24 * 60 * 60 * 1000);
    
    if (now < cutoffDate) {
      return cycle;
    }
  }
  
  return null; // All cycles for the year passed
};

export const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
