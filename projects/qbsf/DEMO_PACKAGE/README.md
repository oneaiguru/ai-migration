# Salesforce-QuickBooks Integration

This is a production-ready middleware solution for integrating Salesforce Opportunities with QuickBooks Invoices.

## Features

- Create QuickBooks invoices from Salesforce opportunities
- Check payment status and update Salesforce
- Full OAuth integration with both systems
- Secure API endpoints with API key authentication
- Detailed logging for audit and troubleshooting

## Quick Start

1. Configure environment variables in `.env` file
2. Install dependencies: `npm install`
3. Start the server: `npm start` or `./run-demo.sh`

## API Endpoints

### Create Invoice
```
POST /api/create-invoice
Content-Type: application/json
X-API-Key: YOUR_API_KEY

{
  "opportunityId": "006xxxxxxxxxxxx",
  "salesforceInstance": "https://your-instance.my.salesforce.com",
  "quickbooksRealm": "your-quickbooks-realm-id"
}
```

### Test Connection
```
POST /api/test-connection
Content-Type: application/json
X-API-Key: YOUR_API_KEY

{
  "salesforceInstance": "https://your-instance.my.salesforce.com",
  "quickbooksRealm": "your-quickbooks-realm-id"
}
```

### Check Payment Status
```
POST /api/check-payment-status
Content-Type: application/json
X-API-Key: YOUR_API_KEY

{
  "salesforceInstance": "https://your-instance.my.salesforce.com",
  "quickbooksRealm": "your-quickbooks-realm-id"
}
```

## Salesforce Components

The `/salesforce` directory contains components to deploy to your Salesforce org:

- **QuickBooksInvoker.cls**: Apex class to call the middleware from Salesforce
- **CreateQuickBooksInvoice**: Lightning Web Component for the Quick Action
- **CreateInvoice.quickAction-meta.xml**: Quick Action metadata

## Deployment Steps

### Middleware
1. Deploy to your server or cloud provider
2. Set environment variables (see .env.example)
3. Install dependencies: `npm install`
4. Start the server: `npm start`

### Salesforce 
1. Deploy the Apex class from the `/salesforce/classes` directory
2. Create a custom field `QB_Invoice_ID__c` on the Opportunity object
3. Deploy the Lightning Web Component from the `/salesforce/lwc` directory
4. Add the Quick Action to your Opportunity page layouts

## Security Considerations

- API is protected with an API key
- OAuth tokens are securely stored
- All endpoints validate inputs
- Detailed logging for audit trails