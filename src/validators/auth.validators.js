'use strict';

const Joi = require('joi');

const passwordRules = Joi.string()
  .min(8)
  .max(72) // bcrypt max
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[0-9]/, 'number')
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters.',
    'string.max': 'Password cannot exceed 72 characters.',
    'string.pattern.name': 'Password must contain at least one {#name}.',
    'any.required': 'Password is required.',
  });

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().messages({
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name cannot exceed 60 characters.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).max(254).required().messages({
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: passwordRules,
  // Accepted and passed through — the controller enforces the match check
  confirmPassword: Joi.string().required().messages({
    'any.required': 'Please confirm your password.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(254).required().messages({
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().max(72).required().messages({
    'any.required': 'Password is required.',
  }),
});

module.exports = { registerSchema, loginSchema };
