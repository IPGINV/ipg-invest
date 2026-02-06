export type Language = 'RU' | 'EN';

export type TimeRange = '1D' | '1W' | '1M' | '1Y';

export interface Transaction {
  id: string;
  date: string;
  type: 'BONUS' | 'BUY' | 'WITHDRAW' | 'FEE';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  comment?: string;
}

export interface WalletState {
  balance: number;
  currency: 'USD';
  goldEquivalentOz: number;
  address: string | null;
  isConnected: boolean;
}

export interface ChartDataPoint {
  date: string;
  price: number;
}

export interface CurrencyRates {
  AED: number;
  RUB: number;
}