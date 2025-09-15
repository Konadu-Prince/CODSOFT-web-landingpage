// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');

const app = express();
const port = config.port;

// Trust reverse proxy (needed for correct IPs and https detection in some envs)
app.set('trust proxy', 1);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Keep bodyParser for compatibility with older clients (can be removed later)
app.use(bodyParser.json());

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS configuration
const allowedOrigins = String(config.corsOrigin)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// Basic rate limiting
app.use(rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false }));
app.use(morgan('combined'));
// Compression
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  }),
);
// Static assets with caching
app.use(
  express.static('.', {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  }),
);

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', env: config.environment });
});

// MongoDB connection (non-fatal if unavailable)
const mongoUri = config.mongoUri;
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
const meRoutes = require('./routes/meRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/me', meRoutes);

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
