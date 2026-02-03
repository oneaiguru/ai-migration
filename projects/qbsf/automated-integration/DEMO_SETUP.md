# Salesforce-QuickBooks Integration Demo Setup

## Prerequisites

1. Working middleware from `automated-integration` folder
2. Salesforce org with API access
3. QuickBooks sandbox account
4. OAuth tokens already set up (using existing oauth-manager)

## Setup Steps

### 1. Deploy Salesforce Components

1. Deploy the Apex class:
   ```bash
   # Copy QuickBooksInvoker.cls to your Salesforce project
   sfdx force:source:deploy -m ApexClass:QuickBooksInvoker
   ```

2. Create Quick Action:
   - Go to Setup → Object Manager → Opportunity
   - Quick Actions → New Action
   - Action Type: Lightning Component
   - Label: Create QuickBooks Invoice
   - Save

3. Add Quick Action to Page Layout:
   - Opportunity Page Layouts
   - Add the Quick Action to the Salesforce Mobile and Lightning Actions section

### 2. Configure Middleware

1. Update your `.env` file:
   ```env
   # Existing configuration
   PORT=3000
   API_KEY=your-demo-api-key
   
   # Salesforce settings
   SF_CLIENT_ID=your-salesforce-client-id
   SF_CLIENT_SECRET=your-salesforce-client-secret
   
   # QuickBooks settings
   QB_CLIENT_ID=your-quickbooks-client-id
   QB_CLIENT_SECRET=your-quickbooks-client-secret
   QB_ENVIRONMENT=sandbox
   ```

2. Replace the standard API route with demo version:
   ```bash
   # Backup original
   mv src/routes/api.js src/routes/api-original.js
   
   # Use demo version
   cp src/routes/api-demo.js src/routes/api.js
   ```

### 3. Update Apex Class Settings

In `QuickBooksInvoker.cls`, update these constants:
```apex
private static final String MIDDLEWARE_URL = 'http://localhost:3000';
private static final String API_KEY = 'your-demo-api-key';
```

Also update the `getQuickBooksRealmId()` method:
```apex
private static String getQuickBooksRealmId() {
    return '123456789'; // Your actual QuickBooks realm ID
}
```

### 4. Run the Demo

1. Start the middleware:
   ```bash
   cd automated-integration
   npm start
   ```

2. Open a test Opportunity in Salesforce

3. Click the "Create QuickBooks Invoice" button

4. Watch the console logs in your middleware

5. Check QuickBooks for the new invoice

6. Mark invoice as paid in QuickBooks

7. Run payment check:
   ```bash
   ./test-demo.sh
   ```

8. Verify Opportunity is updated with payment info

## Demo Script

### Part 1: Invoice Creation
1. "Here we have a Closed Won opportunity in Salesforce"
2. "Click the Create QuickBooks Invoice button"
3. "Watch the real-time logs showing the integration"
4. "Check QuickBooks - invoice is created"
5. "Check Salesforce - QB_Invoice_ID__c is populated"

### Part 2: Payment Sync
1. "In QuickBooks, mark the invoice as paid"
2. "Run the payment check script"
3. "See the payment information sync back to Salesforce"
4. "The opportunity now shows payment details"

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check API_KEY matches in both Apex and .env
2. **Connection refused**: Ensure middleware is running on correct port
3. **Token errors**: Run the OAuth flow again using existing routes
4. **CORS errors**: Add Salesforce domain to Remote Sites

### Debug Mode

Enable detailed logging:
```javascript
// In api-demo.js
logger.level = 'debug';
```

### Test Without Salesforce Button

Use the test script directly:
```bash
./test-demo.sh
```

Or use curl:
```bash
curl -X POST http://localhost:3000/api/create-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "opportunityId": "006XX000012345ABC",
    "salesforceInstance": "https://your-instance.my.salesforce.com",
    "quickbooksRealm": "123456789"
  }'
```
EOL < /dev/null