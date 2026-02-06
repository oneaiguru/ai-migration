# Claude Code Instructions

This document provides instructions on how to use Claude Code (cc) to run the Salesforce-QuickBooks integration.

## Setting Up With Claude Code

Claude Code is a tool that can help you execute the provided code files. Here's how to set up and run the integration using Claude Code:

### 1. Create the Directory Structure

First, let's create the necessary directory structure:

```bash
cc mkdir -p upd2/src/config upd2/src/middleware upd2/src/routes upd2/src/utils upd2/public upd2/tests upd2/logs upd2/data
```

### 2. Place Files in the Correct Directories

Now, let's move the files to their respective directories:

```bash
# Configuration
cc cp src/config/index.js upd2/src/config/index.js

# Middleware
cc cp src/middleware/error-handler.js upd2/src/middleware/error-handler.js

# Routes
cc cp src/routes/admin.js upd2/src/routes/admin.js
cc cp src/routes/scheduler.js upd2/src/routes/scheduler.js
cc cp src/routes/webhook.js upd2/src/routes/webhook.js

# Utils
cc cp src/utils/logger.js upd2/src/utils/logger.js

# Public
cc cp public/dashboard.html upd2/public/dashboard.html

# Tests
cc cp tests/admin.test.js upd2/tests/admin.test.js
cc cp tests/config.test.js upd2/tests/config.test.js
cc cp tests/error-handler.test.js upd2/tests/error-handler.test.js
cc cp tests/logger.test.js upd2/tests/logger.test.js
cc cp tests/scheduler.test.js upd2/tests/scheduler.test.js
cc cp tests/webhook.test.js upd2/tests/webhook.test.js
```

### 3. Set Up the Package.json File

Create a package.json file:

```bash
cc cat > upd2/package.json << 'EOL'
{
  "name": "salesforce-quickbooks-integration",
  "version": "1.0.0",
  "description": "Integration middleware between Salesforce and QuickBooks",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "node-cron": "^3.0.3",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  }
}
EOL
```

### 4. Create a .env File

Create a .env file with the necessary configuration:

```bash
cc cat > upd2/.env << 'EOL'
# Server Configuration
PORT=3000
NODE_ENV=development
MIDDLEWARE_BASE_URL=http://localhost:3000

# Salesforce Configuration
SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_REDIRECT_URI=http://localhost:3000/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks Configuration
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_REDIRECT_URI=http://localhost:3000/auth/quickbooks/callback
QB_ENVIRONMENT=sandbox

# Security
API_KEY=test-api-key
TOKEN_ENCRYPTION_KEY=your_encryption_key_at_least_32_characters_long

# Scheduler Configuration
INVOICE_CREATION_CRON=0 */2 * * *
PAYMENT_CHECK_CRON=0 1 * * *
EOL
```

### 5. Create the app.js file that integrates everything

```bash
cc cat > upd2/src/app.js << 'EOL'
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
app.get('/', (req, res) => {
  res.json({
    name: 'Salesforce-QuickBooks Integration',
    version: '0.1.0',
    status: 'running',
    environment: config.server.env,
    timestamp: new Date().toISOString()
  });
});

// Add API routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/webhook', webhookRoutes);
app.use('/admin', adminRoutes);

// Add scheduler routes
app.use('/scheduler', require('./routes/scheduler'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
EOL
```

### 6. Create a minimal server.js file

```bash
cc cat > upd2/src/server.js << 'EOL'
/**
 * Salesforce-QuickBooks Integration Main Server
 */
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const scheduler = require('./services/scheduler');

// Display startup banner
console.log('=====================================');
console.log('Salesforce-QuickBooks Integration Server');
console.log('=====================================');
console.log(`Environment: ${config.server.env}`);
console.log(`Port: ${config.server.port}`);
console.log(`Base URL: ${config.server.baseUrl}`);
console.log('=====================================');

// Start the server
const server = app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port} in ${config.server.env} mode`);
  logger.info(`Server base URL: ${config.server.baseUrl}`);
  
  // Print auth URLs for convenience during development
  if (config.server.env === 'development') {
    logger.info(`Salesforce Auth URL: ${config.server.baseUrl}/auth/salesforce`);
    logger.info(`QuickBooks Auth URL: ${config.server.baseUrl}/auth/quickbooks`);
  }
  
  // Initialize and start the scheduler
  try {
    scheduler.start();
    logger.info('Scheduler started successfully');
  } catch (error) {
    logger.error('Failed to start scheduler:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Do not crash the application, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Graceful shutdown
  server.close(() => {
    logger.info('Server closed due to uncaught exception');
    process.exit(1);
  });
  
  // If graceful shutdown takes too long, force exit
  setTimeout(() => {
    logger.error('Forcing server shutdown due to uncaught exception');
    process.exit(1);
  }, 10000);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    // Stop scheduler
    scheduler.stop();
    process.exit(0);
  });
  
  // If graceful shutdown takes too long, force exit
  setTimeout(() => {
    logger.error('Forcing server shutdown');
    process.exit(1);
  }, 10000);
});

module.exports = server;
EOL
```

### 7. Add the necessary placeholder files for routes and services

```bash
cc cat > upd2/src/routes/auth.js << 'EOL'
/**
 * Authentication routes for OAuth flows
 */
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { apiKeyAuth } = require('../middleware/error-handler');

// Placeholder route for status
router.get('/status', apiKeyAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      status: {
        salesforce: { 
          connected: true,
          instances: [{
            instanceUrl: "https://example.salesforce.com",
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          }]
        },
        quickbooks: {
          connected: true,
          companies: [{
            realmId: "12345678",
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          }]
        }
      }
    });
  } catch (error) {
    logger.error('Error getting OAuth status:', error);
    next(error);
  }
});

module.exports = router;
EOL

cc cat > upd2/src/routes/api.js << 'EOL'
/**
 * Core API routes for business logic
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Process eligible opportunities
router.post('/process-eligible-opportunities', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm, stage, days, limit } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    // Implement process to find and process eligible opportunities
    // This is a placeholder for your actual business logic
    logger.info('Processing eligible opportunities', { salesforceInstance, quickbooksRealm });
    
    // For demo purposes, return success response
    res.json({
      success: true,
      processed: 5,
      successful: 4,
      failed: 1,
      message: 'Processed eligible opportunities'
    });
  } catch (error) {
    logger.error('Error processing eligible opportunities:', error);
    next(error);
  }
});

// Check payment status
router.post('/check-payment-status', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    // Implement process to check payment status
    // This is a placeholder for your actual business logic
    logger.info('Checking payment status', { salesforceInstance, quickbooksRealm });
    
    // For demo purposes, return success response
    res.json({
      success: true,
      invoicesProcessed: 10,
      paidInvoicesFound: 3,
      invoicesUpdated: 3,
      message: 'Checked payment status'
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    next(error);
  }
});

// Test connection to both systems
router.post('/test-connection', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    // Implement connection test for both systems
    // This is a placeholder for your actual business logic
    logger.info('Testing connection', { salesforceInstance, quickbooksRealm });
    
    // For demo purposes, return success response
    res.json({
      success: true,
      salesforce: {
        connected: true,
        instance: salesforceInstance
      },
      quickbooks: {
        connected: true,
        realm: quickbooksRealm
      }
    });
  } catch (error) {
    logger.error('Error testing connection:', error);
    next(error);
  }
});

module.exports = router;
EOL

cc cat > upd2/src/services/scheduler.js << 'EOL'
/**
 * Scheduler service to handle recurring tasks
 */
const cron = require('node-cron');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Scheduler service to handle recurring tasks
 */
class Scheduler {
  constructor() {
    this.jobs = {};
    this.apiKey = config.security.apiKey;
    
    // Use the middleware endpoint from config instead of hardcoded localhost
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:${config.server.port}`
      : config.server.baseUrl || `http://localhost:${config.server.port}`;
  }

  /**
   * Start the scheduler
   */
  start() {
    this.setupInvoiceCreationJob();
    this.setupPaymentCheckJob();
    logger.info('Scheduler started successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    Object.values(this.jobs).forEach(job => {
      if (job) {
        job.stop();
      }
    });
    
    logger.info('Scheduler stopped');
  }
  
  /**
   * Setup the invoice creation job
   * This job will find Salesforce opportunities ready for invoicing
   */
  setupInvoiceCreationJob() {
    const cronExpression = config.scheduler.invoiceCreationCron || '0 */2 * * *'; // Default to every 2 hours
    
    logger.info(`Setting up invoice creation job with schedule: ${cronExpression}`);
    
    this.jobs.invoiceCreation = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Running scheduled invoice creation job');
        
        // For demo purposes, we'll simulate a successful job run
        logger.info('Scheduled invoice creation completed', {
          opportunitiesProcessed: 5,
          successful: 4,
          failed: 1
        });
      } catch (error) {
        logger.error('Error running scheduled invoice creation:', error);
      }
    });
  }

  /**
   * Setup the payment check job
   */
  setupPaymentCheckJob() {
    const cronExpression = config.scheduler.paymentCheckCron || '0 1 * * *'; // Default: 1:00 AM daily
    
    logger.info(`Setting up payment check job with schedule: ${cronExpression}`);
    
    this.jobs.paymentCheck = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Running scheduled payment status check');
        
        // For demo purposes, we'll simulate a successful job run
        logger.info('Scheduled payment check completed', {
          invoicesProcessed: 10,
          paidInvoicesFound: 3,
          invoicesUpdated: 3
        });
      } catch (error) {
        logger.error('Error running scheduled payment check:', error);
      }
    });
  }

  /**
   * Run the invoice creation job immediately
   */
  async runInvoiceCreationNow() {
    try {
      logger.info('Running manual invoice creation');
      
      // For demo purposes, return a simulated success response
      logger.info('Manual invoice creation completed', {
        opportunitiesProcessed: 5,
        successful: 4,
        failed: 1
      });
      
      return {
        success: true,
        processed: 5,
        successful: 4,
        failed: 1
      };
    } catch (error) {
      logger.error('Error running manual invoice creation:', error);
      throw error;
    }
  }

  /**
   * Run the payment check job immediately
   */
  async runPaymentCheckNow() {
    try {
      logger.info('Running manual payment status check');
      
      // For demo purposes, return a simulated success response
      logger.info('Manual payment check completed', {
        invoicesProcessed: 10,
        paidInvoicesFound: 3,
        invoicesUpdated: 3
      });
      
      return {
        success: true,
        invoicesProcessed: 10,
        paidInvoicesFound: 3,
        invoicesUpdated: 3
      };
    } catch (error) {
      logger.error('Error running manual payment check:', error);
      throw error;
    }
  }
}

// Create singleton
const scheduler = new Scheduler();

module.exports = scheduler;
EOL
```

### 8. Install Dependencies

Install the required dependencies:

```bash
cc cd upd2 && npm install
```

### 9. Run the Tests

Run the tests to ensure everything is working:

```bash
cc cd upd2 && npx jest tests/
```

### 10. Start the Server

Start the server to see it in action:

```bash
cc cd upd2 && node src/server.js
```

### 11. Check the Server Status

Check that the server is running:

```bash
# In a new terminal
cc curl http://localhost:3000/health
```

### 12. Access the Dashboard

The dashboard should be available at `http://localhost:3000/dashboard`. When prompted for an API key, use the value from your `.env` file (default: `test-api-key`).

## Troubleshooting Common Issues

If you encounter issues with Claude Code:

1. **Module not found errors**: Make sure all dependencies are installed with `npm install`.

2. **Port already in use**: If port 3000 is already in use, modify the PORT in your .env file.

3. **Permission errors with log files**: Make sure the logs directory exists and has write permissions.

4. **Testing errors**: If you're having issues with tests, try running them individually (e.g., `npx jest tests/config.test.js`).

Remember that Claude Code is a terminal-like environment, so you can use commands like `ls`, `cat`, and `pwd` to navigate and examine files.