const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

// Path to token storage file
const TOKEN_PATH = path.join(__dirname, '../../data/tokens.json');

// Initialize token storage
const initializeTokenStorage = () => {
  const dir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(TOKEN_PATH)) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({ salesforce: {}, quickbooks: {} }));
    return { salesforce: {}, quickbooks: {} };
  }
  
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading token file:', error);
    return { salesforce: {}, quickbooks: {} };
  }
};

// Save tokens to storage
const storeOAuthTokens = async (service, tokenData) => {
  const tokens = initializeTokenStorage();
  
  if (service === 'salesforce') {
    tokens.salesforce[tokenData.instanceUrl] = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || null,
      instanceUrl: tokenData.instanceUrl,
      expiresAt: Date.now() + (tokenData.expiresIn * 1000)
    };
  } else if (service === 'quickbooks') {
    // Make sure realmId is present
    if (!tokenData.realmId) {
      throw new Error('Missing realmId in QuickBooks token data');
    }
    
    tokens.quickbooks[tokenData.realmId] = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      realmId: tokenData.realmId,
      expiresAt: Date.now() + (tokenData.expiresIn * 1000)
    };
  }
  
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  return tokens;
};

// Salesforce - get auth URL (without PKCE)
function getSalesforceAuthUrl(sfConfig = config.salesforce) {
  const baseUrl = `${sfConfig.loginUrl}/services/oauth2/authorize`;
  const state = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: sfConfig.clientId,
    response_type: 'code',
    redirect_uri: sfConfig.redirectUri,
    state: state
  });
  
  const authUrl = `${baseUrl}?${params.toString()}`;
  console.log('Salesforce Auth URL:', authUrl);
  return authUrl;
}

// QuickBooks - get auth URL
function getQuickBooksAuthUrl(qbConfig = config.quickbooks) {
  const baseUrl = 'https://appcenter.intuit.com/connect/oauth2';
  const state = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: qbConfig.clientId,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: qbConfig.redirectUri,
    state: state
  });
  
  const authUrl = `${baseUrl}?${params.toString()}`;
  console.log('QuickBooks Auth URL:', authUrl);
  return authUrl;
}

// Exchange Salesforce authorization code for tokens (without PKCE)
async function exchangeSalesforceCode(code, state, sfConfig = config.salesforce) {
  try {
    console.log('Exchanging Salesforce code:', { code, state });
    
    // Exchange the code for tokens
    const response = await axios({
      method: 'post',
      url: `${sfConfig.loginUrl}/services/oauth2/token`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: sfConfig.clientId,
        client_secret: sfConfig.clientSecret,
        redirect_uri: sfConfig.redirectUri
      }).toString()
    });
    
    console.log('Salesforce response:', response.data);
    
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      instanceUrl: response.data.instance_url,
      expiresIn: response.data.expires_in
    };
  } catch (error) {
    console.error('Error exchanging Salesforce code:', error.response?.data || error.message);
    throw error;
  }
}

// Exchange QuickBooks authorization code for tokens
async function exchangeQuickBooksCode(code, realmId, qbConfig = config.quickbooks) {
  try {
    console.log('Exchanging QuickBooks code:', { code, realmId });
    console.log('Redirect URI:', qbConfig.redirectUri);
    
    // Exchange the code for tokens
    const response = await axios({
      method: 'post',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${qbConfig.clientId}:${qbConfig.clientSecret}`).toString('base64')}`
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: qbConfig.redirectUri
      }).toString()
    });
    
    console.log('QuickBooks response:', response.data);
    
    // Return token data with the realmId from the callback
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      realmId: realmId
    };
  } catch (error) {
    console.error('Error exchanging QuickBooks code:', error.response?.data || error.message);
    throw error;
  }
}

// Get a valid access token for Salesforce
async function getSalesforceAccessToken(instanceUrl) {
  const tokens = initializeTokenStorage();
  
  // Check if we have a token for this instance
  if (!tokens.salesforce[instanceUrl]) {
    throw new Error(`No token found for Salesforce instance: ${instanceUrl}`);
  }
  
  const tokenData = tokens.salesforce[instanceUrl];
  
  // If the token is still valid, return it
  if (tokenData.expiresAt > Date.now() + 60000) { // 1 minute buffer
    return tokenData.accessToken;
  }
  
  // Otherwise, refresh the token
  try {
    const response = await axios({
      method: 'post',
      url: `${instanceUrl}/services/oauth2/token`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refreshToken,
        client_id: config.salesforce.clientId,
        client_secret: config.salesforce.clientSecret
      }).toString()
    });
    
    // Update token storage
    tokens.salesforce[instanceUrl] = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || tokenData.refreshToken,
      instanceUrl: instanceUrl,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    return tokens.salesforce[instanceUrl].accessToken;
  } catch (error) {
    console.error('Error refreshing Salesforce token:', error.response?.data || error.message);
    throw error;
  }
}

// Get a valid access token for QuickBooks
async function getQuickBooksAccessToken(realmId) {
  const tokens = initializeTokenStorage();
  
  // Check if we have a token for this realm
  if (!tokens.quickbooks[realmId]) {
    throw new Error(`No token found for QuickBooks realm: ${realmId}`);
  }
  
  const tokenData = tokens.quickbooks[realmId];
  
  // If the token is still valid, return it
  if (tokenData.expiresAt > Date.now() + 60000) { // 1 minute buffer
    return tokenData.accessToken;
  }
  
  // Otherwise, refresh the token
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
    
    // Update token storage
    tokens.quickbooks[realmId] = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      realmId: realmId,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    return tokens.quickbooks[realmId].accessToken;
  } catch (error) {
    console.error('Error refreshing QuickBooks token:', error.response?.data || error.message);
    throw error;
  }
}

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