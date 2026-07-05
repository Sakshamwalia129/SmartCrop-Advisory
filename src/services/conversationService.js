'use strict';

const Conversation = require('../models/Conversation');
const AppError = require('../utils/AppError');

const saveConversation = async ({ query, cropType, advisory, language = 'en', title = null }) => {
  try {
    const doc = await Conversation.create({
      query,
      title,
      cropType: cropType || null,
      response: {
        riskLevel: advisory.riskLevel,
        possibleCause: advisory.possibleCause,
        immediateAction: advisory.immediateAction,
        organicTreatment: advisory.organicTreatment,
        disclaimer: advisory.disclaimer,
      },
      isWithinDomain: advisory.isWithinDomain,
      language,
    });
    return doc;
  } catch (err) {
    console.error('[db] saveConversation failed:', err.message);
    throw new AppError('Failed to save conversation.', 500, 'DATABASE_ERROR');
  }
};

const getHistory = async (page = 1, limit = 20) => {
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safeLimit;

  try {
    const [total, conversations] = await Promise.all([
      Conversation.countDocuments(),
      Conversation.find()
        .select('query title cropType response isWithinDomain language createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
    ]);

    return { conversations, total, page: safePage, limit: safeLimit };
  } catch (err) {
    console.error('[db] getHistory failed:', err.message);
    throw new AppError('Failed to retrieve history.', 500, 'DATABASE_ERROR');
  }
};

const renameConversation = async (id, title) => {
  try {
    const doc = await Conversation.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError('Conversation not found.', 404, 'NOT_FOUND');
    return doc;
  } catch (err) {
    if (err.isOperational) throw err;
    console.error('[db] renameConversation failed:', err.message);
    throw new AppError('Failed to rename conversation.', 500, 'DATABASE_ERROR');
  }
};

const deleteConversation = async (id) => {
  try {
    const doc = await Conversation.findByIdAndDelete(id);
    if (!doc) throw new AppError('Conversation not found.', 404, 'NOT_FOUND');
    return doc;
  } catch (err) {
    if (err.isOperational) throw err;
    console.error('[db] deleteConversation failed:', err.message);
    throw new AppError('Failed to delete conversation.', 500, 'DATABASE_ERROR');
  }
};

module.exports = { saveConversation, getHistory, renameConversation, deleteConversation };
