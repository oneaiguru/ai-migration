# Troubleshooting Guide

This guide covers common issues you might encounter during setup and operation of the Salesforce-QuickBooks integration.

## Common Issues by Component

### Salesforce Issues

| Problem | Possible Causes | Solutions |
|---------|----------------|-----------|
| Trigger not firing | - Trigger inactive<br>- Opportunity stage name mismatch | - Check trigger status in Setup → Apex Triggers<br>- Verify stage name is exactly "Closed Won" (case-sensitive) |
| Custom fields not appearing | - Deployment failed<br>- Permission issues | - Check Setup → Deployment Status<br>- Verify field-level security settings |
| Scheduled job not running | - Job not scheduled<br>- Job failed | - Check Setup → Scheduled Jobs<br>- Review debug logs |

### Middleware Issues

| Problem | Possible Causes | Solutions |
|---------|----------------|-----------|
| Cannot start server | - Node.js missing<br>- Dependencies not installed<br>- Port conflict | - Install Node.js v14+<br>- Run `npm install`<br>- Change port in .env file |
| Cannot connect to Salesforce/QuickBooks | - OAuth tokens expired<br>- Incorrect credentials<br>- Middleware URL not accessible | - Reauthorize connections<br>- Verify credentials in .env<br>- Ensure middleware is publicly accessible |
| Payment status check failing | - Scheduler not running<br>- Connection issues<br>- Permission issues | - Check PM2 status<br>- Check OAuth status<br>- Verify API permissions |

### QuickBooks Issues

| Problem | Possible Causes | Solutions |
|---------|----------------|-----------|
| Invoice creation fails | - Item mapping missing<br>- Customer issues<br>- API limits | - Check QB_Item_ID__c on products<br>- Verify customer exists or can be created<br>- Check API call limits |
| Payment detection fails | - Payment improperly applied<br>- OAuth issues | - Ensure payment is fully applied to invoice<br>- Reauthorize QuickBooks connection |

## Specific Error Scenarios and Solutions

### Error: "Middleware endpoint not configured"

**Cause**: The Salesforce custom setting for the middleware endpoint is missing or invalid.

**Solution**:
1. Go to Setup → Custom Settings → QB Integration Settings
2. Click "Manage"
3. Verify settings at Default Organization Level
4. Ensure Middleware_Endpoint__c is correct and does not have a trailing slash

### Error: "Invalid API key"

**Cause**: The API key in Salesforce doesn't match the one in the middleware.

**Solution**:
1. Check the API key in your middleware .env file
2. Update the API_Key__c field in Salesforce custom settings to match

### Error: "No OAuth token found"

**Cause**: The OAuth connection has not been established or tokens have expired.

**Solution**:
1. Navigate to authorization URLs:
   - Salesforce: `https://[your-middleware-domain]/auth/salesforce`
   - QuickBooks: `https://[your-middleware-domain]/auth/quickbooks`
2. Complete the authorization process
3. Verify status with: `curl -H "X-API-Key: YOUR_API_KEY" https://[your-middleware-domain]/auth/status`

### Error: "Product mapping not found"

**Cause**: The QuickBooks Item ID is missing for a product in the opportunity.

**Solution**:
1. Go to Products in Salesforce
2. Edit the product(s) in the opportunity
3. Add the correct QB_Item_ID__c value from your QuickBooks items

### Error: "Customer creation failed"

**Cause**: Issues creating or finding the customer in QuickBooks.

**Solution**:
1. Check if a customer with the same name already exists in QuickBooks
2. Ensure the account in Salesforce has proper contact information
3. If duplicates are the issue, consider adding a unique identifier to account names

## Middleware Logs and Debugging

### Checking Middleware Logs

```bash
# View recent errors
tail -100 logs/error.log

# Search for specific errors
grep "token expired" logs/combined.log

# Check for customer creation issues
grep "customer" logs/error.log

# Look for invoice creation activity
grep "Creating invoice" logs/combined.log
```

### Salesforce Logs

1. Custom Objects:
   - Review QB_Integration_Log__c for general logs
   - Check QB_Integration_Error_Log__c for detailed error information

2. Debug Logs:
   - Setup → Environments → Logs → Debug Logs
   - Set up logging for the user running the integration

3. Developer Console:
   - Use `System.debug()` statements in code
   - Add temporary debug logs for troubleshooting

### QuickBooks Audit Trail

1. In QuickBooks Online, click the Gear icon → Audit Log
2. Filter by "Invoices" and the relevant date range
3. Look for invoice creation and updates

## Reauthorization Process

If OAuth tokens need to be refreshed manually:

1. Navigate to the authorization URLs:
   - Salesforce: `https://[your-middleware-domain]/auth/salesforce`
   - QuickBooks: `https://[your-middleware-domain]/auth/quickbooks`

2. Complete the authorization process for each platform

3. Verify the connections:
   ```bash
   curl -H "X-API-Key: YOUR_API_KEY" https://[your-middleware-domain]/auth/status
   ```

## Testing API Connectivity

```bash
# Test middleware health
curl -H "X-API-Key: YOUR_API_KEY" https://[your-middleware-domain]/api/health

# Test connections to both systems
curl -X POST -H "X-API-Key: YOUR_API_KEY" -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://yourorg.my.salesforce.com","quickbooksRealm":"12345678"}' \
  https://[your-middleware-domain]/api/test-connection
```
