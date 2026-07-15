import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants.js';

/**
 * Creates a rate limiter middleware with the specified configuration.
 * Uses in-memory store by default — acceptable for single-instance deployments.
 */
const createRateLimiter = (config, messagePrefix = 'Too many requests') => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    skip: () => process.env.NODE_ENV === 'test',
    message: {
      success: false,
      error: `${messagePrefix}. Please try again later.`,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Pre-configured limiters
export const authRegisterLimiter = createRateLimiter(
  RATE_LIMITS.AUTH_REGISTER,
  'Too many registration attempts'
);

export const authLoginLimiter = createRateLimiter(
  RATE_LIMITS.AUTH_LOGIN,
  'Too many login attempts'
);

export const aiAnalyzeLimiter = createRateLimiter(
  RATE_LIMITS.AI_ANALYZE,
  'Daily AI analysis limit reached'
);

export const generalLimiter = createRateLimiter(
  RATE_LIMITS.GENERAL,
  'Too many requests'
);

