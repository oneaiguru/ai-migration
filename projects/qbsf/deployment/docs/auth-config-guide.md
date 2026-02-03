# Authentication & Configuration Guide

After setting up the middleware, Salesforce components, and QuickBooks developer app, you need to connect all these components together through authentication and configuration.

## 1. Start the Middleware Server

Start your middleware server using one of these methods:

**For development/testing:**
```bash
npm run dev
```

**For production (with PM2):**
```bash
# If PM2 is not installed
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js
```

## 2. Authorize Salesforce Connection

1. Navigate to your middleware's Salesforce authorization URL:
   ```
   https://[your-middleware-domain]/auth/salesforce
   ```
   For local testing: `http://localhost:3000/auth/salesforce`

2. You'll be redirected to the Salesforce login screen
3. Log in with your Salesforce credentials
4. Grant the requested permissions
5. You should see a success message after authorization completes

## 3. Authorize QuickBooks Connection

1. Navigate to your middleware's QuickBooks authorization URL:
   ```
   https://[your-middleware-domain]/auth/quickbooks
   ```
   For local testing: `http://localhost:3000/auth/quickbooks`

2. You'll be redirected to the QuickBooks login screen
3. Log in with your QuickBooks credentials
4. Select your company if prompted
5. Grant the requested permissions
6. You should see a success message after authorization completes

## 4. Verify OAuth Connections

Check that both connections are established properly:

```bash
# Replace YOUR_API_KEY with your actual API key
curl -H "X-API-Key: YOUR_API_KEY" https://[your-middleware-domain]/auth/status

# Expected response (example):
# {
#   "success": true,
#   "status": {
#     "salesforce": {
#       "connected": true,
#       "instances": [{"instanceUrl": "https://yourorg.my.salesforce.com", "expiresAt": "..."}]
#     },
#     "quickbooks": {
#       "connected": true,
#       "companies": [{"realmId": "12345678", "expiresAt": "..."}]
#     }
#   }
# }
```

Note down these values from the response:
- Salesforce instance URL (e.g., `https://yourorg.my.salesforce.com`)
- QuickBooks realm ID (company ID)

## 5. Configure Salesforce Settings

1. In Salesforce, go to **Setup → Custom Settings → QB Integration Settings**
2. Click "Manage"
3. Click "New" at the "Default Organization Level"
4. Enter the following details:
   - **Middleware Endpoint**: Your middleware URL (e.g., `https://your-middleware.com` or `http://localhost:3000` for testing)
   - **API Key**: The API key you generated during middleware setup
   - **QB Realm ID**: Your QuickBooks company ID (visible in the `/auth/status` response above)
5. Click "Save"

## 6. Test the Connection

```bash
# Replace YOUR_API_KEY, SF_INSTANCE, and QB_REALM with your actual values
curl -X POST -H "X-API-Key: YOUR_API_KEY" -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"SF_INSTANCE","quickbooksRealm":"QB_REALM"}' \
  https://[your-middleware-domain]/api/test-connection
```

A successful response should show connection details for both systems. If either connection fails, review the error message and resolve the issue before proceeding.

## 7. Map Products Between Systems

For each product in Salesforce that will be used in invoices:

1. Go to QuickBooks and identify the Item ID for the corresponding product
2. In Salesforce, navigate to the Products tab
3. Edit each product
4. Enter the corresponding QuickBooks Item ID in the "QB Item ID" field
5. Save the changes

This mapping is essential for the integration to create correct invoice line items in QuickBooks.
