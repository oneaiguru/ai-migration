# Salesforce-QuickBooks Integration Implementation Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Salesforce Setup](#salesforce-setup)
3. [QuickBooks Setup](#quickbooks-setup)
4. [Middleware Setup](#middleware-setup)
5. [Configuration and Testing](#configuration-and-testing)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Access and Tools
- Salesforce Developer or Admin access 
- QuickBooks Online Administrator access
- Node.js environment (v20+ required)
- A server or cloud platform to host the middleware (Heroku, AWS, etc.)

### Required Information
- Salesforce Organization ID
- Salesforce API credentials (Connected App)
- QuickBooks Company ID (Realm ID)
- QuickBooks API credentials (App credentials)

## Salesforce Setup

### 1. Create Custom Fields

Add the following custom fields to the Opportunity object:

| Field Label | API Name | Data Type | Description |
|-------------|----------|-----------|-------------|
| QB Invoice ID | QB_Invoice_ID__c | Text(255) | Stores the QuickBooks Invoice ID |
| QB Payment Date | QB_Payment_Date__c | Date | Date payment was received |
| QB Payment Reference | QB_Payment_Reference__c | Text(255) | Reference number for payment |
| QB Payment Method | QB_Payment_Method__c | Text(255) | Method of payment (check, credit card, etc.) |
| QB Payment Amount | QB_Payment_Amount__c | Currency | Amount of payment received |

Also, add a custom field to the Product2 object:

| Field Label | API Name | Data Type | Description |
|-------------|----------|-----------|-------------|
| QB Item ID | QB_Item_ID__c | Text(255) | QuickBooks Item ID |

### 2. Create Custom Objects

#### QB Integration Settings
Create a custom setting to store integration configuration:

```bash
# Create the custom setting via SFDX (alternative to manual setup)
sfdx force:source:deploy -p 1000011/Salesforce/objects/QB_Integration_Settings.object
```

Or create manually with these fields:
- Middleware Endpoint (Text)
- API Key (Text) 
- QB Realm ID (Text)

#### Error and Log Objects
Create custom objects for logging:

```bash
# Deploy via SFDX
sfdx force:source:deploy -p 1000011/Salesforce/objects/QB_Integration_Error_Log.object
sfdx force:source:deploy -p 1000011/Salesforce/objects/QB_Integration_Log.object
```

### 3. Create Apex Classes and Trigger

Deploy the Apex classes and trigger:

```bash
# Deploy via SFDX
sfdx force:source:deploy -p 1000011/Salesforce/OpportunityQuickBooksTrigger.trigger
sfdx force:source:deploy -p 1000011/Salesforce/QBInvoiceIntegrationQueueable.cls
sfdx force:source:deploy -p 1000011/Salesforce/QBPaymentStatusScheduler.cls
```

### 4. Schedule Payment Status Check

In Salesforce, set up the scheduler to run nightly:

```apex
// Execute in Salesforce Developer Console to schedule the job
QBPaymentStatusScheduler.scheduleNightly();
```

## QuickBooks Setup

### 1. Create App in QuickBooks Developer Portal

1. Go to https://developer.intuit.com/ and sign in
2. Navigate to "Dashboard" > "Create an app"
3. Select "API" app type
4. Enter app name (e.g., "Salesforce Integration")
5. Select APIs: "QuickBooks Online API"
6. Set Production/Development: "Development" initially
7. For OAuth redirect URI, enter your middleware callback URL (e.g., https://your-middleware.com/auth/quickbooks/callback)
8. Save app and note the Client ID and Secret

### 2. Map Products/Services in QuickBooks

Ensure your products in QuickBooks have corresponding Products in Salesforce:

1. For each Product in Salesforce, create a corresponding Item in QuickBooks
2. Note the ID of each QuickBooks Item
3. Update the Product in Salesforce with the QuickBooks Item ID in the QB_Item_ID__c field

## Middleware Setup

### 1. Server Preparation

Prepare your server environment:

```bash
# Clone or upload the middleware code
mkdir sf-qb-middleware
cd sf-qb-middleware
cp -r /path/to/1000011/* .

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file with the required configuration:

```bash
# .env file
PORT=3000
NODE_ENV=production

# Salesforce credentials
SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_REDIRECT_URI=https://your-middleware.com/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks credentials
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_REDIRECT_URI=https://your-middleware.com/auth/quickbooks/callback
QB_ENVIRONMENT=production

# Security
API_KEY=your_generated_api_key
TOKEN_ENCRYPTION_KEY=your_32_byte_encryption_key

# Scheduler
PAYMENT_CHECK_CRON=0 1 * * *

# Base URL (for production)
MIDDLEWARE_BASE_URL=https://your-middleware.com
```

Generate a secure API key and encryption key:

```javascript
// Run this in Node.js to generate keys
const crypto = require('crypto');
console.log('API Key:', crypto.randomBytes(24).toString('hex'));
console.log('Encryption Key:', crypto.randomBytes(32).toString('hex'));
```

### 3. Start the Middleware

Start the server:

```bash
# For production, use a process manager like PM2
npm install -g pm2
pm2 start src/server.js --name sf-qb-integration

# Or for development
npm run dev
```

## Configuration and Testing

### 1. Authorize the Applications

1. Navigate to the OAuth initialization URLs:
   - Salesforce: `https://your-middleware.com/auth/salesforce`
   - QuickBooks: `https://your-middleware.com/auth/quickbooks`

2. Complete the authorization flow for both platforms

3. Verify the connections:
   ```
   curl -H "X-API-Key: your_api_key" https://your-middleware.com/auth/status
   ```

### 2. Configure Salesforce

In Salesforce, add the integration settings:

1. Go to Setup > Custom Settings > QB Integration Settings
2. Click "Manage" then "New" (at Default Organization Level)
3. Enter the configuration:
   - Middleware Endpoint: https://your-middleware.com
   - API Key: your_generated_api_key  
   - QB Realm ID: your_quickbooks_company_id

### 3. Test the Integration Flow

#### Test Invoice Creation
1. Create a test Opportunity in Salesforce
2. Set the Stage to "Closed Won"
3. Verify in the Salesforce logs that the trigger fired
4. Check QuickBooks for the new Invoice
5. Verify the Opportunity in Salesforce has been updated with the QB_Invoice_ID__c

#### Test Payment Status Check
1. In QuickBooks, mark the test Invoice as paid
2. Manually trigger the payment check:
   ```
   curl -X POST -H "X-API-Key: your_api_key" https://your-middleware.com/scheduler/payment-check
   ```
3. Verify the Opportunity in Salesforce has been updated with payment information

## Monitoring and Maintenance

### Log Monitoring

1. Middleware logs are stored in the `logs` directory
2. Salesforce logs are stored in the custom `QB_Integration_Log__c` and `QB_Integration_Error_Log__c` objects

### Health Checks

Periodically check the middleware health:

```bash
curl -H "X-API-Key: your_api_key" https://your-middleware.com/api/health
```

### Token Refresh

OAuth tokens are automatically refreshed by the middleware. However, if authorization fails:

1. Check the middleware logs for token errors
2. Re-authorize the affected platform through the OAuth URLs

### API Version Management

The integration uses Salesforce API v56.0, which is fully supported (Salesforce supports API versions 31.0 through 63.0). If you want to use the latest features, you can optionally update the API version:

1. Open `src/services/salesforce-api.js`
2. Change `this.apiVersion = 'v56.0'` to `this.apiVersion = 'v63.0'`

## Troubleshooting

### Common Issues and Solutions

#### Middleware Connection Errors
- Verify the server is running
- Check network connectivity and firewall settings
- Ensure the API Key is correctly configured in both Salesforce and middleware

#### Salesforce Trigger Not Firing
- Verify the trigger is active
- Check debug logs for errors
- Ensure the Opportunity Stage is exactly "Closed Won"

#### QuickBooks Invoice Creation Failures
- Verify the QuickBooks authorization is valid
- Check if products have valid QB_Item_ID__c values
- Look for validation errors in the middleware logs

#### Payment Status Not Updating
- Check the scheduler job in Salesforce
- Verify the cron job is running in the middleware
- Ensure the Invoice has been fully paid in QuickBooks

#### Node.js Version Issues
- Ensure you're running Node.js v20+ (earlier versions have reached end-of-life)
- If you can't upgrade Node.js, you may need to modify the version check in the scripts

### Support Resources

- QuickBooks API Documentation: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/account
- Salesforce API Documentation: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm
- Middleware Code Repository: (Your repository URL)

---

**Note**: This integration should be thoroughly tested in sandbox environments before deploying to production. Always follow security best practices for API keys and credentials.
