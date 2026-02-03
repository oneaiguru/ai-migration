const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');
const QuickBooks = require('node-quickbooks');
const { saveToken, getToken } = require('../services/token-manager');
const crypto = require('crypto');

// Salesforce OAuth URL
router.get('/salesforce', (req, res) => {
  const oauth2 = new jsforce.OAuth2({
    loginUrl: process.env.SF_LOGIN_URL,
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    redirectUri: process.env.SF_REDIRECT_URI
  });

  const authUrl = oauth2.getAuthorizationUrl({
    state: crypto.randomBytes(16).toString('hex')
  });

  res.redirect(authUrl);
});

// Salesforce callback
router.get('/salesforce/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    const oauth2 = new jsforce.OAuth2({
      loginUrl: process.env.SF_LOGIN_URL,
      clientId: process.env.SF_CLIENT_ID,
      clientSecret: process.env.SF_CLIENT_SECRET,
      redirectUri: process.env.SF_REDIRECT_URI
    });

    const conn = new jsforce.Connection({ oauth2 });
    await conn.authorize(code);

    // Save token
    await saveToken('salesforce', conn.instanceUrl, {
      accessToken: conn.accessToken,
      refreshToken: conn.refreshToken,
      instanceUrl: conn.instanceUrl
    });

    res.send('Salesforce authentication successful! You can close this window.');
  } catch (error) {
    console.error('Salesforce auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// QuickBooks OAuth URL
router.get('/quickbooks', (req, res) => {
  const authUrl = QuickBooks.authorizeUrl({
    consumerKey: process.env.QB_CLIENT_ID,
    consumerSecret: process.env.QB_CLIENT_SECRET,
    callback: process.env.QB_REDIRECT_URI,
    environment: process.env.QB_ENVIRONMENT
  });

  res.redirect(authUrl);
});

// QuickBooks callback
router.get('/quickbooks/callback', async (req, res) => {
  try {
    const { code, realmId } = req.query;

    if (!code || !realmId) {
      return res.status(400).json({ error: 'Missing code or realmId' });
    }

    // Exchange code for tokens
    const qbo = new QuickBooks(
      process.env.QB_CLIENT_ID,
      process.env.QB_CLIENT_SECRET,
      code,
      false,
      realmId,
      process.env.QB_ENVIRONMENT === 'sandbox',
      true
    );

    // Save token
    await saveToken('quickbooks', realmId, {
      accessToken: qbo.token,
      refreshToken: qbo.refreshToken,
      realmId
    });

    res.send('QuickBooks authentication successful! You can close this window.');
  } catch (error) {
    console.error('QuickBooks auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get auth status
router.get('/status', async (req, res) => {
  try {
    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        salesforce: {
          authenticated: true,
          instances: ['demo-instance']
        },
        quickbooks: {
          authenticated: true,
          realms: ['demo-realm']
        }
      });
    }

    const sfTokens = await getToken('salesforce');
    const qbTokens = await getToken('quickbooks');

    res.json({
      salesforce: {
        authenticated: Object.keys(sfTokens || {}).length > 0,
        instances: Object.keys(sfTokens || {})
      },
      quickbooks: {
        authenticated: Object.keys(qbTokens || {}).length > 0,
        realms: Object.keys(qbTokens || {})
      }
    });
  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;