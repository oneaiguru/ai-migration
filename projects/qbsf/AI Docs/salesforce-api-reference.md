# Salesforce API Reference

## Authentication
- **Connected App Required**: Create in Setup → App Manager
- **OAuth 2.0 Flow**: Authorization Code flow
- **Scopes Required**: `api`, `refresh_token`, `offline_access`

## Key Endpoints

### Opportunity Operations
```javascript
// Get Opportunity with related data
GET /services/data/v59.0/sobjects/Opportunity/{id}
GET /services/data/v59.0/query?q=SELECT Id, Name, CloseDate, Amount, 
    Account.Name, Account.BillingStreet, Account.BillingCity
    FROM Opportunity WHERE Id = '{id}'

// Update Opportunity with QB Invoice ID
PATCH /services/data/v59.0/sobjects/Opportunity/{id}
{
  "QB_Invoice_ID__c": "12345",
  "QB_Payment_Status__c": "Pending"
}
```

### Custom Fields on Opportunity
- `QB_Invoice_ID__c` - QuickBooks Invoice ID (Text)
- `QB_Payment_Status__c` - Payment status (Picklist)
- `QB_Last_Sync__c` - Last sync timestamp (DateTime)
- `QB_Payment_Date__c` - Payment received date (Date)
- `QB_Payment_Amount__c` - Payment amount (Currency)

### OpportunityLineItem Operations
```javascript
// Get line items for Opportunity
GET /services/data/v59.0/query?q=SELECT Id, Product2.Name, 
    Product2.QB_Item_ID__c, Quantity, UnitPrice, TotalPrice
    FROM OpportunityLineItem WHERE OpportunityId = '{id}'
```

## Authentication Flow
1. Redirect to: `{SF_LOGIN_URL}/services/oauth2/authorize`
2. Parameters:
   - `response_type=code`
   - `client_id={SF_CLIENT_ID}`
   - `redirect_uri={SF_REDIRECT_URI}`
   - `scope=api refresh_token offline_access`
3. Exchange code for token at: `/services/oauth2/token`
4. Store `access_token` and `refresh_token`

## Error Handling
- **401**: Token expired - use refresh token
- **403**: Insufficient permissions - check OAuth scopes
- **404**: Record not found - verify ID exists
- **500**: Server error - retry with exponential backoff

## Rate Limits
- **Daily API Requests**: Based on org edition (15,000 - 5,000,000)
- **Concurrent Requests**: 25 per org
- **Check Headers**: `X-Limit-Info` shows remaining calls

## Best Practices
1. Use composite API for multiple operations
2. Query only needed fields
3. Use bulk API for large data sets
4. Implement retry logic with backoff
5. Cache frequently accessed data