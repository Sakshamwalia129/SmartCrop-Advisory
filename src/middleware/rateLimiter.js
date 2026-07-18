'use strict';

const rateLimit = require('express-rate-limit');
const { formatError } = require('../utils/responseFormatter');

const handler = (_req, res) =>
  res.status(429).json(formatError('RATE_LIMIT_EXCEEDED', 'Too many requests. Please wait a moment.'));

const globalLimiter = rateLimit({
  windowMs: 60000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
})

const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_CHAT || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Strict limiter for auth endpoints: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_AUTH || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = { globalLimiter, chatLimiter, authLimiter };
