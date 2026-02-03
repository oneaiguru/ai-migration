cat > src/routes/auth.js << 'EOL'
/**
 * Authentication routes for OAuth flows
 */
const express = require('express');
const router = express.Router();
const oauthManager = require('../services/oauth-manager');
const logger = require('../utils/logger');
const { apiKeyAuth } = require('../middleware/error-handler');

// Salesforce OAuth flow start
router.get('/salesforce', (req, res) => {
  const authUrl = oauthManager.getSalesforceAuthUrl();
  res.redirect(authUrl);
});

// Salesforce OAuth callback
router.get('/salesforce/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: code'
      });
    }
    
    // Exchange code for token using PKCE
    const tokenData = await oauthManager.exchangeSalesforceCode(code);
    
    // Store the tokens
    await oauthManager.storeOAuthTokens('salesforce', tokenData);
    
    res.send(`
      <h1>Salesforce Authentication Successful</h1>
      <p>Instance URL: ${tokenData.instanceUrl}</p>
      <p>You can now close this window and continue with the integration.</p>
    `);
  } catch (error) {
    logger.error('Error in Salesforce callback:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// QuickBooks OAuth flow start
router.get('/quickbooks', (req, res) => {
  const authUrl = oauthManager.getQuickBooksAuthUrl();
  res.redirect(authUrl);
});

// QuickBooks OAuth callback
router.get('/quickbooks/callback', async (req, res, next) => {
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
    logger.error('Error in QuickBooks callback:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Get OAuth status - protected with API key
router.get('/status', apiKeyAuth, async (req, res) => {
  try {
    const tokens = oauthManager.initializeTokenStorage();
    
    // Check QuickBooks connections
    const qbConnected = Object.keys(tokens.quickbooks || {}).length > 0;
    const qbCompanies = Object.keys(tokens.quickbooks || {}).map(realmId => ({
      realmId,
      expiresAt: tokens.quickbooks[realmId].expiresAt
    }));
    
    // Check Salesforce connections
    const sfConnected = Object.keys(tokens.salesforce || {}).length > 0;
    const sfInstances = Object.keys(tokens.salesforce || {}).map(instanceUrl => ({
      instanceUrl,
      expiresAt: tokens.salesforce[instanceUrl].expiresAt
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
  } catch (error) {
    logger.error('Error getting OAuth status:', error);
    next(error);
  }
});

module.exports = router;
EOL
