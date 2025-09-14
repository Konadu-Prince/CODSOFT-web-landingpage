// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const Quiz = require('./quizModel');
const mongoose = require('mongoose');

// In-memory fallback store when MongoDB is unavailable
const memoryStore = [];
function isDbReady() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}
function generateId() {
  return Math.random().toString(36).slice(2);
}

// GET /api/quizzes - list all quizzes
router.get('/', async (req, res) => {
  if (!isDbReady()) {
    return res.json(memoryStore);
  }
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// POST /api/quizzes - create a quiz
router.post('/', async (req, res) => {
  const { title, questions } = req.body || {};
  if (!isDbReady()) {
    if (!title || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const doc = { _id: generateId(), title, questions };
    memoryStore.push(doc);
    return res.status(201).json(doc);
  }
  try {
    const quiz = new Quiz({ title, questions });
    const saved = await quiz.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create quiz' });
  }
});

// GET /api/quizzes/:id - get quiz by id
router.get('/:id', async (req, res) => {
  if (!isDbReady()) {
    const quiz = memoryStore.find(q => q._id === req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    return res.json(quiz);
  }
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: 'Invalid quiz id' });
  }
});

// PUT /api/quizzes/:id - update quiz
router.put('/:id', async (req, res) => {
  if (!isDbReady()) {
    const idx = memoryStore.findIndex(q => q._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Quiz not found' });
    memoryStore[idx] = { ...memoryStore[idx], ...req.body };
    return res.json(memoryStore[idx]);
  }
  try {
    const updated = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Quiz not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update quiz' });
  }
});

// DELETE /api/quizzes/:id - delete quiz
router.delete('/:id', async (req, res) => {
  if (!isDbReady()) {
    const idx = memoryStore.findIndex(q => q._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Quiz not found' });
    memoryStore.splice(idx, 1);
    return res.json({ message: 'Quiz deleted' });
  }
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete quiz' });
  }
});

module.exports = router;
