const express = require('express');
const { generateGoogleAuthLink, googleAuthCallback } = require('../controllers/authController');
const { authValidation } = require('../middleware/validation');
const { authLimiter, sanitizeInput } = require('../middleware/security');
const { auditLogger } = require('../middleware/logging');
const { body } = require('express-validator');

const router = express.Router();

// Apply auth rate limiter and sanitization to all auth routes
router.use(authLimiter);
router.use(sanitizeInput);

router.get('/google', (req, res) => res.redirect(generateGoogleAuthLink()));
router.get('/callback', googleAuthCallback); // <-- Ensure this matches

// Login route
router.post('/login', authValidation.login, async (req, res, next) => {
  try {
    // Your existing login logic here
    auditLogger('LOGIN_ATTEMPT', req.body.email, { ip: req.ip });
    // After successful login
    auditLogger('LOGIN_SUCCESS', req.body.email, { ip: req.ip });
  } catch (error) {
    auditLogger('LOGIN_FAILURE', req.body.email, { ip: req.ip, reason: error.message });
    next(error);
  }
});

// Register route
router.post('/register', authValidation.register, async (req, res, next) => {
  try {
    // Your existing registration logic here
    auditLogger('REGISTER_ATTEMPT', req.body.email, { ip: req.ip });
    // After successful registration
    auditLogger('REGISTER_SUCCESS', req.body.email, { ip: req.ip });
  } catch (error) {
    auditLogger('REGISTER_FAILURE', req.body.email, { ip: req.ip, reason: error.message });
    next(error);
  }
});

// Logout route
router.post('/logout', async (req, res, next) => {
  try {
    if (req.session) {
      const userId = req.session.userId;
      req.session.destroy();
      auditLogger('LOGOUT', userId, { ip: req.ip });
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    } else {
      res.status(400).json({ error: 'No active session' });
    }
  } catch (error) {
    next(error);
  }
});

// Password reset request
router.post('/reset-password-request', authValidation.login, async (req, res, next) => {
  try {
    // Your password reset request logic here
    auditLogger('PASSWORD_RESET_REQUEST', req.body.email, { ip: req.ip });
  } catch (error) {
    next(error);
  }
});

// Password reset
router.post('/reset-password', [
  authValidation.login,
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res, next) => {
  try {
    // Your password reset logic here
    auditLogger('PASSWORD_RESET', req.body.email, { ip: req.ip });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
