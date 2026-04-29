const express = require('express');
const router = express.Router();
const { analyzePassword } = require('../utils/analyzer');

// POST /api/analyze-password
router.post('/analyze-password', (req, res) => {
  try {
    const { password } = req.body;

    // Validation
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required and must be a string.' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Password too long. Maximum 128 characters.' });
    }

    // Analyze — password never stored or logged
    const result = analyzePassword(password);

    // Respond
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[analyze-password] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error during analysis.' });
  }
});

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Password Strength Analyzer API is running' });
});

module.exports = router;