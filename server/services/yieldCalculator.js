/**
 * Расчёт доходности за всё время:
 * - База = внесённые средства (пополнения до 24ч до даты цикла участвуют)
 * - Прибыль по циклу = база * доходность_цикла (начисляется на следующий день после открытия)
 * - После цикла: база = база + прибыль_цикла
 * - Пополнения/выводы между циклами добавляются/вычитаются из базы перед следующим циклом
 *
 * Cutoff: 24ч до даты цикла — пополнения до cutoff участвуют.
 * Цикл применяется только когда now >= cycle_date + 24ч (следующий день после окончания поставки).
 */

const { query } = require('../db');

const CUTOFF_HOURS = 24;

function addHours(d, h) {
  const r = new Date(d);
  r.setTime(r.getTime() + h * 60 * 60 * 1000);
  return r;
}

/**
 * @param {number} userId
 * @returns {Promise<{ totalDeposited: number, totalWithdrawn: number, balance: number, profit: number, cyclesApplied: number }>}
 */
async function calculateUserYield(userId) {
  const [cyclesRes, depositsRes, withdrawalsRes] = await Promise.all([
    query(
      `SELECT id, cycle_number, cycle_date, yield_rate
       FROM investment_cycles
       ORDER BY cycle_number ASC`
    ),
    query(
      `SELECT amount, updated_at
       FROM transactions
       WHERE user_id = $1 AND type = 'DEPOSIT' AND status = 'completed'
       ORDER BY updated_at ASC`,
      [userId]
    ),
    query(
      `SELECT amount, updated_at
       FROM transactions
       WHERE user_id = $1 AND type = 'WITHDRAWAL' AND status = 'completed'
       ORDER BY updated_at ASC`,
      [userId]
    )
  ]);

  const cycles = cyclesRes.rows;
  const deposits = depositsRes.rows;
  const withdrawals = withdrawalsRes.rows;

  const totalDeposited = deposits.reduce((s, d) => s + Number(d.amount || 0), 0);
  const totalWithdrawn = withdrawals.reduce((s, w) => s + Number(w.amount || 0), 0);

  if (cycles.length === 0) {
    return {
      totalDeposited,
      totalWithdrawn,
      balance: totalDeposited - totalWithdrawn,
      profit: 0,
      cyclesApplied: 0,
      cyclesLeft: 0,
      nextCycle: null
    };
  }

  let balance = 0;
  let depositIdx = 0;
  let withdrawalIdx = 0;
  let cyclesApplied = 0;

  for (const cycle of cycles) {
    const cycleDate = new Date(cycle.cycle_date);
    const cutoff = addHours(cycleDate, -CUTOFF_HOURS);
    const cycleCloses = addHours(cycleDate, CUTOFF_HOURS);

    while (depositIdx < deposits.length) {
      const d = deposits[depositIdx];
      const at = new Date(d.updated_at);
      if (at >= cutoff) break;
      balance += Number(d.amount || 0);
      depositIdx++;
    }
    while (withdrawalIdx < withdrawals.length) {
      const w = withdrawals[withdrawalIdx];
      const at = new Date(w.updated_at);
      if (at >= cutoff) break;
      balance -= Number(w.amount || 0);
      withdrawalIdx++;
    }

    const now = new Date();
    if (now < cycleCloses) break;

    const rate = Number(cycle.yield_rate || 0);
    balance = balance * (1 + rate);
    cyclesApplied++;
  }

  const profit = Math.max(0, balance - (totalDeposited - totalWithdrawn));

  const nextCycle = (() => {
    const now = new Date();
    for (const c of cycles) {
      const cutoff = addHours(new Date(c.cycle_date), -CUTOFF_HOURS);
      if (now < cutoff) return { id: c.cycle_number, date: new Date(c.cycle_date), yield_rate: Number(c.yield_rate) };
    }
    return null;
  })();
  const cyclesLeft = nextCycle ? cycles.filter((c) => new Date(c.cycle_date) > new Date()).length : 0;

  return {
    totalDeposited,
    totalWithdrawn,
    balance: Math.round(balance * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    cyclesApplied,
    cyclesLeft,
    nextCycle
  };
}

module.exports = { calculateUserYield };
