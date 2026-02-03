---
name: qb-sf-integration-testing
description: Test and debug QuickBooks-Salesforce integrations. Use when verifying invoice ID returns, testing payment link population, debugging async Queueable jobs, or validating end-to-end integration flows.
version: 1.0.0
---
# QB-SF Integration Testing Skill

## End-to-End Test Flow

### Step 1: Test Middleware Health
```bash
curl -H "X-API-Key: YOUR_API_KEY" https://sqint.atocomm.eu/api/health
# Expected: {"success":true,"status":"healthy"}
```

### Step 2: Test Invoice Creation Manually
```bash
curl -X POST https://sqint.atocomm.eu/api/opportunity-to-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"opportunityId":"006XXXXXXXXXXXX"}'
```

### Step 3: Verify in Salesforce
```sql
-- Run in Developer Console or via CLI
SELECT Id, Name, QB_Invoice_ID__c, QB_Payment_Link__c, QB_Last_Sync_Date__c 
FROM Opportunity 
WHERE StageName = 'Proposal and Agreement'
ORDER BY CreatedDate DESC LIMIT 5
```

### Step 4: Verify in QuickBooks
- Login to QB sandbox
- Navigate to Sales > Invoices
- Search for invoice by DocNumber or customer name

## Debugging Apex Async Jobs

### Check Queueable Job Status
```sql
SELECT Id, Status, ExtendedStatus, NumberOfErrors, MethodName, CompletedDate
FROM AsyncApexJob
WHERE ApexClass.Name = 'QBInvoiceIntegrationQueueable'
ORDER BY CreatedDate DESC LIMIT 10
```

### View Debug Logs
1. Setup > Debug Logs
2. Add user to traced entities
3. Reproduce the issue
4. Download and search for:
   - `callIntegrationService`
   - `HTTP Response`
   - `QB_Invoice_ID__c`

## Mock HTTP Response for Tests

### Successful Response Mock
```apex
public class MockQBSuccessResponse implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody(JSON.serialize(new Map<String, Object>{
            'success' => true,
            'qbInvoiceId' => 'QB-INV-12345',
            'qbPaymentLink' => 'https://sandbox.qbo.intuit.com/app/invoices?txnId=12345',
            'message' => 'Invoice created successfully'
        }));
        return res;
    }
}
```

### Error Response Mock
```apex
public class MockQBErrorResponse implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(500);
        res.setBody('{"success": false, "error": "QB API Error"}');
        return res;
    }
}
```

## Common Issues & Fixes

### "Номер не возвращает" (Invoice ID not returning)
1. Check middleware logs for errors
2. Verify OAuth tokens are valid
3. Check if QB customer exists
4. Verify opportunity has all required fields

### Payment Link Empty
1. Check if `InvoiceLink` is in QB response
2. Verify middleware extracts and returns it
3. Check Salesforce parsing code

### Tests Fail with REQUIRED_FIELD_MISSING
1. Find the missing field definition
2. Add to test setup with valid value
3. Run tests again

---
