# IMPLEMENTATION GUIDE - Both Tasks

> **Complements**: `/Users/m/ai/projects/qbsf/EXACT_TASKS_FROM_ROMAN.md`
> **Focus**: Technical approach, file locations, implementation steps
> **Date**: December 6, 2025

---

## TASK 1: FIX BROKEN INTEGRATION

### Root Cause
Missing required field `Supplierc` in test data → tests fail → code coverage drops to 20% → trigger bugs go undetected

### Diagnosis Steps

**Step 1: Find what Supplierc is**
```bash
cd /Users/m/ai/projects/qbsf
grep -r "Supplierc" force-app/
grep -r "Supplier" force-app/
grep -r "supplierc" force-app/ (case-insensitive)
```

**Step 2: Check git history**
```bash
git log --all -p -S "Supplierc" | head -50
git log --all --oneline | grep -i "supplier\|field"
```

**Step 3: Check field definition in production**
```bash
sf data query --query "SELECT DeveloperName, Label FROM CustomField WHERE EntityDefinitionId = 'Account' AND (DeveloperName LIKE '%Supplier%' OR DeveloperName LIKE '%Supplierc%')" -o sanboxsf
```

### Fix Implementation

**File 1: QBInvoiceIntegrationQueueableTest.cls**
- Location: `force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`
- Issue: Line 38 in `setupTestData()` - Account creation missing Supplierc
- Fix: Add `Supplierc` field population when creating test Account
- Example:
  ```apex
  Account acc = new Account(
    Name = 'Test Supplier',
    Type = 'Поставщик',
    Supplierc = 'Test Value',  // ← ADD THIS LINE
    Country__c = 'US'
  );
  ```

**File 2: OpportunityQuickBooksTriggerTest.cls**
- Location: `force-app/main/default/classes/OpportunityQuickBooksTriggerTest.cls`
- Issue: Lines 42 & 71 - Account/Opportunity setup missing Supplierc
- Fix: Ensure test Account has Supplierc populated before creating Opportunity
- Action: Check what value Supplierc should have (check production Account data)

### Verification Steps

**Step 1: Run tests**
```bash
sf apex run test --test-level RunLocalTests --synchronous -o sanboxsf
# Expected: All tests pass
# Check: 10+ tests that were failing now pass
```

**Step 2: Check code coverage**
```bash
sf apex run test --code-coverage --synchronous -o sanboxsf
# Expected: Coverage >= 75%
# Check: OpportunityQuickBooksTrigger > 0% (was 0%)
```

**Step 3: Test integration**
1. Create Opportunity in Salesforce
   - Account: US Supplier (Type = 'Поставщик', Country = 'US')
   - Stage: 'Prospecting'
   - Amount: $1,000
   - Save

2. Change stage to "Proposal and Agreement"
3. Wait 2-5 minutes
4. Check `QB_Invoice_ID__c` field
   - Should be populated with invoice number
   - If empty = integration still broken

### Deployment

**Change Set Method** (proven to work):
```bash
# In Salesforce UI:
# 1. Setup → Outbound Change Sets → New
# 2. Add components:
#    - OpportunityQuickBooksTriggerTest class
#    - QBInvoiceIntegrationQueueableTest class
#    - Any other test classes fixed
# 3. Validate (should show tests passing)
# 4. Deploy
```

---

## TASK 2: ADD PAYMENT LINK FIELD

### Architecture Overview
```
QuickBooks API
    ↓ (has payment link)
Middleware extracts link
    ↓ (returns qbPaymentLink)
Salesforce receives response
    ↓ (stores in QB_Payment_Link__c)
User clicks link
    ↓
QB payment widget opens
```

### Step 1: Research QB API

**Find payment link in QB API response**
- Location: QB API documentation (Intuit Developer Portal)
- Look for: Invoice object structure
- Possible field names:
  - `InvoiceLink`
  - `OnlinePaymentUrl`
  - `PaymentUrl`
  - Or custom URL construction: `https://invoice.payments.intuit.com/{invoiceId}`

**Files to check:**
```
/deployment/sf-qb-integration-final/
├── src/services/quickbooks-api.js  ← Where QB API is called
└── src/transforms/opportunity-to-invoice.js  ← Where data is mapped
```

### Step 2: Middleware Implementation

**File: `/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`**

Find the invoice creation response handling:
```javascript
// CURRENT CODE (example)
const qbResponse = await createInvoice(...);
return {
  success: true,
  invoiceId: qbResponse.Invoice.Id
};

// MODIFIED CODE
const qbResponse = await createInvoice(...);
const paymentLink = qbResponse.Invoice.InvoiceLink ||
                    qbResponse.Invoice.onlinePaymentUrl ||
                    `https://invoice.payments.intuit.com/${qbResponse.Invoice.Id}`;

return {
  success: true,
  invoiceId: qbResponse.Invoice.Id,
  paymentLink: paymentLink  // ← ADD THIS
};
```

**Test locally:**
```bash
cd /deployment/sf-qb-integration-final/
npm test  # If tests exist
# OR manually test with curl
```

### Step 3: Salesforce Implementation

**File: `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`**

Find where response is parsed:
```apex
// CURRENT CODE (example)
Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
opp.QB_Invoice_ID__c = (String) result.get('invoiceId');
update opp;

// MODIFIED CODE
Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
opp.QB_Invoice_ID__c = (String) result.get('invoiceId');
opp.QB_Payment_Link__c = (String) result.get('paymentLink');  // ← ADD THIS
update opp;
```

### Step 4: Add Test Coverage

**File: `force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`**

Add new test method:
```apex
@isTest
private static void testPaymentLinkPopulation() {
    Opportunity opp = new Opportunity(
        Name = 'Test Opp',
        StageName = 'Prospecting',
        Amount = 1000,
        CloseDate = Date.today(),
        AccountId = testAccount.Id
    );
    insert opp;

    // Mock HTTP response with payment link
    Test.setMock(HttpCalloutMock.class, new MockHttpResponseWithLink());

    // Trigger integration
    opp.StageName = 'Proposal and Agreement';
    update opp;

    // Verify payment link populated
    opp = [SELECT QB_Payment_Link__c FROM Opportunity WHERE Id = :opp.Id];
    System.assertNotNull(opp.QB_Payment_Link__c);
    System.assert(opp.QB_Payment_Link__c.contains('https://'));
}
```

### Step 5: Field Configuration

**Verify field exists and is configured:**
```bash
sf data query --query "SELECT Id, DeveloperName, Label FROM CustomField WHERE EntityDefinitionId = 'Opportunity' AND DeveloperName = 'QB_Payment_Link__c'" -o sanboxsf
```

**If field doesn't exist, create it:**
```bash
sf schema create field
# Type: Text (URL)
# Field Name: QB_Payment_Link__c
# Field Label: QB Payment Link
# Length: 500 (for URLs)
```

**Add to page layout:**
- Setup → Object Manager → Opportunity → Page Layouts → Edit
- Search: QB Payment Link
- Add to section
- Save

### Step 6: Deployment

```bash
# Same Change Set method
# Add components:
# - QBInvoiceIntegrationQueueable class (modified)
# - QBInvoiceIntegrationQueueableTest class (new test)
# - QB_Payment_Link__c field (if new)
```

---

## BLOCKERS & DEPENDENCIES

### Task 1 Must Complete First
- Task 1 (fix integration) blocks Task 2 (add payment link)
- Reason: Integration broken = can't test payment link properly
- Flow:
  1. Fix integration (get invoice ID returning)
  2. Test integration works
  3. Then add payment link

### Why They're Separate
- Task 1 = Fix what's broken (unblocks testing)
- Task 2 = Add new feature (requires Task 1 working)
- Don't combine: Different root causes, different testing needs

---

## FILE LOCATIONS QUICK REFERENCE

### Salesforce Classes
```
force-app/main/default/classes/
├── QBInvoiceIntegrationQueueable.cls
├── QBInvoiceIntegrationQueueableTest.cls
├── OpportunityQuickBooksTrigger.trigger
├── OpportunityQuickBooksTriggerTest.cls
└── QuickBooksAPIService.cls
```

### Middleware
```
/deployment/sf-qb-integration-final/src/
├── services/quickbooks-api.js
├── services/salesforce-api.js
├── transforms/opportunity-to-invoice.js
└── routes/api.js
```

### Test Data & Config
```
/Users/m/ai/projects/qbsf/
├── force-app/main/default/objects/Opportunity/fields/
│   ├── QB_Invoice_ID__c.field
│   └── QB_Payment_Link__c.field
└── Custom Settings
    └── QB_Integration_Settings__c (API Key, etc.)
```

---

## TESTING CHECKLIST

### After Fixing Task 1 (Integration)
- [ ] All tests pass (no failures)
- [ ] Code coverage >= 75%
- [ ] Create test Opportunity
- [ ] Change stage to "Proposal and Agreement"
- [ ] QB_Invoice_ID__c populates within 5 minutes
- [ ] Invoice exists in QB with same ID

### After Implementing Task 2 (Payment Link)
- [ ] Test method added and passing
- [ ] QB_Payment_Link__c field populated with URL
- [ ] URL format is correct (https://...)
- [ ] Clicking link opens QB payment widget
- [ ] No changes to existing payment sync logic
- [ ] Code coverage still >= 75%

---

## DEPLOYMENT ORDER

1. **Fix & Deploy Task 1**
   - Update test classes
   - Deploy via Change Set
   - Verify in sandbox
   - Deploy to production

2. **Implement & Deploy Task 2**
   - Modify middleware
   - Modify Salesforce classes
   - Add test coverage
   - Deploy via Change Set
   - Verify in sandbox
   - Deploy to production

3. **Notify Roman**
   - Both tasks complete
   - Ready for testing
   - Ask for verification

---

## COMMANDS CHEAT SHEET

```bash
# Run all tests with coverage
sf apex run test --code-coverage --synchronous -o sanboxsf

# Run specific test class
sf apex run test --test-level RunLocalTests --class-names QBInvoiceIntegrationQueueableTest -o sanboxsf

# Query org coverage
sf data query --query "SELECT PercentCovered FROM ApexOrgWideCoverage" -o sanboxsf

# Deploy specific class
sf project deploy start --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls -o sanboxsf

# Check middleware logs
ssh roman@pve.atocomm.eu -p2323
tail -f /opt/qb-integration/server.log

# Test middleware endpoint
curl https://sqint.atocomm.eu/api/health
```

---

## SUMMARY

**Task 1 (Fix Integration)**:
- Diagnose `Supplierc` field requirement
- Fix test data in 2 test classes
- Verify tests pass and coverage >= 75%
- Verify invoice ID returns correctly

**Task 2 (Add Payment Link)**:
- Extract payment link from QB API response
- Add to middleware response
- Store in Salesforce QB_Payment_Link__c field
- Add test coverage
- Deploy

**Total Time**: ~3-4 hours for both tasks
