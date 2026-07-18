'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');
const passport = require('./config/passport');

const app = express();

const isDevMode = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// Security headers
// Relax CSP in development to allow OAuth provider redirects.
// In production, tighten this based on your deployment domain.
app.use(
  helmet({
    contentSecurityPolicy: isDevMode
      ? false  // Disable CSP entirely in dev — simplest for OAuth flows
      : {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'"],
            styleSrc:   ["'self'", "'unsafe-inline'"],
            imgSrc:     ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            formAction: ["'self'", 'https://accounts.google.com', 'https://github.com'],
            frameAncestors: ["'none'"],
          },
        },
    // Allow the OAuth redirect response header
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

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
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing (10kb limit)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Global rate limiter
app.use(globalLimiter);

// Passport (stateless — no session required)
app.use(passport.initialize());

// API routes
app.use('/api', routes);

// 404
app.use((req, _res, next) => {
  next(new AppError(`${req.method} ${req.path} not found`, 404, 'NOT_FOUND'));
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
