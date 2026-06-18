'use strict';

const { formatError } = require('../utils/responseFormatter');

const validateRequest = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message.replace(/['"]/g, '')).join('. ');
    return res.status(400).json(formatError('VALIDATION_ERROR', message));
  }

  req[source] = value;
  return next();
};

module.exports = validateRequest;
