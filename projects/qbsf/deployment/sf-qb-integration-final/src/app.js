const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/error-handler');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Salesforce-QuickBooks Integration',
    version: '0.1.0',
    status: 'running'
  });
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Add scheduler routes
app.post('/scheduler/payment-check', async (req, res, next) => {
  try {
    const scheduler = require('./services/scheduler');
    const result = await scheduler.runPaymentCheckNow();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
