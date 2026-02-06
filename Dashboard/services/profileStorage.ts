import { User } from '../types';

export type InvestorProfileData = Pick<
  User,
  'fullName' | 'passportData' | 'telegram' | 'cryptoWallet' | 'email'
>;

type InvestorProfileRecord = InvestorProfileData & {
  investorId: string;
  userId: string;
  updatedAt: string;
};

const STORAGE_KEY = 'ipg:investor-profiles';

const readStorage = (): Record<string, InvestorProfileRecord> => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, InvestorProfileRecord>;
  } catch {
    return {};
  }
};

const writeStorage = (data: Record<string, InvestorProfileRecord>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadInvestorProfile = (investorId: string): InvestorProfileData | null => {
  const db = readStorage();
  const record = db[investorId];
  if (!record) return null;
  return {
    fullName: record.fullName,
    passportData: record.passportData,
    telegram: record.telegram,
    cryptoWallet: record.cryptoWallet,
    email: record.email,
  };
};

export const saveInvestorProfile = (
  investorId: string,
  userId: string,
  data: InvestorProfileData,
) => {
  const db = readStorage();
  db[investorId] = {
    investorId,
    userId,
    updatedAt: new Date().toISOString(),
    ...data,
  };
  writeStorage(db);
};
