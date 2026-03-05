const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { query } = require('../db');
const { asyncHandler } = require('./utils');
const { getRedis } = require('../redis');
const { computeInvestorDisplayId } = require('../services/investorDisplayId');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const generateInvestorId = () => `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const PENDING_TTL_DAYS = Number(process.env.PENDING_REGISTRATION_TTL_DAYS || 7);
const isFeatureEnabled = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};
const openRegistrationEnabled = () => isFeatureEnabled(process.env.OPEN_REGISTRATION_ENABLED, true);
const allowPendingLogin = () => isFeatureEnabled(process.env.ALLOW_PENDING_LOGIN, true);

const smtpUser = process.env.EMAIL_USER;
const smtpPass = process.env.EMAIL_PASSWORD;
const transporter = nodemailer.createTransport(
  process.env.EMAIL_HOST
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      }
    : {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      }
);

const signAccessToken = (userId, email) =>
  jwt.sign(
    { sub: userId, role: 'user', email },
    process.env.JWT_SECRET || 'ipg-dev-secret',
    { expiresIn: '15m' }
  );

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Zoloto2026';
const signAdminToken = () =>
  jwt.sign(
    { sub: 'admin', role: 'admin', email: 'admin@ipg-invest.ae' },
    process.env.JWT_SECRET || 'ipg-dev-secret',
    { expiresIn: '8h' }
  );

const signRefreshToken = (userId) =>
  jwt.sign(
    {
      sub: userId,
      type: 'refresh',
      jti: crypto.randomBytes(8).toString('hex')
    },
    process.env.REFRESH_TOKEN_SECRET || 'ipg-dev-refresh',
    { expiresIn: '30d' }
  );

const saveSession = async (userId, refreshToken) => {
  await query(
    `INSERT INTO sessions (user_id, refresh_token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
    [userId, refreshToken]
  );
};

const buildOnboardingPayload = (user) => ({
  status: user.status,
  email_verified: Boolean(user.email_verified),
  onboarding_step: user.onboarding_step || 'registered',
  pending_expires_at: user.pending_expires_at || null
});

const upsertVerification = async (userId, type, status, token = null, expiresAt = null, metadata = null) => {
  try {
    await query(
      `INSERT INTO user_verifications (user_id, type, status, token, expires_at, verified_at, metadata)
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $3 = 'verified' THEN NOW() ELSE NULL END, $6::jsonb)
       ON CONFLICT (user_id, type) DO UPDATE
       SET status = EXCLUDED.status,
           token = EXCLUDED.token,
           expires_at = EXCLUDED.expires_at,
           verified_at = CASE WHEN EXCLUDED.status = 'verified' THEN NOW() ELSE user_verifications.verified_at END,
           metadata = COALESCE(EXCLUDED.metadata, user_verifications.metadata),
           updated_at = NOW()`,
      [userId, type, status, token, expiresAt, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.warn('[auth] upsertVerification failed:', error?.message || error, 'code:', error?.code);
  }
};

const getVerificationMap = async (userId) => {
  try {
    const { rows } = await query(
      `SELECT type, status, verified_at, expires_at
       FROM user_verifications
       WHERE user_id = $1`,
      [userId]
    );
    return rows.reduce((acc, row) => {
      acc[row.type] = row;
      return acc;
    }, {});
  } catch (error) {
    if (error?.code === '42P01') {
      return {};
    }
    throw error;
  }
};

router.post(
  '/admin-login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: 'password is required' });
    }
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }
    const token = signAdminToken();
    res.json({ accessToken: token, expiresIn: '8h' });
  })
);

router.post(
  '/login',
  authLimiter, // Rate limiting для защиты от брутфорса
  asyncHandler(async (req, res) => {
    const { login, password } = req.body || {};
    if (!login || !password) {
      return res.status(400).json({ error: 'login and password are required' });
    }

    const { rows } = await query(
      `SELECT id, investor_id, email, full_name, status, password_hash, email_verified, onboarding_step, pending_expires_at
       FROM users
       WHERE (email = $1 OR telegram_id = $1 OR phone = $1)
       LIMIT 1`,
      [String(login).trim()]
    );

    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const isPending = rows[0].status === 'pending';
    if (
      isPending &&
      rows[0].pending_expires_at &&
      new Date(rows[0].pending_expires_at).getTime() < Date.now()
    ) {
      return res.status(403).json({ error: 'Pending registration expired' });
    }
    if (rows[0].status !== 'active' && !(allowPendingLogin() && isPending)) {
      return res.status(403).json({ error: 'User not active' });
    }
    // Разрешаем вход активным пользователям до верификации (для прохождения KYC и загрузки документов)

    const valid = await bcrypt.compare(password, rows[0].password_hash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken(rows[0].id, rows[0].email);
    const refreshToken = signRefreshToken(rows[0].id);
    await saveSession(rows[0].id, refreshToken);
    await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [rows[0].id]);

    const investorDisplayId = await computeInvestorDisplayId(rows[0].id);
    res.json({
      tokens: {
        accessToken,
        refreshToken
      },
      user: {
        id: rows[0].id,
        investor_id: rows[0].investor_id,
        investor_display_id: investorDisplayId,
        email: rows[0].email,
        full_name: rows[0].full_name,
        ...buildOnboardingPayload(rows[0])
      },
      onboarding: buildOnboardingPayload(rows[0])
    });
  })
);

/**
 * REFRESH TOKEN ENDPOINT
 * Автоматически обновляет access token используя refresh token
 * Обеспечивает бесшовную работу без "Session expired" экранов
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {};
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'RefreshTokenRequired', 
        message: 'Refresh token is required' 
      });
    }

    // 1. Проверяем валидность refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET || 'ipg-dev-refresh'
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'RefreshTokenExpired', 
          message: 'Refresh token has expired, please login again' 
        });
      }
      return res.status(401).json({ 
        error: 'InvalidRefreshToken', 
        message: 'Invalid refresh token' 
      });
    }

    // 2. Проверяем, что refresh token существует в БД (не был отозван)
    const { rows: sessionRows } = await query(
      `SELECT user_id, expires_at FROM sessions 
       WHERE refresh_token = $1 AND expires_at > NOW()
       LIMIT 1`,
      [refreshToken]
    );

    if (!sessionRows.length) {
      return res.status(401).json({ 
        error: 'RefreshTokenRevoked', 
        message: 'Refresh token has been revoked or expired' 
      });
    }

    const userId = sessionRows[0].user_id;

    // 3. Получаем актуальные данные пользователя
    const { rows: userRows } = await query(
      `SELECT id, investor_id, email, full_name, status, email_verified, onboarding_step, pending_expires_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );

    if (!userRows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    // 4. Проверяем статус пользователя
    const pendingAllowed = allowPendingLogin() && user.status === 'pending';
    if (user.status !== 'active' && !pendingAllowed) {
      return res.status(403).json({ error: 'User account is not active' });
    }

    // 5. Генерируем новый access token
    const newAccessToken = signAccessToken(user.id, user.email);

    // 6. Опционально: Rotation - генерируем новый refresh token
    // (для максимальной безопасности, но усложняет логику)
    let newRefreshToken = null;
    if (req.body.rotateRefreshToken) {
      newRefreshToken = signRefreshToken(user.id);
      
      // Удаляем старую сессию
      await query(`DELETE FROM sessions WHERE refresh_token = $1`, [refreshToken]);
      
      // Создаем новую сессию
      await saveSession(user.id, newRefreshToken);
    } else {
      // Обновляем last_login
      await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);
    }

    const investorDisplayId = await computeInvestorDisplayId(user.id);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken || refreshToken,
      user: {
        id: user.id,
        investor_id: user.investor_id,
        investor_display_id: investorDisplayId,
        email: user.email,
        full_name: user.full_name,
        ...buildOnboardingPayload(user)
      },
      onboarding: buildOnboardingPayload(user)
    });
  })
);

/**
 * LOGOUT ENDPOINT
 * Отзывает refresh token (удаляет из БД)
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {};
    
    if (refreshToken) {
      // Удаляем сессию из БД
      await query(`DELETE FROM sessions WHERE refresh_token = $1`, [refreshToken]);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  })
);

router.post(
  '/register/email',
  registerLimiter, // Rate limiting для регистрации
  asyncHandler(async (req, res) => {
    if (!openRegistrationEnabled()) {
      return res.status(403).json({ error: 'Open registration is disabled' });
    }

    const { email, password, full_name, phone, agree_terms } = req.body || {};
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (!agree_terms) {
      return res.status(400).json({ error: 'Необходимо согласие с офертой' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 8 символов' });
    }

    const exists = await query(
      `SELECT id, status, pending_expires_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    let result;
    const emailVerified = false; // Верификация — только после подтверждения документов админом
    const passwordPlain = String(password || '');
    const userStatus = 'active';
    const onboardingStep = 'registered';

    if (exists.rows.length) {
      const existing = exists.rows[0];
      const expiredPending =
        existing.status === 'pending' &&
        existing.pending_expires_at &&
        new Date(existing.pending_expires_at).getTime() < Date.now();

      if (!expiredPending) {
        return res.status(409).json({ error: 'Email уже зарегистрирован' });
      }

      result = await query(
        `UPDATE users
         SET password_hash = $1,
             password_plain = $2,
             full_name = $3,
             phone = COALESCE($4, phone),
             email_verified = $5,
             email_verification_token = NULL,
             email_verification_expires = NULL,
             status = $6,
             onboarding_step = $7,
             pending_expires_at = NULL,
             onboarding_completed_at = NULL,
             registration_method = 'email',
             registration_date = NOW()
         WHERE id = $8
         RETURNING id, investor_id, email, full_name, status, email_verified, onboarding_step, pending_expires_at`,
        [hashedPassword, passwordPlain, full_name, phone || null, emailVerified, userStatus, onboardingStep, existing.id]
      );
    } else {
      const investorId = generateInvestorId();
      result = await query(
        `INSERT INTO users (
          email, password_hash, password_plain, full_name, investor_id, phone,
          email_verified, registration_date, status, registration_method, onboarding_step
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, 'email', $9)
        RETURNING id, investor_id, email, full_name, status, email_verified, onboarding_step, pending_expires_at`,
        [email, hashedPassword, passwordPlain, full_name, investorId, phone || null, emailVerified, userStatus, onboardingStep]
      );
    }

    await upsertVerification(result.rows[0].id, 'email', 'pending');

    const user = result.rows[0];
    let investorDisplayId = null;
    try {
      investorDisplayId = await computeInvestorDisplayId(user.id);
    } catch (err) {
      console.warn('[register] computeInvestorDisplayId failed:', err?.message || err);
    }
    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken(user.id);
    try {
      await saveSession(user.id, refreshToken);
      await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);
    } catch (err) {
      console.warn('[register] saveSession/last_login failed:', err?.message || err);
    }

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      tokens: { accessToken, refreshToken },
      user: {
        id: user.id,
        investor_id: user.investor_id,
        investor_display_id: investorDisplayId,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
        email_verified: user.email_verified,
        onboarding_step: user.onboarding_step,
        pending_expires_at: user.pending_expires_at
      },
      onboarding: buildOnboardingPayload(user)
    });
  })
);

router.get(
  '/verify-email',
  asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    let result = { rows: [] };
    try {
      result = await query(
        `SELECT u.id, u.email
         FROM user_verifications uv
         JOIN users u ON u.id = uv.user_id
         WHERE uv.type = 'email'
           AND uv.token = $1
           AND (uv.expires_at IS NULL OR uv.expires_at > NOW())
         LIMIT 1`,
        [token]
      );
    } catch (error) {
      if (error?.code !== '42P01') {
        throw error;
      }
    }
    if (!result.rows.length) {
      result = await query(
        `SELECT id, email FROM users
         WHERE email_verification_token = $1
         AND email_verification_expires > NOW()
         LIMIT 1`,
        [token]
      );
    }

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Токен невалидный или истек' });
    }

    const user = result.rows[0];
    await query(
      `UPDATE users
       SET email_verification_token = NULL,
           email_verification_expires = NULL,
           status = 'active',
           onboarding_step = 'email_verified',
           pending_expires_at = NULL
       WHERE id = $1`,
      [user.id]
    );

    await upsertVerification(user.id, 'email', 'verified');
    try {
      await query(
        `UPDATE user_verifications
         SET token = NULL, expires_at = NULL, verified_at = NOW(), status = 'verified', updated_at = NOW()
         WHERE user_id = $1 AND type = 'email'`,
        [user.id]
      );
    } catch (error) {
      if (error?.code !== '42P01') throw error;
    }

    const domain = process.env.DOMAIN || 'ipg-invest.ae';
    res.redirect(`https://${domain}/email-verified.html?email=${encodeURIComponent(user.email)}`);
  })
);

router.post(
  '/register/telegram',
  registerLimiter, // Rate limiting для регистрации
  asyncHandler(async (req, res) => {
    const { email, full_name, password, agree_terms, registration_code } = req.body || {};
    if (!registration_code) return res.status(400).json({ error: 'Код регистрации невалидный' });

    const redis = await getRedis();
    if (!redis) {
      return res.status(503).json({ error: 'Регистрация через Telegram временно недоступна (Redis не подключен)' });
    }
    
    const telegramDataStr = await redis.get(`telegram_registration:${registration_code}`);
    if (!telegramDataStr) {
      return res.status(400).json({ error: 'Код регистрации невалидный или истек' });
    }

    if (!email || !full_name || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (!agree_terms) {
      return res.status(400).json({ error: 'Необходимо согласие с офертой' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 8 символов' });
    }

    const telegramData = JSON.parse(telegramDataStr);
    const { telegramId, telegramUsername, chatId } = telegramData;

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR telegram_id = $2',
      [email, String(telegramId)]
    );
    if (existingUser.rows.length) {
      return res.status(409).json({ error: 'Email или Telegram уже зарегистрированы' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const investorId = generateInvestorId();

    const passwordPlain = String(password || '');
    const result = await query(
      `INSERT INTO users (
        email, password_hash, password_plain, full_name, investor_id,
        telegram_id, telegram_username, telegram_chat_id,
        email_verified, status, registration_method, registration_date,
        onboarding_step
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, 'active', 'telegram', NOW(), 'registered')
      RETURNING id, investor_id, email, full_name, status, email_verified, onboarding_step`,
      [
        email,
        hashedPassword,
        passwordPlain,
        full_name,
        investorId,
        String(telegramId),
        telegramUsername || '',
        String(chatId)
      ]
    );

    if (redis) {
      await redis.del(`telegram_registration:${registration_code}`);
    }

    const bot = require('../telegram-bot');
    await bot.sendMessage(
      chatId,
      `✅ Регистрация успешна!\n\nДобро пожаловать, ${full_name}!\nВаш Investor ID: ${result.rows[0].investor_id}\nБонус начисляется за первый депозит и зависит от суммы.`,
      { parse_mode: 'HTML' }
    );

    const accessToken = signAccessToken(result.rows[0].id, result.rows[0].email);
    const refreshToken = signRefreshToken(result.rows[0].id);
    await saveSession(result.rows[0].id, refreshToken);
    await upsertVerification(result.rows[0].id, 'email', 'pending');
    await upsertVerification(result.rows[0].id, 'telegram', 'pending');

    res.status(201).json({
      success: true,
      user: result.rows[0],
      tokens: { accessToken, refreshToken },
      onboarding: buildOnboardingPayload(result.rows[0])
    });
  })
);

router.get(
  '/onboarding-status',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, email, status, email_verified, onboarding_step, pending_expires_at, passport_file_path, telegram_id
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    const verificationMap = await getVerificationMap(user.id);
    const emailStatus = verificationMap.email?.status || (user.email_verified ? 'verified' : 'pending');
    const telegramStatus = verificationMap.telegram?.status || (user.telegram_id ? 'verified' : 'pending');
    const documentsStatus = verificationMap.documents?.status || (user.passport_file_path ? 'uploaded' : 'pending');

    res.json({
      ...buildOnboardingPayload(user),
      email: { status: emailStatus },
      telegram: { status: telegramStatus },
      documents: { status: documentsStatus }
    });
  })
);

router.post(
  '/verify-email/resend',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, email, email_verified
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    if (rows[0].email_verified) {
      return res.json({ success: true, message: 'Email already verified' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(
      `UPDATE users
       SET email_verification_token = $1,
           email_verification_expires = $2
       WHERE id = $3`,
      [token, expiresAt, rows[0].id]
    );
    await upsertVerification(rows[0].id, 'email', 'pending', token, expiresAt);

    const domain = process.env.DOMAIN || 'ipg-invest.ae';
    const verificationLink = `https://${domain}/auth/verify-email?token=${token}`;
    if (smtpUser && smtpPass) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: rows[0].email,
          subject: 'Imperial Pure Gold - Повторное подтверждение email',
          html: `<p>Подтвердите почту: <a href="${verificationLink}">Подтвердить email</a></p>`
        });
      } catch (error) {
        console.warn('Email resend failed:', error?.message || error);
      }
    }

    res.json({ success: true, message: 'Verification email sent' });
  })
);

router.post(
  '/telegram/register-link',
  registerLimiter,
  asyncHandler(async (_req, res) => {
    const bot = require('../telegram-bot');
    const botLink = await bot.buildStartLink('register');
    if (!botLink) {
      return res.status(503).json({ error: 'Telegram bot link is unavailable' });
    }
    res.json({
      success: true,
      bot_link: botLink,
      message: 'Open Telegram bot. You will receive registration link in chat.'
    });
  })
);

router.post(
  '/telegram/bind-link',
  authMiddleware,
  authLimiter,
  asyncHandler(async (req, res) => {
    const redis = await getRedis();
    if (!redis) {
      return res.status(503).json({ error: 'Telegram binding is temporarily unavailable' });
    }

    const bindingCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    await redis.setEx(
      `telegram_binding:${bindingCode}`,
      900,
      JSON.stringify({
        userId: String(req.user.id),
        createdAt: new Date().toISOString()
      })
    );

    const bot = require('../telegram-bot');
    const botLink = await bot.buildStartLink(`bind_${bindingCode}`);
    if (!botLink) {
      return res.status(503).json({ error: 'Telegram bot link is unavailable' });
    }

    res.json({
      success: true,
      bot_link: botLink,
      message: 'Open Telegram bot. Follow the instructions in chat to complete binding.'
    });
  })
);

router.post(
  '/verify-telegram',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { telegram_id, telegram_username, telegram_chat_id } = req.body || {};
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const { rows } = await query(
      `UPDATE users
       SET telegram_id = $1,
           telegram_username = COALESCE($2, telegram_username),
           telegram_chat_id = COALESCE($3, telegram_chat_id),
           onboarding_step = CASE
             WHEN email_verified THEN 'completed'
             ELSE onboarding_step
           END
       WHERE id = $4
       RETURNING id, status, email_verified, onboarding_step, pending_expires_at`,
      [String(telegram_id), telegram_username || null, telegram_chat_id || null, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    await upsertVerification(req.user.id, 'telegram', 'verified');

    res.json({
      success: true,
      onboarding: buildOnboardingPayload(rows[0])
    });
  })
);

module.exports = router;
