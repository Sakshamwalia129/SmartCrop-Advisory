'use strict';

const Groq = require('groq-sdk');

let client = null;

const getGroqClient = () => {
  if (client) return client;

  if (!process.env.GROQ_API_KEY) {
    console.error('[groq] GROQ_API_KEY is not set');
    process.exit(1);
  }

  client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 30000,
    maxRetries: 1,
  });

  return client;
};

const groqConfig = {
  get model() { return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; },
  get maxTokens() { return parseInt(process.env.GROQ_MAX_TOKENS || '1024', 10); },
  get temperature() { return parseFloat(process.env.GROQ_TEMPERATURE || '0.3'); },
};

module.exports = { getGroqClient, groqConfig };
