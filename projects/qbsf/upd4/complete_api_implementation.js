const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');
const QuickBooks = require('node-quickbooks');
const { apiKeyAuth } = require('../middleware/auth');
const { getToken } = require('../services/token-manager');
const { getDemoData } = require('../services/demo-data');

// Apply API key authentication to all routes
router.use(apiKeyAuth);

// Helper function to get Salesforce connection
async function getSalesforceConnection(instanceUrl) {
  const tokenData = await getToken('salesforce', instanceUrl);
  if (!tokenData) {
    throw new Error('Salesforce not authenticated');
  }

  const conn = new jsforce.Connection({
    instanceUrl: tokenData.instanceUrl,
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken
  });

  // Handle token refresh
  conn.on('refresh', async (accessToken, res) => {
    await saveToken('salesforce', instanceUrl, {
      ...tokenData,
      accessToken
    });
  });

  return conn;
}

// Helper function to get QuickBooks client
async function getQuickBooksClient(realmId) {
  const tokenData = await getToken('quickbooks', realmId);
  if (!tokenData) {
    throw new Error('QuickBooks not authenticated');
  }

  const qbo = new QuickBooks(
    process.env.QB_CLIENT_ID,
    process.env.QB_CLIENT_SECRET,
    tokenData.accessToken,
    false,
    realmId,
    process.env.QB_ENVIRONMENT === 'sandbox',
    true,
    null,
    '2.0',
    tokenData.refreshToken
  );

  return qbo;
}

// Create invoice from Salesforce opportunity
router.post('/create-invoice', async (req, res, next) => {
  try {
    const { opportunityId, salesforceInstance, quickbooksRealm } = req.body;

    if (!opportunityId || !salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        error: 'Missing required parameters: opportunityId, salesforceInstance, quickbooksRealm'
      });
    }

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      const demoData = getDemoData();
      return res.json({
        success: true,
        invoiceId: demoData.invoiceId,
        opportunityId,
        message: 'Invoice created successfully (demo mode)'
      });
    }

    // Get connections
    const conn = await getSalesforceConnection(salesforceInstance);
    const qbo = await getQuickBooksClient(quickbooksRealm);

    // 1. Fetch opportunity from Salesforce
    const opportunity = await conn.sobject('Opportunity').retrieve(opportunityId);
    
    // 2. Fetch account from Salesforce
    const account = await conn.sobject('Account').retrieve(opportunity.AccountId);
    
    // 3. Fetch opportunity line items
    const lineItems = await conn.query(
      `SELECT Id, Product2Id, Product2.Name, Quantity, UnitPrice, TotalPrice 
       FROM OpportunityLineItem 
       WHERE OpportunityId = '${opportunityId}'`
    );

    // 4. Find or create customer in QuickBooks
    const customerQuery = `SELECT * FROM Customer WHERE DisplayName = '${account.Name}'`;
    const existingCustomers = await new Promise((resolve, reject) => {
      qbo.query(customerQuery, (err, data) => {
        if (err) reject(err);
        else resolve(data.QueryResponse.Customer || []);
      });
    });

    let qbCustomer;
    if (existingCustomers.length > 0) {
      qbCustomer = existingCustomers[0];
    } else {
      // Create new customer
      const newCustomer = {
        DisplayName: account.Name,
        CompanyName: account.Name,
        BillAddr: {
          Line1: account.BillingStreet || '',
          City: account.BillingCity || '',
          CountrySubDivisionCode: account.BillingState || '',
          PostalCode: account.BillingPostalCode || ''
        }
      };

      qbCustomer = await new Promise((resolve, reject) => {
        qbo.createCustomer(newCustomer, (err, customer) => {
          if (err) reject(err);
          else resolve(customer);
        });
      });
    }

    // 5. Create invoice line items
    const invoiceLines = lineItems.records.map(item => ({
      DetailType: 'SalesItemLineDetail',
      Amount: item.TotalPrice,
      SalesItemLineDetail: {
        ItemRef: {
          name: item.Product2.Name,
          value: '1' // Default to service item
        },
        Qty: item.Quantity,
        UnitPrice: item.UnitPrice
      }
    }));

    // 6. Create invoice in QuickBooks
    const invoiceData = {
      Line: invoiceLines,
      CustomerRef: {
        value: qbCustomer.Id
      },
      DocNumber: opportunity.Name,
      TxnDate: new Date().toISOString().split('T')[0]
    };

    const invoice = await new Promise((resolve, reject) => {
      qbo.createInvoice(invoiceData, (err, invoice) => {
        if (err) reject(err);
        else resolve(invoice);
      });
    });

    // 7. Update opportunity in Salesforce with invoice ID
    await conn.sobject('Opportunity').update({
      Id: opportunityId,
      QB_Invoice_ID__c: invoice.Id,
      QB_Invoice_Number__c: invoice.DocNumber,
      QB_Invoice_Status__c: 'Created'
    });

    res.json({
      success: true,
      invoiceId: invoice.Id,
      invoiceNumber: invoice.DocNumber,
      opportunityId,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    next(error);
  }
});

// Check payment status
router.post('/check-payment-status', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;

    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        error: 'Missing required parameters: salesforceInstance, quickbooksRealm'
      });
    }

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        success: true,
        invoicesProcessed: 3,
        paidInvoicesFound: 2,
        opportunitiesUpdated: 2,
        message: 'Payment status check completed (demo mode)'
      });
    }

    // Get connections
    const conn = await getSalesforceConnection(salesforceInstance);
    const qbo = await getQuickBooksClient(quickbooksRealm);

    // 1. Get all opportunities with QB Invoice IDs from Salesforce
    const opportunities = await conn.query(
      `SELECT Id, Name, QB_Invoice_ID__c 
       FROM Opportunity 
       WHERE QB_Invoice_ID__c != null 
       AND StageName != 'Closed Won'`
    );

    let invoicesProcessed = 0;
    let paidInvoicesFound = 0;
    let opportunitiesUpdated = 0;

    // 2. Check each invoice in QuickBooks
    for (const opp of opportunities.records) {
      invoicesProcessed++;
      
      try {
        // Get invoice from QuickBooks
        const invoice = await new Promise((resolve, reject) => {
          qbo.getInvoice(opp.QB_Invoice_ID__c, (err, invoice) => {
            if (err) reject(err);
            else resolve(invoice);
          });
        });

        // Check if fully paid
        if (invoice.Balance === 0 && invoice.TotalAmt > 0) {
          paidInvoicesFound++;
          
          // Get payment details
          const paymentsQuery = `SELECT * FROM Payment WHERE LinkedTxn.TxnId = '${invoice.Id}'`;
          const payments = await new Promise((resolve, reject) => {
            qbo.query(paymentsQuery, (err, data) => {
              if (err) reject(err);
              else resolve(data.QueryResponse.Payment || []);
            });
          });

          // Update opportunity in Salesforce
          const updateData = {
            Id: opp.Id,
            StageName: 'Closed Won',
            QB_Payment_Status__c: 'Paid',
            QB_Payment_Date__c: payments[0] ? payments[0].TxnDate : new Date().toISOString()
          };

          await conn.sobject('Opportunity').update(updateData);
          opportunitiesUpdated++;
        }
      } catch (err) {
        console.error(`Error processing invoice ${opp.QB_Invoice_ID__c}:`, err);
        // Continue with next invoice
      }
    }

    res.json({
      success: true,
      invoicesProcessed,
      paidInvoicesFound,
      opportunitiesUpdated,
      message: 'Payment status check completed'
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    next(error);
  }
});

// Test connections
router.post('/test-connection', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        success: true,
        salesforce: {
          connected: true,
          instance: salesforceInstance || 'demo-instance'
        },
        quickbooks: {
          connected: true,
          realm: quickbooksRealm || 'demo-realm'
        }
      });
    }

    const results = {
      salesforce: { connected: false },
      quickbooks: { connected: false }
    };

    // Test Salesforce connection
    try {
      const conn = await getSalesforceConnection(salesforceInstance);
      const identity = await conn.identity();
      results.salesforce = {
        connected: true,
        instance: salesforceInstance,
        username: identity.username
      };
    } catch (err) {
      results.salesforce.error = err.message;
    }

    // Test QuickBooks connection
    try {
      const qbo = await getQuickBooksClient(quickbooksRealm);
      await new Promise((resolve, reject) => {
        qbo.getCompanyInfo(quickbooksRealm, (err, company) => {
          if (err) reject(err);
          else resolve(company);
        });
      });
      results.quickbooks = {
        connected: true,
        realm: quickbooksRealm
      };
    } catch (err) {
      results.quickbooks.error = err.message;
    }

    res.json({
      success: results.salesforce.connected && results.quickbooks.connected,
      ...results
    });
  } catch (error) {
    console.error('Connection test error:', error);
    next(error);
  }
});

module.exports = router;