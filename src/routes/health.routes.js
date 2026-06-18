'use strict';

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  const healthy = dbState === 1;

  return res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      database: dbStatus,
      groqApi: process.env.GROQ_API_KEY ? 'configured' : 'not configured',
    },
  });
});

module.exports = router;
