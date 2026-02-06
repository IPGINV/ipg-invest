export interface CalculationStage {
  stageNumber: number;
  dayStart: number;
  dayEnd: number;
  principalAtStart: number;
  gainAmount: number;
  principalAtEnd: number;
  reinvested: number;
  withdrawn: number;
  totalValue: number;
}

export interface CalculationResult {
  stages: CalculationStage[];
  totalInvested: number;
  totalGains: number;
  totalWithdrawn: number;
  finalValue: number;
  roi: number;
  multiplier: number;
}

export interface CalculatorState {
  initialInvestment: number;
  cycles: number;
  reinvestmentEnabled: boolean;
  reinvestmentPercentage: number;
}

export interface MarketData {
  goldPrice: number;
  yearlyGrowth: number;
  timestamp: string;
}