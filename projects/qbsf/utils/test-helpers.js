/**
 * Common test utilities for the Salesforce-QuickBooks integration
 */

const fs = require('fs');
const path = require('path');

/**
 * Check if OAuth tokens exist and are valid
 * @returns {Object} Status of Salesforce and QuickBooks connections
 */
function checkOAuthTokens() {
  const TOKEN_PATH = path.join(__dirname, '../data/tokens.json');
  const result = {
    salesforce: { connected: false, instances: [] },
    quickbooks: { connected: false, companies: [] }
  };

  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      
      // Check Salesforce connections
      const sfInstances = Object.keys(tokens.salesforce || {});
      if (sfInstances.length > 0) {
        result.salesforce.connected = true;
        sfInstances.forEach(instance => {
          const token = tokens.salesforce[instance];
          const expiresAt = new Date(token.expiresAt);
          const isValid = expiresAt > new Date();
          
          result.salesforce.instances.push({
            instanceUrl: token.instanceUrl || instance,
            expiresAt: token.expiresAt,
            isValid
          });
        });
      }
      
      // Check QuickBooks connections
      const qbRealms = Object.keys(tokens.quickbooks || {});
      if (qbRealms.length > 0) {
        result.quickbooks.connected = true;
        qbRealms.forEach(realm => {
          const token = tokens.quickbooks[realm];
          const expiresAt = new Date(token.expiresAt);
          const isValid = expiresAt > new Date();
          
          result.quickbooks.companies.push({
            realmId: token.realmId || realm,
            expiresAt: token.expiresAt,
            isValid
          });
        });
      }
    } catch (error) {
      console.error(`Error reading token file: ${error.message}`);
    }
  }

  return result;
}

/**
 * Validate API key against environment variable
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Whether the API key is valid
 */
function validateApiKey(apiKey) {
  require('dotenv').config();
  return apiKey === process.env.API_KEY;
}

/**
 * Check required environment variables
 * @returns {Object} Status of environment variables
 */
function checkEnvironment() {
  require('dotenv').config();
  
  const requiredVars = [
    'PORT', 'NODE_ENV', 'MIDDLEWARE_BASE_URL',
    'SF_CLIENT_ID', 'SF_CLIENT_SECRET', 'SF_REDIRECT_URI', 'SF_LOGIN_URL',
    'QB_CLIENT_ID', 'QB_CLIENT_SECRET', 'QB_REDIRECT_URI', 'QB_ENVIRONMENT',
    'API_KEY', 'TOKEN_ENCRYPTION_KEY'
  ];
  
  const result = {
    complete: true,
    missing: []
  };
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      result.complete = false;
      result.missing.push(varName);
    }
  });
  
  return result;
}

module.exports = {
  checkOAuthTokens,
  validateApiKey,
  checkEnvironment
};