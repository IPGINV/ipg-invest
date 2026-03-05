const express = require('express');
const { query } = require('../db');
const { asyncHandler } = require('./utils');
const { authMiddleware, ownerOrAdminMiddleware } = require('../middleware/auth');
const { withInvestorDisplayId } = require('../services/investorDisplayId');
const { calculateUserYield } = require('../services/yieldCalculator');

const router = express.Router();

/**
 * UNIFIED DASHBOARD DATA ENDPOINT
 * Объединяет 4 запроса (user, balances, contracts, transactions) в один
 * Значительно уменьшает количество HTTP запросов и нагрузку на БД
 */
router.get(
  '/user-dashboard/:userId',
  authMiddleware,
  ownerOrAdminMiddleware('userId'),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = Number(req.query.transactionsLimit) || 50;

    // Используем Promise.all для параллельного выполнения запросов
    const [userResult, balancesResult, contractsResult, transactionsResult] = await Promise.all([
      // 1. User data
      query(
        `SELECT id, investor_id, email, full_name, registration_date, status, 
                passport_file_path, telegram_id, crypto_wallet, last_login,
                email_verified, onboarding_step, pending_expires_at, phone
         FROM users
         WHERE id = $1`,
        [userId]
      ),
      
      // 2. Balances
      query(
        `SELECT id, user_id, currency, amount
         FROM balances
         WHERE user_id = $1
         ORDER BY currency`,
        [userId]
      ),
      
      // 3. Contracts
      query(
        `SELECT id, user_id, amount_invested, start_date, end_date, status, final_profit
         FROM contracts
         WHERE user_id = $1
         ORDER BY start_date DESC`,
        [userId]
      ),
      
      // 4. Transactions
      query(
        `SELECT id, user_id, type, amount, status, created_at, comment
         FROM transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      )
    ]);

    if (!userResult.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRow = await withInvestorDisplayId(userResult.rows[0]);
    const yieldData = await calculateUserYield(Number(userId));

    const response = {
      user: {
        ...userRow,
        onboarding: {
          status: userRow.status,
          email_verified: Boolean(userRow.email_verified),
          onboarding_step: userRow.onboarding_step || 'registered',
          pending_expires_at: userRow.pending_expires_at || null
        }
      },
      balances: balancesResult.rows,
      contracts: contractsResult.rows,
      transactions: transactionsResult.rows,
      yield: {
        totalDeposited: yieldData.totalDeposited,
        totalWithdrawn: yieldData.totalWithdrawn,
        balance: yieldData.balance,
        profit: yieldData.profit,
        cyclesApplied: yieldData.cyclesApplied,
        cyclesLeft: yieldData.cyclesLeft,
        nextCycle: yieldData.nextCycle ? { id: yieldData.nextCycle.id, date: yieldData.nextCycle.date, yield_rate: yieldData.nextCycle.yield_rate } : null
      },
      meta: {
        timestamp: new Date().toISOString(),
        transactionsLimit: limit,
        transactionsTotal: transactionsResult.rows.length
      }
    };

    res.json(response);
  })
);

/** GET /unified/yield - доходность для текущего пользователя (по JWT) */
router.get(
  '/yield',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const yieldData = await calculateUserYield(Number(uid));
    res.json(yieldData);
  })
);

/**
 * BATCH USER DATA ENDPOINT (для админ-панели)
 * Получение данных нескольких пользователей одним запросом
 */
router.post(
  '/batch-users',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { userIds } = req.body || {};
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    if (userIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 users per request' });
    }

    // Один запрос вместо N запросов
    const { rows: users } = await query(
      `SELECT id, investor_id, email, full_name, registration_date, status, 
              passport_file_path, telegram_id, crypto_wallet, last_login,
              email_verified, onboarding_step, pending_expires_at, phone
       FROM users
       WHERE id = ANY($1::bigint[])`,
      [userIds]
    );

    // Получаем балансы для всех пользователей одним запросом
    const { rows: balances } = await query(
      `SELECT user_id, currency, amount
       FROM balances
       WHERE user_id = ANY($1::bigint[])`,
      [userIds]
    );

    // Группируем балансы по user_id
    const balancesByUser = balances.reduce((acc, balance) => {
      if (!acc[balance.user_id]) {
        acc[balance.user_id] = [];
      }
      acc[balance.user_id].push(balance);
      return acc;
    }, {});

    const result = await Promise.all(
      users.map(async (user) => {
        const withDisplay = await withInvestorDisplayId(user);
        return {
          ...withDisplay,
          balances: balancesByUser[user.id] || [],
          onboarding: {
            status: user.status,
            email_verified: Boolean(user.email_verified),
            onboarding_step: user.onboarding_step || 'registered',
            pending_expires_at: user.pending_expires_at || null
          }
        };
      })
    );

    res.json({ 
      users: result, 
      meta: { 
        count: result.length, 
        requested: userIds.length 
      } 
    });
  })
);

/**
 * BATCH BALANCE UPDATE (для админ-панели)
 * Обновление балансов нескольких пользователей одним запросом
 */
router.post(
  '/batch-update-balances',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { updates } = req.body || {};
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'updates array is required' });
    }

    if (updates.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 updates per request' });
    }

    // Валидация
    for (const update of updates) {
      if (!update.user_id || !update.currency || update.amount === undefined) {
        return res.status(400).json({ 
          error: 'Each update must have user_id, currency, and amount' 
        });
      }
    }

    // Используем transaction для атомарности
    const client = await query('BEGIN');
    
    try {
      const results = [];
      
      for (const update of updates) {
        const { rows } = await query(
          `INSERT INTO balances (user_id, currency, amount)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, currency) 
           DO UPDATE SET amount = EXCLUDED.amount
           RETURNING id, user_id, currency, amount`,
          [update.user_id, update.currency, update.amount]
        );
        results.push(rows[0]);
      }

      await query('COMMIT');
      
      res.json({ 
        success: true, 
        updated: results.length,
        balances: results 
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  })
);

/**
 * USER STATISTICS ENDPOINT
 * Агрегированная статистика для админ-панели (один запрос вместо множества)
 */
router.get(
  '/statistics',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.id END) as active_users,
        COUNT(DISTINCT CASE WHEN u.status = 'pending' THEN u.id END) as pending_users,
        COUNT(DISTINCT CASE WHEN u.registration_date >= NOW() - INTERVAL '7 days' THEN u.id END) as new_users_week,
        COUNT(DISTINCT CASE WHEN u.last_login >= NOW() - INTERVAL '24 hours' THEN u.id END) as active_today,
        COALESCE(SUM(CASE WHEN b.currency = 'USD' THEN b.amount ELSE 0 END), 0) as total_usd,
        COALESCE(SUM(CASE WHEN b.currency = 'GHS' THEN b.amount ELSE 0 END), 0) as total_ghs,
        COUNT(DISTINCT c.id) as total_contracts,
        COALESCE(SUM(c.amount_invested), 0) as total_invested
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      LEFT JOIN contracts c ON u.id = c.user_id AND c.status = 'active'
    `);

    res.json(rows[0]);
  })
);

module.exports = router;
