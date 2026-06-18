'use strict';

const formatSuccess = (data, meta = {}) => {
  const response = { success: true, data };
  if (Object.keys(meta).length > 0) response.meta = meta;
  return response;
};

const formatError = (code, message) => ({
  success: false,
  error: { code, message },
});

const formatList = (items, total, page, limit) => ({
  success: true,
  data: { total, page, limit, conversations: items },
});

module.exports = { formatSuccess, formatError, formatList };
