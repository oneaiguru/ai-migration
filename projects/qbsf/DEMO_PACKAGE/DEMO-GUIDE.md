# Salesforce-QuickBooks Integration Demo Guide

This guide provides instructions for demonstrating the Salesforce-QuickBooks Integration to the client.

## Demo Package Contents

### Middleware (Node.js)
- Production-ready API server
- Secure OAuth token management
- Complete implementation of all API endpoints
- Detailed logging for troubleshooting

### Salesforce Components
- `QuickBooksInvoker.cls`: Apex class to call the middleware from Salesforce
- `CreateQuickBooksInvoice`: Lightning Web Component for the Quick Action button
- `CreateInvoice.quickAction-meta.xml`: Quick Action metadata

## Demo Flow

### 1. Start the Middleware
```bash
./run-demo.sh
```

### 2. Test the API Endpoints
```bash
./test-integration.sh
```

### 3. Show Salesforce Quick Action Button
- Open Salesforce Opportunity in browser
- Click "Create QuickBooks Invoice" button
- Show the success message

### 4. Show Created Invoice in QuickBooks
- Log into QuickBooks
- Navigate to Invoices
- Show the newly created invoice with data from Salesforce

### 5. Show Salesforce Update
- Refresh Opportunity in Salesforce
- Note the QuickBooks Invoice ID field is populated

## Talking Points

1. **Real-time Integration**: Changes in Salesforce immediately reflected in QuickBooks
2. **Bi-directional Sync**: Payment status updates from QuickBooks reflected in Salesforce
3. **Security**: API key authentication, secure OAuth token management
4. **Scalability**: Can handle high volume of transactions
5. **Extensibility**: Easy to add additional features

## Known Working Credentials

- **API Key**: `quickbooks_salesforce_api_key_2025`
- **Salesforce Instance**: `https://customer-inspiration-2543.my.salesforce.com`
- **QuickBooks Realm**: `9341454378379755`

## Technical Implementation Notes

- The integration uses OAuth 2.0 for secure API access
- Tokens are refreshed automatically when needed
- Full error handling with appropriate logging
- Stateless API design for scalability
- Custom field `QB_Invoice_ID__c` added to Opportunity object

---

*For client demo: May 12, 2025*