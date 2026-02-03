# Salesforce-QuickBooks Integration Testing Guide

This guide will walk you through the process of testing your Salesforce-QuickBooks integration to ensure all components are working correctly.

## Prerequisites

- Completed [Salesforce-QuickBooks Integration Implementation Guide](implementation-guide)
- Access to Salesforce and QuickBooks Online accounts
- Middleware server up and running
- All API credentials configured

## Step 1: Verify Middleware Health

First, check that your middleware is running correctly:

```bash
# Check the health endpoint
curl -H "X-API-Key: your_api_key" https://your-middleware.com/api/health

# Expected response:
# {
#   "success": true,
#   "status": "healthy",
#   "timestamp": "2023-05-08T12:00:00.000Z"
# }
```

## Step 2: Verify OAuth Connections

Verify that OAuth connections to both Salesforce and QuickBooks are established:

```bash
# Check OAuth status
curl -H "X-API-Key: your_api_key" https://your-middleware.com/auth/status

# Expected response:
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

If either connection shows as not connected, revisit the OAuth authorization steps:

- For Salesforce: Visit `https://your-middleware.com/auth/salesforce`
- For QuickBooks: Visit `https://your-middleware.com/auth/quickbooks`

## Step 3: Test Connection to Both Systems

Verify that the middleware can communicate with both systems:

```bash
# Test connection to both systems
curl -X POST -H "X-API-Key: your_api_key" -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://yourorg.my.salesforce.com","quickbooksRealm":"12345678"}' \
  https://your-middleware.com/api/test-connection

# Expected successful response shows connection details for both systems
```

## Step 4: Create Test Opportunity in Salesforce

1. Log in to Salesforce
2. Navigate to Opportunities
3. Create a new Opportunity with the following details:
   - Account: An existing account (preferably one that matches a customer in QuickBooks)
   - Opportunity Name: "QuickBooks Integration Test"
   - Amount: $100.00
   - Close Date: Today's date
   - Stage: "Prospecting" (initially - we'll change this later)

4. Add products to the Opportunity:
   - Click "Add Products" on the Opportunity detail page
   - Select at least one product that has a QuickBooks Item ID configured
   - Set the quantity and unit price

5. Note the Opportunity ID for later reference (from the URL, e.g., 006XXXXXXXXXXXXXXX)

## Step 5: Test Invoice Creation

1. Update the Opportunity Stage to "Closed Won"
   - This should trigger the Salesforce apex trigger to call the middleware
   - The middleware should create an invoice in QuickBooks

2. Wait a few moments (usually less than a minute)

3. Verify in Salesforce:
   - Refresh the Opportunity page
   - Check that the "QB Invoice ID" field now contains a value

4. Verify in QuickBooks:
   - Log in to QuickBooks Online
   - Navigate to Sales > Invoices
   - Look for a new invoice with the customer name matching the Account from your Opportunity
   - Verify the amount matches your Opportunity
   - Note: The invoice should have a private note mentioning "Created from Salesforce Opportunity: QuickBooks Integration Test"

5. If the invoice was not created:
   - Check the Salesforce debug logs for trigger execution
   - Check the middleware logs for errors (`logs/error.log`)
   - Check the QB_Integration_Error_Log__c object in Salesforce

## Step 6: Test Payment Detection

1. Mark the invoice as paid in QuickBooks:
   - Open the invoice
   - Click "Receive Payment"
   - Enter payment details and save

2. Manually trigger the payment status check:

```bash
# Trigger payment check manually
curl -X POST -H "X-API-Key: your_api_key" https://your-middleware.com/scheduler/payment-check

# Expected response:
# {
#   "success": true,
#   "invoicesProcessed": 1,
#   "paidInvoicesFound": 1,
#   "invoicesUpdated": 1,
#   "message": "Successfully updated 1 Salesforce records"
# }
```

3. Verify in Salesforce:
   - Refresh the Opportunity page
   - The "QB Payment Date" field should now be populated
   - The "QB Payment Method" field should show the payment method
   - The "QB Payment Amount" field should show the payment amount

## Step 7: Verify Scheduled Job

1. Verify the scheduled job for payment status checking is set up:
   - In Salesforce, go to Setup > Environments > Jobs > Scheduled Jobs
   - Look for "QuickBooks Payment Status Check" in the list
   - Verify the Next Scheduled Run date/time is set correctly (should run daily at 1:00 AM by default)

2. Additionally, check the middleware scheduler is running:
   - Look in the middleware logs for scheduler startup messages
   - If using PM2, check the process is running: `pm2 list`

## Step 8: End-to-End Test with New Opportunity

Now that you've verified each component, perform a complete end-to-end test:

1. Create a new Opportunity with products
2. Set it to "Closed Won"
3. Verify the Invoice is created in QuickBooks
4. Mark the Invoice as paid in QuickBooks
5. Wait for the scheduled payment check or trigger it manually
6. Verify the Opportunity is updated with payment information

## Troubleshooting

### Invoice Not Created

If the invoice isn't created when you set an Opportunity to "Closed Won":

1. Check that the trigger is active:
   ```apex
   // Run in Developer Console to check trigger status
   System.debug([SELECT Id, IsActive FROM ApexTrigger WHERE Name = 'OpportunityQuickBooksTrigger'][0].IsActive);
   ```

2. Verify the middleware endpoint and API key in Salesforce custom settings:
   - Setup > Custom Settings > QB Integration Settings

3. Check the Salesforce logs for API callout errors:
   - Setup > Environments > Logs > Debug Logs

4. Check the middleware logs:
   ```bash
   tail -100 logs/error.log
   ```

### Payment Status Not Updating

If payment status isn't updating in Salesforce:

1. Verify the scheduler is running:
   ```bash
   # Check if the process is running (if using PM2)
   pm2 list
   
   # Check scheduler logs
   grep "scheduler" logs/combined.log
   ```

2. Check that the payment was properly recorded in QuickBooks:
   - Ensure the payment is fully applied to the invoice
   - Verify the invoice balance is zero

3. Try running the payment check manually:
   ```bash
   curl -X POST -H "X-API-Key: your_api_key" https://your-middleware.com/scheduler/payment-check
   ```

4. Check for errors in the middleware logs:
   ```bash
   tail -100 logs/error.log
   ```

## Conclusion

If all steps above are successful, your Salesforce-QuickBooks integration is working properly! You now have an automated system that:

1. Creates QuickBooks invoices from Salesforce opportunities
2. Tracks payment status in QuickBooks
3. Updates Salesforce when payments are received

For ongoing maintenance, regularly check the error logs in both the middleware and Salesforce to ensure continued smooth operation.
