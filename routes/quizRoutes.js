const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const auth = require('../middleware/auth');

router.get(
  '/',
  [
    query('q').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ message: 'Invalid query', errors: errors.array() });

      const { q = '', page = 1, limit = 10 } = req.query;
      const filter = q
        ? { title: { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
        : {};

      const total = await Quiz.countDocuments(filter);
      const quizzes = await Quiz.find(filter)
        .select('_id title createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      res.json({ items: quizzes, page, limit, total, pages: Math.ceil(total / limit) });
    } catch (e) {
      res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
  },
);

router.get('/:id', [param('id').isMongoId()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid params', errors: errors.array() });
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (e) {
    res.status(400).json({ message: 'Invalid quiz id' });
  }
});

router.post(
  '/',
  auth,
  [
    body('title').isString().trim().isLength({ min: 1 }),
    body('description').optional().isString().trim(),
    body('category').optional().isString().trim(),
    body('questions').isArray({ min: 1 }),
    body('questions.*.question').isString().trim().notEmpty(),
    body('questions.*.options').isArray({ min: 2 }),
    body('questions.*.correctAnswer').isString().trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ message: 'Invalid payload', errors: errors.array() });
      const { title, description = '', category = '', questions } = req.body || {};
      const quiz = await Quiz.create({
        title,
        description,
        category,
        questions,
        createdBy: req.user.sub,
      });
      res.status(201).json(quiz);
    } catch (e) {
      res.status(400).json({ message: 'Failed to create quiz' });
    }
  },
);

router.put('/:id', auth, [param('id').isMongoId()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid params', errors: errors.array() });
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy && String(quiz.createdBy) !== String(req.user.sub)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(quiz, req.body);
    await quiz.save();
    res.json(quiz);
  } catch (e) {
    res.status(400).json({ message: 'Failed to update quiz' });
  }
});

router.delete('/:id', auth, [param('id').isMongoId()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid params', errors: errors.array() });
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy && String(quiz.createdBy) !== String(req.user.sub)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (e) {
    res.status(400).json({ message: 'Failed to delete quiz' });
  }
});

module.exports = router;
// Submission endpoints
router.post(
  '/:id/submit',
  [
    param('id').isMongoId(),
    body('answers').isArray({ min: 1 }),
    body('timeTaken').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ message: 'Invalid payload', errors: errors.array() });

      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      const submittedAnswers = req.body.answers;
      let score = 0;
      const graded = quiz.questions.map((q, idx) => {
        const selected = (submittedAnswers[idx] && submittedAnswers[idx].selected) || '';
        const isCorrect = String(selected).trim() === String(q.correctAnswer).trim();
        if (isCorrect) score++;
        return {
          question: q.question,
          selected,
          correct: q.correctAnswer,
          isCorrect,
        };
      });
      const result = await QuizResult.create({
        quiz: quiz._id,
        user: req.user ? req.user.sub : undefined,
        username: req.user ? req.user.username : undefined,
        score,
        total: quiz.questions.length,
        timeTaken: req.body.timeTaken || 0,
        answers: graded,
      });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ message: 'Failed to submit quiz' });
    }
  },
);

router.get('/:id/results', [param('id').isMongoId()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid params', errors: errors.array() });
    const results = await QuizResult.find({ quiz: req.params.id })
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(results);
  } catch (e) {
    res.status(400).json({ message: 'Failed to fetch results' });
  }
});

// Leaderboard - Top results for a quiz
router.get('/:id/leaderboard', [param('id').isMongoId()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid params', errors: errors.array() });
    const results = await QuizResult.find({ quiz: req.params.id })
      .select('username score total timeTaken createdAt')
      .sort({ score: -1, timeTaken: 1, createdAt: 1 })
      .limit(20);
    res.json(results);
  } catch (e) {
    res.status(400).json({ message: 'Failed to fetch leaderboard' });
  }
});
