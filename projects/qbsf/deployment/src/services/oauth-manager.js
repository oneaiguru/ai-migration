const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

// Secure token storage (in production, use a database)
const TOKENS_FILE = path.join(__dirname, '..', '..', 'data', 'tokens.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Encrypts text using AES-256-GCM
 * @param {String} text - Text to encrypt
 * @param {String} key - Encryption key (32 bytes / 64 hex chars)
 * @returns {String} - Encrypted text in format: iv:authTag:encrypted
 */
function encryptData(text, key) {
  // Ensure the key is valid
  if (!key || key.length < 32) {
    logger.warn('Invalid encryption key. Using a default key for development only.');
    // Use a default key for development, but this should NEVER be used in production
    key = config.security.tokenEncryptionKey || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
  
  // Convert hex key to buffer if needed
  const keyBuffer = key.length === 64 ? Buffer.from(key, 'hex') : crypto.createHash('sha256').update(key).digest();
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return the encrypted data in format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts text using AES-256-GCM
 * @param {String} encryptedText - Text to decrypt (format: iv:authTag:encrypted)
 * @param {String} key - Encryption key (32 bytes / 64 hex chars)
 * @returns {String} - Decrypted text
 */
function decryptData(encryptedText, key) {
  // Check if the text is encrypted
  if (!encryptedText.includes(':')) {
    // Not encrypted, return as is (for backward compatibility)
    return encryptedText;
  }
  
  // Ensure the key is valid
  if (!key || key.length < 32) {
    logger.warn('Invalid encryption key. Using a default key for development only.');
    // Use a default key for development, but this should NEVER be used in production
    key = config.security.tokenEncryptionKey || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
  
  // Convert hex key to buffer if needed
  const keyBuffer = key.length === 64 ? Buffer.from(key, 'hex') : crypto.createHash('sha256').update(key).digest();
  
  try {
    // Split the encrypted text into components
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
    
    // Convert hex strings to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Error decrypting data:', { 
      error: error.message, 
      stack: error.stack,
      errorType: error.name,
      cause: 'Possible encryption key mismatch or corrupted data'
    });
    throw new Error('Failed to decrypt data. The encryption key may be incorrect.');
  }
}

/**
 * Initializes token storage
 * @returns {Promise<Object>} - Current token storage
 */
async function initializeTokenStorage() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const encryptedData = fs.readFileSync(TOKENS_FILE, 'utf8');
      
      // Attempt to parse as JSON first (for backward compatibility)
      try {
        return JSON.parse(encryptedData);
      } catch (parseError) {
        // Not valid JSON, try to decrypt
        const decryptedData = decryptData(encryptedData, config.security.tokenEncryptionKey);
        return JSON.parse(decryptedData);
      }
    } else {
      const initialData = {
        quickbooks: {},
        salesforce: {}
      };
      
      // Encrypt and save the initial data
      const encryptedData = encryptData(JSON.stringify(initialData), config.security.tokenEncryptionKey);
      fs.writeFileSync(TOKENS_FILE, encryptedData);
      
      return initialData;
    }
  } catch (error) {
    logger.error('Error initializing token storage:', { 
      error: error.message, 
      stack: error.stack,
      errorType: error.name,
      operation: 'initializeTokenStorage',
      dataPath: TOKENS_FILE,
      exists: fs.existsSync(TOKENS_FILE)
    });
    throw new Error(`Failed to initialize token storage: ${error.message}`);
  }
}

/**
 * Saves tokens to storage with encryption
 * @param {Object} tokens - Token object to save
 * @returns {Promise<boolean>} - Success indicator
 */
async function saveTokens(tokens) {
  try {
    // Encrypt the tokens before saving
    const encryptedData = encryptData(JSON.stringify(tokens), config.security.tokenEncryptionKey);
    fs.writeFileSync(TOKENS_FILE, encryptedData);
    return true;
  } catch (error) {
    logger.error('Error saving OAuth tokens to storage:', {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      operation: 'saveTokens',
      dataPath: TOKENS_FILE,
      directoryExists: fs.existsSync(path.dirname(TOKENS_FILE)),
      writePermissions: error.code === 'EACCES' ? false : 'unknown',
      diskSpaceIssue: error.code === 'ENOSPC' ? true : false,
      servicesWithTokens: Object.keys(tokens || {})
    });
    return false;
  }
}

/**
 * Gets QuickBooks OAuth tokens
 * @param {String} realmId - QuickBooks company ID
 * @returns {Promise<Object>} - QuickBooks tokens
 */
async function getQuickBooksTokens(realmId) {
  try {
    const tokens = await initializeTokenStorage();
    return tokens.quickbooks[realmId] || null;
  } catch (error) {
    logger.error('Error getting QuickBooks tokens:', error);
    throw error;
  }
}

/**
 * Gets Salesforce OAuth tokens
 * @param {String} instanceUrl - Salesforce instance URL
 * @returns {Promise<Object>} - Salesforce tokens
 */
async function getSalesforceTokens(instanceUrl) {
  try {
    const tokens = await initializeTokenStorage();
    return tokens.salesforce[instanceUrl] || null;
  } catch (error) {
    logger.error('Error getting Salesforce tokens:', error);
    throw error;
  }
}

/**
 * Refreshes QuickBooks access token
 * @param {String} realmId - QuickBooks company ID
 * @param {Object} qbConfig - OAuth configuration
 * @returns {Promise<Object>} - Updated tokens
 */
async function refreshQuickBooksToken(realmId, qbConfig = config.quickbooks) {
  try {
    const tokens = await initializeTokenStorage();
    const qbTokens = tokens.quickbooks[realmId];
    
    if (!qbTokens || !qbTokens.refreshToken) {
      throw new Error(`No refresh token found for QuickBooks realm ${realmId}`);
    }
    
    // Create authorization header
    const auth = Buffer.from(`${qbConfig.clientId}:${qbConfig.clientSecret}`).toString('base64');
    
    // Request new access token
    const response = await axios({
      method: 'post',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: `grant_type=refresh_token&refresh_token=${qbTokens.refreshToken}`
    });
    
    // Update tokens in storage
    const updatedTokens = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || qbTokens.refreshToken,
      expiresAt: Date.now() + (response.data.expires_in * 1000),
      realmId
    };
    
    tokens.quickbooks[realmId] = updatedTokens;
    await saveTokens(tokens);
    
    return updatedTokens;
  } catch (error) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    
    logger.error(`Error refreshing QuickBooks token for realm ${realmId}:`, {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      statusCode,
      responseData,
      realmId,
      tokenState: qbTokens ? 'exists' : 'missing'
    });
    
    if (statusCode === 400 && responseData?.error === 'invalid_grant') {
      throw new Error(`QuickBooks refresh token is invalid or expired for realm ${realmId}. Manual reauthorization required.`);
    } else if (statusCode === 401) {
      throw new Error(`Authentication failed for QuickBooks realm ${realmId}. Client credentials may be invalid.`);
    } else {
      throw new Error(`Failed to refresh QuickBooks token: ${error.message}`);
    }
  }
}

/**
 * Refreshes Salesforce access token
 * @param {String} instanceUrl - Salesforce instance URL
 * @param {Object} sfConfig - OAuth configuration
 * @returns {Promise<Object>} - Updated tokens
 */
async function refreshSalesforceToken(instanceUrl, sfConfig = config.salesforce) {
  try {
    const tokens = await initializeTokenStorage();
    const sfTokens = tokens.salesforce[instanceUrl];
    
    if (!sfTokens || !sfTokens.refreshToken) {
      throw new Error(`No refresh token found for Salesforce instance ${instanceUrl}`);
    }
    
    // Request new access token
    const response = await axios({
      method: 'post',
      url: `${sfConfig.loginUrl}/services/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: `grant_type=refresh_token&refresh_token=${sfTokens.refreshToken}&client_id=${sfConfig.clientId}&client_secret=${sfConfig.clientSecret}`
    });
    
    // Update tokens in storage
    const updatedTokens = {
      accessToken: response.data.access_token,
      refreshToken: sfTokens.refreshToken, // Salesforce doesn't return a new refresh token
      instanceUrl: response.data.instance_url || instanceUrl,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };
    
    tokens.salesforce[instanceUrl] = updatedTokens;
    await saveTokens(tokens);
    
    return updatedTokens;
  } catch (error) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    
    logger.error(`Error refreshing Salesforce token for instance ${instanceUrl}:`, {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      statusCode,
      responseData,
      instanceUrl,
      tokenState: sfTokens ? 'exists' : 'missing'
    });
    
    if (statusCode === 400 && responseData?.error === 'invalid_grant') {
      throw new Error(`Salesforce refresh token is invalid or expired for instance ${instanceUrl}. Manual reauthorization required.`);
    } else if (statusCode === 401) {
      throw new Error(`Authentication failed for Salesforce instance ${instanceUrl}. Client credentials may be invalid.`);
    } else {
      throw new Error(`Failed to refresh Salesforce token: ${error.message}`);
    }
  }
}

/**
 * Stores new OAuth tokens
 * @param {String} service - 'quickbooks' or 'salesforce'
 * @param {Object} tokenData - Token data to store
 * @returns {Promise<boolean>} - Success indicator
 */
async function storeOAuthTokens(service, tokenData) {
  try {
    const tokens = await initializeTokenStorage();
    
    // Validate required token data
    if (!tokenData || !tokenData.accessToken) {
      throw new Error(`Missing required token data for ${service}`);
    }
    
    if (service === 'quickbooks') {
      if (!tokenData.realmId) {
        throw new Error('Missing realmId for QuickBooks token storage');
      }
      
      tokens.quickbooks[tokenData.realmId] = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: Date.now() + (tokenData.expiresIn * 1000),
        realmId: tokenData.realmId
      };
      
      logger.debug(`Stored QuickBooks tokens for realm ${tokenData.realmId}`);
    } else if (service === 'salesforce') {
      if (!tokenData.instanceUrl) {
        throw new Error('Missing instanceUrl for Salesforce token storage');
      }
      
      tokens.salesforce[tokenData.instanceUrl] = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: Date.now() + (tokenData.expiresIn * 1000),
        instanceUrl: tokenData.instanceUrl
      };
      
      logger.debug(`Stored Salesforce tokens for instance ${tokenData.instanceUrl}`);
    } else {
      throw new Error(`Unknown service: ${service}`);
    }
    
    await saveTokens(tokens);
    return true;
  } catch (error) {
    logger.error(`Error storing ${service} OAuth tokens:`, {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      service,
      operation: 'storeOAuthTokens',
      hasAccessToken: tokenData?.accessToken ? true : false,
      hasRefreshToken: tokenData?.refreshToken ? true : false,
      missingFields: getMissingRequiredFields(service, tokenData),
      storageInitSuccess: tokens ? true : false
    });
    return false;
  }
}

/**
 * Helper to identify missing required fields in token data
 * @param {String} service - Service name
 * @param {Object} tokenData - Token data to check
 * @returns {Array} - List of missing fields
 */
function getMissingRequiredFields(service, tokenData) {
  if (!tokenData) return ['all fields'];
  
  const missingFields = [];
  
  if (!tokenData.accessToken) missingFields.push('accessToken');
  if (!tokenData.refreshToken) missingFields.push('refreshToken');
  if (!tokenData.expiresIn) missingFields.push('expiresIn');
  
  if (service === 'quickbooks' && !tokenData.realmId) {
    missingFields.push('realmId');
  }
  
  if (service === 'salesforce' && !tokenData.instanceUrl) {
    missingFields.push('instanceUrl');
  }
  
  return missingFields;
}

/**
 * Gets a valid access token, refreshing if necessary
 * @param {String} service - 'quickbooks' or 'salesforce'
 * @param {String} identifier - realmId for QuickBooks, instanceUrl for Salesforce
 * @param {Object} oauthConfig - OAuth configuration
 * @returns {Promise<String>} - Valid access token
 */
async function getValidAccessToken(service, identifier, oauthConfig) {
  try {
    let tokens;
    
    if (service === 'quickbooks') {
      tokens = await getQuickBooksTokens(identifier);
    } else if (service === 'salesforce') {
      tokens = await getSalesforceTokens(identifier);
    } else {
      throw new Error(`Unknown service: ${service}`);
    }
    
    // If no tokens found or tokens are expired, refresh them
    if (!tokens || !tokens.accessToken || tokens.expiresAt <= Date.now()) {
      if (service === 'quickbooks') {
        tokens = await refreshQuickBooksToken(identifier, oauthConfig);
      } else if (service === 'salesforce') {
        tokens = await refreshSalesforceToken(identifier, oauthConfig);
      }
    }
    
    return tokens.accessToken;
  } catch (error) {
    logger.error(`Error getting valid access token for ${service}:`, {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      service,
      identifier,
      operation: 'getValidAccessToken',
      tokenState: tokens ? 'exists' : 'missing'
    });
    
    // Add context to the error message for easier debugging
    const contextMessage = service === 'quickbooks' 
      ? `QuickBooks realm ${identifier}` 
      : `Salesforce instance ${identifier}`;
      
    throw new Error(`Failed to get valid access token for ${contextMessage}: ${error.message}`);
  }
}

/**
 * Generates the authorization URL for QuickBooks OAuth flow
 * @param {Object} qbConfig - QuickBooks OAuth configuration
 * @returns {String} - Authorization URL
 */
function getQuickBooksAuthUrl(qbConfig = config.quickbooks) {
  const baseUrl = 'https://appcenter.intuit.com/connect/oauth2';
  const scopes = 'com.intuit.quickbooks.accounting';
  const state = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: qbConfig.clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: qbConfig.redirectUri,
    state
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates the authorization URL for Salesforce OAuth flow
 * @param {Object} sfConfig - Salesforce OAuth configuration
 * @returns {String} - Authorization URL
 */
function getSalesforceAuthUrl(sfConfig = config.salesforce) {
  const baseUrl = `${sfConfig.loginUrl}/services/oauth2/authorize`;
  const state = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: sfConfig.clientId,
    response_type: 'code',
    redirect_uri: sfConfig.redirectUri,
    state
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchanges authorization code for tokens - QuickBooks
 * @param {String} code - Authorization code
 * @param {Object} qbConfig - QuickBooks OAuth configuration
 * @returns {Promise<Object>} - Token response
 */
async function exchangeQuickBooksCode(code, qbConfig = config.quickbooks) {
  try {
    // Create authorization header
    const auth = Buffer.from(`${qbConfig.clientId}:${qbConfig.clientSecret}`).toString('base64');
    
    // Exchange code for tokens
    const response = await axios({
      method: 'post',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: `grant_type=authorization_code&code=${code}&redirect_uri=${qbConfig.redirectUri}`
    });
    
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      realmId: response.data.realmId
    };
  } catch (error) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    
    logger.error('Error exchanging QuickBooks authorization code:', {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      statusCode,
      responseData,
      oauthEndpoint: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      codeLength: code ? code.length : 0
    });
    
    if (statusCode === 400) {
      throw new Error(`Invalid QuickBooks authorization code: ${responseData?.error_description || error.message}`);
    } else {
      throw new Error(`Failed to exchange QuickBooks authorization code: ${error.message}`);
    }
  }
}

/**
 * Exchanges authorization code for tokens - Salesforce
 * @param {String} code - Authorization code
 * @param {Object} sfConfig - Salesforce OAuth configuration
 * @returns {Promise<Object>} - Token response
 */
async function exchangeSalesforceCode(code, sfConfig = config.salesforce) {
  try {
    // Exchange code for tokens
    const response = await axios({
      method: 'post',
      url: `${sfConfig.loginUrl}/services/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: `grant_type=authorization_code&code=${code}&client_id=${sfConfig.clientId}&client_secret=${sfConfig.clientSecret}&redirect_uri=${sfConfig.redirectUri}`
    });
    
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      instanceUrl: response.data.instance_url,
      expiresIn: response.data.expires_in || 7200 // Default to 2 hours if not provided
    };
  } catch (error) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    
    logger.error('Error exchanging Salesforce authorization code:', {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      statusCode,
      responseData,
      oauthEndpoint: `${sfConfig.loginUrl}/services/oauth2/token`,
      codeLength: code ? code.length : 0
    });
    
    if (statusCode === 400) {
      throw new Error(`Invalid Salesforce authorization code: ${responseData?.error_description || error.message}`);
    } else {
      throw new Error(`Failed to exchange Salesforce authorization code: ${error.message}`);
    }
  }
}

module.exports = {
  initializeTokenStorage,
  getQuickBooksTokens,
  getSalesforceTokens,
  refreshQuickBooksToken,
  refreshSalesforceToken,
  storeOAuthTokens,
  getValidAccessToken,
  getQuickBooksAuthUrl,
  getSalesforceAuthUrl,
  exchangeQuickBooksCode,
  exchangeSalesforceCode
};
