'use strict';

const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getConversationHistory,
  patchConversationTitle,
  removeConversation,
} = require('../controllers/chatController');
const validateRequest = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const { chatLimiter } = require('../middleware/rateLimiter');
const { chatBodySchema, historyQuerySchema } = require('../validators/chat.validators');

// All chat routes require authentication
router.use(authenticate);

// GET /api/chat/history — must be before any parameterized routes
router.get('/history', validateRequest(historyQuerySchema, 'query'), getConversationHistory);

// POST /api/chat
router.post('/', chatLimiter, validateRequest(chatBodySchema, 'body'), sendMessage);

// PATCH /api/chat/:id/title  — rename a conversation
router.patch('/:id/title', patchConversationTitle);

// DELETE /api/chat/:id  — delete a conversation
router.delete('/:id', removeConversation);

module.exports = router;
