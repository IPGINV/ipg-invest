const { query } = require('../db');

const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

async function cleanupExpiredPendingUsers() {
  try {
    const { rowCount } = await query(
      `DELETE FROM users
       WHERE status = 'pending'
         AND pending_expires_at IS NOT NULL
         AND pending_expires_at < NOW()`
    );
    console.log(`[Pending Cleanup] Deleted ${rowCount || 0} expired pending users`);
  } catch (error) {
    console.error('[Pending Cleanup] Error:', error);
  }
}

function startPendingCleanupJob() {
  console.log('[Pending Cleanup] Starting automatic cleanup job...');
  cleanupExpiredPendingUsers();
  const intervalId = setInterval(cleanupExpiredPendingUsers, CLEANUP_INTERVAL);

  const stop = () => clearInterval(intervalId);
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
  return intervalId;
}

module.exports = {
  cleanupExpiredPendingUsers,
  startPendingCleanupJob
};
