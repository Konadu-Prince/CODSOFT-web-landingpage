// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

dotenv.config();
const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use(morgan('combined'));
app.use(express.static('.'));

// MongoDB connection (non-fatal if unavailable)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/onlinequiz';
mongoose
  .connect(mongoUri, {
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
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



