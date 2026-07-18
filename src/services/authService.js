'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ── Token helpers ────────────────────────────────────────────────────────────

/**
 * Sign a JWT for the given user id.
 * @param {string} userId - MongoDB ObjectId string
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ sub: string }} decoded payload
 * @throws AppError(401) on invalid/expired token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN');
  }
};

// ── Auth operations ──────────────────────────────────────────────────────────

/**
 * Register a new local user.
 * Throws 409 if email already exists.
 */
const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: password, // pre-save hook will hash this
    provider: 'local',
  });

  await user.save();
  return user;
};

/**
 * Authenticate a local user with email + password.
 * Throws 401 on invalid credentials (generic message — no email enumeration).
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Generic message to prevent email enumeration attacks
  const invalidError = new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');

  if (!user) throw invalidError;
  if (user.provider !== 'local') {
    throw new AppError(
      `This account uses ${user.provider} sign-in. Please use that instead.`,
      401,
      'WRONG_PROVIDER'
    );
  }

  const valid = await user.comparePassword(password);
  if (!valid) throw invalidError;

  return user;
};

/**
 * Find or create a user via OAuth (Google / GitHub).
 * @param {{ provider, providerId, email, name }} profile
 */
const findOrCreateOAuthUser = async ({ provider, providerId, email, name }) => {
  // Try by providerId first (most reliable)
  let user = await User.findOne({ provider, providerId });
  if (user) return user;

  // If not found, try by email — link the OAuth provider to that account
  if (email) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      // Link the OAuth provider to the existing account
      user.provider = provider;
      user.providerId = providerId;
      await user.save();
      return user;
    }
  }

  // Create a brand-new OAuth user
  user = await User.create({
    name,
    email: email ? email.toLowerCase().trim() : `${provider}_${providerId}@noemail.local`,
    provider,
    providerId,
    passwordHash: null,
  });

  return user;
};

module.exports = { generateToken, verifyToken, registerUser, loginUser, findOrCreateOAuthUser };
