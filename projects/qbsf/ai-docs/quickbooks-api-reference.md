# QuickBooks Online API v3 Reference

## Authentication
- **OAuth 2.0** flow required
- **Base URL:** https://sandbox-quickbooks.api.intuit.com (sandbox) / https://quickbooks.api.intuit.com (production)
- **Required Headers:**
  - `Authorization: Bearer {access_token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

## Core Endpoints

### Create Invoice
```
POST /v3/company/{realmId}/invoice
```

**Request Body Structure:**
```json
{
  "Line": [{
    "Amount": 100.00,
    "DetailType": "SalesItemLineDetail",
    "SalesItemLineDetail": {
      "ItemRef": { "value": "1", "name": "Services" },
      "Qty": 1,
      "UnitPrice": 100.00
    }
  }],
  "CustomerRef": { "value": "1" }
}
```

### Query Invoice
```
GET /v3/company/{realmId}/invoice/{invoiceId}
```

### Create Customer
```
POST /v3/company/{realmId}/customer
```

**Request Body:**
```json
{
  "DisplayName": "Customer Name",
  "CompanyName": "Company Name",
  "PrimaryEmailAddr": { "Address": "email@example.com" },
  "PrimaryPhone": { "FreeFormNumber": "555-555-5555" },
  "BillAddr": {
    "Line1": "123 Main St",
    "City": "City",
    "CountrySubDivisionCode": "State",
    "PostalCode": "12345",
    "Country": "USA"
  }
}
```

## Invoice Status Mapping

### QuickBooks Statuses
- `Draft` - invoice created but not sent
- `Sent` - invoice sent to customer  
- `Viewed` - customer viewed invoice
- `Paid` - invoice fully paid
- `Overdue` - past due date

### Salesforce Status Mapping
- QB `Draft` → SF `Created`
- QB `Sent` → SF `Sent` 
- QB `Viewed` → SF `Viewed`
- QB `Paid` → SF `Paid` + Opportunity `Closed Won`

## Error Codes

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (token expired)
- `403` - Forbidden (insufficient permissions)
- `429` - Rate limit exceeded
- `500` - Internal server error

### Rate Limits
- **Sandbox:** 100 requests per minute
- **Production:** 500 requests per minute per app per realm

## Data Transformation Rules

### Salesforce → QuickBooks
```javascript
{
  "CustomerRef": { "value": qbCustomerId },
  "DocNumber": `№"${randomNumber.padStart(4, '0')}"`,
  "Line": [{
    "Amount": opportunity.Amount,
    "Description": `Invoice for ${opportunity.Name}`,
    "DetailType": "SalesItemLineDetail", 
    "SalesItemLineDetail": {
      "ItemRef": { "value": "1", "name": "Services" },
      "Qty": 1,
      "UnitPrice": opportunity.Amount
    }
  }],
  "PrivateNote": `Created from Salesforce Opportunity: ${opportunity.Id}`
}
```

## Webhook Events (Future Enhancement)
- `Invoice.Created`
- `Invoice.Updated` 
- `Payment.Created`
- `Payment.Updated`
