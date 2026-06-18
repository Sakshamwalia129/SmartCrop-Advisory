'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { formatSuccess, formatList } = require('../utils/responseFormatter');
const { getAgriculturalAdvisory } = require('../services/groqService');
const { saveConversation, getHistory } = require('../services/conversationService');

// POST /api/chat
const sendMessage = asyncHandler(async (req, res) => {
  const { query, cropType } = req.body;

  // 1. Get advisory from Groq
  const advisory = await getAgriculturalAdvisory(query, cropType || null);

  // 2. Save to MongoDB
  const saved = await saveConversation({ query, cropType: cropType || null, advisory });

  // 3. Return response
  const { isWithinDomain, ...responseData } = advisory;

  return res.status(200).json(
    formatSuccess(
      { conversationId: saved._id, ...responseData },
      { isWithinDomain }
    )
  );
});

// GET /api/chat/history
const getConversationHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const { conversations, total, page: currentPage, limit: currentLimit } =
    await getHistory(Number(page), Number(limit));

  return res.status(200).json(formatList(conversations, total, currentPage, currentLimit));
});

module.exports = { sendMessage, getConversationHistory };
