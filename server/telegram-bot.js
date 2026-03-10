const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getRedis } = require('./redis');
const { query } = require('./db');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

const bot = new TelegramBot(token, { polling: true });

let cachedBotUsername = process.env.TELEGRAM_BOT_USERNAME || 'IPGIVESTREG_bot';
const pendingContactRegistrations = new Map();
const PENDING_CONTACT_TTL_MS = 15 * 60 * 1000;

const normalizeDashboardLoginUrl = (rawUrl) => {
  const fallback = 'https://dashboard.ipg-invest.ae/login.html';
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;

  try {
    const parsed = new URL(rawUrl);
    const host = (parsed.hostname || '').toLowerCase();
    const isLandingHost = host === 'ipg-invest.ae' || host === 'www.ipg-invest.ae';
    if (isLandingHost) {
      parsed.hostname = 'dashboard.ipg-invest.ae';
    }

    if (!parsed.pathname || parsed.pathname === '/' || !parsed.pathname.endsWith('.html')) {
      parsed.pathname = '/login.html';
    }

    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch (_) {
    return fallback;
  }
};

const getDashboardUrl = () =>
  normalizeDashboardLoginUrl(process.env.DASHBOARD_APP_URL || process.env.VITE_DASHBOARD_APP_URL);
const generateInvestorId = () => `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const generateTempPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let core = '';
  for (let i = 0; i < 10; i += 1) {
    core += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${core}!`;
};

const upsertTelegramRegisteredUser = async ({
  telegramId,
  telegramUsername,
  telegramFirstName,
  chatId,
  phoneNumber
}) => {
  const loginAlias = `@${telegramUsername}`;
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const byTelegramId = await query(
    `SELECT id
     FROM users
     WHERE telegram_id = $1
     LIMIT 1`,
    [String(telegramId)]
  );

  let userId;
  if (byTelegramId.rows.length) {
    userId = byTelegramId.rows[0].id;
    await query(
      `UPDATE users
       SET telegram_username = $1,
           telegram_chat_id = $2,
           phone = COALESCE($3, phone),
           password_hash = $4,
           password_plain = $5,
           status = 'active',
           onboarding_step = CASE
             WHEN onboarding_step IS NULL OR onboarding_step = '' THEN 'registered'
             ELSE onboarding_step
           END,
           updated_at = NOW()
       WHERE id = $6`,
      [telegramUsername, String(chatId), phoneNumber || null, passwordHash, tempPassword, userId]
    );
  } else {
    const byTelegramUsername = await query(
      `SELECT id
       FROM users
       WHERE telegram_username = $1
       LIMIT 1`,
      [telegramUsername]
    );
    if (byTelegramUsername.rows.length) {
      return { conflict: true };
    }

    const fullName = telegramFirstName || `Telegram User ${telegramId}`;
    const syntheticEmail = `tg_${telegramId}@telegram.ipg.local`;
    const created = await query(
      `INSERT INTO users (
        email, password_hash, password_plain, full_name, investor_id,
        telegram_id, telegram_username, telegram_chat_id, phone,
        email_verified, status, registration_method, registration_date, onboarding_step
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, 'active', 'telegram', NOW(), 'registered')
      RETURNING id`,
      [
        syntheticEmail,
        passwordHash,
        tempPassword,
        fullName,
        generateInvestorId(),
        String(telegramId),
        telegramUsername,
        String(chatId),
        phoneNumber || null
      ]
    );
    userId = created.rows[0].id;
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
      [userId, JSON.stringify({ source: 'telegram-register', telegram_id: String(telegramId), phone: phoneNumber || null })]
    );
  } catch (error) {
    if (error?.code !== '42P01') {
      console.warn('[telegram-bot] verification upsert failed:', error?.message || error);
    }
  }

  return { loginAlias, tempPassword };
};

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

const sendRegistrationWelcome = async ({ chatId, firstName, loginAlias, tempPassword, loginUrl }) => {
  const introName = firstName ? `, ${firstName}` : '';
  await bot.sendMessage(
    chatId,
    `Добро пожаловать${introName} в Imperial Pure Gold.\n\n` +
      `Аккаунт создан автоматически.\n` +
      `Логин: ${loginAlias}\n` +
      `Ваш временный пароль: ${tempPassword}\n\n` +
      `Дальше:\n` +
      `1) Откройте кабинет по кнопке ниже.\n` +
      `2) Войдите по логину и временному паролю.\n` +
      `3) Заполните профиль и KYC в кабинете.`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Открыть кабинет', url: loginUrl }]]
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
      `3) Return to Contact Binding and press "I have completed verification".`,
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
    if (!telegramUsername) {
      await bot.sendMessage(
        chatId,
        'Для регистрации нужен Telegram username.\nОткройте настройки Telegram, задайте username и нажмите ссылку регистрации снова.'
      );
      return;
    }
    pendingContactRegistrations.set(String(chatId), {
      telegramId: String(telegramId),
      telegramUsername,
      telegramFirstName,
      createdAt: Date.now()
    });
    await bot.sendMessage(
      chatId,
      'Для завершения регистрации поделитесь контактом (телефоном) через кнопку ниже.',
      {
        reply_markup: {
          keyboard: [[{ text: 'Поделиться контактом', request_contact: true }]],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    );
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

bot.on('message', async (msg) => {
  if (msg.contact) {
    const chatId = msg.chat.id;
    const key = String(chatId);
    const pending = pendingContactRegistrations.get(key);
    if (!pending) {
      return;
    }
    if (Date.now() - Number(pending.createdAt || 0) > PENDING_CONTACT_TTL_MS) {
      pendingContactRegistrations.delete(key);
      await bot.sendMessage(chatId, 'Сессия регистрации истекла. Нажмите ссылку регистрации снова.');
      return;
    }

    const telegramId = String(msg.from?.id || '');
    if (!telegramId || telegramId !== String(pending.telegramId)) {
      await bot.sendMessage(chatId, 'Контакт должен быть отправлен из того же Telegram аккаунта.');
      return;
    }

    const contactUserId = String(msg.contact.user_id || '');
    if (contactUserId && contactUserId !== telegramId) {
      await bot.sendMessage(chatId, 'Пожалуйста, отправьте ваш собственный контакт.');
      return;
    }

    const phoneNumber = String(msg.contact.phone_number || '').trim();
    if (!phoneNumber) {
      await bot.sendMessage(chatId, 'Не удалось получить телефон. Повторите попытку.');
      return;
    }

    const result = await upsertTelegramRegisteredUser({
      telegramId,
      telegramUsername: String(pending.telegramUsername || ''),
      telegramFirstName: String(pending.telegramFirstName || ''),
      chatId,
      phoneNumber
    });
    pendingContactRegistrations.delete(key);

    if (result?.conflict) {
      await bot.sendMessage(chatId, 'Этот username уже связан с другим аккаунтом. Обратитесь в поддержку.');
      return;
    }

    const loginUrlObj = new URL(getDashboardUrl());
    loginUrlObj.searchParams.set('login', String(result.loginAlias || ''));
    loginUrlObj.searchParams.set('next', 'profile');
    const loginUrl = loginUrlObj.toString();
    await sendRegistrationWelcome({
      chatId,
      firstName: String(pending.telegramFirstName || ''),
      loginAlias: String(result.loginAlias || ''),
      tempPassword: String(result.tempPassword || ''),
      loginUrl
    });
    await bot.sendMessage(chatId, 'Регистрация завершена.', {
      reply_markup: {
        remove_keyboard: true
      }
    });
    return;
  }

  if (!msg.text || msg.text.startsWith('/')) return;
  await bot.sendMessage(
    msg.chat.id,
    'Use the website button to continue. The bot will send the required link automatically.'
  );
});

bot.buildStartLink = buildStartLink;

module.exports = bot;
