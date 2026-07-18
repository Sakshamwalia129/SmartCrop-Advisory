'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { formatSuccess, formatError } = require('../utils/responseFormatter');
const { registerUser, loginUser, generateToken } = require('../services/authService');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Independent server-side guard — never trust the client alone
  if (password !== confirmPassword) {
    return res.status(400).json(
      formatError('PASSWORDS_MISMATCH', 'Passwords do not match.')
    );
  }

  const user = await registerUser({ name, email, password });
  const token = generateToken(user._id.toString());

  return res.status(201).json(
    formatSuccess({ token, user: user.toSafeObject() })
  );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUser({ email, password });
  const token = generateToken(user._id.toString());

  return res.status(200).json(
    formatSuccess({ token, user: user.toSafeObject() })
  );
});

// GET /api/auth/me  (protected)
const me = asyncHandler(async (req, res) => {
  // req.user is attached by the authenticate middleware
  return res.status(200).json(formatSuccess({ user: req.user }));
});

// POST /api/auth/logout
// JWT is stateless — logout is handled client-side (delete token from storage).
// This endpoint exists so the frontend can make a clean call and we can
// later add token revocation (e.g. Redis blocklist) without changing the API.
const logout = asyncHandler(async (_req, res) => {
  return res.status(200).json(formatSuccess({ message: 'Logged out successfully.' }));
});

module.exports = { register, login, me, logout };
