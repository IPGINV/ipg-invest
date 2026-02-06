
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PROFIT = 'PROFIT',
  TOKEN_PURCHASE = 'TOKEN_PURCHASE',
  CONTRACT_ACTIVATION = 'CONTRACT_ACTIVATION'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED'
}

export interface InvestorDocument {
  id: string;
  name: string;
  type: 'PASSPORT' | 'ID_CARD' | 'UTILITY_BILL' | 'OTHER';
  uploadDate: string;
  previewUrl: string;
}

export interface Investor {
  id: string;
  email: string;
  fullName: string;
  password?: string;
  socialId?: string;
  passportData?: string;
  cryptoWallets?: string[];
  documents?: InvestorDocument[];
  status: UserStatus;
  registrationDate: string;
  balances: {
    main: number;
    ghs: number;
  };
  contracts: Contract[];
}

export interface Contract {
  id: string;
  type: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Transaction {
  id: string;
  investorId: string;
  investorName: string;
  type: TransactionType;
  amount: number;
  currency: 'USD' | 'GHS';
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export type ViewState = 'INVESTORS' | 'TRANSACTIONS' | 'DASHBOARD';
