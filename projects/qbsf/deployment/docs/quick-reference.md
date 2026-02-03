# Salesforce-QuickBooks Integration: Quick Reference Guide

## Key Components

### Salesforce Components
- **Opportunity Trigger**: `OpportunityQuickBooksTrigger` - Fires when opportunities reach "Closed Won" stage
- **Queueable Class**: `QBInvoiceIntegrationQueueable` - Handles asynchronous API calls to middleware
- **Scheduler Class**: `QBPaymentStatusScheduler` - Runs nightly to check payment status
- **Custom Objects**: 
  - `QB_Integration_Settings__c` - Stores configuration
  - `QB_Integration_Log__c` - Tracks integration events
  - `QB_Integration_Error_Log__c` - Records errors

### Middleware Components
- **Server**: Node.js Express application
- **OAuth Manager**: Handles authentication with both platforms
- **API Services**: Interfaces with Salesforce and QuickBooks APIs
- **Scheduler**: Manages scheduled tasks like payment checks

## Common Commands

### Middleware Server Management

```bash
# Start server in development mode
npm run dev

# Start server in production mode
npm start

# Using PM2 for production
pm2 start ecosystem.config.js
pm2 status
pm2 logs sf-qb-integration
```

### API Testing

```bash
# Health check
curl -H "X-API-Key: your_api_key" https://your-middleware.com/api/health

# OAuth status
curl -H "X-API-Key: your_api_key" https://your-middleware.com/auth/status

# Test connection
curl -X POST -H "X-API-Key: your_api_key" -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://yourorg.my.salesforce.com","quickbooksRealm":"12345678"}' \
  https://your-middleware.com/api/test-connection

# Trigger payment check manually
curl -X POST -H "X-API-Key: your_api_key" \
  https://your-middleware.com/scheduler/payment-check
```

## Monitoring & Logging

### Middleware Logs
- **Location**: `logs/` directory
- **Files**:
  - `combined.log` - All logs
  - `error.log` - Error logs only

```bash
# View recent logs
tail -100 logs/combined.log

# View only errors
tail -100 logs/error.log

# Filter for specific events
grep "payment status" logs/combined.log
```

### Salesforce Logs
- **Setup** > **Environments** > **Logs** > **Debug Logs**
- Custom object: `QB_Integration_Log__c`
- Custom object: `QB_Integration_Error_Log__c`

### QuickBooks Audit Trail
- **Gear icon** > **Audit Log**
- Filter by "Invoices" and date

## Integration Flow Checkpoints

### Invoice Creation Flow
1. **Salesforce**: Opportunity reaches "Closed Won" status
2. **Salesforce**: Trigger fires and calls middleware
3. **Middleware**: Receives request and gets data from Salesforce
4. **Middleware**: Transforms data and calls QuickBooks API
5. **QuickBooks**: Creates invoice
6. **Middleware**: Gets invoice ID and updates Salesforce
7. **Salesforce**: Opportunity updated with QB_Invoice_ID__c

### Payment Detection Flow
1. **QuickBooks**: Payment received and applied to invoice
2. **Middleware**: Scheduled job runs nightly (or manual trigger)
3. **Middleware**: Gets unpaid invoices from Salesforce
4. **Middleware**: Checks payment status in QuickBooks
5. **Middleware**: Updates paid invoices in Salesforce
6. **Salesforce**: Opportunity updated with payment details

## Key Configuration Details

### Salesforce Custom Settings
- **Setup** > **Custom Settings** > **QB Integration Settings** > **Manage**
  - **Middleware Endpoint**: Your middleware URL
  - **API Key**: Your middleware API key
  - **QB Realm ID**: Your QuickBooks company ID

### Environment Variables
Key variables in the `.env` file:
- `API_KEY`: Authentication key for middleware
- `SF_CLIENT_ID`, `SF_CLIENT_SECRET`: Salesforce API credentials
- `QB_CLIENT_ID`, `QB_CLIENT_SECRET`: QuickBooks API credentials
- `PAYMENT_CHECK_CRON`: Schedule for payment checks (default: `0 1 * * *`)

## Common Issues & Solutions

### Invoice Creation Issues

| Problem | Possible Solutions |
|---------|-------------------|
| Trigger not firing | Check if the trigger is active; Verify opportunity stage is exactly "Closed Won" |
| API connection error | Check middleware logs; Verify endpoint and API key in Salesforce settings |
| QuickBooks validation error | Check product mappings; Verify customer can be created/found |

### Payment Detection Issues

| Problem | Possible Solutions |
|---------|-------------------|
| Scheduler not running | Check scheduled jobs in Salesforce; Verify middleware process is running |
| OAuth token expired | Check middleware logs; Re-authorize the connection |
| Payment not detected | Verify invoice is fully paid in QuickBooks; Check payment is applied correctly |

## Reauthorization Process

If OAuth tokens need to be refreshed manually:

1. Navigate to the authorization URLs:
   - Salesforce: `https://your-middleware.com/auth/salesforce`
   - QuickBooks: `https://your-middleware.com/auth/quickbooks`

2. Complete the authorization process for each platform

3. Verify the new connections: `curl -H "X-API-Key: your_api_key" https://your-middleware.com/auth/status`

## Security Reminders

- Keep API keys secure and rotate periodically
- Use HTTPS for all middleware endpoints
- Regularly check logs for unauthorized access attempts
- Maintain least-privilege access in both Salesforce and QuickBooks
- Ensure the middleware server has proper firewall and access controls
- Encrypt sensitive data in transit and at rest
