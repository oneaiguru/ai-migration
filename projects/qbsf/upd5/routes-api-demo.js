/**
 * Core API routes for demo - Simplified for essential functionality
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth, AppError, asyncHandler } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const jsforce = require('jsforce');
const QuickBooks = require('node-quickbooks');
const oauthManager = require('../services/oauth-manager');
const config = require('../config');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * Create invoice in QuickBooks from Salesforce opportunity
 * This is called by Salesforce button click
 * POST /api/create-invoice
 */
router.post('/create-invoice', asyncHandler(async (req, res) => {
  const { opportunityId } = req.body;
  
  if (!opportunityId) {
    throw new AppError('Missing required parameter: opportunityId', 400, 'MISSING_PARAMS');
  }
  
  logger.info(`=== DEMO: Creating invoice for opportunity ${opportunityId} ===`);
  
  try {
    // Get connections from token storage
    const tokens = await oauthManager.initializeTokenStorage();
    const sfInstance = Object.keys(tokens.salesforce || {})[0];
    const qbRealm = Object.keys(tokens.quickbooks || {})[0];
    
    if (!sfInstance || !qbRealm) {
      throw new AppError('No connections available. Please authenticate both services first.', 400, 'NO_CONNECTIONS');
    }
    
    logger.info(`Using Salesforce: ${sfInstance}, QuickBooks: ${qbRealm}`);
    
    // Get access tokens
    const sfAccessToken = await oauthManager.getSalesforceAccessToken(sfInstance);
    const qbAccessToken = await oauthManager.getQuickBooksAccessToken(qbRealm);
    
    // Create API clients
    const sfConn = new jsforce.Connection({
      instanceUrl: sfInstance,
      accessToken: sfAccessToken
    });
    
    const qbo = new QuickBooks(
      config.quickbooks.clientId,
      config.quickbooks.clientSecret,
      qbAccessToken,
      false,
      qbRealm,
      config.quickbooks.environment === 'sandbox',
      false,
      null,
      '2.0'
    );
    
    // Get opportunity details
    logger.info('Fetching opportunity details from Salesforce...');
    const opp = await sfConn.sobject('Opportunity').retrieve(opportunityId);
    
    if (!opp) {
      throw new AppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND');
    }
    
    // Check if invoice already exists
    if (opp.QB_Invoice_ID__c) {
      logger.warn(`Invoice already exists: ${opp.QB_Invoice_ID__c}`);
      throw new AppError('Invoice already exists for this opportunity', 400, 'INVOICE_EXISTS');
    }
    
    // Get account details
    logger.info('Fetching account details...');
    const account = await sfConn.sobject('Account').retrieve(opp.AccountId);
    
    // Get opportunity line items
    logger.info('Fetching opportunity line items...');
    const lineItemsResult = await sfConn.query(`
      SELECT Id, PricebookEntry.Product2.Name, PricebookEntry.Product2.ProductCode,
             Quantity, UnitPrice, TotalPrice, Description,
             PricebookEntry.Product2.QB_Item_ID__c
      FROM OpportunityLineItem
      WHERE OpportunityId = '${opportunityId}'
    `);
    
    if (!lineItemsResult.records || lineItemsResult.records.length === 0) {
      logger.warn('No line items found, using default service item');
      // Create default line item
      lineItemsResult.records = [{
        PricebookEntry: { Product2: { Name: 'Services' } },
        Quantity: 1,
        UnitPrice: opp.Amount || 0,
        TotalPrice: opp.Amount || 0,
        Description: opp.Name
      }];
    }
    
    // Find or create customer in QuickBooks
    logger.info(`Looking for customer: ${account.Name}`);
    const customerQuery = `SELECT * FROM Customer WHERE DisplayName = '${account.Name.replace(/'/g, "\\'")}'`;
    const existingCustomers = await new Promise((resolve, reject) => {
      qbo.query(customerQuery, (err, data) => {
        if (err) return reject(err);
        resolve(data.QueryResponse.Customer || []);
      });
    });
    
    let customerId;
    
    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].Id;
      logger.info(`Found existing customer: ${customerId}`);
    } else {
      // Create new customer
      logger.info('Creating new customer in QuickBooks...');
      const customerData = {
        DisplayName: account.Name,
        CompanyName: account.Name
      };
      
      if (account.BillingStreet || account.BillingCity) {
        customerData.BillAddr = {
          Line1: account.BillingStreet || '',
          City: account.BillingCity || '',
          CountrySubDivisionCode: account.BillingState || '',
          PostalCode: account.BillingPostalCode || ''
        };
      }
      
      const newCustomer = await new Promise((resolve, reject) => {
        qbo.createCustomer(customerData, (err, customer) => {
          if (err) return reject(err);
          resolve(customer);
        });
      });
      
      customerId = newCustomer.Id;
      logger.info(`Created new customer: ${customerId}`);
    }
    
    // Prepare line items
    logger.info('Preparing invoice line items...');
    const invoiceLines = lineItemsResult.records.map((item, index) => ({
      LineNum: index + 1,
      DetailType: "SalesItemLineDetail",
      Description: item.Description || item.PricebookEntry.Product2.Name,
      Amount: item.TotalPrice,
      SalesItemLineDetail: {
        ItemRef: { name: "Services" }, // Default to Services
        Qty: item.Quantity,
        UnitPrice: item.UnitPrice
      }
    }));
    
    // Add note referencing Salesforce
    invoiceLines.push({
      LineNum: invoiceLines.length + 1,
      DetailType: "DescriptionOnly", 
      Description: `Created from Salesforce Opportunity: ${opp.Name}`
    });
    
    // Create invoice in QuickBooks
    logger.info('Creating invoice in QuickBooks...');
    const invoiceData = {
      Line: invoiceLines,
      CustomerRef: { value: customerId },
      DocNumber: `SF-${opportunityId.substring(0, 8)}`,
      TxnDate: new Date().toISOString().split('T')[0]
    };
    
    const invoice = await new Promise((resolve, reject) => {
      qbo.createInvoice(invoiceData, (err, invoice) => {
        if (err) return reject(err);
        resolve(invoice);
      });
    });
    
    logger.info(`✓ Invoice created: ${invoice.Id} (${invoice.DocNumber})`);
    
    // Update Salesforce opportunity with the invoice ID
    logger.info('Updating Salesforce opportunity...');
    await sfConn.sobject('Opportunity').update({
      Id: opportunityId,
      QB_Invoice_ID__c: invoice.Id,
      QB_Invoice_Number__c: invoice.DocNumber
    });
    
    logger.info('=== DEMO: Invoice creation completed successfully ===');
    
    res.json({
      success: true,
      invoiceId: invoice.Id,
      invoiceNumber: invoice.DocNumber,
      customerName: account.Name,
      amount: invoice.TotalAmt,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    throw new AppError('Failed to create invoice: ' + error.message, error.statusCode || 500, 'INVOICE_CREATION_ERROR');
  }
}));

/**
 * Check payment status and update Salesforce
 * This can be triggered manually during demo
 * POST /api/check-payment-status
 */
router.post('/check-payment-status', asyncHandler(async (req, res) => {
  const { invoiceId } = req.body; // Optional: check specific invoice
  
  logger.info(`=== DEMO: Checking payment status ${invoiceId ? `for invoice ${invoiceId}` : 'for all invoices'} ===`);
  
  try {
    // Get connections from token storage
    const tokens = await oauthManager.initializeTokenStorage();
    const sfInstance = Object.keys(tokens.salesforce || {})[0];
    const qbRealm = Object.keys(tokens.quickbooks || {})[0];
    
    if (!sfInstance || !qbRealm) {
      throw new AppError('No connections available.', 400, 'NO_CONNECTIONS');
    }
    
    // Get access tokens
    const sfAccessToken = await oauthManager.getSalesforceAccessToken(sfInstance);
    const qbAccessToken = await oauthManager.getQuickBooksAccessToken(qbRealm);
    
    // Create API clients
    const sfConn = new jsforce.Connection({
      instanceUrl: sfInstance,
      accessToken: sfAccessToken
    });
    
    const qbo = new QuickBooks(
      config.quickbooks.clientId,
      config.quickbooks.clientSecret,
      qbAccessToken,
      false,
      qbRealm,
      config.quickbooks.environment === 'sandbox',
      false,
      null,
      '2.0'
    );
    
    // Query Salesforce for opportunities with invoices
    let query;
    if (invoiceId) {
      query = `
        SELECT Id, Name, QB_Invoice_ID__c, StageName, Amount
        FROM Opportunity
        WHERE QB_Invoice_ID__c = '${invoiceId}'
      `;
    } else {
      query = `
        SELECT Id, Name, QB_Invoice_ID__c, StageName, Amount
        FROM Opportunity
        WHERE QB_Invoice_ID__c != null
        AND StageName != 'Closed Won'
        ORDER BY LastModifiedDate DESC
        LIMIT 50
      `;
    }
    
    logger.info('Querying Salesforce for opportunities with invoices...');
    const result = await sfConn.query(query);
    
    if (!result.records || result.records.length === 0) {
      logger.info('No invoices to check');
      return res.json({
        success: true,
        invoicesProcessed: 0,
        paidInvoicesFound: 0,
        message: 'No invoices to check'
      });
    }
    
    const results = [];
    let paidInvoicesFound = 0;
    let invoicesUpdated = 0;
    
    // Check each invoice in QuickBooks
    for (const opp of result.records) {
      try {
        logger.info(`Checking payment status for invoice ${opp.QB_Invoice_ID__c}...`);
        
        // Get invoice from QuickBooks
        const invoice = await new Promise((resolve, reject) => {
          qbo.getInvoice(opp.QB_Invoice_ID__c, (err, invoice) => {
            if (err) return reject(err);
            resolve(invoice);
          });
        });
        
        logger.info(`Invoice balance: ${invoice.Balance}, Total: ${invoice.TotalAmt}`);
        
        // Check if invoice is paid (Balance should be 0)
        if (invoice.Balance === 0 && invoice.TotalAmt > 0) {
          paidInvoicesFound++;
          logger.info(`✓ Invoice ${opp.QB_Invoice_ID__c} is PAID!`);
          
          // Find the payment for this invoice
          const paymentQuery = `
            SELECT * FROM Payment 
            WHERE Line ANY (LinkedTxn.TxnId = '${invoice.Id}' AND LinkedTxn.TxnType = 'Invoice')
          `;
          
          const payments = await new Promise((resolve, reject) => {
            qbo.query(paymentQuery, (err, data) => {
              if (err) return reject(err);
              resolve(data.QueryResponse.Payment || []);
            });
          });
          
          let updateData = {
            Id: opp.Id,
            StageName: 'Closed Won'
          };
          
          if (payments.length > 0) {
            const payment = payments[0];
            updateData.QB_Payment_Date__c = payment.TxnDate;
            updateData.QB_Payment_ID__c = payment.Id;
            updateData.QB_Payment_Method__c = payment.PaymentMethodRef ? payment.PaymentMethodRef.name : 'Cash';
            updateData.QB_Payment_Amount__c = payment.TotalAmt;
            logger.info(`Found payment: ${payment.Id} for $${payment.TotalAmt}`);
          }
          
          // Update Salesforce opportunity
          logger.info(`Updating opportunity ${opp.Id} to Closed Won...`);
          await sfConn.sobject('Opportunity').update(updateData);
          
          invoicesUpdated++;
          
          results.push({
            invoice: opp.QB_Invoice_ID__c,
            opportunity: opp.Name,
            status: 'Updated to Closed Won',
            paymentAmount: invoice.TotalAmt
          });
          
          logger.info(`✓ Updated opportunity ${opp.Name} to Closed Won`);
        } else {
          logger.info(`Invoice ${opp.QB_Invoice_ID__c} is not paid (Balance: ${invoice.Balance})`);
          results.push({
            invoice: opp.QB_Invoice_ID__c,
            opportunity: opp.Name,
            status: 'Not Paid',
            balance: invoice.Balance
          });
        }
      } catch (error) {
        logger.error(`Error checking invoice ${opp.QB_Invoice_ID__c}:`, error);
        results.push({
          invoice: opp.QB_Invoice_ID__c,
          opportunity: opp.Name,
          error: error.message
        });
      }
    }
    
    logger.info(`=== DEMO: Payment check completed. Found ${paidInvoicesFound} paid invoices ===`);
    
    res.json({
      success: true,
      invoicesProcessed: result.records.length,
      paidInvoicesFound,
      invoicesUpdated,
      message: `Checked ${result.records.length} invoices, found ${paidInvoicesFound} paid`,
      results
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    throw new AppError('Failed to check payment status: ' + error.message, error.statusCode || 500, 'PAYMENT_CHECK_ERROR');
  }
}));

/**
 * Test connection to both systems
 * GET /api/test-connection
 */
router.get('/test-connection', asyncHandler(async (req, res) => {
  logger.info('Testing connections to Salesforce and QuickBooks...');
  
  try {
    const tokens = await oauthManager.initializeTokenStorage();
    const sfInstance = Object.keys(tokens.salesforce || {})[0];
    const qbRealm = Object.keys(tokens.quickbooks || {})[0];
    
    if (!sfInstance || !qbRealm) {
      throw new AppError('No connections available.', 400, 'NO_CONNECTIONS');
    }
    
    // Test Salesforce
    const sfAccessToken = await oauthManager.getSalesforceAccessToken(sfInstance);
    const sfConn = new jsforce.Connection({
      instanceUrl: sfInstance,
      accessToken: sfAccessToken
    });
    const sfIdentity = await sfConn.identity();
    
    // Test QuickBooks
    const qbAccessToken = await oauthManager.getQuickBooksAccessToken(qbRealm);
    const qbo = new QuickBooks(
      config.quickbooks.clientId,
      config.quickbooks.clientSecret,
      qbAccessToken,
      false,
      qbRealm,
      config.quickbooks.environment === 'sandbox',
      false,
      null,
      '2.0'
    );
    
    const companyInfo = await new Promise((resolve, reject) => {
      qbo.findCompanyInfos((err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
    
    logger.info('✓ Connected to both Salesforce and QuickBooks');
    
    res.json({
      success: true,
      salesforce: {
        connected: true,
        instance: sfInstance,
        user: sfIdentity.username
      },
      quickbooks: {
        connected: true,
        realm: qbRealm,
        company: companyInfo.QueryResponse.CompanyInfo[0].CompanyName
      }
    });
  } catch (error) {
    logger.error('Connection test failed:', error);
    throw new AppError('Connection test failed: ' + error.message, 500, 'CONNECTION_TEST_FAILED');
  }
}));

module.exports = router;
