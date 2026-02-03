# QuickBooks API Reference

## Authentication
- **OAuth 2.0**: Authorization Code flow
- **Base URL (Production)**: `https://quickbooks.api.intuit.com`
- **Base URL (Sandbox)**: `https://sandbox-quickbooks.api.intuit.com`

## Key Endpoints

### Customer Operations
```javascript
// Find customer by name
GET /v3/company/{realmId}/query?query=SELECT * FROM Customer WHERE DisplayName = 'Customer Name'

// Create customer
POST /v3/company/{realmId}/customer
{
  "DisplayName": "Customer Name",
  "CompanyName": "Company LLC",
  "PrimaryEmailAddr": {"Address": "email@example.com"},
  "PrimaryPhone": {"FreeFormNumber": "555-1234"},
  "BillAddr": {
    "Line1": "123 Main St",
    "City": "City",
    "CountrySubDivisionCode": "CA",
    "PostalCode": "12345"
  }
}
```

### Invoice Operations
```javascript
// Create invoice
POST /v3/company/{realmId}/invoice
{
  "CustomerRef": {"value": "123"},
  "Line": [{
    "DetailType": "SalesItemLineDetail",
    "Amount": 100.00,
    "SalesItemLineDetail": {
      "ItemRef": {"value": "1"},
      "Qty": 1,
      "UnitPrice": 100.00
    }
  }],
  "TxnDate": "2025-08-01",
  "DueDate": "2025-08-31"
}

// Get invoice status
GET /v3/company/{realmId}/invoice/{invoiceId}

// Query paid invoices
GET /v3/company/{realmId}/query?query=SELECT * FROM Invoice WHERE Balance = 0
```

### Payment Operations
```javascript
// Get payments for invoice
GET /v3/company/{realmId}/query?query=SELECT * FROM Payment WHERE Id IN 
  (SELECT PaymentRef FROM InvoicePayment WHERE InvoiceRef = '{invoiceId}')
```

## Authentication Flow
1. Redirect to: `https://appcenter.intuit.com/connect/oauth2`
2. Parameters:
   - `client_id={QB_CLIENT_ID}`
   - `scope=com.intuit.quickbooks.accounting`
   - `redirect_uri={QB_REDIRECT_URI}`
   - `response_type=code`
   - `state={random_string}`
3. Exchange code for token
4. Store `access_token`, `refresh_token`, and `realmId`

## Invoice Structure
```javascript
{
  "CustomerRef": {"value": "customerId"},
  "Line": [
    {
      "DetailType": "SalesItemLineDetail",
      "Amount": 100.00,
      "SalesItemLineDetail": {
        "ItemRef": {"value": "itemId"},
        "Qty": 1,
        "UnitPrice": 100.00
      },
      "Description": "Product description"
    }
  ],
  "TxnDate": "YYYY-MM-DD",
  "DueDate": "YYYY-MM-DD",
  "DocNumber": "INV-001",
  "PrivateNote": "Internal note",
  "CustomerMemo": {"value": "Customer visible note"}
}
```

## Error Codes
- **401**: Invalid/expired token
- **403**: Insufficient permissions
- **429**: Rate limit exceeded
- **500**: Server error
- **6000-6999**: Business logic errors

## Rate Limits
- **Sandbox**: 500 requests per minute
- **Production**: 500 requests per minute (can be increased)
- **Batch Operations**: Max 30 operations per batch

## Best Practices
1. Use batch operations for multiple updates
2. Implement webhook for real-time updates
3. Cache customer and item IDs
4. Use sparse updates (only changed fields)
5. Handle token refresh proactively