/**
 * Scheduler routes for managing automated tasks
 * Provides endpoints to control and monitor scheduled jobs
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth, AppError, asyncHandler } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const scheduler = require('../services/scheduler');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

/**
 * Get scheduler status
 * GET /scheduler/status
 */
router.get('/status', (req, res) => {
  const status = scheduler.getStatus();
  
  res.json({
    success: true,
    scheduler: status
  });
});

/**
 * Start the scheduler
 * POST /scheduler/start
 */
router.post('/start', (req, res) => {
  try {
    scheduler.start();
    logger.info('Scheduler started via API');
    
    res.json({
      success: true,
      message: 'Scheduler started successfully'
    });
  } catch (error) {
    logger.error('Error starting scheduler:', error);
    throw new AppError('Failed to start scheduler', 500, 'SCHEDULER_START_ERROR');
  }
});

/**
 * Stop the scheduler
 * POST /scheduler/stop
 */
router.post('/stop', (req, res) => {
  try {
    scheduler.stop();
    logger.info('Scheduler stopped via API');
    
    res.json({
      success: true,
      message: 'Scheduler stopped successfully'
    });
  } catch (error) {
    logger.error('Error stopping scheduler:', error);
    throw new AppError('Failed to stop scheduler', 500, 'SCHEDULER_STOP_ERROR');
  }
});

/**
 * Run invoice creation job immediately
 * POST /scheduler/run/invoice-creation
 */
router.post('/run/invoice-creation', asyncHandler(async (req, res) => {
  try {
    logger.info('Running invoice creation job manually');
    
    const result = await scheduler.runInvoiceCreationNow();
    
    res.json({
      success: true,
      message: 'Invoice creation job completed',
      result
    });
  } catch (error) {
    logger.error('Error running invoice creation:', error);
    throw new AppError('Failed to run invoice creation', 500, 'INVOICE_CREATION_ERROR');
  }
}));

/**
 * Run payment check job immediately
 * POST /scheduler/run/payment-check
 */
router.post('/run/payment-check', asyncHandler(async (req, res) => {
  try {
    logger.info('Running payment check job manually');
    
    const result = await scheduler.runPaymentCheckNow();
    
    res.json({
      success: true,
      message: 'Payment check job completed',
      result
    });
  } catch (error) {
    logger.error('Error running payment check:', error);
    throw new AppError('Failed to run payment check', 500, 'PAYMENT_CHECK_ERROR');
  }
}));

/**
 * Get scheduler logs
 * GET /scheduler/logs/:jobName
 */
router.get('/logs/:jobName', asyncHandler(async (req, res) => {
  const { jobName } = req.params;
  const { limit = 50 } = req.query;
  
  const validJobs = ['invoice-creation', 'payment-check'];
  if (!validJobs.includes(jobName)) {
    throw new AppError('Invalid job name. Must be one of: ' + validJobs.join(', '), 400, 'INVALID_JOB_NAME');
  }
  
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const logFile = path.join(__dirname, `../../logs/scheduler/${jobName}.log`);
    
    // Check if log file exists
    try {
      await fs.access(logFile);
    } catch (error) {
      return res.json({
        success: true,
        logs: [],
        message: 'No log file found for this job'
      });
    }
    
    // Read log file
    const logContent = await fs.readFile(logFile, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    // Parse the last N lines as JSON
    const logs = [];
    for (let i = Math.max(lines.length - parseInt(limit), 0); i < lines.length; i++) {
      try {
        const log = JSON.parse(lines[i]);
        logs.push(log);
      } catch (parseError) {
        // Skip lines that aren't valid JSON
      }
    }
    
    res.json({
      success: true,
      jobName,
      logs: logs.reverse(), // Most recent first
      count: logs.length
    });
  } catch (error) {
    logger.error(`Error reading logs for job ${jobName}:`, error);
    throw new AppError('Failed to read scheduler logs', 500, 'LOG_READ_ERROR');
  }
}));

/**
 * Update scheduler configuration
 * PATCH /scheduler/config
 */
router.patch('/config', asyncHandler(async (req, res) => {
  const { invoiceCreationCron, paymentCheckCron } = req.body;
  
  if (!invoiceCreationCron && !paymentCheckCron) {
    throw new AppError('At least one cron expression must be provided', 400, 'NO_CRON_PROVIDED');
  }
  
  // Validate cron expressions
  const cron = require('node-cron');
  
  if (invoiceCreationCron && !cron.validate(invoiceCreationCron)) {
    throw new AppError('Invalid invoice creation cron expression', 400, 'INVALID_CRON');
  }
  
  if (paymentCheckCron && !cron.validate(paymentCheckCron)) {
    throw new AppError('Invalid payment check cron expression', 400, 'INVALID_CRON');
  }
  
  // Note: In a real implementation, we would update the scheduler configuration
  // For now, we'll just return a success message
  logger.info('Scheduler configuration update requested', { invoiceCreationCron, paymentCheckCron });
  
  res.json({
    success: true,
    message: 'Scheduler configuration would be updated in production',
    config: {
      invoiceCreationCron: invoiceCreationCron || 'unchanged',
      paymentCheckCron: paymentCheckCron || 'unchanged'
    }
  });
}));

/**
 * Get recent job executions
 * GET /scheduler/executions
 */
router.get('/executions', asyncHandler(async (req, res) => {
  const { job, limit = 10 } = req.query;
  
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const schedulerLogsDir = path.join(__dirname, '../../logs/scheduler');
    const executions = [];
    
    // Get executions from log files
    const logFiles = job ? [`${job}.log`] : ['invoice-creation.log', 'payment-check.log'];
    
    for (const file of logFiles) {
      const logFile = path.join(schedulerLogsDir, file);
      
      try {
        const logContent = await fs.readFile(logFile, 'utf8');
        const lines = logContent.split('\n').filter(line => line.trim());
        
        // Get last N executions
        for (let i = Math.max(lines.length - parseInt(limit), 0); i < lines.length; i++) {
          try {
            const execution = JSON.parse(lines[i]);
            executions.push({
              job: file.replace('.log', ''),
              ...execution
            });
          } catch (parseError) {
            // Skip invalid JSON
          }
        }
      } catch (error) {
        // Log file doesn't exist, skip
      }
    }
    
    // Sort by timestamp descending
    executions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      executions: executions.slice(0, parseInt(limit)),
      count: executions.length
    });
  } catch (error) {
    logger.error('Error getting executions:', error);
    throw new AppError('Failed to get scheduler executions', 500, 'EXECUTIONS_ERROR');
  }
}));

module.exports = router;
