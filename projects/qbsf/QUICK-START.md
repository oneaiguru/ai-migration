# Salesforce-QuickBooks Integration Quick Start Guide

This guide provides step-by-step instructions to get started with testing the Salesforce-QuickBooks integration middleware.

## Prerequisites

1. Node.js installed (v14+ recommended)
2. npm or yarn 
3. Salesforce developer account
4. QuickBooks developer account

## Setup Steps

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
MIDDLEWARE_BASE_URL=http://localhost:3000

SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_REDIRECT_URI=http://localhost:3000/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_REDIRECT_URI=http://localhost:3000/auth/quickbooks/callback
QB_ENVIRONMENT=sandbox

API_KEY=your_secure_api_key
TOKEN_ENCRYPTION_KEY=your_secure_encryption_key

INVOICE_CREATION_CRON=0 */2 * * *
PAYMENT_CHECK_CRON=0 1 * * *
```

Replace the placeholder values with your actual credentials.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Middleware

```bash
npm start
```

The server should now be running on port 3000 (or your specified port).

## Testing Process

Follow this sequence to verify the middleware functionality:

### Step 1: Verify OAuth Setup

```bash
node test-oauth.js
```

This will check if you have any existing OAuth tokens and environment configuration. If no tokens exist, you'll need to complete the authentication process:

1. Visit `http://localhost:3000/auth/salesforce` in your browser
2. Authorize the application in Salesforce
3. Visit `http://localhost:3000/auth/quickbooks` in your browser
4. Authorize the application in QuickBooks
5. Run `test-oauth.js` again to confirm connections

### Step 2: Test API Endpoints

```bash
node test-api.js YOUR_API_KEY
```

Replace `YOUR_API_KEY` with the value you set in your `.env` file. This test will verify that all API endpoints are functioning correctly.

### Step 3: Test Scheduler Functionality

```bash
node test-scheduler.js YOUR_API_KEY
```

This will test the scheduled jobs for invoice creation and payment status updates.

## Troubleshooting

If you encounter issues:

1. Check your `.env` configuration
2. Ensure Salesforce and QuickBooks developer accounts are properly set up
3. Verify OAuth tokens are current (run `test-oauth.js`)
4. Check the logs at `logs/error.log` for detailed error information

## Next Steps

After confirming the middleware is functioning correctly, you can:

1. Set up a production environment
2. Configure cron schedules for your business needs
3. Integrate with your existing Salesforce instance
4. Set up webhook notifications if needed

For more detailed information, refer to the full documentation in the README.md file.