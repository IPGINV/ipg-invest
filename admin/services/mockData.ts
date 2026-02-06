
import { Investor, Transaction, TransactionType, UserStatus } from '../types';

export const MOCK_INVESTORS: Investor[] = [
  {
    id: 'INV-001',
    email: 'john.doe@gmail.com',
    fullName: 'John Doe',
    password: 'password123',
    socialId: '@johndoe_tg',
    passportData: '4508 123456, выдан УВД г. Москва',
    cryptoWallets: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'TGC29m8uHn8N6q9zJ5yE4vBwR6kLpQxW2z'],
    documents: [
      { id: 'DOC-01', name: 'Passport_Main.jpg', type: 'PASSPORT', uploadDate: '2023-10-15', previewUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=400&auto=format&fit=crop' },
      { id: 'DOC-02', name: 'Registration_Address.jpg', type: 'UTILITY_BILL', uploadDate: '2023-10-16', previewUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=400&auto=format&fit=crop' }
    ],
    status: UserStatus.ACTIVE,
    registrationDate: '2023-10-15',
    balances: { main: 5400.50, ghs: 1200 },
    contracts: [
      { id: 'C-101', type: 'Pro Miner', amount: 5000, startDate: '2023-11-01', endDate: '2024-11-01', status: 'ACTIVE' }
    ]
  },
  {
    id: 'INV-002',
    email: 'alice.smith@yahoo.com',
    fullName: 'Alice Smith',
    password: 'securePass789',
    socialId: 'fb_992100',
    passportData: 'ID-99210088, USA Passport',
    cryptoWallets: ['0x32Be343B94f860124dC4fEe278FDCBD38C102D88'],
    documents: [
      { id: 'DOC-03', name: 'US_Passport.png', type: 'PASSPORT', uploadDate: '2023-11-20', previewUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=400&auto=format&fit=crop' }
    ],
    status: UserStatus.ACTIVE,
    registrationDate: '2023-11-20',
    balances: { main: 150.00, ghs: 50 },
    contracts: []
  },
  {
    id: 'INV-003',
    email: 'robert.fox@outlook.com',
    fullName: 'Robert Fox',
    password: 'foxPassword00',
    socialId: '@robfox',
    passportData: 'AB 772211, выдан МВД РБ',
    cryptoWallets: [],
    documents: [],
    status: UserStatus.BLOCKED,
    registrationDate: '2023-09-05',
    balances: { main: 0, ghs: 0 },
    contracts: [
      { id: 'C-050', type: 'Trial', amount: 100, startDate: '2023-09-05', endDate: '2023-10-05', status: 'COMPLETED' }
    ]
  },
  {
    id: 'INV-004',
    email: 'sarah.connor@sky.net',
    fullName: 'Sarah Connor',
    password: 'terminator2024',
    passportData: 'SN-001984, Skynet Intel',
    cryptoWallets: ['0xAA7656EC7ab88b098defB751B7401B5f6d8976E'],
    documents: [
      { id: 'DOC-04', name: 'Resistance_ID.jpg', type: 'ID_CARD', uploadDate: '2024-01-10', previewUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop' }
    ],
    status: UserStatus.ACTIVE,
    registrationDate: '2024-01-10',
    balances: { main: 12500, ghs: 4500 },
    contracts: [
      { id: 'C-202', type: 'Titan', amount: 10000, startDate: '2024-01-12', endDate: '2025-01-12', status: 'ACTIVE' }
    ]
  },
  {
    id: 'INV-005',
    email: 'victor.vance@vice.com',
    fullName: 'Victor Vance',
    password: 'viceCity84',
    passportData: 'VC-1984, Vice City Dept',
    cryptoWallets: ['0xBB7656EC7ab88b098defB751B7401B5f6d8976D'],
    documents: [],
    status: UserStatus.ACTIVE,
    registrationDate: '2024-02-14',
    balances: { main: 300, ghs: 100 },
    contracts: []
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX-1001', investorId: 'INV-001', investorName: 'John Doe', type: TransactionType.DEPOSIT, amount: 5000, currency: 'USD', date: '2023-11-01 10:30', status: 'SUCCESS' },
  { id: 'TX-1002', investorId: 'INV-004', investorName: 'Sarah Connor', type: TransactionType.DEPOSIT, amount: 10000, currency: 'USD', date: '2024-01-12 14:15', status: 'SUCCESS' },
  { id: 'TX-1003', investorId: 'INV-001', investorName: 'John Doe', type: TransactionType.PROFIT, amount: 45.50, currency: 'USD', date: '2024-03-01 00:00', status: 'SUCCESS' },
  { id: 'TX-1004', investorId: 'INV-002', investorName: 'Alice Smith', type: TransactionType.WITHDRAWAL, amount: 50, currency: 'USD', date: '2024-03-05 16:45', status: 'PENDING' },
];
