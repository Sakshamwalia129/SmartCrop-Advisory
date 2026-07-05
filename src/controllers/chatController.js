'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { formatSuccess, formatList, formatError } = require('../utils/responseFormatter');
const { getAgriculturalAdvisory, generateTitle } = require('../services/groqService');
const { saveConversation, getHistory, renameConversation, deleteConversation } = require('../services/conversationService');

// POST /api/chat
const sendMessage = asyncHandler(async (req, res) => {
  const { query, cropType, language = 'en' } = req.body;

  // 1. Get advisory from Groq + generate title in parallel (title failure is non-fatal)
  const [advisoryResult, titleResult] = await Promise.allSettled([
    getAgriculturalAdvisory(query, cropType || null, language),
    generateTitle(query, language),
  ]);

  if (advisoryResult.status === 'rejected') throw advisoryResult.reason;

  const advisory = advisoryResult.value;
  const title = titleResult.status === 'fulfilled' ? titleResult.value : null;

  // 2. Save to MongoDB (title is null if generation failed — backward compatible)
  const saved = await saveConversation({ query, cropType: cropType || null, advisory, language, title });

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

// PATCH /api/chat/:id/title
const patchConversationTitle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json(formatError('VALIDATION_ERROR', 'title cannot be empty'));
  }
  if (title.trim().length > 60) {
    return res.status(400).json(formatError('VALIDATION_ERROR', 'title cannot exceed 60 characters'));
  }

  const updated = await renameConversation(id, title.trim());
  return res.status(200).json(formatSuccess({ _id: updated._id, title: updated.title }));
});

// DELETE /api/chat/:id
const removeConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteConversation(id);
  return res.status(200).json(formatSuccess({ _id: id }));
});

module.exports = { sendMessage, getConversationHistory, patchConversationTitle, removeConversation };
