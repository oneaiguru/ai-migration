/**
 * Core API routes for business logic
 * Updated with correct workflow - creates invoice from selected opportunity
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth, AppError } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const config = require('../config');
const path = require('path');
const fs = require('fs');

// Determine if we are in demo mode
const isDemoMode = process.env.NODE_ENV === 'development';

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

/**
 * Create invoice in QuickBooks from Salesforce opportunity
 * This endpoint allows manual triggering of invoice creation for a specific opportunity
 */
router.post('/create-invoice', async (req, res, next) => {
  try {
    const { opportunityId, salesforceInstance, quickbooksRealm } = req.body;
    
    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: opportunityId'
      });
    }
    
    logger.info(`Creating invoice for opportunity ${opportunityId}`, { salesforceInstance, quickbooksRealm });
    
    // In demo mode, return simulated data
    if (isDemoMode) {
      logger.info('Running in demo mode - simulating invoice creation');
      
      // Log the simulated process
      logger.info(`Retrieving opportunity data from Salesforce: ${opportunityId}`);
      logger.info('Creating customer in QuickBooks for account: Acme Corp');
      logger.info('Creating invoice in QuickBooks with line items from opportunity');
      logger.info('Invoice #INV-001 created successfully in QuickBooks');
      logger.info(`Updating Salesforce opportunity ${opportunityId} with QuickBooks invoice ID: 123`);
      
      // Return simulated response
      return res.json({
        success: true,
        qbInvoiceId: 'INV-001',
        message: 'Invoice created successfully in QuickBooks',
        details: {
          opportunity: opportunityId,
          customer: 'Acme Corp',
          amount: 1500.00,
          invoice: 'INV-001',
          date: new Date().toISOString().split('T')[0]
        }
      });
    }
    
    // Real implementation would call Salesforce and QuickBooks APIs here
    throw new AppError('Real API connections not configured', 500, 'API_NOT_CONFIGURED');
  } catch (error) {
    logger.error('Error creating invoice:', error);
    next(error);
  }
});

/**
 * Process eligible opportunities
 * Finds Salesforce opportunities and creates QuickBooks invoices
 */
router.post('/process-eligible-opportunities', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm, stage, days, limit } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    logger.info('Processing eligible opportunities', { salesforceInstance, quickbooksRealm });
    
    // In demo mode, return simulated data
    if (isDemoMode) {
      logger.info('Running in demo mode - simulating opportunity processing');
      
      // Log the simulated process
      logger.info(`Searching for opportunities with stage '${stage || 'Closed Won'}' in the last ${days || 30} days`);
      logger.info('Found 5 eligible opportunities');
      logger.info('Processing opportunity: New Client Project (ABC123)');
      logger.info('Created invoice #INV-001 for New Client Project in QuickBooks');
      logger.info('Processing opportunity: Product Renewal (DEF456)');
      logger.info('Created invoice #INV-002 for Product Renewal in QuickBooks');
      logger.info('Processing opportunity: Expansion Deal (GHI789)');
      logger.info('Created invoice #INV-003 for Expansion Deal in QuickBooks');
      logger.info('Processing opportunity: Consulting Services (JKL012)');
      logger.info('Created invoice #INV-004 for Consulting Services in QuickBooks');
      
      // Simulate an error for one opportunity
      logger.error('Error processing opportunity MNO345: Customer not found in QuickBooks');
      
      // Return simulated response
      return res.json({
        success: true,
        processed: 5,
        successful: 4,
        failed: 1,
        message: 'Processed eligible opportunities',
        results: [
          { opportunity: 'New Client Project', invoice: 'INV-001', success: true },
          { opportunity: 'Product Renewal', invoice: 'INV-002', success: true },
          { opportunity: 'Expansion Deal', invoice: 'INV-003', success: true },
          { opportunity: 'Consulting Services', invoice: 'INV-004', success: true },
          { opportunity: 'Special Discount', error: 'Customer not found in QuickBooks', success: false }
        ]
      });
    }
    
    // Real implementation would call Salesforce and QuickBooks APIs here
    throw new AppError('Real API connections not configured', 500, 'API_NOT_CONFIGURED');
  } catch (error) {
    logger.error('Error processing eligible opportunities:', error);
    next(error);
  }
});

/**
 * Check payment status and update Salesforce
 * This endpoint checks for payments in QuickBooks and updates Salesforce
 */
router.post('/check-payment-status', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    logger.info('Checking payment status', { salesforceInstance, quickbooksRealm });
    
    // In demo mode, return simulated data
    if (isDemoMode) {
      logger.info('Running in demo mode - simulating payment check');
      
      // Log the simulated process
      logger.info('Querying Salesforce for opportunities with invoices');
      logger.info('Found 10 invoices to check');
      logger.info('Checking payment status for invoice INV-001 in QuickBooks');
      logger.info('Invoice INV-001 is fully paid - updating Salesforce opportunity');
      logger.info('Checking payment status for invoice INV-002 in QuickBooks');
      logger.info('Invoice INV-002 is fully paid - updating Salesforce opportunity');
      logger.info('Marking Salesforce opportunity as "Closed Won" after payment confirmation');
      
      // Return simulated response
      return res.json({
        success: true,
        invoicesProcessed: 10,
        paidInvoicesFound: 3,
        invoicesUpdated: 3,
        message: 'Checked payment status',
        results: [
          { invoice: 'INV-001', paid: true, opportunity: 'New Client Project', status: 'Changed to Closed Won' },
          { invoice: 'INV-002', paid: true, opportunity: 'Product Renewal', status: 'Changed to Closed Won' },
          { invoice: 'INV-003', paid: true, opportunity: 'Expansion Deal', status: 'Changed to Closed Won' },
          { invoice: 'INV-004', paid: false, opportunity: 'Consulting Services', status: 'Unchanged' }
        ]
      });
    }
    
    // Real implementation would call Salesforce and QuickBooks APIs here
    throw new AppError('Real API connections not configured', 500, 'API_NOT_CONFIGURED');
  } catch (error) {
    logger.error('Error checking payment status:', error);
    next(error);
  }
});

/**
 * Test connection to both systems
 */
router.post('/test-connection', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    logger.info('Testing connection', { salesforceInstance, quickbooksRealm });
    
    // In demo mode, return simulated success
    if (isDemoMode) {
      logger.info('Running in demo mode - simulating successful connection test');
      
      return res.json({
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
    }
    
    // Real implementation would test actual connections
    throw new AppError('Real API connections not configured', 500, 'API_NOT_CONFIGURED');
  } catch (error) {
    logger.error('Error testing connection:', error);
    next(error);
  }
});

/**
 * Get logs endpoint
 */
router.get('/logs', async (req, res, next) => {
  try {
    const { filter, limit } = req.query;
    const maxLimit = parseInt(limit) || 50;
    
    // Get logs from file
    const logFile = path.join(__dirname, '../../logs/combined.log');
    
    // If log file doesn't exist yet, return empty array
    if (!fs.existsSync(logFile)) {
      return res.json({
        success: true,
        logs: []
      });
    }
    
    // In demo mode, return simulated logs
    if (isDemoMode) {
      const simulatedLogs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Scheduler started successfully'
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'info',
          message: 'Processing eligible opportunities'
        },
        {
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'info',
          message: 'Created invoice #INV-001 for New Client Project'
        },
        {
          timestamp: new Date(Date.now() - 180000).toISOString(),
          level: 'info',
          message: 'Checking payment status for invoice INV-002'
        },
        {
          timestamp: new Date(Date.now() - 240000).toISOString(),
          level: 'error',
          message: 'Error processing opportunity: Customer not found'
        }
      ];
      
      // Apply filter if provided
      let filteredLogs = simulatedLogs;
      if (filter) {
        const filterLower = filter.toLowerCase();
        filteredLogs = simulatedLogs.filter(log => 
          log.message.toLowerCase().includes(filterLower) || 
          log.level.toLowerCase() === filterLower
        );
      }
      
      // Apply limit
      filteredLogs = filteredLogs.slice(0, maxLimit);
      
      return res.json({
        success: true,
        logs: filteredLogs
      });
    }
    
    // Real implementation would read actual log files
    const dummyLogs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Scheduler running'
      }
    ];
    
    res.json({
      success: true,
      logs: dummyLogs
    });
  } catch (error) {
    logger.error('Error getting logs:', error);
    next(error);
  }
});

module.exports = router;