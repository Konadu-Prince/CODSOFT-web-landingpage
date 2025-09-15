/* Seed script to insert a sample user and quiz */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { mongoUri } = require('../config');
const User = require('../models/User');
const Quiz = require('../models/Quiz');

async function run() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const username = 'demo';
    let user = await User.findOne({ username });
    if (!user) {
      const passwordHash = await bcrypt.hash('password123', 10);
      user = await User.create({ username, email: 'demo@example.com', passwordHash });
      console.log('Created user:', user.username);
    }

    const quizTitle = 'Sample General Knowledge';
    let quiz = await Quiz.findOne({ title: quizTitle });
    if (!quiz) {
      quiz = await Quiz.create({
        title: quizTitle,
        createdBy: user._id,
        questions: [
          {
            question: 'Capital of France?',
            options: ['Paris', 'London', 'Rome'],
            correctAnswer: 'Paris',
          },
          {
            question: 'Largest planet?',
            options: ['Mars', 'Jupiter', 'Venus'],
            correctAnswer: 'Jupiter',
          },
        ],
      });
      console.log('Created quiz:', quiz.title);
    }

    console.log('Seeding complete.');
  } catch (e) {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
