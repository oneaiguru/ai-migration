/**
 * Core API routes for business logic
 * Handles the actual integration between Salesforce and QuickBooks
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');
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
    
    // 3. Find eligible opportunities in Salesforce
    const daysAgo = days || 30;
    const dateCutoff = new Date();
    dateCutoff.setDate(dateCutoff.getDate() - daysAgo);
    const formattedDate = dateCutoff.toISOString().split('T')[0];
    
    logger.info(`Searching for opportunities with stage '${stage || 'Closed Won'}' since ${formattedDate}`);
    
    const opportunitiesResult = await sfConn.query(`
      SELECT Id, Name, Amount, CloseDate, AccountId, Description, 
             Account.Name, Account.BillingStreet, Account.BillingCity, 
             Account.BillingState, Account.BillingPostalCode, Account.BillingCountry
      FROM Opportunity 
      WHERE StageName = '${stage || 'Closed Won'}' 
      AND CloseDate >= ${formattedDate}
      AND QB_Invoice_ID__c = null
      LIMIT ${limit || 10}
    `);
    
    if (!opportunitiesResult.records || opportunitiesResult.records.length === 0) {
      logger.info('No eligible opportunities found');
      return res.json({
        success: true,
        processed: 0,
        successful: 0,
        failed: 0,
        message: 'No eligible opportunities found'
      });
    }
    
    logger.info(`Found ${opportunitiesResult.records.length} eligible opportunities`);
    
    // 4. Process each opportunity
    let successful = 0;
    let failed = 0;
    
    for (const opp of opportunitiesResult.records) {
      try {
        logger.info(`Processing opportunity ${opp.Id}: ${opp.Name}`);
        
        // 4.1. Get opportunity line items
        const lineItemsResult = await sfConn.query(`
          SELECT Id, PricebookEntry.Product2.Name, PricebookEntry.Product2.ProductCode,
                 Quantity, UnitPrice, TotalPrice, Description,
                 PricebookEntry.Product2.QB_Item_ID__c
          FROM OpportunityLineItem
          WHERE OpportunityId = '${opp.Id}'
        `);
        
        // 4.2. Find or create customer in QuickBooks
        logger.info(`Finding or creating customer in QuickBooks for account: ${opp.Account.Name}`);
        
        // Search for existing customer
        const customerQuery = `SELECT * FROM Customer WHERE DisplayName = '${opp.Account.Name.replace(/'/g, "\\'")}'`;
        const existingCustomers = await new Promise((resolve, reject) => {
          qbo.query(customerQuery, (err, data) => {
            if (err) return reject(err);
            resolve(data.QueryResponse.Customer || []);
          });
        });
        
        let customerId;
        
        if (existingCustomers.length > 0) {
          // Use existing customer
          customerId = existingCustomers[0].Id;
          logger.info(`Using existing customer with ID: ${customerId}`);
        } else {
          // Create new customer
          const customerData = {
            DisplayName: opp.Account.Name,
            CompanyName: opp.Account.Name,
            BillAddr: {
              Line1: opp.Account.BillingStreet || '',
              City: opp.Account.BillingCity || '',
              CountrySubDivisionCode: opp.Account.BillingState || '',
              PostalCode: opp.Account.BillingPostalCode || '',
              Country: opp.Account.BillingCountry || ''
            }
          };
          
          const newCustomer = await new Promise((resolve, reject) => {
            qbo.createCustomer(customerData, (err, customer) => {
              if (err) return reject(err);
              resolve(customer);
            });
          });
          
          customerId = newCustomer.Id;
          logger.info(`Created new customer with ID: ${customerId}`);
        }
        
        // 4.3. Create invoice in QuickBooks
        logger.info(`Creating invoice in QuickBooks for opportunity: ${opp.Id}`);
        
        // Prepare line items
        const invoiceLines = lineItemsResult.records.map(item => {
          // Use QB_Item_ID__c if available, fallback to service item
          const itemRef = item.PricebookEntry.Product2.QB_Item_ID__c ? 
            { value: item.PricebookEntry.Product2.QB_Item_ID__c } : 
            { name: "Services" };
          
          return {
            DetailType: "SalesItemLineDetail",
            Description: item.Description || item.PricebookEntry.Product2.Name,
            Amount: item.TotalPrice,
            SalesItemLineDetail: {
              ItemRef: itemRef,
              Qty: item.Quantity,
              UnitPrice: item.UnitPrice
            }
          };
        });
        
        // Add note referencing Salesforce
        invoiceLines.push({
          DetailType: "DescriptionOnly",
          Description: `Created from Salesforce Opportunity: ${opp.Name} (${opp.Id})`,
          Amount: 0,
          LineNum: 1
        });
        
        const invoiceData = {
          Line: invoiceLines,
          CustomerRef: {
            value: customerId
          },
          DocNumber: `SF-${opp.Id.substring(0, 8)}`,
          TxnDate: new Date().toISOString().split('T')[0]
        };
        
        const invoice = await new Promise((resolve, reject) => {
          qbo.createInvoice(invoiceData, (err, invoice) => {
            if (err) return reject(err);
            resolve(invoice);
          });
        });
        
        // 4.4. Update Salesforce opportunity with the invoice ID
        logger.info(`Updating Salesforce opportunity ${opp.Id} with QuickBooks invoice ID: ${invoice.Id}`);
        
        await sfConn.sobject('Opportunity').update({
          Id: opp.Id,
          QB_Invoice_ID__c: invoice.Id
        });
        
        successful++;
      } catch (err) {
        logger.error(`Error processing opportunity ${opp.Id}:`, err);
        failed++;
      }
    }
    
    res.json({
      success: true,
      processed: opportunitiesResult.records.length,
      successful,
      failed,
      message: `Processed ${opportunitiesResult.records.length} opportunities`
    });
  } catch (error) {
    logger.error('Error processing eligible opportunities:', error);
    next(error);
  }
});

/**
 * Check payment status
 * Checks payments in QuickBooks and updates Salesforce opportunities
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

module.exports = router;
