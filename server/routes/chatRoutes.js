const express = require('express');
const { handleChat } = require('../controllers/chatController');

const router = express.Router();

router.post('/webhook', handleChat);

module.exports = router;
