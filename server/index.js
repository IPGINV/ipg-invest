require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const balancesRouter = require('./routes/balances');
const transactionsRouter = require('./routes/transactions');
const contractsRouter = require('./routes/contracts');
const tokenPriceRouter = require('./routes/tokenPriceHistory');
const adminLogsRouter = require('./routes/adminLogs');
const apiRouter = require('./routes/api');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/balances', balancesRouter);
app.use('/transactions', transactionsRouter);
app.use('/contracts', contractsRouter);
app.use('/token-price-history', tokenPriceRouter);
app.use('/admin-logs', adminLogsRouter);
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const server = app.listen(port, () => {
  console.log(`IPG API listening on port ${port}`);
  console.log('Server is running...');
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
