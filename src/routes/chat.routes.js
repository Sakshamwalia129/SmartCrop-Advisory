'use strict';

const express = require('express');
const router = express.Router();

const { sendMessage, getConversationHistory } = require('../controllers/chatController');
const validateRequest = require('../middleware/validateRequest');
const { chatLimiter } = require('../middleware/rateLimiter');
const { chatBodySchema, historyQuerySchema } = require('../validators/chat.validators');

// GET /api/chat/history — must be before any parameterized routes
router.get('/history', validateRequest(historyQuerySchema, 'query'), getConversationHistory);

// POST /api/chat
router.post('/', chatLimiter, validateRequest(chatBodySchema, 'body'), sendMessage);

module.exports = router;
