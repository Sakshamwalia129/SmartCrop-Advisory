'use strict';

const Conversation = require('../models/Conversation');
const AppError = require('../utils/AppError');

const saveConversation = async ({ query, cropType, advisory }) => {
  try {
    const doc = await Conversation.create({
      query,
      cropType: cropType || null,
      response: {
        riskLevel: advisory.riskLevel,
        possibleCause: advisory.possibleCause,
        immediateAction: advisory.immediateAction,
        organicTreatment: advisory.organicTreatment,
        whenToContactOfficer: advisory.whenToContactOfficer,
        disclaimer: advisory.disclaimer,
      },
      isWithinDomain: advisory.isWithinDomain,
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
        .select('query cropType response isWithinDomain createdAt')
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

module.exports = { saveConversation, getHistory };
