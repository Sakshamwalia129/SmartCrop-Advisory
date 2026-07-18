'use strict';

const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const { register, login, me, logout } = require('../controllers/authController');
const { googleCallback, githubCallback, oauthFailure } = require('../controllers/oauthController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema } = require('../validators/auth.validators');

// ── Email / Password ──────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', authLimiter, validateRequest(registerSchema, 'body'), register);

// POST /api/auth/login
router.post('/login', authLimiter, validateRequest(loginSchema, 'body'), login);

// GET /api/auth/me — protected (used by frontend on page load to restore session)
router.get('/me', authenticate, me);

// POST /api/auth/logout
router.post('/logout', logout);

// ── Google OAuth ──────────────────────────────────────────────────────────────

// Only mount if the Google strategy was registered (credentials present)
if (passport._strategies && passport._strategies.google) {
  // Step 1: redirect user to Google
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  // Step 2: Google redirects here after user approves
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/api/auth/oauth/failure' }),
    googleCallback
  );
} else {
  // Return a clear JSON error when credentials are not configured
  router.get('/google', (_req, res) =>
    res.status(501).json({ success: false, error: { code: 'NOT_CONFIGURED', message: 'Google OAuth is not configured on this server.' } })
  );
  router.get('/google/callback', (_req, res) =>
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?oauth_error=not_configured`)
  );
}

// ── GitHub OAuth ──────────────────────────────────────────────────────────────

if (passport._strategies && passport._strategies.github) {
  // Step 1: redirect user to GitHub
  router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  // Step 2: GitHub redirects here after user approves
  router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/api/auth/oauth/failure' }),
    githubCallback
  );
} else {
  router.get('/github', (_req, res) =>
    res.status(501).json({ success: false, error: { code: 'NOT_CONFIGURED', message: 'GitHub OAuth is not configured on this server.' } })
  );
  router.get('/github/callback', (_req, res) =>
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?oauth_error=not_configured`)
  );
}

// ── OAuth failure handler ─────────────────────────────────────────────────────
router.get('/oauth/failure', oauthFailure);

module.exports = router;
