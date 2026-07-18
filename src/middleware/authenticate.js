'use strict';

const { verifyToken } = require('../services/authService');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * authenticate middleware
 * - Reads `Authorization: Bearer <token>` header
 * - Verifies JWT, loads user from DB
 * - Attaches req.user = { id, name, email, provider } to request
 * - Returns 401 on missing / invalid / expired token
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.slice(7); // remove "Bearer "

  // verifyToken throws an AppError on failure
  const payload = verifyToken(token);

  // Load user to ensure they still exist (e.g. not deleted)
  const user = await User.findById(payload.sub).select('_id name email provider').lean();
  if (!user) {
    throw new AppError('User account not found.', 401, 'UNAUTHORIZED');
  }

  req.user = { id: user._id.toString(), name: user.name, email: user.email, provider: user.provider };
  next();
});

module.exports = authenticate;
