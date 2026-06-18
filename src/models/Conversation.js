'use strict';

const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Unknown', 'N/A'],
      default: 'Unknown',
    },
    possibleCause: { type: String, default: '' },
    immediateAction: { type: String, default: '' },
    organicTreatment: { type: String, default: '' },
    whenToContactOfficer: { type: String, default: '' },
    disclaimer: { type: String, default: '' },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    cropType: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    response: {
      type: responseSchema,
      required: true,
    },
    isWithinDomain: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'conversations',
  }
);

// Index for fetching recent conversations efficiently
conversationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
