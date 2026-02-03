/**
 * Test script for OAuth authentication
 * Run with: node test-oauth.js
 */
const { checkOAuthTokens, checkEnvironment } = require('./utils/test-helpers');

console.log('\n=== CHECKING OAUTH TOKEN STORAGE ===');

// Check OAuth tokens
const oauthStatus = checkOAuthTokens();

// Check Salesforce connections
if (oauthStatus.salesforce.connected) {
  console.log('✅ Salesforce connected:');
  oauthStatus.salesforce.instances.forEach(instance => {
    const expiresAt = new Date(instance.expiresAt);
    console.log(`   - Instance: ${instance.instanceUrl}`);
    console.log(`     Token expires: ${expiresAt.toLocaleString()} (${instance.isValid ? 'Valid' : 'Expired'})`);
  });
} else {
  console.log('❌ No Salesforce connections found');
  console.log('   Visit: http://localhost:3000/auth/salesforce to connect');
}

// Check QuickBooks connections
if (oauthStatus.quickbooks.connected) {
  console.log('\n✅ QuickBooks connected:');
  oauthStatus.quickbooks.companies.forEach(company => {
    const expiresAt = new Date(company.expiresAt);
    console.log(`   - Realm ID: ${company.realmId}`);
    console.log(`     Token expires: ${expiresAt.toLocaleString()} (${company.isValid ? 'Valid' : 'Expired'})`);
  });
} else {
  console.log('\n❌ No QuickBooks connections found');
  console.log('   Visit: http://localhost:3000/auth/quickbooks to connect');
}

// Show auth URLs
console.log('\n=== OAUTH AUTHENTICATION URLS ===');
console.log('1. Start the server: npm start');
console.log('2. Open these URLs in your browser:');
console.log('   Salesforce: http://localhost:3000/auth/salesforce');
console.log('   QuickBooks: http://localhost:3000/auth/quickbooks');
console.log('3. Complete the authentication flow');
console.log('4. Verify connections with API key:');
console.log('   curl -H "X-API-Key: YOUR_API_KEY" http://localhost:3000/auth/status');

// Check environment variables
console.log('\n=== ENVIRONMENT CONFIGURATION ===');
const envStatus = checkEnvironment();

if (envStatus.complete) {
  console.log('✅ All required environment variables are set');
} else {
  envStatus.missing.forEach(varName => {
    console.log(`❌ Missing ${varName} in .env file`);
  });
  console.log(`\n⚠️ Missing ${envStatus.missing.length} environment variables. Please update your .env file.`);
}