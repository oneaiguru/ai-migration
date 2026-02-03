/**
 * Test script for API endpoints
 * Run with: node test-api.js YOUR_API_KEY
 */
const axios = require('axios');

// Get API key from command line argument
const apiKey = process.argv[2];
if (!apiKey) {
  console.error('Error: API key is required');
  console.log('Usage: node test-api.js YOUR_API_KEY');
  process.exit(1);
}

// Base URL
const baseURL = 'http://localhost:3000';

// Axios instance with API key
const api = axios.create({
  baseURL,
  headers: {
    'X-API-Key': apiKey
  }
});

// Run the tests
async function runTests() {
  console.log('=== API ENDPOINT TESTS ===\n');
  
  // Test results
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  // Helper function to run tests
  async function testEndpoint(name, method, url, data = null) {
    try {
      console.log(`Testing ${name}...`);
      
      let response;
      if (method.toLowerCase() === 'get') {
        response = await api.get(url);
      } else if (method.toLowerCase() === 'post') {
        response = await api.post(url, data);
      }
      
      if (response.data.success) {
        console.log(`✅ ${name} test passed`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        results.passed++;
        return true;
      } else {
        console.log(`❌ ${name} test failed`);
        console.log(`   Error: ${response.data.error || 'Unknown error'}`);
        results.failed++;
        return false;
      }
    } catch (error) {
      console.log(`❌ ${name} test failed`);
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      results.failed++;
      return false;
    }
  }
  
  // 1. Test health endpoint
  await testEndpoint('Health check', 'get', '/api/health');
  
  // 2. Test OAuth status
  const authStatusResult = await testEndpoint('OAuth status', 'get', '/auth/status');
  
  // 3. Test scheduler status (if OAuth is connected)
  if (authStatusResult) {
    await testEndpoint('Scheduler status', 'get', '/scheduler/status');
  } else {
    console.log('⚠️ Skipping scheduler status test (OAuth not connected)');
    results.skipped++;
  }
  
  // 4. Get the first available Salesforce instance and QuickBooks realm
  let salesforceInstance, quickbooksRealm;
  
  if (authStatusResult) {
    try {
      const response = await api.get('/auth/status');
      const sfInstances = response.data.status.salesforce.instances;
      const qbCompanies = response.data.status.quickbooks.companies;
      
      if (sfInstances.length > 0) {
        salesforceInstance = sfInstances[0].instanceUrl;
      }
      
      if (qbCompanies.length > 0) {
        quickbooksRealm = qbCompanies[0].realmId;
      }
    } catch (error) {
      console.log('⚠️ Could not retrieve instance information');
    }
  }
  
  // 5. Test connection if we have instance information
  if (salesforceInstance && quickbooksRealm) {
    await testEndpoint('Test connection', 'post', '/api/test-connection', {
      salesforceInstance,
      quickbooksRealm
    });
    
    // 6. Test invoice creation (manual trigger)
    await testEndpoint('Manual invoice creation', 'post', '/scheduler/invoice-creation');
    
    // 7. Test payment check (manual trigger)
    await testEndpoint('Manual payment check', 'post', '/scheduler/payment-check');
  } else {
    console.log('⚠️ Skipping connection and process tests (OAuth information missing)');
    results.skipped += 3;
  }
  
  // 8. Test logs endpoint
  await testEndpoint('Logs endpoint', 'get', '/api/logs');
  
  // Print summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Total: ${results.passed + results.failed + results.skipped}`);
  
  if (results.failed === 0) {
    console.log('\n✅ All executed tests passed!');
  } else {
    console.log(`\n❌ ${results.failed} tests failed`);
  }
}

// Run the tests and handle errors
runTests()
  .catch(error => {
    console.error('Error running tests:', error.message);
  });