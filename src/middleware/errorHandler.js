'use strict';

const { formatError } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((e) => e.message).join('. ');
    return res.status(400).json(formatError('VALIDATION_ERROR', msg));
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json(formatError('VALIDATION_ERROR', `Invalid ${err.path}`));
  }

  // Known operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json(formatError(err.code, err.message));
  }

  // Unknown errors — log internally, return generic message
  console.error(`[error] ${req.method} ${req.path}:`, err);
  return res.status(500).json(formatError('INTERNAL_ERROR', 'Something went wrong. Please try again.'));
};

module.exports = errorHandler;
