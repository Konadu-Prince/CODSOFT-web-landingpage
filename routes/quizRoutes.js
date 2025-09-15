const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('_id title createdAt');
    res.json(quizzes);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (e) {
    res.status(400).json({ message: 'Invalid quiz id' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, questions } = req.body || {};
    if (!title || !Array.isArray(questions))
      return res.status(400).json({ message: 'Invalid payload' });
    const quiz = await Quiz.create({ title, questions, createdBy: req.user.sub });
    res.status(201).json(quiz);
  } catch (e) {
    res.status(400).json({ message: 'Failed to create quiz' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(404).json({ message: 'Quiz not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: 'Failed to update quiz' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz deleted' });
  } catch (e) {
    res.status(400).json({ message: 'Failed to delete quiz' });
  }
});

module.exports = router;
