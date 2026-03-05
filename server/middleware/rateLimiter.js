const rateLimit = require('express-rate-limit');
const { getRedis } = require('../redis');

const shouldSkipRateLimit = (req) => {
  const disableLocal = process.env.RATE_LIMIT_DISABLE_LOCAL !== 'false';
  if (!disableLocal) return false;

  const ip = String(req.ip || '');
  const forwardedFor = String(req.headers['x-forwarded-for'] || '');
  const source = `${ip},${forwardedFor}`;

  return (
    source.includes('127.0.0.1') ||
    source.includes('::1') ||
    source.includes('localhost') ||
    source.includes('192.168.') ||
    source.includes('10.') ||
    /172\.(1[6-9]|2\d|3[0-1])\./.test(source)
  );
};

/**
 * REDIS-BASED RATE LIMITER
 * Использует Redis для distributed rate limiting (работает с несколькими инстансами API)
 */
class RedisRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 минут
    this.max = options.max || 100; // максимум запросов
    this.message = options.message || 'Too many requests, please try again later';
    this.keyPrefix = options.keyPrefix || 'rate-limit:';
  }

  async middleware(req, res, next) {
    if (shouldSkipRateLimit(req)) {
      next();
      return;
    }

    try {
      const redis = await getRedis();
      
      // Если Redis недоступен, пропускаем rate limiting
      if (!redis) {
        next();
        return;
      }
      
      const key = `${this.keyPrefix}${req.ip}`;
      
      const current = await redis.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= this.max) {
        return res.status(429).json({ 
          error: 'TooManyRequests', 
          message: this.message,
          retryAfter: Math.ceil(this.windowMs / 1000)
        });
      }

      // Инкремент счетчика
      if (count === 0) {
        await redis.setEx(key, Math.ceil(this.windowMs / 1000), '1');
      } else {
        await redis.incr(key);
      }

      // Добавляем заголовки для клиента
      res.setHeader('X-RateLimit-Limit', this.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - count - 1));

      next();
    } catch (error) {
      // Fallback: если Redis недоступен, пропускаем rate limiting
      console.error('Redis rate limiter error:', error);
      next();
    }
  }
}

/**
 * MEMORY-BASED RATE LIMITER (fallback)
 * Для локальной разработки или когда Redis недоступен
 */
const createMemoryRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => shouldSkipRateLimit(req)
  });
};

/**
 * PRESET CONFIGURATIONS
 */

// Строгий лимит для авторизации (защита от брутфорса)
const authLimiter = process.env.REDIS_URL
  ? new RedisRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 минут
      max: 5, // 5 попыток
      message: 'Too many login attempts, please try again later',
      keyPrefix: 'auth-limit:'
    })
  : createMemoryRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many login attempts'
    });

// Средний лимит для регистрации
const registerLimiter = process.env.REDIS_URL
  ? new RedisRateLimiter({
      windowMs: 60 * 60 * 1000, // 1 час
      max: 3, // 3 регистрации с одного IP
      message: 'Too many registration attempts',
      keyPrefix: 'register-limit:'
    })
  : createMemoryRateLimiter({
      windowMs: 60 * 60 * 1000,
      max: 3,
      message: 'Too many registration attempts'
    });

// Общий лимит для API
const apiLimiter = process.env.REDIS_URL
  ? new RedisRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 минут
      max: 100, // 100 запросов
      message: 'Too many API requests',
      keyPrefix: 'api-limit:'
    })
  : createMemoryRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many API requests'
    });

// Строгий лимит для админ панели
const adminLimiter = process.env.REDIS_URL
  ? new RedisRateLimiter({
      windowMs: 60 * 1000, // 1 минута
      max: 30, // 30 запросов в минуту
      message: 'Admin API rate limit exceeded',
      keyPrefix: 'admin-limit:'
    })
  : createMemoryRateLimiter({
      windowMs: 60 * 1000,
      max: 30,
      message: 'Admin API rate limit exceeded'
    });

// Экспорт middleware
module.exports = {
  RedisRateLimiter,
  createMemoryRateLimiter,
  authLimiter: authLimiter.middleware ? authLimiter.middleware.bind(authLimiter) : authLimiter,
  registerLimiter: registerLimiter.middleware ? registerLimiter.middleware.bind(registerLimiter) : registerLimiter,
  apiLimiter: apiLimiter.middleware ? apiLimiter.middleware.bind(apiLimiter) : apiLimiter,
  adminLimiter: adminLimiter.middleware ? adminLimiter.middleware.bind(adminLimiter) : adminLimiter
};
