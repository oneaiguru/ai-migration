const express = require('express');
const router = express.Router();
const SalesforceAPI = require('../services/salesforce-api');
const QuickBooksAPI = require('../services/quickbooks-api');
const { mapOpportunityToInvoice } = require('../transforms/opportunity-to-invoice');
const logger = require('../utils/logger');
const { apiKeyAuth, AppError } = require('../middleware/error-handler');
const oauthManager = require('../services/oauth-manager');

// Protect all API routes with API key authentication
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
 * Create QuickBooks invoice from Salesforce Opportunity
 */
router.post('/opportunity-to-invoice', async (req, res, next) => {
  try {
    const { opportunityId, salesforceInstance, quickbooksRealm } = req.body;
    
    if (!opportunityId) {
      throw new AppError('Opportunity ID is required', 400, 'MISSING_OPPORTUNITY_ID');
    }
    
    if (!salesforceInstance) {
      throw new AppError('Salesforce instance URL is required', 400, 'MISSING_SALESFORCE_INSTANCE');
    }
    
    if (!quickbooksRealm) {
      throw new AppError('QuickBooks realm ID is required', 400, 'MISSING_QUICKBOOKS_REALM');
    }
    
    // Initialize API clients
    const sfApi = new SalesforceAPI(salesforceInstance);
    const qbApi = new QuickBooksAPI(quickbooksRealm);
    
    // Get Opportunity data from Salesforce
    logger.info(`Fetching Opportunity data from Salesforce: ${opportunityId}`);
    const opportunityData = await sfApi.getOpportunityWithRelatedData(opportunityId);
    
    // Create or find customer in QuickBooks
    logger.info(`Creating/finding customer in QuickBooks: ${opportunityData.account.Name}`);
    const customerData = {
      DisplayName: opportunityData.account.Name,
      CompanyName: opportunityData.account.Name,
      PrimaryEmailAddr: {
        Address: opportunityData.account.Email__c || ''
      },
      PrimaryPhone: {
        FreeFormNumber: opportunityData.account.Phone || ''
      },
      BillAddr: {
        Line1: opportunityData.account.BillingStreet || '',
        City: opportunityData.account.BillingCity || '',
        CountrySubDivisionCode: opportunityData.account.BillingState || '',
        PostalCode: opportunityData.account.BillingPostalCode || '',
        Country: opportunityData.account.BillingCountry || ''
      }
    };
    
    const qbCustomerId = await qbApi.findOrCreateCustomer(customerData);
    
    // Transform Opportunity to Invoice
    logger.info('Transforming Opportunity data to QuickBooks Invoice format');
    const invoiceData = mapOpportunityToInvoice(
      opportunityData.opportunity,
      opportunityData.account,
      opportunityData.products,
      qbCustomerId
    );
    
    // Create Invoice in QuickBooks
    logger.info('Creating Invoice in QuickBooks');
    const invoice = await qbApi.createInvoice(invoiceData);
    
    // Update Salesforce with QuickBooks Invoice ID
    logger.info(`Updating Salesforce Opportunity with QuickBooks Invoice ID: ${invoice.Id}`);
    await sfApi.updateOpportunityWithQBInvoiceId(opportunityId, invoice.Id);
    
    res.json({
      success: true,
      qbInvoiceId: invoice.Id,
      message: 'Invoice created successfully in QuickBooks'
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    next(error);
  }
});

/**
 * Check payment status for invoices
 */
router.post('/check-payment-status', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance) {
      throw new AppError('Salesforce instance URL is required', 400, 'MISSING_SALESFORCE_INSTANCE');
    }
    
    if (!quickbooksRealm) {
      throw new AppError('QuickBooks realm ID is required', 400, 'MISSING_QUICKBOOKS_REALM');
    }
    
    // Initialize API clients
    const sfApi = new SalesforceAPI(salesforceInstance);
    const qbApi = new QuickBooksAPI(quickbooksRealm);
    
    // Get unpaid invoices from Salesforce
    logger.info('Fetching unpaid invoices from Salesforce');
    const unpaidInvoices = await sfApi.getUnpaidInvoices();
    
    if (unpaidInvoices.length === 0) {
      logger.info('No unpaid invoices found');
      return res.json({
        success: true,
        invoicesProcessed: 0,
        paidInvoicesFound: 0,
        message: 'No unpaid invoices found'
      });
    }
    
    logger.info(`Found ${unpaidInvoices.length} unpaid invoices to check`);
    
    // Extract QuickBooks invoice IDs
    const qbInvoiceIds = unpaidInvoices.map(invoice => invoice.qbInvoiceId);
    
    // Check payment status for all invoices
    logger.info('Checking payment status in QuickBooks');
    const paymentStatusResults = await qbApi.batchCheckPaymentStatus(qbInvoiceIds);
    
    // Find paid invoices
    const paidInvoices = paymentStatusResults.filter(result => result.isPaid && !result.error);
    
    logger.info(`Found ${paidInvoices.length} newly paid invoices`);
    
    // Update Salesforce for paid invoices
    let updatedCount = 0;
    
    for (const paidInvoice of paidInvoices) {
      // Find the corresponding Salesforce Opportunity ID
      const sfInvoice = unpaidInvoices.find(invoice => invoice.qbInvoiceId === paidInvoice.invoiceId);
      
      if (sfInvoice && paidInvoice.paymentDetails) {
        logger.info(`Updating Salesforce Opportunity ${sfInvoice.sfOpportunityId} with payment information`);
        await sfApi.updateOpportunityWithPaymentInfo(
          sfInvoice.sfOpportunityId,
          paidInvoice.paymentDetails
        );
        updatedCount++;
      }
    }
    
    res.json({
      success: true,
      invoicesProcessed: unpaidInvoices.length,
      paidInvoicesFound: paidInvoices.length,
      invoicesUpdated: updatedCount,
      message: `Successfully updated ${updatedCount} Salesforce records`
    });
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
    
    const results = {
      salesforce: { connected: false },
      quickbooks: { connected: false }
    };
    
    // Test Salesforce connection if provided
    if (salesforceInstance) {
      try {
        const sfApi = new SalesforceAPI(salesforceInstance);
        const sfAccessToken = await sfApi.getAccessToken();
        
        // Make a simple API call
        const response = await sfApi.request('get', 'limits');
        
        results.salesforce = {
          connected: true,
          limits: {
            dailyApiRequests: response.DailyApiRequests
          }
        };
        
        logger.info('Salesforce connection test successful');
      } catch (error) {
        logger.error('Salesforce connection test failed:', error);
        results.salesforce = {
          connected: false,
          error: error.message
        };
      }
    }
    
    // Test QuickBooks connection if provided
    if (quickbooksRealm) {
      try {
        const qbApi = new QuickBooksAPI(quickbooksRealm);
        const qbAccessToken = await qbApi.getAccessToken();
        
        // Get company info
        const companyInfo = await qbApi.request('get', `companyinfo/${quickbooksRealm}`);
        
        results.quickbooks = {
          connected: true,
          company: {
            name: companyInfo.CompanyInfo.CompanyName,
            legalName: companyInfo.CompanyInfo.LegalName,
            country: companyInfo.CompanyInfo.Country
          }
        };
        
        logger.info('QuickBooks connection test successful');
      } catch (error) {
        logger.error('QuickBooks connection test failed:', error);
        results.quickbooks = {
          connected: false,
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    logger.error('Connection test error:', error);
    next(error);
  }
});

module.exports = router;
