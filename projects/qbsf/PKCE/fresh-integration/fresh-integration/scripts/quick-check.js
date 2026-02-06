require('dotenv').config();
const oauthManager = require('../src/services/oauth-manager');

(async () => {
  console.log('====================================');
  console.log('OAUTH CONNECTION CHECKER');
  console.log('====================================');
  
  // Print environment settings
  console.log('\nEnvironment Settings:');
  console.log(`Salesforce Redirect URI: ${process.env.SF_REDIRECT_URI}`);
  console.log(`QuickBooks Redirect URI: ${process.env.QB_REDIRECT_URI}`);
  
  // Show auth URLs
  console.log('\nAuthentication URLs (open these in your browser):');
  console.log('\n1. QuickBooks Auth URL:');
  console.log(oauthManager.getQuickBooksAuthUrl());
  
  console.log('\n2. Salesforce Auth URL:');
  console.log(oauthManager.getSalesforceAuthUrl());
  
  // List what is already stored
  const tokens = oauthManager.initializeTokenStorage();
  
  console.log('\nCurrent Connections:');
  
  // Salesforce connections
  const sfInstances = Object.keys(tokens.salesforce || {});
  if (sfInstances.length > 0) {
    console.log('\n✅ Salesforce Connected:');
    sfInstances.forEach(instance => {
      const expires = new Date(tokens.salesforce[instance].expiresAt);
      console.log(`   - Instance: ${instance}`);
      console.log(`     Expires: ${expires.toLocaleString()}`);
    });
  } else {
    console.log('\n❌ Salesforce: Not connected');
  }
  
  // QuickBooks connections
  const qbRealms = Object.keys(tokens.quickbooks || {});
  if (qbRealms.length > 0) {
    console.log('\n✅ QuickBooks Connected:');
    qbRealms.forEach(realm => {
      const expires = new Date(tokens.quickbooks[realm].expiresAt);
      console.log(`   - Realm ID: ${realm}`);
      console.log(`     Expires: ${expires.toLocaleString()}`);
    });
  } else {
    console.log('\n❌ QuickBooks: Not connected');
  }
  
  console.log('\nInstructions:');
  console.log('1. Open each URL in your browser');
  console.log('2. Complete the authentication flow for each service');
  console.log('3. Run this script again to see updated connections');
  console.log('====================================');
})();