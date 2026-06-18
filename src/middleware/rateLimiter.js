'use strict';

const rateLimit = require('express-rate-limit');
const { formatError } = require('../utils/responseFormatter');

const handler = (_req, res) =>
  res.status(429).json(formatError('RATE_LIMIT_EXCEEDED', 'Too many requests. Please wait a moment.'));

const globalLimiter = rateLimit({
  windowMs: 60000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_CHAT || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = { globalLimiter, chatLimiter };
