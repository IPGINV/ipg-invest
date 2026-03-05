const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const { getRedis } = require('./redis');
const { query } = require('./db');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

const bot = new TelegramBot(token, { polling: true });

let cachedBotUsername = process.env.TELEGRAM_BOT_USERNAME || '';

const getDomain = () => process.env.DOMAIN || 'ipg-invest.ae';
const getDashboardUrl = () => process.env.DASHBOARD_APP_URL || 'https://dashboard.ipg-invest.ae/login.html';

const resolveBotUsername = async () => {
  if (cachedBotUsername) return cachedBotUsername.replace(/^@/, '');
  try {
    const me = await bot.getMe();
    cachedBotUsername = me?.username || '';
  } catch (error) {
    console.warn('[telegram-bot] Failed to resolve bot username:', error?.message || error);
  }
  return cachedBotUsername.replace(/^@/, '');
};

const buildStartLink = async (startParam) => {
  const username = await resolveBotUsername();
  if (!username) return null;
  return `https://t.me/${username}?start=${encodeURIComponent(startParam)}`;
};

const sendRegistrationWelcome = async ({ chatId, firstName, registrationCode, registrationLink }) => {
  const introName = firstName ? `, ${firstName}` : '';
  await bot.sendMessage(
    chatId,
    `Welcome${introName} to Imperial Pure Gold.\n\n` +
      `Step 1: Open registration link from this message.\n` +
      `Step 2: Fill in email and password.\n` +
      `Step 3: Return to this bot for further support.\n\n` +
      `Your one-time code: ${registrationCode}\n` +
      `Code expires in 10 minutes.\n\n` +
      `Registration link:\n${registrationLink}`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Open Registration', url: registrationLink }]]
      }
    }
  );
};

const sendBindingWelcome = async ({ chatId, dashboardUrl }) => {
  await bot.sendMessage(
    chatId,
    `Telegram binding completed successfully.\n\n` +
      `Next steps:\n` +
      `1) Open Dashboard login page.\n` +
      `2) Sign in to your account.\n` +
      `3) Return to Contact Binding and press \"I have completed verification\".`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Open Dashboard', url: dashboardUrl }]]
      }
    }
  );
};

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const telegramUsername = msg.from.username || '';
  const telegramFirstName = msg.from.first_name || '';
  const startParam = (match?.[1] || '').trim();

  if (!startParam) {
    await bot.sendMessage(
      chatId,
      'Use one of the links from the website to continue registration or contact binding.'
    );
    return;
  }

  if (startParam === 'register') {
    const registrationCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    const redis = await getRedis();

    if (!redis) {
      await bot.sendMessage(
        chatId,
        'Registration via Telegram is temporarily unavailable. Please try again later.'
      );
      return;
    }

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

    const registrationLink = `https://${getDomain()}/auth-telegram-register.html?code=${registrationCode}`;
    await sendRegistrationWelcome({
      chatId,
      firstName: telegramFirstName,
      registrationCode,
      registrationLink
    });
    return;
  }

  if (startParam.startsWith('bind_')) {
    const bindingCode = startParam.slice('bind_'.length);
    const redis = await getRedis();

    if (!redis) {
      await bot.sendMessage(
        chatId,
        'Telegram binding is temporarily unavailable. Please try again later.'
      );
      return;
    }

    const bindingDataRaw = await redis.get(`telegram_binding:${bindingCode}`);
    if (!bindingDataRaw) {
      await bot.sendMessage(
        chatId,
        'Binding link is invalid or expired. Please request a new Telegram binding link in Dashboard.'
      );
      return;
    }

    const bindingData = JSON.parse(bindingDataRaw);
    const userId = String(bindingData.userId || '');
    if (!userId) {
      await bot.sendMessage(chatId, 'Invalid binding payload. Please try again from Dashboard.');
      return;
    }

    const existingTelegram = await query(
      `SELECT id FROM users WHERE telegram_id = $1 AND id <> $2 LIMIT 1`,
      [String(telegramId), userId]
    );

    if (existingTelegram.rows.length) {
      await bot.sendMessage(
        chatId,
        'This Telegram account is already linked to another user.'
      );
      return;
    }

    const updated = await query(
      `UPDATE users
       SET telegram_id = $1,
           telegram_username = COALESCE($2, telegram_username),
           telegram_chat_id = $3,
           onboarding_step = CASE
             WHEN email_verified THEN 'completed'
             WHEN onboarding_step IS NULL THEN 'registered'
             ELSE onboarding_step
           END
       WHERE id = $4
       RETURNING id`,
      [String(telegramId), telegramUsername || null, String(chatId), userId]
    );

    if (!updated.rows.length) {
      await bot.sendMessage(chatId, 'User not found. Please login and try again.');
      await redis.del(`telegram_binding:${bindingCode}`);
      return;
    }

    try {
      await query(
        `INSERT INTO user_verifications (user_id, type, status, verified_at, metadata)
         VALUES ($1, 'telegram', 'verified', NOW(), $2::jsonb)
         ON CONFLICT (user_id, type) DO UPDATE
         SET status = 'verified',
             verified_at = NOW(),
             metadata = COALESCE(EXCLUDED.metadata, user_verifications.metadata),
             updated_at = NOW()`,
        [userId, JSON.stringify({ source: 'telegram-bot', telegram_id: String(telegramId) })]
      );
    } catch (error) {
      if (error?.code !== '42P01') {
        console.warn('[telegram-bot] user_verifications update failed:', error?.message || error);
      }
    }

    await redis.del(`telegram_binding:${bindingCode}`);
    await sendBindingWelcome({ chatId, dashboardUrl: getDashboardUrl() });
    return;
  }

  await bot.sendMessage(chatId, 'Unknown command. Please use the link from website.');
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const registerLink = await buildStartLink('register');
  await bot.sendMessage(
    chatId,
    'Help:\n' +
      `- For registration, open ${registerLink || 'the registration link from website'}\n` +
      '- For Telegram binding, use the link generated in Dashboard.'
  );
});

bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  bot.sendMessage(
    msg.chat.id,
    'Use the website button to continue. The bot will send the required link automatically.'
  );
});

bot.buildStartLink = buildStartLink;

module.exports = bot;
