const express = require('express');
const { generateGoogleAuthLink, googleAuthCallback } = require('../controllers/authController');

const router = express.Router();

router.get('/google', (req, res) => res.redirect(generateGoogleAuthLink()));
router.get('/callback', googleAuthCallback); // <-- Ensure this matches

module.exports = router;
