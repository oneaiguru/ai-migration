/**
 * Scheduler service to handle recurring tasks
 */
const cron = require('node-cron');
const axios = require('axios');
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
          }
        });
        
        logger.info('Scheduled invoice creation completed', {
          opportunitiesProcessed: response.data.processed || 0,
          successful: response.data.successful || 0,
          failed: response.data.failed || 0
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
      
      // Call the API endpoint
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
        }
      });
      
      logger.info('Manual invoice creation completed', {
        opportunitiesProcessed: response.data.processed || 0,
        successful: response.data.successful || 0,
        failed: response.data.failed || 0
      });
      
      return response.data;
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
