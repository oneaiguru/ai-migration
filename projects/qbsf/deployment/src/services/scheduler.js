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
      : process.env.MIDDLEWARE_BASE_URL || `http://localhost:${config.server.port}`;
  }

  /**
   * Start the scheduler
   */
  start() {
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
   * Setup the payment check job
   */
  setupPaymentCheckJob() {
    const cronExpression = config.scheduler.paymentCheckCron;
    
    logger.info(`Setting up payment check job with schedule: ${cronExpression}`);
    
    this.jobs.paymentCheck = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Running scheduled payment status check');
        
        // Initialize token storage to get connections
        const tokensModule = require('./oauth-manager');
        const tokens = await tokensModule.initializeTokenStorage();
        
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
          }
        });
        
        logger.info('Scheduled payment check completed', {
          invoicesProcessed: response.data.invoicesProcessed,
          paidInvoicesFound: response.data.paidInvoicesFound,
          invoicesUpdated: response.data.invoicesUpdated
        });
      } catch (error) {
        logger.error('Error running scheduled payment check:', error);
      }
    });
  }

  /**
   * Run the payment check job immediately
   */
  async runPaymentCheckNow() {
    try {
      logger.info('Running manual payment status check');
      
      // Initialize token storage to get connections
      const tokensModule = require('./oauth-manager');
      const tokens = await tokensModule.initializeTokenStorage();
      
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
        invoicesProcessed: response.data.invoicesProcessed,
        paidInvoicesFound: response.data.paidInvoicesFound,
        invoicesUpdated: response.data.invoicesUpdated
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error running manual payment check:', error);
      throw error;
    }
  }
}

// Create singleton
const scheduler = new Scheduler();

module.exports = scheduler;
