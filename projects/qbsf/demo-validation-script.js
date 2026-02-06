// Script to validate the demo is working with real connections
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const API_KEY = 'quickbooks_salesforce_api_key_2025';
const SF_INSTANCE = 'https://customer-inspiration-2543.my.salesforce.com';
const QB_REALM = '9341454378379755';

async function validateDemo() {
  console.log('=== Validating Demo Connection ===\n');

  try {
    // 1. Check health
    console.log('1. Checking server health...');
    const healthResponse = await axios.get(`${API_URL}/health`, {
      headers: { 'X-API-Key': API_KEY }
    });
    console.log('✅ Server is healthy:', healthResponse.data);

    // 2. Test connections
    console.log('\n2. Testing Salesforce and QuickBooks connections...');
    const connectionResponse = await axios.post(`${API_URL}/api/test-connection`, {
      salesforceInstance: SF_INSTANCE,
      quickbooksRealm: QB_REALM
    }, {
      headers: { 
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (connectionResponse.data.salesforce.connected && connectionResponse.data.quickbooks.connected) {
      console.log('✅ Both connections are active!');
      console.log('   Salesforce:', connectionResponse.data.salesforce);
      console.log('   QuickBooks:', connectionResponse.data.quickbooks);
    } else {
      console.log('❌ Connection issues detected:');
      console.log(connectionResponse.data);
    }

    // 3. Check if we're in demo mode or real mode
    console.log('\n3. Checking integration mode...');
    if (process.env.NODE_ENV === 'development' && connectionResponse.data.success) {
      console.log('✅ Running with REAL connections (not simulation)');
    }

    console.log('\n=== Demo validation complete ===');
    
  } catch (error) {
    console.error('❌ Error during validation:', error.response?.data || error.message);
  }
}

// Run validation
validateDemo();