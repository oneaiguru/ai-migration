/**
 * Salesforce-QuickBooks Integration App Configuration
 */
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
const webhookRoutes = require('./routes/webhook');
const adminRoutes = require('./routes/admin');

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

// Serve static files for admin dashboard
app.use('/dashboard', express.static(path.join(__dirname, '../public')));

// Routes
const healthHandler = (_req, res) => {
  res.json({
    success: true,
    name: 'Salesforce-QuickBooks Integration',
    version: '0.1.0',
    status: 'running',
    environment: config.server.env,
    timestamp: new Date().toISOString()
  });
};
app.get('/', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Add API routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/webhook', webhookRoutes);
app.use('/admin', adminRoutes);

// Add scheduler routes
app.use('/scheduler', require('./routes/scheduler'));


// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
