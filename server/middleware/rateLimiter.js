import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Prevents abuse and DDoS attacks
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests too
});

/**
 * Strict limiter for authentication endpoints (login/register)
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload limiter for file uploads
 * Prevents excessive file uploads
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: 'Upload limit reached. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict limiter for sensitive operations
 * Like password reset, email change, etc.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    error: 'Too many requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create a custom rate limiter with dynamic configuration
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests
 * @param {string} message - Custom error message
 */
export const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message || 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};