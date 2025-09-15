const express = require('express');
const auth = require('../middleware/auth');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

const router = express.Router();

// GET /api/me - profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('_id username email createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

// GET /api/me/results - my recent quiz results
router.get('/results', auth, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user.sub })
      .select('quiz username score total timeTaken createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('quiz', 'title');
    res.json(results);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load results' });
  }
});

module.exports = router;
