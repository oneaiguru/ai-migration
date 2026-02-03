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

// Get logs endpoint
router.get('/logs', (req, res, next) => {
  try {
    // This is a placeholder - return some dummy log data
    res.json({
      success: true,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Scheduler started successfully'
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'info',
          message: 'Processed 5 opportunities'
        }
      ]
    });
  } catch (error) {
    logger.error('Error getting logs:', error);
    next(error);
  }
});

// Create invoice from Salesforce opportunity
router.post('/create-invoice', async (req, res, next) => {
  try {
    const { opportunityId, salesforceInstance, quickbooksRealm } = req.body;
    
    if (!opportunityId || !salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: opportunityId, salesforceInstance, quickbooksRealm'
      });
    }
    
    logger.info('Creating invoice from opportunity', { 
      opportunityId, 
      salesforceInstance, 
      quickbooksRealm 
    });
    
    try {
      // Get OAuth tokens for both services
      const oauthManager = require('../services/oauth-manager');
      const jsforce = require('jsforce');
      const QuickBooks = require('node-quickbooks');
      const config = require('../config');
      
      const sfAccessToken = await oauthManager.getSalesforceAccessToken(salesforceInstance);
      const qbAccessToken = await oauthManager.getQuickBooksAccessToken(quickbooksRealm);
      
      // Create Salesforce connection
      const sfConn = new jsforce.Connection({
        instanceUrl: salesforceInstance,
        accessToken: sfAccessToken
      });
      
      // Create QuickBooks connection
      const qbo = new QuickBooks(
        config.quickbooks.clientId,
        config.quickbooks.clientSecret,
        qbAccessToken,
        false,
        quickbooksRealm,
        config.quickbooks.environment === 'sandbox',
        false,
        null,
        '2.0'
      );
      
      // Get opportunity details from Salesforce
      logger.info(`Fetching Opportunity: ${opportunityId}`);
      const opp = await sfConn.sobject('Opportunity').retrieve(opportunityId);
      logger.info(`Opportunity Name: ${opp.Name}, Amount: ${opp.Amount}`);
      
      // Get account details
      const account = await sfConn.sobject('Account').retrieve(opp.AccountId);
      logger.info(`Account Name: ${account.Name}`);
      
      // Find or create customer in QuickBooks
      const customers = await new Promise((resolve, reject) => {
        qbo.findCustomers({ DisplayName: account.Name }, (err, data) => {
          if (err) reject(err);
          else resolve(data.QueryResponse.Customer || []);
        });
      });
      
      let customerId;
      if (customers.length > 0) {
        customerId = customers[0].Id;
        logger.info(`Found existing customer: ${customerId}`);
      } else {
        // Create new customer
        const newCustomer = await new Promise((resolve, reject) => {
          qbo.createCustomer({
            DisplayName: account.Name,
            CompanyName: account.Name
          }, (err, customer) => {
            if (err) reject(err);
            else resolve(customer);
          });
        });
        customerId = newCustomer.Id;
        logger.info(`Created new customer: ${customerId}`);
      }
      
      // Create invoice in QuickBooks
      const invoice = await new Promise((resolve, reject) => {
        qbo.createInvoice({
          Line: [{
            DetailType: "SalesItemLineDetail",
            Amount: opp.Amount || 100,
            Description: opp.Name,
            SalesItemLineDetail: {
              ItemRef: {
                value: "1", // Default service item
                name: "Services"
              }
            }
          }],
          CustomerRef: {
            value: customerId
          },
          DocNumber: `SF-${opportunityId.slice(-5)}`
        }, (err, invoice) => {
          if (err) reject(err);
          else resolve(invoice);
        });
      });
      
      logger.info(`Created QuickBooks Invoice: ${invoice.Id}`);
      
      // Update Salesforce opportunity with invoice ID
      await sfConn.sobject('Opportunity').update({
        Id: opportunityId,
        QB_Invoice_ID__c: invoice.Id
      });
      
      logger.info(`Updated Salesforce Opportunity with Invoice ID: ${invoice.Id}`);
      
      // Return successful response
      res.json({
        success: true,
        opportunityId: opportunityId,
        invoiceId: invoice.Id,
        message: `Invoice ${invoice.Id} created successfully in QuickBooks`
      });
    } catch (apiError) {
      logger.error('API error creating invoice:', apiError);
      // For production, return a generic error but log the details
      res.status(500).json({
        success: false,
        error: 'Error creating invoice in QuickBooks',
        message: apiError.message
      });
    }
  } catch (error) {
    logger.error('Error in create-invoice route:', error);
    next(error);
  }
});

module.exports = router;
