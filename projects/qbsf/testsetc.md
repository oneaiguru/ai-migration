# Implementation and Testing Plan for Salesforce-QuickBooks Integration

You're right about creating a clean implementation and thoroughly testing before the demo. Here's a structured plan to backup existing files, implement the new solution, and thoroughly test it.

## Step 1: Backup Existing Files

```bash
# Create a backup directory
mkdir -p backup/$(date +%Y%m%d)

# Move existing files to backup
mv app-js.js config-js.js dashboard.html demo-script.md scheduler-js.js scheduler-routes.js server-js.js targeted-plan.md backup/$(date +%Y%m%d)/

# Backup any existing implementation
if [ -d "src" ]; then
  cp -r src backup/$(date +%Y%m%d)/src
fi

if [ -d "public" ]; then
  cp -r public backup/$(date +%Y%m%d)/public
fi

# Save any existing .env file
if [ -f ".env" ]; then
  cp .env backup/$(date +%Y%m%d)/
fi

echo "Backup complete in backup/$(date +%Y%m%d)/"
```

## Step 2: Run Implementation Scripts

Execute all the implementation scripts I provided in the previous message. This will create the new directory structure with all the necessary files.

## Step 3: Verify Installation

```bash
# Check if all required directories exist
for dir in src/config src/routes src/services src/middleware src/utils logs data internal_tools/monitoring docs; do
  if [ ! -d "$dir" ]; then
    echo "❌ Missing directory: $dir"
  else
    echo "✅ Directory exists: $dir"
  fi
done

# Check if all main files exist
for file in src/server.js src/app.js src/config/index.js src/utils/logger.js src/middleware/error-handler.js src/services/oauth-manager.js src/services/scheduler.js src/routes/auth.js src/routes/api.js src/routes/scheduler.js; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing file: $file"
  else
    echo "✅ File exists: $file"
  fi
done

# Check if .env file exists, create from example if not
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "⚠️ Created .env from example. Please update with your credentials!"
  else
    echo "❌ Missing .env and .env.example files!"
  fi
else
  echo "✅ .env file exists"
fi

# Verify package.json and install dependencies
if [ -f "package.json" ]; then
  echo "✅ package.json exists"
  echo "Installing dependencies..."
  npm install
else
  echo "❌ Missing package.json"
fi
```

## Step 4: Test OAuth Authentication

Let's create a test script for OAuth:

```bash
cat > test-oauth.js << 'EOL'
/**
 * Test script for OAuth authentication
 * Run with: node test-oauth.js
 */
const fs = require('fs');
const path = require('path');

// Verify token storage
const TOKEN_PATH = path.join(__dirname, 'data/tokens.json');
console.log('\n=== CHECKING OAUTH TOKEN STORAGE ===');

if (fs.existsSync(TOKEN_PATH)) {
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    
    // Check Salesforce connections
    const sfInstances = Object.keys(tokens.salesforce || {});
    if (sfInstances.length > 0) {
      console.log('✅ Salesforce connected:');
      sfInstances.forEach(instance => {
        const expiresAt = new Date(tokens.salesforce[instance].expiresAt);
        const isValid = expiresAt > new Date();
        console.log(`   - Instance: ${instance}`);
        console.log(`     Token expires: ${expiresAt.toLocaleString()} (${isValid ? 'Valid' : 'Expired'})`);
      });
    } else {
      console.log('❌ No Salesforce connections found');
      console.log('   Visit: http://localhost:3000/auth/salesforce to connect');
    }
    
    // Check QuickBooks connections
    const qbRealms = Object.keys(tokens.quickbooks || {});
    if (qbRealms.length > 0) {
      console.log('\n✅ QuickBooks connected:');
      qbRealms.forEach(realm => {
        const expiresAt = new Date(tokens.quickbooks[realm].expiresAt);
        const isValid = expiresAt > new Date();
        console.log(`   - Realm ID: ${realm}`);
        console.log(`     Token expires: ${expiresAt.toLocaleString()} (${isValid ? 'Valid' : 'Expired'})`);
      });
    } else {
      console.log('\n❌ No QuickBooks connections found');
      console.log('   Visit: http://localhost:3000/auth/quickbooks to connect');
    }
  } catch (error) {
    console.log(`❌ Error reading token file: ${error.message}`);
  }
} else {
  console.log('❌ Token file not found');
  console.log('   No authentication data available yet');
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

// Show how to check environment variables
const dotenv = require('dotenv');
dotenv.config();

console.log('\n=== ENVIRONMENT CONFIGURATION ===');
const requiredVars = [
  'PORT', 'NODE_ENV', 'MIDDLEWARE_BASE_URL',
  'SF_CLIENT_ID', 'SF_CLIENT_SECRET', 'SF_REDIRECT_URI', 'SF_LOGIN_URL',
  'QB_CLIENT_ID', 'QB_CLIENT_SECRET', 'QB_REDIRECT_URI', 'QB_ENVIRONMENT',
  'API_KEY', 'TOKEN_ENCRYPTION_KEY'
];

let missingVars = 0;
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ Missing ${varName} in .env file`);
    missingVars++;
  }
});

if (missingVars === 0) {
  console.log('✅ All required environment variables are set');
} else {
  console.log(`\n⚠️ Missing ${missingVars} environment variables. Please update your .env file.`);
}
EOL

echo "Created test-oauth.js"
```

## Step 5: Test API Endpoints

Let's create a test script for API endpoints:

```bash
cat > test-api.js << 'EOL'
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
EOL

echo "Created test-api.js"
```

## Step 6: Test Scheduler Functionality

```bash
cat > test-scheduler.js << 'EOL'
/**
 * Test script for the scheduler functionality
 * Run with: node test-scheduler.js YOUR_API_KEY
 */
const axios = require('axios');

// Get API key from command line argument
const apiKey = process.argv[2];
if (!apiKey) {
  console.error('Error: API key is required');
  console.log('Usage: node test-scheduler.js YOUR_API_KEY');
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

// Test the scheduler
async function testScheduler() {
  console.log('=== SCHEDULER TESTS ===\n');
  
  try {
    // 1. Check scheduler status
    console.log('Checking scheduler status...');
    const statusResponse = await api.get('/scheduler/status');
    
    if (statusResponse.data.success) {
      console.log('✅ Scheduler status check passed');
      
      const jobs = statusResponse.data.jobs;
      console.log(`Found ${jobs.length} scheduled jobs:`);
      
      jobs.forEach(job => {
        console.log(`- ${job.name}: ${job.active ? 'Active' : 'Inactive'}`);
        if (job.nextRun) {
          console.log(`  Next run: ${new Date(job.nextRun).toLocaleString()}`);
        }
      });
      
      // 2. Trigger invoice creation
      console.log('\nTriggering manual invoice creation...');
      const invoiceResponse = await api.post('/scheduler/invoice-creation');
      
      if (invoiceResponse.data.success) {
        console.log('✅ Manual invoice creation triggered successfully');
        console.log(`Processed: ${invoiceResponse.data.processed || 0}`);
        console.log(`Successful: ${invoiceResponse.data.successful || 0}`);
        console.log(`Failed: ${invoiceResponse.data.failed || 0}`);
      } else {
        console.log('❌ Manual invoice creation failed');
        console.log(`Error: ${invoiceResponse.data.error || 'Unknown error'}`);
      }
      
      // 3. Trigger payment check
      console.log('\nTriggering manual payment check...');
      const paymentResponse = await api.post('/scheduler/payment-check');
      
      if (paymentResponse.data.success) {
        console.log('✅ Manual payment check triggered successfully');
        console.log(`Invoices processed: ${paymentResponse.data.invoicesProcessed || 0}`);
        console.log(`Paid invoices found: ${paymentResponse.data.paidInvoicesFound || 0}`);
        console.log(`Invoices updated: ${paymentResponse.data.invoicesUpdated || 0}`);
      } else {
        console.log('❌ Manual payment check failed');
        console.log(`Error: ${paymentResponse.data.error || 'Unknown error'}`);
      }
    } else {
      console.log('❌ Scheduler status check failed');
      console.log(`Error: ${statusResponse.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Error testing scheduler:');
    console.log(error.response?.data?.error || error.message);
  }
}

// Run the test
testScheduler();
EOL

echo "Created test-scheduler.js"
```

## Step 7: Comprehensive Verification Checklist

```bash
cat > verification-checklist.md << 'EOL'
# Salesforce-QuickBooks Integration Verification Checklist

Use this checklist to ensure all components of the integration are working properly before the demo.

## Initial Setup

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file configured with correct credentials
- [ ] Server starts without errors

## Authentication

- [ ] Salesforce authentication flow works
- [ ] QuickBooks authentication flow works
- [ ] OAuth tokens stored securely
- [ ] Token refresh mechanism works

## Core Functionality

- [ ] Invoice creation from eligible opportunities works
- [ ] Payment status updates successfully
- [ ] Scheduler runs on the configured schedule
- [ ] Error handling works properly
- [ ] Logs are created correctly

## API Endpoints

- [ ] Health check endpoint responds correctly
- [ ] OAuth status endpoint returns connection status
- [ ] Manual invoice creation endpoint works
- [ ] Manual payment check endpoint works
- [ ] Logs endpoint returns log data

## Security

- [ ] API key authentication works
- [ ] OAuth tokens are encrypted at rest
- [ ] No sensitive information is exposed in logs

## Demo Preparation

- [ ] Demo script reviewed and understood
- [ ] Test data prepared in Salesforce
- [ ] Test data prepared in QuickBooks
- [ ] Fallback options prepared in case of issues
- [ ] Monitoring dashboard functions (for internal use only)

## Post-Demo

- [ ] Notes taken on client feedback
- [ ] Action items documented
- [ ] Next steps planned

## Notes

_Use this section to document any issues or special considerations_

EOL

echo "Created verification-checklist.md"
```

## Step 8: Create a Helper Script to Initialize Test Data

```bash
cat > initialize-test-data.js << 'EOL'
/**
 * Helper script to initialize test data in Salesforce
 * This script requires jsforce package
 * Run with: node initialize-test-data.js SF_USERNAME SF_PASSWORD SF_SECURITY_TOKEN
 */
const jsforce = require('jsforce');

// Get credentials from command line arguments
const username = process.argv[2];
const password = process.argv[3];
const securityToken = process.argv[4] || '';

if (!username || !password) {
  console.error('Error: Salesforce credentials are required');
  console.log('Usage: node initialize-test-data.js SF_USERNAME SF_PASSWORD [SF_SECURITY_TOKEN]');
  process.exit(1);
}

// Create a connection
const conn = new jsforce.Connection({
  loginUrl: 'https://login.salesforce.com'
});

// Helper function to create an opportunity
async function createTestOpportunity(name, stage, amount, closeDate, accountId) {
  try {
    const result = await conn.sobject('Opportunity').create({
      Name: name,
      StageName: stage,
      Amount: amount,
      CloseDate: closeDate,
      AccountId: accountId
    });
    
    if (result.success) {
      console.log(`✅ Created opportunity: ${name} (ID: ${result.id})`);
      return result.id;
    } else {
      console.log(`❌ Failed to create opportunity: ${name}`);
      console.log(`   Error: ${result.errors.join(', ')}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating opportunity ${name}: ${error.message}`);
    return null;
  }
}

// Initialize test data
async function initializeTestData() {
  try {
    console.log(`Logging in as ${username}...`);
    await conn.login(username, password + securityToken);
    console.log(`✅ Logged in successfully`);
    
    // Find a test account (or create one if needed)
    console.log('Looking for a test account...');
    const accountQuery = await conn.query("SELECT Id, Name FROM Account LIMIT 1");
    
    let accountId;
    if (accountQuery.records.length > 0) {
      accountId = accountQuery.records[0].Id;
      console.log(`✅ Using existing account: ${accountQuery.records[0].Name} (ID: ${accountId})`);
    } else {
      // Create a test account
      console.log('No accounts found. Creating a test account...');
      const accountResult = await conn.sobject('Account').create({
        Name: 'Test Account for Integration'
      });
      
      if (accountResult.success) {
        accountId = accountResult.id;
        console.log(`✅ Created test account (ID: ${accountId})`);
      } else {
        console.log('❌ Failed to create test account');
        return;
      }
    }
    
    // Create test opportunities
    console.log('\nCreating test opportunities...');
    
    // 1. A "Closed Won" opportunity for immediate processing
    const today = new Date();
    const closedWonId = await createTestOpportunity(
      'Test Closed Won Opportunity',
      'Closed Won',
      1000,
      today.toISOString().split('T')[0],
      accountId
    );
    
    // 2. A "Prospecting" opportunity that can be moved to "Closed Won" during demo
    const prospectingId = await createTestOpportunity(
      'Test Prospecting Opportunity',
      'Prospecting',
      2000,
      today.toISOString().split('T')[0],
      accountId
    );
    
    console.log('\n=== TEST DATA SUMMARY ===');
    console.log(`Account ID: ${accountId}`);
    console.log(`Closed Won Opportunity ID: ${closedWonId || 'Creation failed'}`);
    console.log(`Prospecting Opportunity ID: ${prospectingId || 'Creation failed'}`);
    console.log('\nUse these IDs during the demo to show the integration in action.');
  } catch (error) {
    console.error('Error initializing test data:', error.message);
  }
}

// Run the initialization
initializeTestData();
EOL

echo "Created initialize-test-data.js"
```

## Step 9: Final Verification Script

```bash
cat > verify-installation.js << 'EOL'
/**
 * Comprehensive verification script for the Salesforce-QuickBooks integration
 * Run with: node verify-installation.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check directory structure
console.log('=== CHECKING DIRECTORY STRUCTURE ===');
const requiredDirs = [
  'src',
  'src/config',
  'src/routes',
  'src/services',
  'src/middleware',
  'src/utils',
  'logs',
  'data',
  'internal_tools/monitoring',
  'docs'
];

let missingDirs = 0;
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`❌ Missing directory: ${dir}`);
    missingDirs++;
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

if (missingDirs > 0) {
  console.log(`\n⚠️ ${missingDirs} directories are missing. Run the setup scripts first.`);
}

// Check required files
console.log('\n=== CHECKING REQUIRED FILES ===');
const requiredFiles = [
  'src/server.js',
  'src/app.js',
  'src/config/index.js',
  'src/utils/logger.js',
  'src/middleware/error-handler.js',
  'src/services/oauth-manager.js',
  'src/services/scheduler.js',
  'src/routes/auth.js',
  'src/routes/api.js',
  'src/routes/scheduler.js',
  'src/routes/webhook.js',
  'package.json',
  '.env.example',
  'README.md'
];

let missingFiles = 0;
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`❌ Missing file: ${file}`);
    missingFiles++;
  } else {
    console.log(`✅ File exists: ${file}`);
  }
});

if (missingFiles > 0) {
  console.log(`\n⚠️ ${missingFiles} files are missing. Run the setup scripts first.`);
}

// Check .env file
console.log('\n=== CHECKING ENVIRONMENT CONFIGURATION ===');
if (!fs.existsSync('.env')) {
  console.log('❌ .env file is missing');
  console.log('   Copy .env.example to .env and configure it with your credentials');
} else {
  console.log('✅ .env file exists');
  
  // Check for required variables
  const dotenv = require('dotenv');
  dotenv.config();
  
  const requiredVars = [
    'PORT', 'NODE_ENV', 'MIDDLEWARE_BASE_URL',
    'SF_CLIENT_ID', 'SF_CLIENT_SECRET', 'SF_REDIRECT_URI', 'SF_LOGIN_URL',
    'QB_CLIENT_ID', 'QB_CLIENT_SECRET', 'QB_REDIRECT_URI', 'QB_ENVIRONMENT',
    'API_KEY', 'TOKEN_ENCRYPTION_KEY'
  ];
  
  let missingVars = 0;
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`❌ Missing ${varName} in .env file`);
      missingVars++;
    } else {
      console.log(`✅ ${varName} is configured`);
    }
  });
  
  if (missingVars > 0) {
    console.log(`\n⚠️ ${missingVars} environment variables are missing in your .env file`);
  }
}

// Check dependencies
console.log('\n=== CHECKING DEPENDENCIES ===');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'axios', 'cors', 'dotenv', 'express', 'helmet', 'jsforce', 
    'node-cron', 'node-quickbooks', 'winston'
  ];
  
  let missingDeps = 0;
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      console.log(`❌ Missing dependency: ${dep}`);
      missingDeps++;
    } else {
      console.log(`✅ Dependency exists: ${dep}`);
    }
  });
  
  if (missingDeps > 0) {
    console.log(`\n⚠️ ${missingDeps} dependencies are missing in package.json`);
  }
  
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    console.log('\n⚠️ node_modules directory not found. Run npm install');
  } else {
    console.log('\n✅ node_modules directory exists');
  }
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
}

// Final status summary
console.log('\n=== VERIFICATION SUMMARY ===');
if (missingDirs === 0 && missingFiles === 0) {
  console.log('✅ All required directories and files are present');
  console.log('\nNext steps:');
  console.log('1. Ensure your .env file is configured correctly');
  console.log('2. Install dependencies: npm install');
  console.log('3. Start the server: npm start');
  console.log('4. Authenticate with Salesforce and QuickBooks');
  console.log('5. Run the test scripts to verify functionality');
} else {
  console.log('❌ Some required directories or files are missing');
  console.log('\nPlease run the setup scripts to create the required structure');
}
EOL

echo "Created verify-installation.js"
```

## Comprehensive Testing Process

Now that we have all the test scripts, let's detail the process for a thorough verification:

1. **Backup existing files**:
   ```bash
   # Run the backup script provided earlier
   ```

2. **Implement the new solution**:
   ```bash
   # Run all the implementation scripts from the previous message
   ```

3. **Verify installation**:
   ```bash
   node verify-installation.js
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Authenticate with Salesforce and QuickBooks**:
   - Open http://localhost:3000/auth/salesforce in your browser
   - Complete the Salesforce OAuth flow
   - Open http://localhost:3000/auth/quickbooks in your browser
   - Complete the QuickBooks OAuth flow

7. **Verify OAuth connections**:
   ```bash
   node test-oauth.js
   ```

8. **Create test data in Salesforce**:
   ```bash
   node initialize-test-data.js YOUR_SF_USERNAME YOUR_SF_PASSWORD YOUR_SF_SECURITY_TOKEN
   ```

9. **Test API endpoints**:
   ```bash
   node test-api.js YOUR_API_KEY
   ```

10. **Test scheduler functionality**:
    ```bash
    node test-scheduler.js YOUR_API_KEY
    ```

11. **Run a complete flow test**:
    - Find the opportunity IDs from the test data setup
    - Manually trigger the invoice creation process:
      ```bash
      curl -X POST -H "X-API-Key: YOUR_API_KEY" -H "Content-Type: application/json" \
        -d '{"opportunityId":"OPPORTUNITY_ID_HERE"}' \
        http://localhost:3000/api/create-invoice
      ```
    - Verify the invoice was created in QuickBooks
    - Mark the invoice as paid in QuickBooks
    - Manually trigger the payment status check:
      ```bash
      curl -X POST -H "X-API-Key: YOUR_API_KEY" http://localhost:3000/scheduler/payment-check
      ```
    - Verify the payment status was updated in Salesforce

12. **Final verification**:
    - Run through the verification checklist
    - Make any necessary adjustments
    - Ensure all tests pass

After completing these steps, you'll have a thoroughly tested integration ready for demonstration. The automated middleware will be reliable, and you'll have confidence that all the components work as expected.
