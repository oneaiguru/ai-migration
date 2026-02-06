const express = require('express');
const router = express.Router();
const oauthManager = require('../services/oauth-manager');
const { oauthError, AppError } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Initiates Salesforce OAuth flow
 */
router.get('/salesforce', (req, res) => {
  const authUrl = oauthManager.getSalesforceAuthUrl();
  logger.info('Redirecting to Salesforce OAuth authorization');
  res.redirect(authUrl);
});

/**
 * Salesforce OAuth callback
 */
router.get('/salesforce/callback', oauthError, async (req, res, next) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      throw new AppError('Authorization code not provided', 400, 'INVALID_REQUEST');
    }
    
    // Exchange code for tokens
    const tokenData = await oauthManager.exchangeSalesforceCode(code);
    
    // Store tokens
    await oauthManager.storeOAuthTokens('salesforce', tokenData);
    
    logger.info('Salesforce OAuth authorization successful');
    
    // Redirect to success page or show success message
    res.send(`
      <html>
        <head><title>Authorization Successful</title></head>
        <body>
          <h1>Salesforce Authorization Successful</h1>
          <p>You can now close this window and return to the application.</p>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('Salesforce OAuth error:', error);
    next(error);
  }
});

/**
 * Initiates QuickBooks OAuth flow
 */
router.get('/quickbooks', (req, res) => {
  const authUrl = oauthManager.getQuickBooksAuthUrl();
  logger.info('Redirecting to QuickBooks OAuth authorization');
  res.redirect(authUrl);
});

/**
 * QuickBooks OAuth callback
 */
router.get('/quickbooks/callback', oauthError, async (req, res, next) => {
  try {
    const { code, realmId } = req.query;
    
    if (!code) {
      throw new AppError('Authorization code not provided', 400, 'INVALID_REQUEST');
    }
    
    if (!realmId) {
      throw new AppError('QuickBooks company ID (realmId) not provided', 400, 'INVALID_REQUEST');
    }
    
    // Exchange code for tokens
    const tokenData = await oauthManager.exchangeQuickBooksCode(code);
    
    // Add realmId to token data
    tokenData.realmId = realmId;
    
    // Store tokens
    await oauthManager.storeOAuthTokens('quickbooks', tokenData);
    
    logger.info('QuickBooks OAuth authorization successful', { realmId });
    
    // Redirect to success page or show success message
    res.send(`
      <html>
        <head><title>Authorization Successful</title></head>
        <body>
          <h1>QuickBooks Authorization Successful</h1>
          <p>You can now close this window and return to the application.</p>
          <p>Company ID: ${realmId}</p>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('QuickBooks OAuth error:', error);
    next(error);
  }
});

/**
 * Get OAuth status for both services
 */
router.get('/status', async (req, res, next) => {
  try {
    const status = {
      salesforce: {
        connected: false,
        instances: []
      },
      quickbooks: {
        connected: false,
        companies: []
      }
    };
    
    // Initialize token storage
    const tokens = await oauthManager.initializeTokenStorage();
    
    // Check Salesforce connections
    if (tokens.salesforce && Object.keys(tokens.salesforce).length > 0) {
      status.salesforce.connected = true;
      status.salesforce.instances = Object.keys(tokens.salesforce).map(instanceUrl => ({
        instanceUrl,
        expiresAt: new Date(tokens.salesforce[instanceUrl].expiresAt).toISOString()
      }));
    }
    
    // Check QuickBooks connections
    if (tokens.quickbooks && Object.keys(tokens.quickbooks).length > 0) {
      status.quickbooks.connected = true;
      status.quickbooks.companies = Object.keys(tokens.quickbooks).map(realmId => ({
        realmId,
        expiresAt: new Date(tokens.quickbooks[realmId].expiresAt).toISOString()
      }));
    }
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Error getting OAuth status:', error);
    next(error);
  }
});

module.exports = router;
