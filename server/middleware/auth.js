const jwt = require('jsonwebtoken');
const { query } = require('../db');

/**
 * JWT Authentication Middleware
 * Проверяет наличие и валидность JWT токена в заголовке Authorization
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'ipg-dev-secret'
    );

    // Добавляем данные пользователя в req для использования в роутах
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'TokenExpired', 
        message: 'Access token has expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'InvalidToken', 
        message: 'Invalid access token' 
      });
    }

    return res.status(500).json({ 
      error: 'ServerError', 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Optional Auth Middleware
 * Проверяет токен, но не требует его наличия
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'ipg-dev-secret'
      );
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'user'
      };
    }
    
    next();
  } catch (error) {
    // Игнорируем ошибки токена для optional middleware
    next();
  }
};

/**
 * Admin Only Middleware
 * Требует JWT токен с ролью admin
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Admin access required' 
    });
  }

  next();
};

/**
 * Owner or Admin Middleware
 * Проверяет, что пользователь владелец ресурса или админ
 */
const ownerOrAdminMiddleware = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      });
    }

    const resourceUserId = req.params[paramName] || req.query.userId || req.body.user_id;
    
    if (req.user.role === 'admin' || String(req.user.id) === String(resourceUserId)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Access denied to this resource' 
    });
  };
};

const isFeatureEnabled = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

/**
 * Blocks financial mutations for users that are not active/verified.
 * Toggle via BLOCK_FINANCE_FOR_PENDING env flag.
 */
const requireActiveVerifiedUser = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!isFeatureEnabled(process.env.BLOCK_FINANCE_FOR_PENDING, true)) {
      return next();
    }

    const { rows } = await query(
      `SELECT status, email_verified
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    if (user.status !== 'active' || !user.email_verified) {
      return res.status(403).json({
        error: 'OnboardingRequired',
        message: 'Complete onboarding before financial operations'
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to validate onboarding access'
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  ownerOrAdminMiddleware,
  requireActiveVerifiedUser
};
