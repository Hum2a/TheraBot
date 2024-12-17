const express = require('express');
const { handleChat, initializeSession, fetchHistory } = require('../controllers/chatController');

const router = express.Router();

router.post('/initialize-session', initializeSession);
router.post('/webhook', handleChat);
router.get('/history', fetchHistory); // New route for fetching conversation history

module.exports = router;
