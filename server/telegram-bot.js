const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const { getRedis } = require('./redis');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const telegramUsername = msg.from.username || '';
  const telegramFirstName = msg.from.first_name || '';
  const startParam = match[1];

  if (startParam === 'register') {
    const registrationCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    const redis = await getRedis();
    await redis.setEx(
      `telegram_registration:${registrationCode}`,
      600,
      JSON.stringify({
        telegramId,
        telegramUsername,
        telegramFirstName,
        chatId,
        createdAt: new Date().toISOString()
      })
    );

    const domain = process.env.DOMAIN || 'ipg-invest.ae';
    const registrationLink = `https://${domain}/auth-telegram-register.html?code=${registrationCode}`;

    await bot.sendMessage(
      chatId,
      `🎉 Добро пожаловать в Imperial Pure Gold!\n\n` +
        `Ваш код регистрации: <code>${registrationCode}</code>\n\n` +
        `Нажмите на ссылку ниже, чтобы завершить регистрацию:\n` +
        `${registrationLink}\n\n` +
        `Код действителен 10 минут.`,
      { parse_mode: 'HTML' }
    );
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `ℹ️ Справка\n\n` +
      `Используйте команду /start register для регистрации в Imperial Pure Gold`
  );
});

bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Привет! 👋\n\n` +
      `Используйте /start register для регистрации\n` +
      `Или /help для справки`
  );
});

module.exports = bot;
