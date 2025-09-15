const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const port = Number.parseInt(process.env.PORT, 10) || 8080;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/onlinequiz';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
const corsOrigin = process.env.CORS_ORIGIN || '*';

module.exports = {
  environment,
  port,
  mongoUri,
  jwtSecret,
  corsOrigin,
};
