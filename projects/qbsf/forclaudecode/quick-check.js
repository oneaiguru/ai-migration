// scripts/quick-check.js
/**
 * Quick Connection Checker for OAuth Status
 * This script verifies the authentication status for both Salesforce and QuickBooks
 * and provides the URLs needed for authentication if not already authenticated.
 */

const fs = require('fs');
const path = require('path');
const oauthManager = require('../src/services/oauth-manager');
const config = require('../src/config');

// Path to token storage file
const TOKEN_PATH = path.join(__dirname, '../data/tokens.json');

// Print header
console.log('====================================');
console.log('OAUTH CONNECTION CHECKER');
console.log('====================================');

// Print environment settings
console.log('Environment Settings:');
console.log(`Salesforce Redirect URI: ${config.salesforce.redirectUri}`);
console.log(`QuickBooks Redirect URI: ${config.quickbooks.redirectUri}`);

// Generate authentication URLs
console.log('Authentication URLs (open these in your browser):');

const qbAuthUrl = oauthManager.getQuickBooksAuthUrl();
console.log('1. QuickBooks Auth URL:');
console.log(qbAuthUrl);

const sfAuthUrl = oauthManager.getSalesforceAuthUrl();
console.log('2. Salesforce Auth URL:');
console.log(sfAuthUrl);

// Check current connections
console.log('Current Connections:');

// Initialize token storage
let tokens = { salesforce: {}, quickbooks: {} };
if (fs.existsSync(TOKEN_PATH)) {
  try {
    tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading token file:', error);
  }
}

// Check Salesforce connection
const sfInstances = Object.keys(tokens.salesforce || {});
if (sfInstances.length > 0) {
  console.log('✅ Salesforce Connected:');
  sfInstances.forEach(instanceUrl => {
    const tokenData = tokens.salesforce[instanceUrl];
    const expiresAt = new Date(tokenData.expiresAt || 0).toLocaleString();
    console.log(`   - Instance: ${instanceUrl}`);
    console.log(`     Expires: ${expiresAt}`);
  });
} else {
  console.log('❌ Salesforce: Not connected');
}

// Check QuickBooks connection
const qbRealms = Object.keys(tokens.quickbooks || {});
if (qbRealms.length > 0) {
  console.log('✅ QuickBooks Connected:');
  qbRealms.forEach(realmId => {
    const tokenData = tokens.quickbooks[realmId];
    const expiresAt = new Date(tokenData.expiresAt || 0).toLocaleString();
    console.log(`   - Company ID (Realm ID): ${realmId}`);
    console.log(`     Expires: ${expiresAt}`);
  });
} else {
  console.log('❌ QuickBooks: Not connected');
}

// Print instructions
console.log('Instructions:');
console.log('1. Open each URL in your browser');
console.log('2. Complete the authentication flow for each service');
console.log('3. Run this script again to see updated connections');
console.log('====================================');
