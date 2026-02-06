
import { InvestmentCycle, TickerData } from './types';

export const CYCLE_YIELD_RATE = 0.068; // 6.8%

export const INVESTMENT_CYCLES_2026: InvestmentCycle[] = [
  { number: 1, date: '16.02.2026' },
  { number: 2, date: '13.03.2026' },
  { number: 3, date: '07.04.2026' },
  { number: 4, date: '04.05.2026' },
  { number: 5, date: '29.05.2026' },
  { number: 6, date: '23.06.2026' },
  { number: 7, date: '20.07.2026' },
  { number: 8, date: '14.08.2026' },
  { number: 9, date: '08.09.2026' },
  { number: 10, date: '05.10.2026' },
  { number: 11, date: '30.10.2026' },
  { number: 12, date: '24.11.2026' },
  { number: 13, date: '21.12.2026' },
  { number: 14, date: '18.01.2027' },
];

export const MOCK_TICKERS: TickerData[] = [
  { symbol: 'GOLD (XAU/USD)', price: '$2,342.10', change: '+1.2%', isUp: true },
  { symbol: 'SILVER (XAG/USD)', price: '$28.45', change: '-0.5%', isUp: false },
  { symbol: 'IPG TOKEN', price: '$1.068', change: '+6.8%', isUp: true },
  { symbol: 'PLATINUM', price: '$982.50', change: '+0.3%', isUp: true },
  { symbol: 'PALLADIUM', price: '$1,021.15', change: '-1.1%', isUp: false },
];
