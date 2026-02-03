# Integration Patterns & Architecture

## Data Flow Architecture

### Invoice Creation Flow
```mermaid
Salesforce Opportunity → Middleware → QuickBooks Invoice
     ↓                       ↓              ↓
Stage Change            Transform       Create Invoice
     ↓                       ↓              ↓
Trigger/Button          Map Fields      Return ID
     ↓                       ↓              ↓
API Call               Validation      Update SF
```

### Payment Sync Flow
```mermaid
QuickBooks Payment → Scheduler → Salesforce Update
        ↓               ↓              ↓
   Payment Made    Check Status   Update Opportunity
        ↓               ↓              ↓
   Webhook/Poll    Compare Date    Set Closed Won
```

## Key Integration Points

### Opportunity → Invoice Trigger Points
1. **Manual**: Button click in LWC
2. **Automated**: Stage = "Proposal and Agreement"
3. **Scheduled**: Batch process for multiple opportunities

### Field Mappings
| Salesforce Field | QuickBooks Field | Notes |
|-----------------|------------------|-------|
| Opportunity.Name | Invoice.PrivateNote | Internal reference |
| Opportunity.CloseDate | Invoice.DueDate | Payment due date |
| Account.Name | Customer.DisplayName | Customer identifier |
| Account.BillingAddress | Customer.BillAddr | Billing address |
| OpportunityLineItem | Invoice.Line | Product line items |
| Product2.Name | Item.Name | Product reference |
| Quantity | Line.Qty | Item quantity |
| UnitPrice | Line.UnitPrice | Item price |
| TotalPrice | Line.Amount | Line total |

### Status Synchronization
```javascript
// QuickBooks Invoice Status → Salesforce Opportunity
{
  "Balance": 0 → "QB_Payment_Status__c": "Paid",
  "Balance": > 0 && DueDate < Today → "QB_Payment_Status__c": "Overdue",
  "Balance": > 0 && DueDate >= Today → "QB_Payment_Status__c": "Pending"
}
```

## Error Handling Patterns

### Retry Strategy
```javascript
const retryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};
```

### Error Recovery
1. **Token Expired**: Auto-refresh using refresh token
2. **Network Error**: Exponential backoff retry
3. **Business Error**: Log and notify admin
4. **Data Validation**: Return to Salesforce for correction

## Security Patterns

### API Key Validation
- All middleware endpoints protected by X-API-Key header
- Key stored in Salesforce Custom Settings
- Rotate keys quarterly

### OAuth Token Management
```javascript
// Token storage structure
{
  "salesforce": {
    "access_token": "...",
    "refresh_token": "...",
    "instance_url": "...",
    "expires_at": 1234567890
  },
  "quickbooks": {
    "access_token": "...",
    "refresh_token": "...",
    "realm_id": "...",
    "expires_at": 1234567890
  }
}
```

### Encryption
- Tokens encrypted at rest using AES-256
- Environment variables for sensitive config
- No credentials in code repository

## Performance Optimization

### Caching Strategy
1. Cache customer IDs (TTL: 24 hours)
2. Cache product/item mappings (TTL: 7 days)
3. Cache OAuth tokens (TTL: until expiry - 5 minutes)

### Batch Processing
- Process up to 25 opportunities per batch
- Use Salesforce Bulk API for large updates
- QuickBooks batch API for multiple invoices

### Async Processing
- Use Queueable for Salesforce operations
- Implement webhooks for real-time updates
- Background jobs for payment status checks

## Monitoring & Logging

### Key Metrics
- API response times
- Success/failure rates
- Token refresh frequency
- Queue depth
- Error rates by type

### Log Levels
```javascript
logger.error()  // Failures requiring immediate attention
logger.warn()   // Issues that may cause problems
logger.info()   // Normal operation events
logger.debug()  // Detailed debugging information
```

### Health Checks
- `/api/health` - Basic availability
- `/api/health/salesforce` - SF connection status
- `/api/health/quickbooks` - QB connection status
- `/api/health/scheduler` - Cron job status