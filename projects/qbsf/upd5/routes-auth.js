/**
 * Authentication routes for Salesforce and QuickBooks OAuth flows
 * Handles OAuth authorization and callback endpoints
 */
const express = require('express');
const router = express.Router();
const oauthManager = require('../services/oauth-manager');
const logger = require('../utils/logger');
const { asyncHandler, AppError } = require('../middleware/error-handler');

/**
 * Check authentication status for both services
 * GET /auth/status
 */
router.get('/status', asyncHandler(async (req, res) => {
  try {
    const tokens = await oauthManager.initializeTokenStorage();
    
    const salesforceInstances = Object.keys(tokens.salesforce || {});
    const quickbooksRealms = Object.keys(tokens.quickbooks || {});
    
    // Calculate token expiry status
    const now = Date.now();
    
    const salesforceStatus = salesforceInstances.map(instance => ({
      instance,
      connected: true,
      expiresAt: tokens.salesforce[instance].expiresAt,
      expired: now >= tokens.salesforce[instance].expiresAt
    }));
    
    const quickbooksStatus = quickbooksRealms.map(realm => ({
      realm,
      connected: true,
      expiresAt: tokens.quickbooks[realm].expiresAt,
      expired: now >= tokens.quickbooks[realm].expiresAt
    }));
    
    res.json({
      success: true,
      salesforce: {
        connected: salesforceInstances.length > 0,
        instances: salesforceStatus
      },
      quickbooks: {
        connected: quickbooksRealms.length > 0,
        realms: quickbooksStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error checking auth status:', error);
    throw new AppError('Failed to check authentication status', 500, 'AUTH_STATUS_ERROR');
  }
}));

/**
 * Initialize Salesforce OAuth flow
 * GET /auth/salesforce
 */
router.get('/salesforce', (req, res) => {
  try {
    const authUrl = oauthManager.getSalesforceAuthUrl();
    logger.info('Initiating Salesforce OAuth flow');
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error initiating Salesforce auth:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate Salesforce authorization'
    });
  }
});

/**
 * Handle Salesforce OAuth callback
 * GET /auth/salesforce/callback
 */
router.get('/salesforce/callback', asyncHandler(async (req, res) => {
  try {
    const { code, state, error: authError, error_description } = req.query;
    
    // Check for OAuth errors
    if (authError) {
      logger.error('Salesforce OAuth error:', { error: authError, description: error_description });
      throw new AppError(error_description || 'Salesforce authorization failed', 400, 'SALESFORCE_AUTH_ERROR');
    }
    
    if (!code) {
      throw new AppError('No authorization code received', 400, 'NO_AUTH_CODE');
    }
    
    logger.info('Processing Salesforce OAuth callback');
    
    // Exchange code for tokens
    const tokenData = await oauthManager.exchangeSalesforceCode(code);
    
    // Store tokens
    const stored = await oauthManager.storeOAuthTokens('salesforce', tokenData);
    
    if (stored) {
      logger.info('Salesforce tokens stored successfully', { instanceUrl: tokenData.instanceUrl });
      
      // Create a simple HTML response with success message
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Salesforce Authorization</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
              .success { color: #28a745; }
              .error { color: #dc3545; }
            </style>
          </head>
          <body>
            <h2 class="success">✓ Salesforce Authorization Successful</h2>
            <p>You have successfully connected to Salesforce instance:</p>
            <p><strong>${tokenData.instanceUrl}</strong></p>
            <p>You can now close this window and return to the application.</p>
            <hr>
            <p><a href="/auth/status">Check Auth Status</a></p>
          </body>
        </html>
      `);
    } else {
      throw new AppError('Failed to store Salesforce tokens', 500, 'TOKEN_STORAGE_ERROR');
    }
  } catch (error) {
    logger.error('Salesforce callback error:', error);
    
    // Create an error HTML response
    res.status(error.statusCode || 500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salesforce Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h2 class="error">✗ Salesforce Authorization Failed</h2>
          <p>${error.message}</p>
          <p>Please try again or contact support if the issue persists.</p>
          <hr>
          <p><a href="/auth/salesforce">Try Again</a></p>
        </body>
      </html>
    `);
  }
}));

/**
 * Initialize QuickBooks OAuth flow
 * GET /auth/quickbooks
 */
router.get('/quickbooks', (req, res) => {
  try {
    const authUrl = oauthManager.getQuickBooksAuthUrl();
    logger.info('Initiating QuickBooks OAuth flow');
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error initiating QuickBooks auth:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate QuickBooks authorization'
    });
  }
});

/**
 * Handle QuickBooks OAuth callback
 * GET /auth/quickbooks/callback
 */
router.get('/quickbooks/callback', asyncHandler(async (req, res) => {
  try {
    const { code, state, realmId, error: authError, error_description } = req.query;
    
    // Check for OAuth errors
    if (authError) {
      logger.error('QuickBooks OAuth error:', { error: authError, description: error_description });
      throw new AppError(error_description || 'QuickBooks authorization failed', 400, 'QUICKBOOKS_AUTH_ERROR');
    }
    
    if (!code) {
      throw new AppError('No authorization code received', 400, 'NO_AUTH_CODE');
    }
    
    if (!realmId) {
      throw new AppError('No realm ID received', 400, 'NO_REALM_ID');
    }
    
    logger.info('Processing QuickBooks OAuth callback', { realmId });
    
    // Exchange code for tokens
    const tokenData = await oauthManager.exchangeQuickBooksCode(code, realmId);
    
    // Store tokens
    const stored = await oauthManager.storeOAuthTokens('quickbooks', tokenData);
    
    if (stored) {
      logger.info('QuickBooks tokens stored successfully', { realmId });
      
      // Create a simple HTML response with success message
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QuickBooks Authorization</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
              .success { color: #28a745; }
              .error { color: #dc3545; }
            </style>
          </head>
          <body>
            <h2 class="success">✓ QuickBooks Authorization Successful</h2>
            <p>You have successfully connected to QuickBooks company:</p>
            <p><strong>Realm ID: ${realmId}</strong></p>
            <p>You can now close this window and return to the application.</p>
            <hr>
            <p><a href="/auth/status">Check Auth Status</a></p>
          </body>
        </html>
      `);
    } else {
      throw new AppError('Failed to store QuickBooks tokens', 500, 'TOKEN_STORAGE_ERROR');
    }
  } catch (error) {
    logger.error('QuickBooks callback error:', error);
    
    // Create an error HTML response
    res.status(error.statusCode || 500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QuickBooks Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h2 class="error">✗ QuickBooks Authorization Failed</h2>
          <p>${error.message}</p>
          <p>Please try again or contact support if the issue persists.</p>
          <hr>
          <p><a href="/auth/quickbooks">Try Again</a></p>
        </body>
      </html>
    `);
  }
}));

/**
 * Revoke QuickBooks authentication
 * POST /auth/quickbooks/revoke
 */
router.post('/quickbooks/revoke', asyncHandler(async (req, res) => {
  try {
    const { realmId } = req.body;
    
    if (!realmId) {
      throw new AppError('Realm ID required', 400, 'REALM_ID_REQUIRED');
    }
    
    logger.info('Revoking QuickBooks authentication', { realmId });
    
    await oauthManager.revokeQuickBooksTokens(realmId);
    
    res.json({
      success: true,
      message: 'QuickBooks authentication revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking QuickBooks auth:', error);
    throw new AppError('Failed to revoke QuickBooks authentication', 500, 'REVOKE_ERROR');
  }
}));

module.exports = router;
