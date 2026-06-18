'use strict';

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[db] MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[db] Connected — ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`[db] Connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => console.warn('[db] Disconnected'));
  mongoose.connection.on('reconnected', () => console.log('[db] Reconnected'));
};

module.exports = { connectDB };
