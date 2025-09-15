const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: (v) => Array.isArray(v) && v.length >= 2 },
    correctAnswer: { type: String, required: true },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    questions: { type: [questionSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Quiz', quizSchema);
