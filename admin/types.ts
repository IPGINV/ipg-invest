
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
  investorDisplayId?: string | null;
  email: string;
  fullName: string;
  phone?: string;
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
  kycStatus?: string;
  onboardingStep?: string;
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
  tx_hash?: string;
  comment?: string;
  rawType?: string;
}

export interface PaymentIntent {
  intent_id: string;
  provider_payment_id?: string;
  user_id: number;
  expected_fiat_amount: number;
  settlement_currency: 'USD' | 'GHS';
  paid_crypto_amount?: number;
  crypto_asset: string;
  crypto_network?: string;
  provider_status: string;
  internal_status: string;
  created_at: string;
}

export interface InvestmentCycle {
  id: number;
  cycle_number: number;
  cycle_date: string;
  yield_rate: number;
  created_at?: string;
  updated_at?: string;
}

export type ViewState = 'INVESTORS' | 'TRANSACTIONS' | 'DASHBOARD' | 'CYCLES';
