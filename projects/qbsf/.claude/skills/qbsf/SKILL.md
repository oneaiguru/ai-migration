# QB-SF Integration Skills & MASTER_PLAN Review

## 🔴 MASTER_PLAN.md Issues Identified

### Critical Gaps

1. **Supplierc Field Research is Incomplete**
   - Plan says "Find what Supplierc is" but doesn't specify HOW if grep fails
   - Missing: Query Salesforce directly: `sf sobject describe Account -o sanboxsf | grep -i supplier`
   - Missing: Check if it's `Supplier__c` (lookup) vs `Supplierc` (custom checkbox)

2. **QB Payment Link Field Name Unknown**
   - Plan assumes field names like `InvoiceLink` or `OnlinePaymentUrl`
   - **Reality**: QB invoice response doesn't include payment link directly
   - **Solution**: Construct URL: `https://sandbox.qbo.intuit.com/app/invoice?txnId={invoiceId}` OR use `InvoiceLink` from QB's send email API

3. **No Middleware Local Testing Step**
   - Plan jumps from code change → deploy
   - Missing: `npm test` locally, `curl` test against local server

4. **No Rollback Plan**
   - What happens if production deployment breaks existing functionality?

5. **Missing OAuth Token Refresh Consideration**
   - QB OAuth tokens expire - is refresh token still valid after months?

### Structural Issues

6. **Phase Dependencies Not Clear**
   - Task 0.4 (Find Supplierc) blocks Task 1.1
   - If 0.4 fails, entire Phase 1 is blocked

7. **Test Coverage Verification Timing**
   - Should verify coverage BEFORE modifying code (baseline)
   - Current plan runs tests only after changes

---

## 📦 SKILL.md FILES FOR CLAUDE CODE

### SKILL 1: Salesforce DX Development Skill

```yaml
---
name: salesforce-dx-dev
description: Deploy, test, and manage Salesforce code with SFDX CLI. Use when working with Apex classes, triggers, test coverage, deployments, or Salesforce metadata operations. Triggers on keywords like Apex, trigger, test coverage, SFDX, deploy, sandbox, production.
version: 1.0.0
allowed-tools: Bash, Read, Write, Edit, Grep
---
```

# Salesforce DX Development Skill

## When to Use
- Deploying Apex classes/triggers to Salesforce orgs
- Running Apex tests and checking code coverage
- Managing field metadata and custom objects
- Debugging Salesforce deployment errors

## Core Commands

### Authentication
```bash
# Check current auth status
sf org list

# Login to sandbox
sf org login web --alias sanboxsf --instance-url https://customer-inspiration-2543.sandbox.my.salesforce.com

# Display org info
sf org display --target-org sanboxsf
```

### Testing
```bash
# Run all local tests with coverage
sf apex run test --code-coverage --synchronous --target-org sanboxsf

# Run specific test class
sf apex run test --class-names QBInvoiceIntegrationQueueableTest --target-org sanboxsf --synchronous

# Get org-wide coverage
sf apex run test --test-level RunLocalTests --code-coverage --result-format human --target-org sanboxsf
```

### Deployment
```bash
# Validate deployment (dry-run)
sf project deploy start --source-dir force-app/main/default/classes/ --target-org sanboxsf --dry-run

# Deploy with tests
sf project deploy start --source-dir force-app/main/default/classes/ --target-org sanboxsf --test-level RunLocalTests

# Deploy specific file
sf project deploy start --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls --target-org sanboxsf
```

### Field Research
```bash
# Describe Account object to find Supplierc
sf sobject describe Account --target-org sanboxsf | grep -i supplier

# Query field definitions
sf data query --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinitionId = 'Account' AND QualifiedApiName LIKE '%Supplier%'" --target-org sanboxsf

# List all custom fields on Account
sf data query --query "SELECT QualifiedApiName, DataType FROM FieldDefinition WHERE EntityDefinitionId = 'Account' AND IsCustom = true" --target-org sanboxsf
```

## Error Patterns

### REQUIRED_FIELD_MISSING
```
System.DmlException: Insert failed. First exception on row 0; first error: REQUIRED_FIELD_MISSING, Required fields are missing: [Supplierc]
```
**Fix**: Add the required field to test data setup. Find field type first, then populate with valid value.

### Code Coverage Below 75%
```
Your organization's code coverage is 20%. You need at least 75% coverage.
```
**Fix**: 
1. Identify uncovered lines: `sf apex run test --code-coverage --output-dir ./coverage`
2. Add tests for uncovered code paths
3. Ensure triggers have at least 1% coverage

## Test Data Patterns

### Creating Valid Test Account
```apex
@TestSetup
static void setupTestData() {
    Account testAccount = new Account(
        Name = 'Test Supplier',
        Type = 'Supplier',
        BillingCountry = 'USA',
        // Add required custom fields:
        Supplierc = true,  // or lookup ID if lookup field
        Account_Type__c = 'Поставщик',
        Country__c = 'US'
    );
    insert testAccount;
}
```

---

### SKILL 2: QuickBooks Online API Skill

```yaml
---
name: quickbooks-api-dev
description: Work with QuickBooks Online API for invoice creation, payment links, and data sync. Use when handling QB invoice responses, extracting payment URLs, debugging QB API errors, or building QB-Salesforce integrations.
version: 1.0.0
---
```

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

### SKILL 3: QB-SF Integration Testing Skill

```yaml
---
name: qb-sf-integration-testing
description: Test and debug QuickBooks-Salesforce integrations. Use when verifying invoice ID returns, testing payment link population, debugging async Queueable jobs, or validating end-to-end integration flows.
version: 1.0.0
---
```

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

## 🚀 RECOMMENDED IMPLEMENTATION ORDER

### Immediate Actions (Before Coding)

1. **Research Supplierc field** (CRITICAL)
```bash
sf sobject describe Account --target-org sanboxsf 2>/dev/null | grep -i "supplier\|Supplierc"
```

2. **Check QB OAuth status**
```bash
curl -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health
```

3. **Get baseline test coverage**
```bash
sf apex run test --code-coverage --synchronous --target-org sanboxsf
```

### Updated Phase 0 Tasks

| Task | Command | Success Criteria |
|------|---------|------------------|
| 0.1 SF Auth | `sf org display -o sanboxsf` | Shows org details |
| 0.2 Middleware | `curl https://sqint.atocomm.eu/api/health` | `{"success":true}` |
| 0.3 Find Supplierc | `sf sobject describe Account -o sanboxsf \| grep -i supplier` | Field name + type |
| 0.4 Baseline Coverage | `sf apex run test --code-coverage` | Record current % |
| 0.5 QB OAuth Check | Check middleware logs for token errors | Tokens valid |

### Critical Missing Step: Verify QB Invoice Response

Before implementing payment link, you MUST verify what QB actually returns:

```bash
# SSH to middleware server
ssh roman@pve.atocomm.eu -p2323

# Check recent logs for actual QB response
grep -A 50 "createInvoice" /opt/qb-integration/server.log | tail -100

# Or add temporary logging in quickbooks-api.js:
# console.log('QB Invoice Response:', JSON.stringify(invoiceResponse, null, 2));
```

---

## 📋 INSTALLATION

### For Claude Code Users

1. Create skill directories:
```bash
mkdir -p ~/.claude/skills/salesforce-dx-dev
mkdir -p ~/.claude/skills/quickbooks-api-dev
mkdir -p ~/.claude/skills/qb-sf-integration-testing
```

2. Copy SKILL.md content to each directory

3. In Claude Code, skills auto-activate based on context

### For This Specific Project

Add to `.claude/skills/` in your project root for project-specific activation.
