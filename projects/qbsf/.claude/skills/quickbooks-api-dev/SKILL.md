---
name: quickbooks-api-dev
description: Work with QuickBooks Online API for invoice creation, payment links, and data sync. Use when handling QB invoice responses, extracting payment URLs, debugging QB API errors, or building QB-Salesforce integrations.
version: 1.0.0
---
# QuickBooks Online API Skill

## When to Use
- Creating/reading QB invoices via API
- Extracting payment links from invoices
- Debugging QB OAuth issues
- Building middleware for QB-SF sync

## QB Invoice API

### Create Invoice Endpoint
```
POST /v3/company/{realmId}/invoice
```

### Invoice Response Structure
```json
{
  "Invoice": {
    "Id": "12345",
    "DocNumber": "INV-001",
    "TxnDate": "2025-12-06",
    "TotalAmt": 1000.00,
    "Balance": 1000.00,
    "CustomerRef": { "value": "123", "name": "Customer Name" },
    "Line": [...],
    "InvoiceLink": "https://sandbox.qbo.intuit.com/..."
  }
}
```

## Payment Link Extraction

### Option 1: Direct from Invoice (if available)
```javascript
const paymentLink = invoiceResponse.Invoice?.InvoiceLink;
```

### Option 2: Construct URL
```javascript
const environment = process.env.QUICKBOOKS_ENVIRONMENT;
const baseUrl = environment === 'sandbox' 
  ? 'https://sandbox.qbo.intuit.com'
  : 'https://qbo.intuit.com';
const paymentLink = `${baseUrl}/app/invoices?txnId=${invoiceId}`;
```

### Option 3: Use Send Invoice API (includes payment link)
```
POST /v3/company/{realmId}/invoice/{invoiceId}/send
```
Response includes `EmailStatus` with payment URL.

## Middleware Integration Pattern

### Express Route for Invoice Creation
```javascript
app.post('/api/opportunity-to-invoice', async (req, res) => {
  try {
    const { opportunityId } = req.body;
    
    // 1. Get opportunity data from Salesforce
    const oppData = await salesforceApi.getOpportunity(opportunityId);
    
    // 2. Transform to QB invoice format
    const invoiceData = transformOpportunityToInvoice(oppData);
    
    // 3. Create invoice in QB
    const qbResponse = await qbApi.createInvoice(invoiceData);
    
    // 4. Extract invoice ID and payment link
    const invoiceId = qbResponse.Invoice?.Id;
    const paymentLink = qbResponse.Invoice?.InvoiceLink || 
                        constructPaymentLink(invoiceId);
    
    // 5. Return to Salesforce
    res.json({
      success: true,
      qbInvoiceId: invoiceId,
      qbPaymentLink: paymentLink,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## OAuth Token Management

### Check Token Validity
```javascript
const isTokenValid = () => {
  const tokenExpiry = new Date(process.env.QB_TOKEN_EXPIRY);
  return tokenExpiry > new Date();
};
```

### Refresh Token
```javascript
const refreshToken = async () => {
  const response = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    grant_type: 'refresh_token',
    refresh_token: process.env.QUICKBOOKS_REFRESH_TOKEN
  }, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};
```

---
