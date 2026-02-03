const express = require('express');
const router = express.Router();
const oauthManager = require('../services/oauth-manager');
const salesforceApi = require('../services/salesforce');
const quickbooksApi = require('../services/quickbooks');
const config = require('../config');

// Middleware for API key authentication
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== config.security.apiKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid API key' 
    });
  }
  
  next();
};

// Salesforce OAuth flow start
router.get('/auth/salesforce', (req, res) => {
  const authUrl = oauthManager.getSalesforceAuthUrl();
  res.redirect(authUrl);
});

// Salesforce OAuth callback
router.get('/auth/salesforce/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: code'
      });
    }
    
    // Exchange code for token
    const tokenData = await oauthManager.exchangeSalesforceCode(code, state);
    
    // Store the tokens
    await oauthManager.storeOAuthTokens('salesforce', tokenData);
    
    res.send(`
      <h1>Salesforce Authentication Successful</h1>
      <p>Instance URL: ${tokenData.instanceUrl}</p>
      <p>You can now close this window and continue with the integration.</p>
    `);
  } catch (error) {
    console.error('Error in Salesforce callback:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// QuickBooks OAuth flow start
router.get('/auth/quickbooks', (req, res) => {
  const authUrl = oauthManager.getQuickBooksAuthUrl();
  res.redirect(authUrl);
});

// QuickBooks OAuth callback
router.get('/auth/quickbooks/callback', async (req, res) => {
  try {
    const { code, realmId, state } = req.query;
    
    if (!code || !realmId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: code or realmId'
      });
    }
    
    // Exchange code for token
    const tokenData = await oauthManager.exchangeQuickBooksCode(code, realmId);
    
    // Store the tokens
    await oauthManager.storeOAuthTokens('quickbooks', tokenData);
    
    res.send(`
      <h1>QuickBooks Authentication Successful</h1>
      <p>QuickBooks company ID (Realm ID): ${realmId}</p>
      <p>You can now close this window and continue with the integration.</p>
    `);
  } catch (error) {
    console.error('Error in QuickBooks callback:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Get OAuth status
router.get('/auth/status', apiKeyAuth, async (req, res) => {
  const tokens = oauthManager.initializeTokenStorage();
  
  // Check QuickBooks connections
  const qbConnected = Object.keys(tokens.quickbooks || {}).length > 0;
  const qbCompanies = Object.keys(tokens.quickbooks || {}).map(realmId => ({
    realmId,
    expiresAt: new Date(tokens.quickbooks[realmId].expiresAt).toISOString()
  }));
  
  // Check Salesforce connections
  const sfConnected = Object.keys(tokens.salesforce || {}).length > 0;
  const sfInstances = Object.keys(tokens.salesforce || {}).map(instanceUrl => ({
    instanceUrl,
    expiresAt: new Date(tokens.salesforce[instanceUrl].expiresAt).toISOString()
  }));
  
  res.json({
    success: true,
    status: {
      salesforce: { 
        connected: sfConnected,
        instances: sfInstances
      },
      quickbooks: {
        connected: qbConnected,
        companies: qbCompanies
      }
    }
  });
});

// Create QuickBooks invoice from Salesforce opportunity
router.post('/api/create-invoice', apiKeyAuth, async (req, res) => {
  try {
    const { opportunityId, quickbooksRealmId, salesforceInstanceUrl } = req.body;
    
    if (!opportunityId || !quickbooksRealmId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Get the default instance URL if not provided
    const instanceUrl = salesforceInstanceUrl || 
                       Object.keys(oauthManager.initializeTokenStorage().salesforce)[0];
    
    if (!instanceUrl) {
      return res.status(400).json({
        success: false,
        error: 'No Salesforce instance available'
      });
    }
    
    // Get opportunity data from Salesforce
    const opportunityData = await salesforceApi.getOpportunity(opportunityId, instanceUrl);
    
    // Create the invoice in QuickBooks
    const invoice = await quickbooksApi.createInvoiceFromOpportunity(
      quickbooksRealmId, 
      opportunityData
    );
    
    // Update Salesforce with the QuickBooks invoice ID
    await salesforceApi.updateOpportunityWithInvoiceId(
      opportunityId,
      invoice.Id,
      instanceUrl
    );
    
    res.json({
      success: true,
      invoice: {
        id: invoice.Id,
        docNumber: invoice.DocNumber,
        total: invoice.TotalAmt
      }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;