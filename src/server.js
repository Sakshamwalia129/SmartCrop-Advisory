'use strict';

const path = require('path');
// Always load .env from the project root, regardless of which directory
// the server process was launched from (e.g. `cd src && npm run dev`).
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT} — ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received — shutting down`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('[server] MongoDB connection closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    console.error('[server] Uncaught Exception:', err.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[server] Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

start();
