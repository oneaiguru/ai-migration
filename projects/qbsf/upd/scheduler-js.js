/**
 * Enhanced scheduler service to handle recurring tasks for Salesforce-QuickBooks integration
 */
const cron = require('node-cron');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const config = require('../config');
const oauthManager = require('./oauth-manager');

/**
 * Scheduler service to handle recurring tasks
 */
class Scheduler {
  constructor() {
    this.jobs = {};
    this.apiKey = config.security.apiKey;
    
    // Use the middleware endpoint from config
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:${config.server.port}`
      : config.server.baseUrl || `http://localhost:${config.server.port}`;
      
    // Create log directory for the scheduler
    const schedulerLogDir = path.join(__dirname, '../../logs/scheduler');
    if (!fs.existsSync(schedulerLogDir)) {
      fs.mkdirSync(schedulerLogDir, { recursive: true });
    }
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
        
        // Initialize token storage to get connections
        const tokens = await oauthManager.initializeTokenStorage();
        
        const salesforceInstances = Object.keys(tokens.salesforce || {});
        const quickbooksRealms = Object.keys(tokens.quickbooks || {});
        
        if (salesforceInstances.length === 0 || quickbooksRealms.length === 0) {
          logger.warn('Cannot run invoice creation: Missing connection to Salesforce or QuickBooks');
          return;
        }
        
        // Use the first connection of each
        const salesforceInstance = salesforceInstances[0];
        const quickbooksRealm = quickbooksRealms[0];
        
        // Call the API endpoint to process eligible opportunities
        const response = await axios({
          method: 'post',
          url: `${this.baseUrl}/api/process-eligible-opportunities`,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          data: {
            salesforceInstance,
            quickbooksRealm,
            stage: 'Closed Won',
            days: 30,
            limit: 10
          },
          timeout: 30000 // 30 seconds timeout
        });
        
        // Log the results
        logger.info(`Scheduled invoice creation completed: ${new Date().toISOString()}`, {
          opportunitiesProcessed: response.data.processed || 0,
          successful: response.data.successful || 0,
          failed: response.data.failed || 0
        });
        
        // Write to scheduler log file
        this.logJobRun('invoice-creation', {
          timestamp: new Date().toISOString(),
          result: response.data
        });
      } catch (error) {
        logger.error('Error running scheduled invoice creation:', {
          error: error.message,
          stack: error.stack
        });
        
        // Write to scheduler error log file
        this.logJobError('invoice-creation', {
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack
        });
      }
    });
  }

  /**
   * Setup the payment check job
   */
  setupPaymentCheckJob() {
    const cronExpression = config.scheduler.paymentCheckCron || '0 */1 * * *'; // Default: Every hour
    
    logger.info(`Setting up payment check job with schedule: ${cronExpression}`);
    
    this.jobs.paymentCheck = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Running scheduled payment status check');
        
        // Initialize token storage to get connections
        const tokens = await oauthManager.initializeTokenStorage();
        
        const salesforceInstances = Object.keys(tokens.salesforce || {});
        const quickbooksRealms = Object.keys(tokens.quickbooks || {});
        
        if (salesforceInstances.length === 0 || quickbooksRealms.length === 0) {
          logger.warn('Cannot run payment check: Missing connection to Salesforce or QuickBooks');
          return;
        }
        
        // Use the first connection of each
        const salesforceInstance = salesforceInstances[0];
        const quickbooksRealm = quickbooksRealms[0];
        
        // Call the API endpoint
        const response = await axios({
          method: 'post',
          url: `${this.baseUrl}/api/check-payment-status`,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          data: {
            salesforceInstance,
            quickbooksRealm
          },
          timeout: 30000 // 30 seconds timeout
        });
        
        // Log the results
        logger.info(`Scheduled payment check completed: ${new Date().toISOString()}`, {
          invoicesProcessed: response.data.invoicesProcessed || 0,
          paidInvoicesFound: response.data.paidInvoicesFound || 0,
          invoicesUpdated: response.data.invoicesUpdated || 0
        });
        
        // Write to scheduler log file
        this.logJobRun('payment-check', {
          timestamp: new Date().toISOString(),
          result: response.data
        });
      } catch (error) {
        logger.error('Error running scheduled payment check:', {
          error: error.message,
          stack: error.stack
        });
        
        // Write to scheduler error log file
        this.logJobError('payment-check', {
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack
        });
      }
    });
  }

  /**
   * Log job run results to file
   */
  logJobRun(jobName, data) {
    try {
      const logFile = path.join(__dirname, `../../logs/scheduler/${jobName}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      logger.error(`Error writing to scheduler log file for ${jobName}:`, error);
    }
  }
  
  /**
   * Log job errors to file
   */
  logJobError(jobName, data) {
    try {
      const errorLogFile = path.join(__dirname, `../../logs/scheduler/${jobName}-error.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(errorLogFile, logEntry);
    } catch (error) {
      logger.error(`Error writing to scheduler error log file for ${jobName}:`, error);
    }
  }

  /**
   * Run the invoice creation job immediately
   */
  async runInvoiceCreationNow() {
    try {
      logger.info('Running manual invoice creation');
      
      // Initialize token storage to get connections
      const tokens = await oauthManager.initializeTokenStorage();
      
      const salesforceInstances = Object.keys(tokens.salesforce || {});
      const quickbooksRealms = Object.keys(tokens.quickbooks || {});
      
      if (salesforceInstances.length === 0 || quickbooksRealms.length === 0) {
        logger.warn('Cannot run invoice creation: Missing connection to Salesforce or QuickBooks');
        return {
          success: false,
          error: 'Missing connection to Salesforce or QuickBooks'
        };
      }
      
      // Use the first connection of each
      const salesforceInstance = salesforceInstances[0];
      const quickbooksRealm = quickbooksRealms[0];
      
      // Execute the integration workflow script directly
      const { batchProcessOpportunities } = require('../../scripts/integration-workflow');
      
      const result = await batchProcessOpportunities({
        salesforceInstanceUrl: salesforceInstance,
        quickbooksRealmId: quickbooksRealm,
        stage: 'Closed Won',
        days: 30,
        limit: 10
      });
      
      logger.info('Manual invoice creation completed', {
        opportunitiesProcessed: result.processed || 0,
        successful: result.successful || 0,
        failed: result.failed || 0
      });
      
      return result;
    } catch (error) {
      logger.error('Error running manual invoice creation:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Run the payment check job immediately
   */
  async runPaymentCheckNow() {
    try {
      logger.info('Running manual payment status check');
      
      // Initialize token storage to get connections
      const tokens = await oauthManager.initializeTokenStorage();
      
      const salesforceInstances = Object.keys(tokens.salesforce || {});
      const quickbooksRealms = Object.keys(tokens.quickbooks || {});
      
      if (salesforceInstances.length === 0 || quickbooksRealms.length === 0) {
        logger.warn('Cannot run payment check: Missing connection to Salesforce or QuickBooks');
        return {
          success: false,
          error: 'Missing connection to Salesforce or QuickBooks'
        };
      }
      
      // Use the first connection of each
      const salesforceInstance = salesforceInstances[0];
      const quickbooksRealm = quickbooksRealms[0];
      
      // Call the API endpoint
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/api/check-payment-status`,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        data: {
          salesforceInstance,
          quickbooksRealm
        }
      });
      
      logger.info('Manual payment check completed', {
        invoicesProcessed: response.data.invoicesProcessed || 0,
        paidInvoicesFound: response.data.paidInvoicesFound || 0,
        invoicesUpdated: response.data.invoicesUpdated || 0
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error running manual payment check:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  /**
   * Get scheduler status
   */
  getStatus() {
    const status = {
      running: true,
      jobs: {}
    };
    
    // Get status of each job
    Object.keys(this.jobs).forEach(jobName => {
      const job = this.jobs[jobName];
      status.jobs[jobName] = {
        active: Boolean(job),
        nextRun: job && job.nextDate ? job.nextDate().toDate().toISOString() : null
      };
    });
    
    return status;
  }
}

// Create singleton
const scheduler = new Scheduler();

module.exports = scheduler;
