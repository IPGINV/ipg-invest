/**
 * Investor Display ID для верифицированных пользователей
 * Формат: #XXX/YY
 * XXX — порядковый номер среди верифицированных (с 020)
 * YY — номер цикла верификации (по дате прохождения)
 *
 * Неверифицированные: null (ID не показывается)
 */

const { query } = require('../db');

// Циклы инвестиций 2026 (даты открытия) — синхрон с Dashboard/constants.tsx
const INVESTMENT_CYCLES = [
  { number: 1, date: new Date(2026, 1, 16) },   // 16.02.2026
  { number: 2, date: new Date(2026, 2, 13) },   // 13.03.2026
  { number: 3, date: new Date(2026, 3, 7) },    // 07.04.2026
  { number: 4, date: new Date(2026, 4, 4) },    // 04.05.2026
  { number: 5, date: new Date(2026, 4, 29) },  // 29.05.2026
  { number: 6, date: new Date(2026, 5, 23) },   // 23.06.2026
  { number: 7, date: new Date(2026, 6, 20) },   // 20.07.2026
  { number: 8, date: new Date(2026, 7, 14) },   // 14.08.2026
  { number: 9, date: new Date(2026, 8, 8) },    // 08.09.2026
  { number: 10, date: new Date(2026, 9, 5) },   // 05.10.2026
  { number: 11, date: new Date(2026, 9, 30) },  // 30.10.2026
  { number: 12, date: new Date(2026, 10, 24) }, // 24.11.2026
  { number: 13, date: new Date(2026, 11, 21) }, // 21.12.2026
  { number: 14, date: new Date(2027, 0, 18) }, // 18.01.2027
];

function getCycleNumberByDate(verifiedAt) {
  if (!verifiedAt) return 1;
  const date = verifiedAt instanceof Date ? verifiedAt : new Date(verifiedAt);
  if (Number.isNaN(date.getTime())) return 1;

  // Выбираем последний цикл, чья дата открытия уже наступила к моменту верификации
  let found = 1;
  for (const c of INVESTMENT_CYCLES) {
    if (date >= c.date) found = c.number;
  }
  return found;
}

/**
 * Вычисляет investor_display_id для пользователя
 * @param {number|string} userId
 * @returns {Promise<string|null>} "#020/01" или null для неверифицированных
 */
async function computeInvestorDisplayId(userId) {
  try {
    const uid = Number(userId);
    if (!uid) return null;

    const { rows } = await query(
    `SELECT u.id, u.email_verified, u.status,
            COALESCE(uv.verified_at, u.onboarding_completed_at, u.registration_date) as verified_at
     FROM users u
     LEFT JOIN user_verifications uv ON uv.user_id = u.id AND uv.type = 'email' AND uv.status = 'verified'
     WHERE u.id = $1`,
    [uid]
  );
  if (!rows.length) return null;

  const user = rows[0];
  if (!user.email_verified || user.status !== 'active') return null;

  const verifiedAt = user.verified_at;

  // Порядковый номер среди верифицированных (ORDER BY verified_at ASC, id ASC)
  const { rows: rankRows } = await query(
    `WITH v AS (
       SELECT u.id,
              COALESCE(uv.verified_at, u.onboarding_completed_at, u.registration_date) as vat
       FROM users u
       LEFT JOIN user_verifications uv ON uv.user_id = u.id AND uv.type = 'email' AND uv.status = 'verified'
       WHERE u.email_verified = true AND u.status = 'active'
     )
     SELECT 1 + COUNT(*)::int as rank
     FROM v
     WHERE v.vat < $1::timestamp
        OR (v.vat = $1::timestamp AND v.id < $2)`,
    [verifiedAt, uid]
  );
  const rank = rankRows[0]?.rank ?? 1;
  const seqNumber = 19 + rank; // 020, 021, ...

  const cycleNum = getCycleNumberByDate(verifiedAt);
  const seqStr = String(seqNumber).padStart(3, '0');
  const cycleStr = String(cycleNum).padStart(2, '0');

  return `#${seqStr}/${cycleStr}`;
  } catch (err) {
    console.warn('[investorDisplayId] computeInvestorDisplayId error:', err?.message || err);
    return null;
  }
}

/**
 * Добавляет investor_display_id к объекту user
 * @param {object} user - объект с id, email_verified, status
 * @returns {Promise<object>} user с investor_display_id
 */
async function withInvestorDisplayId(user) {
  if (!user?.id) return user;
  const displayId = await computeInvestorDisplayId(user.id);
  return { ...user, investor_display_id: displayId };
}

module.exports = {
  computeInvestorDisplayId,
  withInvestorDisplayId,
  getCycleNumberByDate
};
