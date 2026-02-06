
export interface User {
  id: string;
  email: string;
  investorId: string;
  tokenBalance: number;
  fullName: string;
  passportData: string;
  telegram: string;
  cryptoWallet: string;
}

export interface InvestmentCycle {
  number: number;
  date: string; // ISO format or DD.MM.YYYY
}

export interface Contract {
  number: string;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'yield';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export enum AuthStatus {
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  LOADING = 'LOADING',
}

export interface TickerData {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}
