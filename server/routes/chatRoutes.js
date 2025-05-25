const express = require('express');
const { handleChat, initializeSession, fetchHistory, deleteSession } = require('../controllers/chatController');
const { chatValidation } = require('../middleware/validation');
const { chatLimiter, sanitizeInput } = require('../middleware/security');
const { auditLogger } = require('../middleware/logging');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();

// Apply chat rate limiter and sanitization to all chat routes
router.use(chatLimiter);
router.use(sanitizeInput);

// Apply Firebase authentication to all chat routes
router.use(verifyFirebaseToken);

// Initialize chat session
router.post('/initialize-session', async (req, res, next) => {
  try {
    const sessionId = await initializeSession(req.user.uid);
    auditLogger('CHAT_SESSION_INIT', req.user.uid, { sessionId });
    res.json({ sessionId });
  } catch (error) {
    next(error);
  }
});

// Send message
router.post('/webhook', async (req, res, next) => {
  try {
    const response = await handleChat(req.body.Body, req.body.From, req.body.sessionId, req.user.uid);
    auditLogger('CHAT_MESSAGE_SENT', req.user.uid, {
      sessionId: req.body.sessionId,
      messageLength: req.body.Body.length
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get chat history
router.get('/history', async (req, res, next) => {
  try {
    const history = await fetchHistory(req.user.uid);
    auditLogger('CHAT_HISTORY_ACCESS', req.user.uid, {
      sessionId: req.query.sessionId
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Delete chat session
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    await deleteSession(req.params.sessionId, req.user.uid);
    auditLogger('CHAT_SESSION_DELETE', req.user.uid, {
      sessionId: req.params.sessionId
    });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
