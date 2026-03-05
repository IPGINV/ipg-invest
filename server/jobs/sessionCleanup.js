/**
 * SESSION CLEANUP JOB
 * Автоматическая очистка истекших refresh tokens из БД
 * Запускается каждые 24 часа
 */

const { query } = require('../db');

const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

/**
 * Удаляет истекшие сессии из БД
 */
async function cleanupExpiredSessions() {
  try {
    const startTime = Date.now();
    
    // Удаляем истекшие сессии
    const result = await query(
      `DELETE FROM sessions 
       WHERE expires_at < NOW()
       RETURNING id`
    );

    const deletedCount = result.rowCount || 0;
    const duration = Date.now() - startTime;

    console.log(`[Session Cleanup] Deleted ${deletedCount} expired sessions in ${duration}ms`);
    
    return { success: true, deletedCount, duration };
  } catch (error) {
    console.error('[Session Cleanup] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Удаляет старые сессии для конкретного пользователя
 * Оставляет только N последних активных сессий
 */
async function cleanupOldUserSessions(userId, keepCount = 5) {
  try {
    // Оставляем только последние keepCount сессий
    const result = await query(
      `DELETE FROM sessions 
       WHERE user_id = $1 
       AND id NOT IN (
         SELECT id FROM sessions 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2
       )
       RETURNING id`,
      [userId, keepCount]
    );

    return { success: true, deletedCount: result.rowCount || 0 };
  } catch (error) {
    console.error(`[Session Cleanup] Error cleaning user ${userId} sessions:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Отзывает все сессии пользователя (logout со всех устройств)
 */
async function revokeAllUserSessions(userId) {
  try {
    const result = await query(
      `DELETE FROM sessions WHERE user_id = $1 RETURNING id`,
      [userId]
    );

    return { success: true, deletedCount: result.rowCount || 0 };
  } catch (error) {
    console.error(`[Session Cleanup] Error revoking user ${userId} sessions:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Получает статистику сессий
 */
async function getSessionsStats() {
  try {
    const { rows } = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_sessions,
        COUNT(*) FILTER (WHERE expires_at >= NOW()) as active_sessions,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as sessions_last_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as sessions_last_7d
      FROM sessions
    `);

    return { success: true, stats: rows[0] };
  } catch (error) {
    console.error('[Session Cleanup] Error getting stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Инициализирует автоматическую очистку
 */
function startCleanupJob() {
  console.log('[Session Cleanup] Starting automatic cleanup job...');
  console.log(`[Session Cleanup] Will run every ${CLEANUP_INTERVAL / 1000 / 60 / 60} hours`);

  // Запускаем сразу при старте
  cleanupExpiredSessions();

  // Запускаем периодически
  const intervalId = setInterval(() => {
    cleanupExpiredSessions();
  }, CLEANUP_INTERVAL);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Session Cleanup] Stopping cleanup job...');
    clearInterval(intervalId);
  });

  process.on('SIGINT', () => {
    console.log('[Session Cleanup] Stopping cleanup job...');
    clearInterval(intervalId);
  });

  return intervalId;
}

module.exports = {
  cleanupExpiredSessions,
  cleanupOldUserSessions,
  revokeAllUserSessions,
  getSessionsStats,
  startCleanupJob
};
