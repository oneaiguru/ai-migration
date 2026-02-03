/**
 * Core API routes for business logic
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth, AppError } = require('../middleware/error-handler');
const logger = require('../utils/logger');

// Import integration workflow (PKCE assets present; if missing, fail gracefully)
let batchProcessOpportunities;
try {
  ({ batchProcessOpportunities } = require('../../PKCE/fresh-integration/fresh-integration/scripts/integration-workflow'));
} catch (err) {
  batchProcessOpportunities = async () => {
    const error = new AppError('Integration workflow not available. Ensure PKCE assets are present.', 501);
    throw error;
  };
}
const jsforce = require('jsforce');
const QuickBooks = require('node-quickbooks');
const oauthManager = require('../services/oauth-manager');
const config = require('../config');

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
    
    // Call the batch process opportunities function from integration workflow
    logger.info('Processing eligible opportunities', { salesforceInstance, quickbooksRealm });
    
    const result = await batchProcessOpportunities({
      salesforceInstanceUrl: salesforceInstance,
      quickbooksRealmId: quickbooksRealm,
      stage: stage || 'Closed Won',
      days: days || 30,
      limit: limit || 10
    });
    
    res.json({
      success: true,
      processed: result.processed || 0,
      successful: result.successful || 0,
      failed: result.failed || 0,
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
    
    logger.info('Checking payment status', { salesforceInstance, quickbooksRealm });
    
    // 1. Get access tokens for both services
    const sfAccessToken = await oauthManager.getSalesforceAccessToken(salesforceInstance);
    const qbAccessToken = await oauthManager.getQuickBooksAccessToken(quickbooksRealm);
    
    // 2. Create API clients
    const sfConn = new jsforce.Connection({
      instanceUrl: salesforceInstance,
      accessToken: sfAccessToken
    });
    
    const qbo = new QuickBooks(
      config.quickbooks.clientId,
      config.quickbooks.clientSecret,
      qbAccessToken,
      false, // no token secret for OAuth2
      quickbooksRealm,
      config.quickbooks.environment === 'sandbox',
      false, // debugging
      null, // minor version
      '2.0' // OAuth version
    );
    
    // 3. Get all Salesforce opportunities with QuickBooks Invoice IDs
    // that aren't marked as paid yet
    logger.info('Querying Salesforce for opportunities with invoices');
    const opportunitiesResult = await sfConn.query(`
      SELECT Id, Name, QB_Invoice_ID__c
      FROM Opportunity 
      WHERE QB_Invoice_ID__c != null 
      AND QB_Invoice_ID__c != '' 
      AND (QB_Payment_Date__c = null OR QB_Payment_Date__c = '')
      LIMIT 50
    `);
    
    if (!opportunitiesResult.records || opportunitiesResult.records.length === 0) {
      logger.info('No unpaid invoices found in Salesforce');
      return res.json({
        success: true,
        invoicesProcessed: 0,
        paidInvoicesFound: 0,
        invoicesUpdated: 0,
        message: 'No unpaid invoices found'
      });
    }
    
    logger.info(`Found ${opportunitiesResult.records.length} opportunities with invoices to check`);
    
    // 4. Check each invoice in QuickBooks for payment status
    const paidInvoices = [];
    let invoicesProcessed = 0;
    
    for (const opp of opportunitiesResult.records) {
      const invoiceId = opp.QB_Invoice_ID__c;
      invoicesProcessed++;
      
      try {
        // Check invoice in QuickBooks
        logger.info(`Checking payment status for invoice ${invoiceId}`);
        
        // Get the invoice details
        const invoice = await new Promise((resolve, reject) => {
          qbo.getInvoice(invoiceId, (err, invoice) => {
            if (err) return reject(err);
            resolve(invoice);
          });
        });
        
        // Check if invoice is paid (Balance is 0)
        if (invoice.Balance === 0) {
          logger.info(`Invoice ${invoiceId} is fully paid`);
          
          // Find payment details
          const paymentsResult = await new Promise((resolve, reject) => {
            const query = `SELECT * FROM Payment WHERE Id IN (SELECT PaymentId FROM PaymentLine WHERE LinkedTxn.TxnId = '${invoiceId}')`;
            qbo.query(query, (err, data) => {
              if (err) return reject(err);
              resolve(data);
            });
          });
          
          if (paymentsResult.QueryResponse && paymentsResult.QueryResponse.Payment) {
            const payment = paymentsResult.QueryResponse.Payment[0];
            
            paidInvoices.push({
              opportunityId: opp.Id,
              opportunityName: opp.Name,
              invoiceId: invoiceId,
              paymentId: payment.Id,
              paymentDate: payment.TxnDate,
              paymentMethod: payment.PaymentMethodRef ? payment.PaymentMethodRef.name : 'Unknown',
              amount: payment.TotalAmt
            });
          }
        }
      } catch (err) {
        logger.error(`Error checking invoice ${invoiceId}:`, err);
        // Continue with other invoices
      }
    }
    
    // 5. Update Salesforce opportunities for paid invoices
    let invoicesUpdated = 0;
    
    for (const paidInvoice of paidInvoices) {
      try {
        logger.info(`Updating Salesforce Opportunity ${paidInvoice.opportunityId} with payment information`);
        
        // Update the opportunity in Salesforce
        await sfConn.sobject('Opportunity').update({
          Id: paidInvoice.opportunityId,
          QB_Payment_Date__c: paidInvoice.paymentDate,
          QB_Payment_ID__c: paidInvoice.paymentId,
          QB_Payment_Method__c: paidInvoice.paymentMethod,
          QB_Payment_Amount__c: paidInvoice.amount
        });
        
        invoicesUpdated++;
      } catch (err) {
        logger.error(`Error updating opportunity ${paidInvoice.opportunityId}:`, err);
      }
    }
    
    // Return results
    res.json({
      success: true,
      invoicesProcessed,
      paidInvoicesFound: paidInvoices.length,
      invoicesUpdated,
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
    
    logger.info('Testing connection', { salesforceInstance, quickbooksRealm });
    
    // Test Salesforce connection
    let salesforceConnected = false;
    let salesforceError = null;
    try {
      const sfAccessToken = await oauthManager.getSalesforceAccessToken(salesforceInstance);
      const sfConn = new jsforce.Connection({
        instanceUrl: salesforceInstance,
        accessToken: sfAccessToken
      });
      
      // Test by getting user info
      await sfConn.identity();
      salesforceConnected = true;
    } catch (err) {
      salesforceError = err.message;
    }
    
    // Test QuickBooks connection
    let quickbooksConnected = false;
    let quickbooksError = null;
    try {
      const qbAccessToken = await oauthManager.getQuickBooksAccessToken(quickbooksRealm);
      const qbo = new QuickBooks(
        config.quickbooks.clientId,
        config.quickbooks.clientSecret,
        qbAccessToken,
        false, // no token secret for OAuth2
        quickbooksRealm,
        config.quickbooks.environment === 'sandbox',
        false, // debugging
        null, // minor version
        '2.0' // OAuth version
      );
      
      // Test by getting company info
      await new Promise((resolve, reject) => {
        qbo.getCompanyInfo(quickbooksRealm, (err, companyInfo) => {
          if (err) return reject(err);
          resolve(companyInfo);
        });
      });
      quickbooksConnected = true;
    } catch (err) {
      quickbooksError = err.message;
    }
    
    res.json({
      success: salesforceConnected && quickbooksConnected,
      salesforce: {
        connected: salesforceConnected,
        instance: salesforceInstance,
        error: salesforceError
      },
      quickbooks: {
        connected: quickbooksConnected,
        realm: quickbooksRealm,
        error: quickbooksError
      }
    });
  } catch (error) {
    logger.error('Error testing connection:', error);
    next(error);
  }
});

// Get logs
router.get('/logs', async (req, res, next) => {
  try {
    const { filter, limit } = req.query;
    const maxLimit = parseInt(limit) || 50;
    
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');
    
    // Read the combined log file
    const logFile = path.join(__dirname, '../../logs/combined.log');
    
    if (!fs.existsSync(logFile)) {
      return res.json({
        success: true,
        logs: []
      });
    }
    
    // Read the last X lines of the log file
    const logEntries = [];
    const fileStream = fs.createReadStream(logFile);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const logMatch = trimmed.match(/^(.*?) \[([A-Z]+)\]:\s*(.*)$/);
      const entry = logMatch
        ? { timestamp: logMatch[1], level: logMatch[2], message: logMatch[3], raw: trimmed }
        : { raw: trimmed };

      if (filter) {
        const filterLower = filter.toLowerCase();
        const haystack = `${entry.level || ''} ${entry.message || ''} ${entry.raw || ''}`.toLowerCase();
        if (!haystack.includes(filterLower)) {
          continue;
        }
      }

      logEntries.unshift(entry);

      if (logEntries.length >= maxLimit) {
        break;
      }
    }
    
    res.json({
      success: true,
      logs: logEntries
    });
  } catch (error) {
    logger.error('Error getting logs:', error);
    next(error);
  }
});

module.exports = router;
