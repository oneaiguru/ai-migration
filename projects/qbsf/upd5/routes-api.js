/**
 * Core API routes for business logic
 * Handles invoice creation and payment processing
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
 * Test connection to both systems
 * POST /api/test-connection
 */
router.post('/test-connection', asyncHandler(async (req, res) => {
  const { salesforceInstance, quickbooksRealm } = req.body;
  
  if (!salesforceInstance || !quickbooksRealm) {
    throw new AppError('Missing required parameters: salesforceInstance or quickbooksRealm', 400, 'MISSING_PARAMS');
  }
  
  logger.info('Testing connections', { salesforceInstance, quickbooksRealm });
  
  try {
    // Test Salesforce connection
    const sfAccessToken = await oauthManager.getSalesforceAccessToken(salesforceInstance);
    const sfConn = new jsforce.Connection({
      instanceUrl: salesforceInstance,
      accessToken: sfAccessToken
    });
    
    const sfIdentity = await sfConn.identity();
    
    // Test QuickBooks connection
    const qbAccessToken = await oauthManager.getQuickBooksAccessToken(quickbooksRealm);
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
    
    const companyInfo = await new Promise((resolve, reject) => {
      qbo.findCompanyInfos((err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
    
    res.json({
      success: true,
      salesforce: {
        connected: true,
        instance: salesforceInstance,
        username: sfIdentity.username,
        displayName: sfIdentity.display_name
      },
      quickbooks: {
        connected: true,
        realm: quickbooksRealm,
        companyName: companyInfo.QueryResponse.CompanyInfo[0].CompanyName
      }
    });
  } catch (error) {
    logger.error('Connection test failed:', error);
    throw new AppError('Connection test failed: ' + error.message, 500, 'CONNECTION_TEST_FAILED');
  }
}));

/**
 * Create invoice in QuickBooks from Salesforce opportunity
 * POST /api/create-invoice
 */
router.post('/create-invoice', asyncHandler(async (req, res) => {
  const { opportunityId, salesforceInstance, quickbooksRealm } = req.body;
  
  if (!opportunityId) {
    throw new AppError('Missing required parameter: opportunityId', 400, 'MISSING_PARAMS');
  }
  
  // Use default connections if not provided
  let sfInstance = salesforceInstance;
  let qbRealm = quickbooksRealm;
  
  if (!sfInstance || !qbRealm) {
    const tokens = await oauthManager.initializeTokenStorage();
    sfInstance = sfInstance || Object.keys(tokens.salesforce || {})[0];
    qbRealm = qbRealm || Object.keys(tokens.quickbooks || {})[0];
    
    if (!sfInstance || !qbRealm) {
      throw new AppError('No connections available. Please authenticate both services first.', 400, 'NO_CONNECTIONS');
    }
  }
  
  logger.info(`Creating invoice for opportunity ${opportunityId}`, { salesforceInstance: sfInstance, quickbooksRealm: qbRealm });
  
  try {
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
    const opp = await sfConn.sobject('Opportunity').retrieve(opportunityId);
    
    if (!opp) {
      throw new AppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND');
    }
    
    // Check if invoice already exists
    if (opp.QB_Invoice_ID__c) {
      throw new AppError('Invoice already exists for this opportunity', 400, 'INVOICE_EXISTS');
    }
    
    // Get account details
    const account = await sfConn.sobject('Account').retrieve(opp.AccountId);
    
    // Get opportunity line items
    const lineItemsResult = await sfConn.query(`
      SELECT Id, PricebookEntry.Product2.Name, PricebookEntry.Product2.ProductCode,
             Quantity, UnitPrice, TotalPrice, Description,
             PricebookEntry.Product2.QB_Item_ID__c
      FROM OpportunityLineItem
      WHERE OpportunityId = '${opportunityId}'
    `);
    
    if (!lineItemsResult.records || lineItemsResult.records.length === 0) {
      throw new AppError('No line items found for this opportunity', 400, 'NO_LINE_ITEMS');
    }
    
    // Find or create customer in QuickBooks
    const customerQuery = `SELECT * FROM Customer WHERE DisplayName = '${account.Name.replace(/'/g, "\\'")}'`;
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
      logger.info(`Found existing QuickBooks customer: ${existingCustomers[0].DisplayName} (${customerId})`);
    } else {
      // Create new customer
      const customerData = {
        DisplayName: account.Name,
        CompanyName: account.Name,
        BillAddr: {
          Line1: account.BillingStreet || '',
          City: account.BillingCity || '',
          CountrySubDivisionCode: account.BillingState || '',
          PostalCode: account.BillingPostalCode || '',
          Country: account.BillingCountry || ''
        }
      };
      
      if (account.Phone) {
        customerData.PrimaryPhone = { FreeFormNumber: account.Phone };
      }
      
      if (account.Website) {
        customerData.WebAddr = { URI: account.Website };
      }
      
      const newCustomer = await new Promise((resolve, reject) => {
        qbo.createCustomer(customerData, (err, customer) => {
          if (err) return reject(err);
          resolve(customer);
        });
      });
      
      customerId = newCustomer.Id;
      logger.info(`Created new QuickBooks customer: ${newCustomer.DisplayName} (${customerId})`);
    }
    
    // Prepare line items
    const invoiceLines = lineItemsResult.records.map((item, index) => {
      // Use QB_Item_ID__c if available, fallback to service item
      const itemRef = item.PricebookEntry.Product2.QB_Item_ID__c ? 
        { value: item.PricebookEntry.Product2.QB_Item_ID__c } : 
        { name: "Services" };
      
      return {
        LineNum: index + 1,
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
      LineNum: invoiceLines.length + 1,
      DetailType: "DescriptionOnly", 
      Description: `Created from Salesforce Opportunity: ${opp.Name} (${opp.Id})`
    });
    
    // Create invoice in QuickBooks
    const invoiceData = {
      Line: invoiceLines,
      CustomerRef: {
        value: customerId
      },
      DocNumber: `SF-${opp.Id.substring(0, 8)}`,
      TxnDate: new Date().toISOString().split('T')[0],
      DueDate: opp.CloseDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };
    
    const invoice = await new Promise((resolve, reject) => {
      qbo.createInvoice(invoiceData, (err, invoice) => {
        if (err) return reject(err);
        resolve(invoice);
      });
    });
    
    logger.info(`Created QuickBooks invoice ${invoice.Id} for opportunity ${opportunityId}`);
    
    // Update Salesforce opportunity with the invoice ID
    await sfConn.sobject('Opportunity').update({
      Id: opportunityId,
      QB_Invoice_ID__c: invoice.Id
    });
    
    res.json({
      success: true,
      invoiceId: invoice.Id,
      invoiceNumber: invoice.DocNumber,
      customerName: account.Name,
      amount: invoice.TotalAmt,
      message: 'Invoice created successfully',
      details: {
        opportunity: {
          id: opportunityId,
          name: opp.Name,
          amount: opp.Amount
        },
        invoice: {
          id: invoice.Id,
          number: invoice.DocNumber,
          date: invoice.TxnDate,
          dueDate: invoice.DueDate,
          total: invoice.TotalAmt,
          customerRef: invoice.CustomerRef.value
        }
      }
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    throw new AppError('Failed to create invoice: ' + error.message, error.statusCode || 500, 'INVOICE_CREATION_ERROR');
  }
}));

/**
 * Process eligible opportunities
 * POST /api/process-eligible-opportunities
 */
router.post('/process-eligible-opportunities', asyncHandler(async (req, res) => {
  const { salesforceInstance, quickbooksRealm, stage = 'Closed Won', days = 30, limit = 10 } = req.body;
  
  // Use default connections if not provided
  let sfInstance = salesforceInstance;
  let qbRealm = quickbooksRealm;
  
  if (!sfInstance || !qbRealm) {
    const tokens = await oauthManager.initializeTokenStorage();
    sfInstance = sfInstance || Object.keys(tokens.salesforce || {})[0];
    qbRealm = qbRealm || Object.keys(tokens.quickbooks || {})[0];
    
    if (!sfInstance || !qbRealm) {
      throw new AppError('No connections available. Please authenticate both services first.', 400, 'NO_CONNECTIONS');
    }
  }
  
  logger.info('Processing eligible opportunities', { salesforceInstance: sfInstance, quickbooksRealm: qbRealm, stage, days, limit });
  
  try {
    // Get access token for Salesforce
    const sfAccessToken = await oauthManager.getSalesforceAccessToken(sfInstance);
    const sfConn = new jsforce.Connection({
      instanceUrl: sfInstance,
      accessToken: sfAccessToken
    });
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Query eligible opportunities
    const query = `
      SELECT Id, Name, AccountId, Amount, CloseDate, StageName, QB_Invoice_ID__c
      FROM Opportunity
      WHERE StageName = '${stage}'
      AND CloseDate >= ${startDateStr}
      AND QB_Invoice_ID__c = null
      ORDER BY CloseDate DESC
      LIMIT ${limit}
    `;
    
    const result = await sfConn.query(query);
    
    if (!result.records || result.records.length === 0) {
      return res.json({
        success: true,
        processed: 0,
        successful: 0,
        failed: 0,
        message: 'No eligible opportunities found',
        results: []
      });
    }
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    // Process each opportunity
    for (const opp of result.records) {
      try {
        logger.info(`Processing opportunity: ${opp.Name} (${opp.Id})`);
        
        // Create invoice for this opportunity
        const invoiceResponse = await this.createInvoice({
          body: {
            opportunityId: opp.Id,
            salesforceInstance: sfInstance,
            quickbooksRealm: qbRealm
          }
        }, {
          json: (data) => data
        }, (err) => {
          if (err) throw err;
        });
        
        results.push({
          opportunity: opp.Name,
          opportunityId: opp.Id,
          invoice: invoiceResponse.invoiceNumber,
          invoiceId: invoiceResponse.invoiceId,
          success: true
        });
        successful++;
      } catch (error) {
        logger.error(`Error processing opportunity ${opp.Id}:`, error);
        results.push({
          opportunity: opp.Name,
          opportunityId: opp.Id,
          error: error.message,
          success: false
        });
        failed++;
      }
    }
    
    res.json({
      success: true,
      processed: result.records.length,
      successful,
      failed,
      message: 'Processed eligible opportunities',
      results
    });
  } catch (error) {
    logger.error('Error processing eligible opportunities:', error);
    throw new AppError('Failed to process opportunities: ' + error.message, error.statusCode || 500, 'PROCESS_OPPORTUNITIES_ERROR');
  }
}));

/**
 * Check payment status and update Salesforce
 * POST /api/check-payment-status
 */
router.post('/check-payment-status', asyncHandler(async (req, res) => {
  const { salesforceInstance, quickbooksRealm } = req.body;
  
  // Use default connections if not provided
  let sfInstance = salesforceInstance;
  let qbRealm = quickbooksRealm;
  
  if (!sfInstance || !qbRealm) {
    const tokens = await oauthManager.initializeTokenStorage();
    sfInstance = sfInstance || Object.keys(tokens.salesforce || {})[0];
    qbRealm = qbRealm || Object.keys(tokens.quickbooks || {})[0];
    
    if (!sfInstance || !qbRealm) {
      throw new AppError('No connections available. Please authenticate both services first.', 400, 'NO_CONNECTIONS');
    }
  }
  
  logger.info('Checking payment status', { salesforceInstance: sfInstance, quickbooksRealm: qbRealm });
  
  try {
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
    const query = `
      SELECT Id, Name, QB_Invoice_ID__c, StageName, Amount
      FROM Opportunity
      WHERE QB_Invoice_ID__c != null
      AND (QB_Payment_ID__c = null OR QB_Payment_Date__c = null)
      ORDER BY LastModifiedDate DESC
      LIMIT 100
    `;
    
    const result = await sfConn.query(query);
    
    if (!result.records || result.records.length === 0) {
      return res.json({
        success: true,
        invoicesProcessed: 0,
        paidInvoicesFound: 0,
        invoicesUpdated: 0,
        message: 'No invoices to check',
        results: []
      });
    }
    
    const results = [];
    let paidInvoicesFound = 0;
    let invoicesUpdated = 0;
    
    // Check each invoice in QuickBooks
    for (const opp of result.records) {
      try {
        logger.info(`Checking payment status for invoice ${opp.QB_Invoice_ID__c}`);
        
        // Get invoice from QuickBooks
        const invoice = await new Promise((resolve, reject) => {
          qbo.getInvoice(opp.QB_Invoice_ID__c, (err, invoice) => {
            if (err) return reject(err);
            resolve(invoice);
          });
        });
        
        // Check if invoice is paid (Balance should be 0)
        if (invoice.Balance === 0 && invoice.TotalAmt > 0) {
          paidInvoicesFound++;
          
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
            StageName: 'Closed Won' // Mark as Closed Won when payment is received
          };
          
          if (payments.length > 0) {
            const payment = payments[0];
            updateData.QB_Payment_Date__c = payment.TxnDate;
            updateData.QB_Payment_ID__c = payment.Id;
            updateData.QB_Payment_Method__c = payment.PaymentMethodRef ? payment.PaymentMethodRef.name : 'Unknown';
            updateData.QB_Payment_Amount__c = payment.TotalAmt;
          }
          
          // Update Salesforce opportunity
          await sfConn.sobject('Opportunity').update(updateData);
          
          invoicesUpdated++;
          
          results.push({
            invoice: opp.QB_Invoice_ID__c,
            paid: true,
            opportunity: opp.Name,
            opportunityId: opp.Id,
            status: 'Changed to Closed Won',
            paymentAmount: invoice.TotalAmt,
            paymentDate: updateData.QB_Payment_Date__c
          });
          
          logger.info(`Updated opportunity ${opp.Id} with payment details`);
        } else {
          results.push({
            invoice: opp.QB_Invoice_ID__c,
            paid: false,
            opportunity: opp.Name,
            opportunityId: opp.Id,
            status: 'Unchanged',
            balance: invoice.Balance
          });
        }
      } catch (error) {
        logger.error(`Error checking invoice ${opp.QB_Invoice_ID__c}:`, error);
        results.push({
          invoice: opp.QB_Invoice_ID__c,
          opportunity: opp.Name,
          opportunityId: opp.Id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      invoicesProcessed: result.records.length,
      paidInvoicesFound,
      invoicesUpdated,
      message: 'Checked payment status',
      results
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    throw new AppError('Failed to check payment status: ' + error.message, error.statusCode || 500, 'PAYMENT_CHECK_ERROR');
  }
}));

/**
 * Get logs endpoint
 */
router.get('/logs', (req, res) => {
  const { filter, limit = 50 } = req.query;
  const maxLimit = Math.min(parseInt(limit), 1000);
  
  // In production, this would read from actual log files
  // For now, return a simple message
  res.json({
    success: true,
    message: 'Log retrieval endpoint',
    limit: maxLimit,
    filter: filter || null,
    logs: []
  });
});

module.exports = router;
