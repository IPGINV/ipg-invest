require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const balancesRouter = require('./routes/balances');
const transactionsRouter = require('./routes/transactions');
const depositsRouter = require('./routes/deposits');
const contractsRouter = require('./routes/contracts');
const tokenPriceRouter = require('./routes/tokenPriceHistory');
const adminLogsRouter = require('./routes/adminLogs');
const cyclesRouter = require('./routes/cycles');
const apiRouter = require('./routes/api');
const unifiedRouter = require('./routes/unified');
const paymentsRouter = require('./routes/payments');

const { authMiddleware, adminMiddleware, ownerOrAdminMiddleware } = require('./middleware/auth');
const { authLimiter, registerLimiter, apiLimiter, adminLimiter } = require('./middleware/rateLimiter');
const { startCleanupJob } = require('./jobs/sessionCleanup');
const { startPendingCleanupJob } = require('./jobs/pendingCleanup');

const app = express();

// Preflight: явная обработка OPTIONS для CORS (до rate-limit и остального)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const allowed = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [];
    const isLocalhost = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isDev = process.env.NODE_ENV !== 'production';
    const allowOrigin = !origin || allowed.includes('*') || allowed.includes(origin) || (isDev && isLocalhost)
      ? (origin || '*')
      : allowed[0] || '*';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  next();
});

// CORS: в dev разрешаем любой localhost; в production — только из CORS_ORIGIN
const isDev = process.env.NODE_ENV !== 'production';
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [];
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const allow = allowed.includes('*') || allowed.includes(origin) || (isDev && isLocalhost);
    cb(null, allow);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (с rate limiting)
app.use('/auth', authRouter);
app.use('/api', apiLimiter, apiRouter); // Публичный API с общим лимитом

// Protected routes (требуют JWT + rate limiting)
app.use('/unified', apiLimiter, unifiedRouter); // Новый unified endpoint
app.use('/users', apiLimiter, authMiddleware, usersRouter); // Защищено JWT
app.use('/balances', apiLimiter, authMiddleware, balancesRouter); // Защищено JWT
app.use('/transactions', apiLimiter, authMiddleware, transactionsRouter); // Защищено JWT
app.use('/deposits', apiLimiter, authMiddleware, depositsRouter); // Защищено JWT
app.use('/contracts', apiLimiter, authMiddleware, contractsRouter); // Защищено JWT
app.use('/token-price-history', apiLimiter, authMiddleware, tokenPriceRouter); // Защищено JWT
app.use('/payments', apiLimiter, paymentsRouter); // JWT внутри роута + публичный webhook
app.use('/cycles', apiLimiter, cyclesRouter); // GET публичный, PUT/POST только admin

// Admin routes (требуют JWT + admin role + строгий rate limiting)
app.use('/admin-logs', adminLimiter, authMiddleware, adminMiddleware, adminLogsRouter);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err?.message || err);
  console.error('[ERROR] stack:', err?.stack);
  if (err?.code) console.error('[ERROR] pg code:', err.code);
  res.status(500).json({ error: 'Server error', message: process.env.NODE_ENV === 'development' ? err?.message : undefined });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const server = app.listen(port, () => {
  console.log(`IPG API listening on port ${port}`);
  console.log('Server is running...');
  
  // Информация о конфигурации
  if (process.env.REDIS_URL) {
    console.log('[Rate Limiter] Using Redis-based rate limiting');
  } else {
    console.log('[Rate Limiter] Using memory-based rate limiting (Redis not configured)');
  }
  
  // Запускаем автоматическую очистку истекших сессий
  startCleanupJob();
  startPendingCleanupJob();
});

// Keep the process alive
const keepAlive = setInterval(() => {
  // Keep server running
}, 1000);

// Keep the server running
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  clearInterval(keepAlive);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  clearInterval(keepAlive);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
