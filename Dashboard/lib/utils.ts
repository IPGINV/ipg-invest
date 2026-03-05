import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { subHours, isBefore } from "date-fns";
import { INVESTMENT_CYCLES_2026 } from "../constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CYCLE_RATE = 0.068;

// Format for Dashboard v2: { id, date: Date }
export const CYCLES_2026_V2 = INVESTMENT_CYCLES_2026.map((c) => ({
  id: c.number,
  date: (() => {
    const [day, month, year] = c.date.split(".").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
  })(),
}));

export function getCutoffDate(cycleDate: Date): Date {
  return subHours(cycleDate, 24);
}

export function isCycleActive(cycleDate: Date): boolean {
  const cutoffDate = getCutoffDate(cycleDate);
  const now = new Date();
  return isBefore(now, cutoffDate);
}

export function getNextCycle() {
  const now = new Date();
  return (
    CYCLES_2026_V2.find((cycle) => {
      const cutoffDate = getCutoffDate(cycle.date);
      return isBefore(now, cutoffDate);
    }) || null
  );
}

export function calculateYield(principal: number, startDate: Date = new Date()) {
  const nextActive = getNextCycle();

  if (!nextActive) {
    return {
      cyclesLeft: 0,
      totalAmount: principal,
      profit: 0,
      nextCycle: null,
    };
  }

  const startIndex = CYCLES_2026_V2.findIndex((c) => c.id === nextActive.id);
  const remainingCycles = CYCLES_2026_V2.slice(startIndex);
  const cyclesCount = remainingCycles.length;

  const totalAmount = principal * Math.pow(1 + CYCLE_RATE, cyclesCount);
  const profit = totalAmount - principal;

  return {
    cyclesLeft: cyclesCount,
    totalAmount,
    profit,
    nextCycle: remainingCycles[0]?.date || null,
  };
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export { CYCLES_2026_V2 as INVESTMENT_CYCLES_2026 };
