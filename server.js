// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/onlinequiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Routes
try {
  const quizRoutes = require('./quizRoutes');
  app.use('/api/quizzes', quizRoutes);
} catch (error) {
  console.warn('quizRoutes not configured:', error.message);
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



