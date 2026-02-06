/**
 * Enhanced Salesforce-QuickBooks Integration Main Server
 * This file combines and improves the server functionality
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
  
  // Print auth URLs for convenience
  logger.info(`Salesforce Auth URL: ${config.server.baseUrl}/auth/salesforce`);
  logger.info(`QuickBooks Auth URL: ${config.server.baseUrl}/auth/quickbooks`);
  
  // Show API status endpoint
  logger.info(`API Status: curl -H "X-API-Key: ${config.security.apiKey}" ${config.server.baseUrl}/auth/status`);
  
  // Initialize and start the scheduler
  try {
    scheduler.start();
    logger.info('Scheduler started successfully');
    
    // Log scheduler job details
    Object.keys(scheduler.jobs).forEach(jobName => {
      const job = scheduler.jobs[jobName];
      if (job && job.nextDate) {
        logger.info(`Job "${jobName}" scheduled, next run: ${job.nextDate().toDate().toISOString()}`);
      }
    });
  } catch (error) {
    logger.error('Failed to start scheduler:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', {
    error: err.message,
    stack: err.stack
  });
  // Do not crash the application, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.message,
    stack: err.stack
  });
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
