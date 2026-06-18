'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');

const app = express();

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

const isDevMode = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow: no origin (curl/Postman), dev mode, or whitelisted origins
      if (!origin || isDevMode || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// HTTP logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing (10kb limit)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Global rate limiter
app.use(globalLimiter);

// API routes
app.use('/api', routes);

// 404
app.use((req, _res, next) => {
  next(new AppError(`${req.method} ${req.path} not found`, 404, 'NOT_FOUND'));
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
