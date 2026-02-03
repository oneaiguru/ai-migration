// scripts/token-inspector.js
const fs = require('fs');
const path = require('path');

// Path to token storage file
const TOKEN_PATH = path.join(__dirname, '../PKCE/fresh-integration/fresh-integration/data/tokens.json');

/**
 * Read and display the stored OAuth tokens
 */
function inspectTokens() {
  console.log('=== TOKEN INSPECTION ===');
  
  // Check if tokens file exists
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('Error: Tokens file not found. Please authenticate first.');
    return;
  }
  
  try {
    // Read tokens file
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    
    // Check Salesforce tokens
    console.log('\nSalesforce Connections:');
    if (Object.keys(tokens.salesforce || {}).length === 0) {
      console.log('❌ No Salesforce connections found');
    } else {
      console.log('✅ Salesforce connected:');
      for (const instanceUrl in tokens.salesforce) {
        const tokenData = tokens.salesforce[instanceUrl];
        const expiresAt = tokenData.expiresAt ? new Date(tokenData.expiresAt).toLocaleString() : 'No expiration (session-based token)';
        console.log(`   - Instance: ${instanceUrl}`);
        console.log(`     Access Token: ${tokenData.accessToken.substring(0, 10)}...`);
        console.log(`     Refresh Token: ${tokenData.refreshToken ? tokenData.refreshToken.substring(0, 10) + '...' : 'None'}`);
        console.log(`     Expires: ${expiresAt}`);
      }
    }
    
    // Check QuickBooks tokens
    console.log('\nQuickBooks Connections:');
    if (Object.keys(tokens.quickbooks || {}).length === 0) {
      console.log('❌ No QuickBooks connections found');
    } else {
      console.log('✅ QuickBooks connected:');
      for (const realmId in tokens.quickbooks) {
        const tokenData = tokens.quickbooks[realmId];
        const expiresAt = tokenData.expiresAt ? new Date(tokenData.expiresAt).toLocaleString() : 'No expiration (session-based token)';
        console.log(`   - Company ID (Realm ID): ${realmId}`);
        console.log(`     Access Token: ${tokenData.accessToken.substring(0, 10)}...`);
        console.log(`     Refresh Token: ${tokenData.refreshToken.substring(0, 10)}...`);
        console.log(`     Expires: ${expiresAt}`);
      }
    }
    
    console.log('\n=== END OF INSPECTION ===');
    
    return tokens;
  } catch (error) {
    console.error('Error reading tokens file:', error);
    return null;
  }
}

// Execute if called directly
if (require.main === module) {
  inspectTokens();
}

module.exports = { inspectTokens };
