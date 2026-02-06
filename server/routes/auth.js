const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { query } = require('../db');
const { asyncHandler } = require('./utils');
const { getRedis } = require('../redis');

const router = express.Router();

const generateInvestorId = () => `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

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

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { login, password } = req.body || {};
    if (!login || !password) {
      return res.status(400).json({ error: 'login and password are required' });
    }

    const { rows } = await query(
      `SELECT id, investor_id, email, full_name, status, password_hash, email_verified
       FROM users
       WHERE (email = $1 OR telegram_id = $1)
       LIMIT 1`,
      [login]
    );

    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    if (rows[0].status !== 'active') return res.status(403).json({ error: 'User not active' });
    if (!rows[0].email_verified) return res.status(403).json({ error: 'Email not verified' });

    const valid = await bcrypt.compare(password, rows[0].password_hash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken(rows[0].id, rows[0].email);
    const refreshToken = signRefreshToken(rows[0].id);
    await saveSession(rows[0].id, refreshToken);
    await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [rows[0].id]);

    res.json({
      tokens: {
        accessToken,
        refreshToken
      },
      user: {
        id: rows[0].id,
        investor_id: rows[0].investor_id,
        email: rows[0].email,
        full_name: rows[0].full_name
      }
    });
  })
);

router.post(
  '/register/email',
  asyncHandler(async (req, res) => {
    const { email, password, full_name, agree_terms } = req.body || {};
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (!agree_terms) {
      return res.status(400).json({ error: 'Необходимо согласие с офертой' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 8 символов' });
    }

    const exists = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);
    const investorId = generateInvestorId();

    const result = await query(
      `INSERT INTO users (
        email, password_hash, full_name, investor_id,
        email_verified, email_verification_token, email_verification_expires,
        registration_date, status, registration_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending', 'email')
      RETURNING id, investor_id, email, full_name`,
      [
        email,
        hashedPassword,
        full_name,
        investorId,
        false,
        emailVerificationToken,
        emailVerificationExpires
      ]
    );

    const domain = process.env.DOMAIN || 'ipg-invest.ae';
    const verificationLink = `https://${domain}/auth/verify-email?token=${emailVerificationToken}`;

    if (smtpUser && smtpPass) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Imperial Pure Gold - Подтверждение email',
          html: `
            <h2>Добро пожаловать в Imperial Pure Gold!</h2>
            <p>Спасибо за регистрацию. Пожалуйста, подтвердите вашу почту:</p>
            <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background-color:#d4af37;color:#050505;text-decoration:none;border-radius:4px;">
              Подтвердить email
            </a>
            <p>Ссылка действительна 24 часа.</p>
          `
        });
      } catch (error) {
        console.warn('Email delivery failed. Registration continues.', error?.message || error);
      }
    } else {
      // Dev-friendly: allow registration without SMTP credentials.
      console.warn('EMAIL_USER/EMAIL_PASSWORD are not set. Skipping email delivery.');
    }

    res.status(201).json({
      success: true,
      message: 'Письмо с подтверждением отправлено на вашу почту',
      user: result.rows[0]
    });
  })
);

router.get(
  '/verify-email',
  asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const result = await query(
      `SELECT id, email FROM users
       WHERE email_verification_token = $1
       AND email_verification_expires > NOW()`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Токен невалидный или истек' });
    }

    const user = result.rows[0];
    await query(
      `UPDATE users
       SET email_verified = true,
           email_verification_token = NULL,
           email_verification_expires = NULL,
           status = 'active'
       WHERE id = $1`,
      [user.id]
    );

    await query(
      `INSERT INTO balances (user_id, currency, amount)
       VALUES ($1, 'GHS', 1.0)
       ON CONFLICT (user_id, currency)
       DO UPDATE SET amount = balances.amount + 1.0`,
      [user.id]
    );

    const domain = process.env.DOMAIN || 'ipg-invest.ae';
    res.redirect(`https://${domain}/email-verified.html?email=${encodeURIComponent(user.email)}`);
  })
);

router.post(
  '/register/telegram',
  asyncHandler(async (req, res) => {
    const { email, full_name, password, agree_terms, registration_code } = req.body || {};
    if (!registration_code) return res.status(400).json({ error: 'Код регистрации невалидный' });

    const redis = await getRedis();
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

    const result = await query(
      `INSERT INTO users (
        email, password_hash, full_name, investor_id,
        telegram_id, telegram_username, telegram_chat_id,
        email_verified, status, registration_method, registration_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'active', 'telegram', NOW())
      RETURNING id, investor_id, email, full_name`,
      [
        email,
        hashedPassword,
        full_name,
        investorId,
        String(telegramId),
        telegramUsername || '',
        String(chatId)
      ]
    );

    await query(
      `INSERT INTO balances (user_id, currency, amount)
       VALUES ($1, 'GHS', 1.0)
       ON CONFLICT (user_id, currency)
       DO UPDATE SET amount = balances.amount + 1.0`,
      [result.rows[0].id]
    );

    await redis.del(`telegram_registration:${registration_code}`);

    const bot = require('../telegram-bot');
    await bot.sendMessage(
      chatId,
      `✅ Регистрация успешна!\n\nДобро пожаловать, ${full_name}!\nВаш Investor ID: ${result.rows[0].investor_id}\nВы получили бонус: 1 GHS`,
      { parse_mode: 'HTML' }
    );

    const accessToken = signAccessToken(result.rows[0].id, result.rows[0].email);
    const refreshToken = signRefreshToken(result.rows[0].id);
    await saveSession(result.rows[0].id, refreshToken);

    res.status(201).json({
      success: true,
      user: result.rows[0],
      tokens: { accessToken, refreshToken },
      bonus: { amount: 1, currency: 'GHS' }
    });
  })
);

module.exports = router;
