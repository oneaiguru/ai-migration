/**
 * Salesforce-QuickBooks Integration Server
 * Optimized for reliable background processing with minimal UI dependencies
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
  
  // Print auth URLs for convenience during initial setup only
  if (config.server.env === 'development') {
    logger.info(`Salesforce Auth URL: ${config.server.baseUrl}/auth/salesforce`);
    logger.info(`QuickBooks Auth URL: ${config.server.baseUrl}/auth/quickbooks`);
  }
  
  // Initialize and start the scheduler for background processing
  try {
    scheduler.start();
    logger.info('Scheduler started successfully - automated tasks will run on their configured schedules');
    logger.info(`Invoice creation scheduled: ${config.scheduler.invoiceCreationCron}`);
    logger.info(`Payment check scheduled: ${config.scheduler.paymentCheckCron}`);
  } catch (error) {
    logger.error('Failed to start scheduler:', error);
  }
});

// Handle unhandled promise rejections without crashing
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Log but don't crash the application to maintain service availability
});

// Handle uncaught exceptions with graceful shutdown
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  
  // Graceful shutdown
  server.close(() => {
    logger.info('Server closed due to uncaught exception');
    process.exit(1);
  });
  
  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forcing server shutdown due to uncaught exception');
    process.exit(1);
  }, 10000);
});

// Handle SIGTERM for proper service shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    // Stop scheduler to prevent pending tasks
    scheduler.stop();
    process.exit(0);
  });
  
  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forcing server shutdown');
    process.exit(1);
  }, 10000);
});

module.exports = server;
