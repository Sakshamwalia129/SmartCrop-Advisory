'use strict';

const Joi = require('joi');

const chatBodySchema = Joi.object({
  query: Joi.string().trim().min(3).max(500).required().messages({
    'string.empty': 'query cannot be empty',
    'string.min': 'query must be at least 3 characters',
    'string.max': 'query cannot exceed 500 characters',
    'any.required': 'query is required',
  }),
  cropType: Joi.string().trim().max(100).optional().allow('', null),
});

const historyQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { chatBodySchema, historyQuerySchema };
