'use strict';

const express = require('express');
const router = express.Router();

router.use('/health', require('./health.routes'));
router.use('/chat', require('./chat.routes'));

module.exports = router;
