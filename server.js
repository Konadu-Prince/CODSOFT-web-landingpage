// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(express.static('.'));

// MongoDB connection (non-fatal if unavailable)
mongoose
  .connect('mongodb://localhost:27017/onlinequiz', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.warn('MongoDB not available, continuing without DB:', err.message);
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



