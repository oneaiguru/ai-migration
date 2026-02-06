const express = require('express');
const router = express.Router();
const SalesforceAPI = require('../services/salesforce-api');
const QuickBooksAPI = require('../services/quickbooks-api');
const { mapOpportunityToInvoice, convertProductsForCurrency } = require('../transforms/opportunity-to-invoice');
const logger = require('../utils/logger');
const { apiKeyAuth, AppError } = require('../middleware/error-handler');

const normalizeCurrencyCode = (currency) => {
  if (typeof currency !== 'string') {
    return null;
  }
  const trimmed = currency.trim();
  return trimmed ? trimmed.toUpperCase() : null;
};

const normalizeFxRate = (fxRate) => {
  const numericRate = Number(fxRate);
  return Number.isFinite(numericRate) ? numericRate : null;
};

const resolveExistingCustomerCurrency = async (qbApi, customerId, customerCurrency) => {
  const normalizedCurrency = normalizeCurrencyCode(customerCurrency);
  if (normalizedCurrency) {
    return normalizedCurrency;
  }

  try {
    const customerResponse = await qbApi.getCustomer(customerId);
    const customerRecord = customerResponse.Customer || customerResponse.QueryResponse?.Customer?.[0];
    const fallbackCurrency = normalizeCurrencyCode(customerRecord?.CurrencyRef?.value);
    if (fallbackCurrency) {
      return fallbackCurrency;
    }
  } catch (error) {
    if (error.isAuthError) {
      throw error;
    }
    logger.warn('Unable to fetch QuickBooks customer currency', {
      customerId,
      error: error.message
    });
  }

  return null;
};

const resolveInvoiceCurrencyPolicy = () => {
  const raw = String(process.env.QB_INVOICE_CURRENCY_POLICY || 'opportunity').trim().toLowerCase();
  return raw === 'customer' ? 'customer' : 'opportunity';
};

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

    // Use provided instance URL or fall back to config
    const sfInstance = salesforceInstance || process.env.SF_INSTANCE_URL;
    if (!sfInstance) {
      throw new AppError('Salesforce instance URL is required (provide in request body or set SF_INSTANCE_URL)', 400, 'MISSING_SALESFORCE_INSTANCE');
    }

    if (!quickbooksRealm) {
      throw new AppError('QuickBooks realm ID is required', 400, 'MISSING_QUICKBOOKS_REALM');
    }

    logger.debug(`Opportunity-to-invoice: opportunityId=${opportunityId}, instance=${sfInstance}, realm=${quickbooksRealm}`);

    // Initialize API clients
    const sfApi = new SalesforceAPI(sfInstance);
    const qbApi = new QuickBooksAPI(quickbooksRealm);

    const existingInvoice = await qbApi.findInvoiceByOpportunityId(opportunityId);
    if (existingInvoice) {
      const reconciledInvoiceId = existingInvoice.Id;
      const reconciledInvoiceNumber = existingInvoice.DocNumber || null;
      await sfApi.updateRecord('Opportunity', opportunityId, {
        QB_Invoice_ID__c: reconciledInvoiceId,
        ...(reconciledInvoiceNumber ? { QB_Invoice_Number__c: reconciledInvoiceNumber } : {}),
        QB_Sync_Status__c: 'Success',
        QB_Error_Message__c: 'Reconciled with existing invoice'
      });

      let paymentLink = null;
      let paymentLinkStatus = null;
      let paymentLinkMessage = null;
      try {
        const linkResult = await qbApi.getInvoicePaymentLinkDetails(existingInvoice.Id);
        paymentLink = linkResult.link || null;
        paymentLinkStatus = linkResult.reason;
        paymentLinkMessage = linkResult.message || null;

        await sfApi.updateRecord('Opportunity', opportunityId, {
          QB_Invoice_ID__c: reconciledInvoiceId,
          ...(reconciledInvoiceNumber ? { QB_Invoice_Number__c: reconciledInvoiceNumber } : {}),
          QB_Payment_Link_Status__c: paymentLinkStatus,
          QB_Error_Message__c: paymentLink ? null : paymentLinkMessage,
          ...(paymentLink ? { QB_Payment_Link__c: paymentLink } : {})
        });
      } catch (linkError) {
        logger.warn('Could not retrieve payment link for existing invoice:', linkError.message);
      }

      return res.json({
        success: true,
        qbInvoiceId: existingInvoice.Id,
        paymentLink,
        paymentLinkStatus,
        paymentLinkMessage,
        reconciled: true
      });
    }
    
    // Get Opportunity data from Salesforce
    logger.info(`Fetching Opportunity data from Salesforce: ${opportunityId}`);
    const opportunityData = await sfApi.getOpportunityWithRelatedData(opportunityId);
    
    const billingEmail = opportunityData.billingEmail?.trim() || '';
    logger.info(
      `Billing email for customer: ${billingEmail || '(none)'} (source: ${opportunityData.emailSource || 'unknown'})`
    );

    // Get currency from Opportunity (default to USD if not set)
    const sourceCurrency = normalizeCurrencyCode(opportunityData.opportunity.CurrencyIsoCode) || 'USD';
    logger.info(`Opportunity currency for ${opportunityData.account.Name}: ${sourceCurrency}`);

    // Create or find customer in QuickBooks
    logger.info(`Creating/finding customer in QuickBooks: ${opportunityData.account.Name}`);
    const normalizedBillingEmail = billingEmail && billingEmail.trim();
    const customerData = {
      DisplayName: opportunityData.account.Name,
      CompanyName: opportunityData.account.Name,
      CurrencyRef: {
        value: sourceCurrency
      },
      ...(normalizedBillingEmail && {
        PrimaryEmailAddr: {
          Address: normalizedBillingEmail
        }
      }),
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
    
    const customerResult = await qbApi.findOrCreateCustomer(customerData);
    const customerResultIsObject = customerResult && typeof customerResult === 'object';
    const qbCustomerId = customerResult?.id ?? customerResult;
    const isExistingCustomer = customerResultIsObject ? customerResult.isExisting : true;
    const customerCurrency = customerResultIsObject ? customerResult.currency : null;

    if (!qbCustomerId) {
      throw new AppError(
        'QuickBooks customer ID missing after create/find',
        502,
        'QB_CUSTOMER_ID_MISSING'
      );
    }

    const invoiceCurrencyPolicy = resolveInvoiceCurrencyPolicy();
    let targetCurrency = sourceCurrency;

    if (invoiceCurrencyPolicy === 'opportunity') {
      // Roman client checkpoint: force Opportunity currency if configured
      targetCurrency = sourceCurrency;

      if (isExistingCustomer) {
        const resolvedCurrency = await resolveExistingCustomerCurrency(
          qbApi,
          qbCustomerId,
          customerCurrency
        );
        if (resolvedCurrency && resolvedCurrency !== sourceCurrency) {
          logger.info(
            `Note: Existing QB customer ${qbCustomerId} has ${resolvedCurrency}, ` +
            `using Opportunity currency ${sourceCurrency} (QB_INVOICE_CURRENCY_POLICY=opportunity)`
          );
        }
      }
    } else {
      if (isExistingCustomer) {
        const resolvedCurrency = await resolveExistingCustomerCurrency(
          qbApi,
          qbCustomerId,
          customerCurrency
        );
        if (!resolvedCurrency) {
          throw new AppError(
            `Existing customer ${qbCustomerId} currency is unavailable in QuickBooks`,
            422,
            'QB_CUSTOMER_CURRENCY_UNKNOWN'
          );
        }
        targetCurrency = resolvedCurrency;
      } else {
        const createdCurrency = normalizeCurrencyCode(customerCurrency);
        if (createdCurrency) {
          targetCurrency = createdCurrency;
        }
      }
    }

    let fxRate = null;
    let convertedProducts = opportunityData.products;
    let warningCode = null;
    let warningMessage = null;

    let conversionSourceCurrency = sourceCurrency;
    let conversionSourceType = 'opportunity';

    // If OpportunityLineItems have different currency than Opportunity, convert from product currency
    let productCurrency = null;
    if (opportunityData.products && opportunityData.products.length > 0) {
      productCurrency = normalizeCurrencyCode(opportunityData.products[0].CurrencyIsoCode);
    }

    if (productCurrency && productCurrency !== sourceCurrency) {
      conversionSourceCurrency = productCurrency;
      conversionSourceType = 'product';
    }

    if (conversionSourceCurrency !== targetCurrency) {
      const asOfDate = new Date().toISOString().split('T')[0];
      try {
        fxRate = await qbApi.getExchangeRate(conversionSourceCurrency, targetCurrency, asOfDate);
      } catch (fxError) {
        throw new AppError(
          `FX rate API error: ${fxError.message}`,
          502,
          conversionSourceType === 'product' ? 'PRODUCT_CURRENCY_CONVERSION_ERROR' : 'FX_RATE_API_ERROR'
        );
      }
      const normalizedFxRate = normalizeFxRate(fxRate);
      if (!normalizedFxRate || normalizedFxRate <= 0) {
        throw new AppError(
          `No FX rate for ${conversionSourceCurrency} -> ${targetCurrency} as of ${asOfDate}`,
          422,
          conversionSourceType === 'product' ? 'PRODUCT_FX_RATE_MISSING' : 'FX_RATE_MISSING'
        );
      }
      fxRate = normalizedFxRate;
      convertedProducts = convertProductsForCurrency(opportunityData.products, fxRate);

      if (conversionSourceType === 'product' && targetCurrency === sourceCurrency) {
        warningCode = 'PRODUCT_CURRENCY_CONVERTED';
        warningMessage = `Converted product prices from ${conversionSourceCurrency} to ${targetCurrency} at ${fxRate} as of ${asOfDate}`;
        logger.info(warningMessage);
      } else {
        warningCode = 'CURRENCY_MISMATCH_CONVERTED';
        warningMessage = `Converted ${conversionSourceCurrency} to ${targetCurrency} at ${fxRate} as of ${asOfDate}`;
      }
    }
    
    // Transform Opportunity to Invoice (include billing email for payment link)
    logger.info('Transforming Opportunity data to QuickBooks Invoice format');
    const invoiceData = mapOpportunityToInvoice(
      opportunityData.opportunity,
      opportunityData.account,
      convertedProducts,
      qbCustomerId,
      billingEmail,  // Pass billing email for BillEmail field
      targetCurrency // Pass currency for CurrencyRef field
    );
    
    // Create Invoice in QuickBooks
    logger.info('Creating Invoice in QuickBooks');
    // Prefer TxnDate for FX lookup when available
    const txnDate = invoiceData?.TxnDate || null;
    if (txnDate && fxRate === null && conversionSourceCurrency !== targetCurrency) {
      // If fxRate not already fetched (shouldn't happen), attempt with txnDate
      try {
        fxRate = await qbApi.getExchangeRate(conversionSourceCurrency, targetCurrency, txnDate);
      } catch (fxError) {
        logger.warn(`FX rate lookup on txnDate ${txnDate} failed: ${fxError.message}`);
      }
    }

    const invoiceResponse = await qbApi.createInvoice(invoiceData);
    
    // Extract QB Invoice ID from response structure
    const qbInvoiceId = invoiceResponse.QueryResponse?.Invoice?.[0]?.Id || 
                       invoiceResponse.Invoice?.Id || 
                       invoiceResponse.Id;
    
    logger.info(`QuickBooks Invoice Response structure:`, { 
      hasQueryResponse: !!invoiceResponse.QueryResponse,
      hasInvoice: !!invoiceResponse.Invoice,
      hasDirectId: !!invoiceResponse.Id,
      extractedId: qbInvoiceId
    });
    
    if (!qbInvoiceId) {
      throw new Error('Failed to extract QuickBooks Invoice ID from response');
    }
    
    // Update Salesforce with QuickBooks Invoice ID
    logger.info(`Updating Salesforce Opportunity with QuickBooks Invoice ID: ${qbInvoiceId}`);
    await sfApi.updateOpportunityWithQBInvoiceId(opportunityId, qbInvoiceId);

    // Fetch payment link for the invoice
    let paymentLink = null;
    let paymentLinkStatus = null;
    let paymentLinkMessage = null;
    try {
      logger.info(`Fetching payment link for invoice: ${qbInvoiceId}`);
      const linkResult = await qbApi.getInvoicePaymentLinkDetails(qbInvoiceId);
      paymentLink = linkResult.link || null;
      paymentLinkStatus = linkResult.reason;
      paymentLinkMessage = linkResult.message || null;
      logger.info(`Payment link obtained: ${paymentLink ? 'yes' : 'no'}`);

      await sfApi.updateRecord('Opportunity', opportunityId, {
        QB_Invoice_ID__c: qbInvoiceId,
        QB_Payment_Link_Status__c: paymentLinkStatus,
        QB_Error_Message__c: paymentLink ? null : paymentLinkMessage,
        ...(paymentLink ? { QB_Payment_Link__c: paymentLink } : {})
      });
    } catch (error) {
      logger.warn('Could not retrieve payment link:', error.message);
      // Payment link is optional, don't fail if we can't get it
    }

    res.json({
      success: true,
      qbInvoiceId: qbInvoiceId,
      paymentLink: paymentLink,
      paymentLinkStatus: paymentLinkStatus,
      paymentLinkMessage: paymentLinkMessage,
      ...(warningCode ? { warningCode, warningMessage } : {}),
      ...(fxRate ? { fxRate, sourceCurrency, targetCurrency } : {}),
      message: 'Invoice created successfully in QuickBooks'
    });
  } catch (error) {
    if (error.isAuthError) {
      return res.status(401).json({
        success: false,
        errorCode: error.code,
        error: error.message,
        reauthorizeUrl: 'https://sqint.atocomm.eu/auth/quickbooks'
      });
    }
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

/**
 * Update an existing QuickBooks invoice with new line items
 * Allows Roman to update invoice products after initial creation
 */
router.post('/update-invoice', async (req, res, next) => {
  try {
    const { opportunityId, qbInvoiceId, salesforceInstance, quickbooksRealm } = req.body;

    if (!opportunityId || !qbInvoiceId) {
      throw new AppError('Opportunity ID and QuickBooks Invoice ID are required', 400, 'MISSING_IDS');
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

    logger.info(`Updating invoice: Opportunity=${opportunityId}, QB Invoice=${qbInvoiceId}`);

    // Get latest Opportunity data from Salesforce (including any new products)
    logger.info(`Fetching updated Opportunity data from Salesforce: ${opportunityId}`);
    const opportunityData = await sfApi.getOpportunityWithRelatedData(opportunityId);

    const billingEmail = opportunityData.billingEmail?.trim() || '';
    logger.info(
      `Billing email for invoice update: ${billingEmail || '(none)'} (source: ${opportunityData.emailSource || 'unknown'})`
    );
    const sourceCurrency = normalizeCurrencyCode(opportunityData.opportunity.CurrencyIsoCode) || 'USD';

    const invoiceResponse = await qbApi.getInvoice(qbInvoiceId);
    const invoiceRecord = invoiceResponse.Invoice || invoiceResponse.QueryResponse?.Invoice?.[0];
    if (!invoiceRecord) {
      throw new AppError(`Invoice ${qbInvoiceId} not found in QuickBooks`, 404, 'INVOICE_NOT_FOUND');
    }

    let targetCurrency = normalizeCurrencyCode(invoiceRecord.CurrencyRef?.value);
    const customerId = invoiceRecord.CustomerRef?.value || null;
    if (!targetCurrency && customerId) {
      const customerResponse = await qbApi.getCustomer(customerId);
      const customerRecord = customerResponse.Customer || customerResponse.QueryResponse?.Customer?.[0];
      targetCurrency = normalizeCurrencyCode(customerRecord?.CurrencyRef?.value);
    }
    let fxRate = null;
    let convertedProducts = opportunityData.products;
    let warningCode = null;
    let warningMessage = null;

    if (!targetCurrency) {
      const companyCurrency = await qbApi.getCompanyCurrency();
      if (companyCurrency) {
        targetCurrency = companyCurrency;
        warningCode = 'CURRENCY_DEFAULTED';
        warningMessage = `Using QuickBooks company currency ${companyCurrency} because CurrencyRef is missing for invoice ${qbInvoiceId}`;
        logger.info(warningMessage);
      } else {
        targetCurrency = sourceCurrency;
        warningCode = 'CURRENCY_DEFAULTED';
        warningMessage = `CurrencyRef missing; defaulting to source currency ${sourceCurrency}`;
        logger.warn(`CurrencyRef missing for invoice ${qbInvoiceId}; defaulting to source currency ${sourceCurrency}`);
      }
    }
    if (!targetCurrency) {
      throw new AppError(
        `Unable to determine currency for invoice ${qbInvoiceId}`,
        422,
        'QB_CUSTOMER_CURRENCY_UNKNOWN'
      );
    }

    if (sourceCurrency !== targetCurrency) {
      const asOfDate = invoiceRecord.TxnDate || new Date().toISOString().split('T')[0];
      try {
        fxRate = await qbApi.getExchangeRate(sourceCurrency, targetCurrency, asOfDate);
      } catch (fxError) {
        throw new AppError(`FX rate API error: ${fxError.message}`, 502, 'FX_RATE_API_ERROR');
      }
      const normalizedFxRate = normalizeFxRate(fxRate);
      if (!normalizedFxRate || normalizedFxRate <= 0) {
        throw new AppError(`No FX rate for ${sourceCurrency} -> ${targetCurrency} as of ${asOfDate}`, 422, 'FX_RATE_MISSING');
      }
      fxRate = normalizedFxRate;
      convertedProducts = convertProductsForCurrency(opportunityData.products, fxRate);
      warningCode = 'CURRENCY_MISMATCH_CONVERTED';
      warningMessage = `Converted ${sourceCurrency} to ${targetCurrency} at ${fxRate} as of ${asOfDate}`;
    }

    // For updates, we don't need qbCustomerId since CustomerRef is preserved from existing invoice
    // Pass placeholder - the CustomerRef won't be used in the update payload
    const placeholderCustomerId = 'EXISTING_CUSTOMER';

    // Transform the updated Opportunity products to invoice line items
    logger.info('Transforming updated Opportunity data to new line items');
    const invoiceData = mapOpportunityToInvoice(
      opportunityData.opportunity,
      opportunityData.account,
      convertedProducts,
      placeholderCustomerId,  // Not used - existing CustomerRef preserved in updateInvoice
      billingEmail,
      targetCurrency
    );

    const lineItems = Array.isArray(invoiceData.Line) ? invoiceData.Line : [];

    if (lineItems.length === 0) {
      logger.warn(`No products found on Opportunity ${opportunityId}; keeping existing QuickBooks invoice lines`);
    }

    // Update the invoice in QuickBooks with new line items (preserve existing QB dates)
    logger.info(`Updating invoice ${qbInvoiceId} in QuickBooks with new products`);
    const updatedInvoice = await qbApi.updateInvoice(qbInvoiceId, {
      ...(lineItems.length ? { Line: lineItems } : {}),
      CustomerMemo: invoiceData.CustomerMemo,
      ...(invoiceData.BillEmail ? { BillEmail: invoiceData.BillEmail } : {}) // avoid clearing existing BillEmail when SF has none
    });

    logger.info(`Invoice ${qbInvoiceId} updated successfully in QuickBooks`);

    // Fetch updated payment link if QB Payments is enabled
    let paymentLink = null;
    let paymentLinkStatus = null;
    let paymentLinkMessage = null;
    try {
      logger.info(`Fetching payment link for updated invoice: ${qbInvoiceId}`);
      const linkResult = await qbApi.getInvoicePaymentLinkDetails(qbInvoiceId);
      paymentLink = linkResult.link || null;
      paymentLinkStatus = linkResult.reason;
      paymentLinkMessage = linkResult.message || null;
      logger.info(`Payment link for updated invoice: ${paymentLink ? 'yes' : 'no'}`);

      await sfApi.updateRecord('Opportunity', opportunityId, {
        QB_Invoice_ID__c: qbInvoiceId,
        QB_Payment_Link_Status__c: paymentLinkStatus,
        QB_Error_Message__c: paymentLink ? null : paymentLinkMessage,
        ...(paymentLink ? { QB_Payment_Link__c: paymentLink } : {})
      });
    } catch (linkError) {
      logger.warn('Could not retrieve payment link for updated invoice:', linkError.message);
      // Payment link is optional, don't fail if we can't get it
    }

    res.json({
      success: true,
      qbInvoiceId: qbInvoiceId,
      paymentLink: paymentLink,
      paymentLinkStatus: paymentLinkStatus,
      paymentLinkMessage: paymentLinkMessage,
      ...(warningCode ? { warningCode, warningMessage } : {}),
      ...(fxRate ? { fxRate, sourceCurrency, targetCurrency } : {}),
      message: 'Invoice updated successfully in QuickBooks'
    });
  } catch (error) {
    if (error.isAuthError) {
      return res.status(401).json({
        success: false,
        errorCode: error.code,
        error: error.message,
        reauthorizeUrl: 'https://sqint.atocomm.eu/auth/quickbooks'
      });
    }
    logger.error('Error updating invoice:', error);
    next(error);
  }
});

module.exports = router;
