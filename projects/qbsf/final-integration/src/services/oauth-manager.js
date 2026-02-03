/**
 * OAuth manager for handling authentication with Salesforce and QuickBooks
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

// Secure token storage file path
const TOKEN_PATH = path.join(__dirname, '../../data/tokens.json');

// PKCE helper functions
function base64URLEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

// Initialize token storage
const initializeTokenStorage = () => {
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(TOKEN_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(TOKEN_PATH)) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({ salesforce: {}, quickbooks: {} }, null, 2));
    return { salesforce: {}, quickbooks: {} };
  }
  
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  } catch (error) {
    logger.error('Error reading token file:', error);
    return { salesforce: {}, quickbooks: {} };
  }
};

// Store tokens securely
const storeOAuthTokens = async (service, tokenData) => {
  try {
    const tokens = initializeTokenStorage();
    
    if (service === 'salesforce') {
      tokens.salesforce[tokenData.instanceUrl] = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken || null,
        instanceUrl: tokenData.instanceUrl,
        expiresAt: Date.now() + (tokenData.expiresIn * 1000)
      };
    } else if (service === 'quickbooks') {
      tokens.quickbooks[tokenData.realmId] = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        realmId: tokenData.realmId,
        expiresAt: Date.now() + (tokenData.expiresIn * 1000)
      };
    }
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    return tokens;
  } catch (error) {
    logger.error(`Error storing ${service} OAuth tokens:`, error);
    throw error;
  }
};

// Generate Salesforce authorization URL with PKCE
const getSalesforceAuthUrl = () => {
  // Generate code verifier for PKCE
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(verifier));
  
  // Save code verifier to a file for later use
  const verifierPath = path.join(__dirname, '../../data/sf_verifier.json');
  fs.writeFileSync(verifierPath, JSON.stringify({ verifier }));
  
  const baseUrl = `${config.salesforce.loginUrl}/services/oauth2/authorize`;
  const state = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: config.salesforce.clientId,
    response_type: 'code',
    redirect_uri: config.salesforce.redirectUri,
    state: state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Generate QuickBooks authorization URL
const getQuickBooksAuthUrl = () => {
  const baseUrl = 'https://appcenter.intuit.com/connect/oauth2';
  const state = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: config.quickbooks.clientId,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: config.quickbooks.redirectUri,
    state: state
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Exchange Salesforce authorization code for tokens using PKCE
const exchangeSalesforceCode = async (code) => {
  try {
    // Read saved code verifier
    const verifierPath = path.join(__dirname, '../../data/sf_verifier.json');
    let verifier;
    
    try {
      const verifierData = JSON.parse(fs.readFileSync(verifierPath, 'utf8'));
      verifier = verifierData.verifier;
    } catch (error) {
      throw new Error('Code verifier not found. Please restart the authentication process.');
    }
    
    // Exchange code for tokens
    const response = await axios({
      method: 'post',
      url: `${config.salesforce.loginUrl}/services/oauth2/token`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.salesforce.clientId,
        client_secret: config.salesforce.clientSecret,
        code_verifier: verifier,
        code: code,
        redirect_uri: config.salesforce.redirectUri
      }).toString()
    });
    
    // Delete the verifier file after successful exchange
    fs.unlinkSync(verifierPath);
    
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      instanceUrl: response.data.instance_url,
      expiresIn: response.data.expires_in || 7200 // Default to 2 hours if not provided
    };
  } catch (error) {
    logger.error('Error exchanging Salesforce code:', error.response?.data || error.message);
    throw error;
  }
};

// Exchange QuickBooks authorization code for tokens
const exchangeQuickBooksCode = async (code, realmId) => {
  try {
    // Exchange code for tokens
    const response = await axios({
      method: 'post',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${config.quickbooks.clientId}:${config.quickbooks.clientSecret}`).toString('base64')}`
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.quickbooks.redirectUri
      }).toString()
    });
    
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      realmId: realmId
    };
  } catch (error) {
    logger.error('Error exchanging QuickBooks code:', error.response?.data || error.message);
    throw error;
  }
};

// Get Salesforce access token, refreshing if necessary
const getSalesforceAccessToken = async (instanceUrl) => {
  const tokens = initializeTokenStorage();
  
  if (!tokens.salesforce[instanceUrl]) {
    throw new Error(`No token found for Salesforce instance: ${instanceUrl}`);
  }
  
  const tokenData = tokens.salesforce[instanceUrl];
  
  // If token is still valid, return it
  if (tokenData.expiresAt > Date.now() + 60000) { // 1 minute buffer
    return tokenData.accessToken;
  }
  
  // Refresh token
  try {
    const response = await axios({
      method: 'post',
      url: `${config.salesforce.loginUrl}/services/oauth2/token`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refreshToken,
        client_id: config.salesforce.clientId,
        client_secret: config.salesforce.clientSecret
      }).toString()
    });
    
    // Update token in storage
    tokens.salesforce[instanceUrl] = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || tokenData.refreshToken,
      instanceUrl: instanceUrl,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    return tokens.salesforce[instanceUrl].accessToken;
  } catch (error) {
    logger.error('Error refreshing Salesforce token:', error);
    throw error;
  }
};

// Get QuickBooks access token, refreshing if necessary
const getQuickBooksAccessToken = async (realmId) => {
  const tokens = initializeTokenStorage();
  
  if (!tokens.quickbooks[realmId]) {
    throw new Error(`No token found for QuickBooks realm: ${realmId}`);
  }
  
  const tokenData = tokens.quickbooks[realmId];
  
  // If token is still valid, return it
  if (tokenData.expiresAt > Date.now() + 60000) { // 1 minute buffer
    return tokenData.accessToken;
  }
  
  // Refresh token
  try {
    const response = await axios({
      method: 'post',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${config.quickbooks.clientId}:${config.quickbooks.clientSecret}`).toString('base64')}`
      },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refreshToken
      }).toString()
    });
    
    // Update token in storage
    tokens.quickbooks[realmId] = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      realmId: realmId,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    return tokens.quickbooks[realmId].accessToken;
  } catch (error) {
    logger.error('Error refreshing QuickBooks token:', error);
    throw error;
  }
};

module.exports = {
  initializeTokenStorage,
  storeOAuthTokens,
  getSalesforceAuthUrl,
  getQuickBooksAuthUrl,
  exchangeSalesforceCode,
  exchangeQuickBooksCode,
  getSalesforceAccessToken,
  getQuickBooksAccessToken
};
