# MASTER PLAN - QB-SF Integration Completion

> **Goal**: Complete Roman's integration in minimum sessions with clear incremental progress
> **Value**: Fix broken integration + Add payment link feature = Happy client
> **Method**: Small deterministic tasks with clear done criteria

---

## 📋 PROGRESS TRACKING

**ALL AGENTS**: Update this section IMMEDIATELY when you complete a task.
Mark with ✅ and add date/time when done.

### PHASE 0: Prerequisites
- [ ] 0.1 Verify SF CLI authentication works
- [ ] 0.2 Verify middleware server is accessible
- [ ] 0.3 Get baseline test coverage (BEFORE any changes)
- [ ] 0.4 Find Supplierc field definition (BLOCKER for Phase 1.1)
- [ ] 0.5 Verify QB OAuth tokens valid (BLOCKER for Phase 2)
- [ ] 0.6 Verify QB invoice response structure (affects Phase 2.1)

### PHASE 1: Fix Broken Integration
- [ ] 1.1 Add missing fields to test Account
- [ ] 1.2 Run tests locally - all pass
- [ ] 1.3 Verify code coverage >= 75%
- [ ] 1.4 Deploy to sandbox
- [ ] 1.5 E2E test: Create Opportunity → Invoice ID populates

### PHASE 2: Add Payment Link
- [ ] 2.1 Research QB API for payment link field
- [ ] 2.2 Modify middleware to extract payment link
- [ ] 2.3 Modify middleware to return payment link
- [ ] 2.4 Modify Salesforce to parse payment link
- [ ] 2.5 Modify Salesforce to store in QB_Payment_Link__c
- [ ] 2.6 Add test for payment link
- [ ] 2.7 Deploy to sandbox
- [ ] 2.8 E2E test: Invoice created → Payment link populates

### PHASE 3: Final Validation
- [ ] 3.1 Full E2E test in sandbox
- [ ] 3.2 Deploy to production
- [ ] 3.3 E2E test in production
- [ ] 3.4 Notify Roman for approval

---

## 🎯 VALUE CREATION ORDER

**Highest Value First**:
1. Fix broken integration (Roman can't use system at all right now)
2. Add payment link (Roman requested Nov 7, waiting 1 month)
3. Everything else is secondary

---

## 📚 ABOUT SKILL.MD FILES

**✅ SKILL.md FILES NOW CREATED** (Dec 6, 2025):

Three project-specific skills created in `.claude/skills/`:
1. **salesforce-dx-dev** - SFDX CLI commands, test coverage, deployment patterns
2. **quickbooks-api-dev** - QB API invoice structure, payment link extraction patterns
3. **qb-sf-integration-testing** - E2E test flows, debugging async jobs, mock HTTP responses

**How Next Agent Uses Them**:
- Claude Code automatically loads skills from `.claude/skills/` directory
- Skills provide context-specific commands and patterns
- Reduces need to search external docs

**Still Using API References**:
- `ai-docs/quickbooks-api-reference.md` - General QB API reference
- `ai-docs/salesforce-api-reference.md` - General SF API reference
- SKILL.md files supplement (not replace) these references with project-specific patterns

---

## 🔧 PHASE 0: PREREQUISITES

### Task 0.1: Verify SF CLI Authentication

**Command**:
```bash
sf org list
sf org display --target-org sanboxsf
```

**Done when**:
- Command runs without error
- Shows org details for `olga.rybak@atocomm2023.eu.sanboxsf`

**If fails**:
```bash
sf org login web --alias sanboxsf --instance-url https://customer-inspiration-2543.sandbox.my.salesforce.com
```

---

### Task 0.2: Verify Middleware Server Accessible

**Command**:
```bash
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
```

**Done when**:
- Returns `{"success":true,"status":"healthy",...}`

**If fails**:
- SSH to server: `ssh roman@pve.atocomm.eu -p2323` (password: `3Sd5R069jvuy[3u6yj`)
- Check if server running: `ps aux | grep node`
- Start if needed: `cd /opt/qb-integration && node src/server.js`

---

### Task 0.3: Get Baseline Test Coverage

**⚠️ CRITICAL**: Must establish baseline BEFORE making any changes

**Command**:
```bash
sf apex run test --code-coverage --synchronous --target-org sanboxsf
```

**Done when**:
- Know current org-wide coverage percentage
- Know which classes are uncovered
- Document in PROGRESS.md

**Example output to track**:
```
Org-wide Code Coverage: X%
QBInvoiceIntegrationQueueable: Y%
OpportunityQuickBooksTrigger: Z%
```

---

### Task 0.4: Find Supplierc Field Definition

**⏸️ BLOCKER**: Phase 1.1 cannot proceed until this is done

**Commands** (try in order):
```bash
# 1. Query Salesforce directly (MOST RELIABLE)
sf sobject describe Account --target-org sanboxsf | grep -i "supplier\|Supplierc"

# 2. If above doesn't work, use full field definition query
sf data query --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinitionId = 'Account' AND QualifiedApiName LIKE '%Supplier%'" --target-org sanboxsf

# 3. If still not found, search codebase
grep -ri "Supplierc" /Users/m/ai/projects/qbsf/force-app/

# 4. Check Account metadata directly
ls /Users/m/ai/projects/qbsf/force-app/main/default/objects/Account/fields/
```

**Done when**:
- Know exact field API name (e.g., `Supplier__c` or `Supplierc__c` or `Supplierc`)
- Know field type (Boolean? Lookup? Text?)
- Know what value to populate for tests

**Document finding in PROGRESS.md for next agent**

---

### Task 0.5: Verify QB OAuth Token Validity

**⏸️ BLOCKER**: Phase 2 cannot proceed if tokens expired

**Action**:
SSH to middleware server and check logs:
```bash
ssh roman@pve.atocomm.eu -p2323
tail -100 /opt/qb-integration/server.log | grep -i "token\|oauth\|401\|unauthorized"
```

**Done when**:
- Know if OAuth tokens are valid
- If expired: will need to re-authenticate via QB Intuit portal

**If expired**:
- Will block Phase 2 (payment link task)
- Notify Roman that middleware re-auth needed
- Provide instructions for QB OAuth re-authentication

---

### Task 0.6: Verify QB Invoice Response Structure

**⏸️ BLOCKER**: Phase 2.1 needs actual QB response to know payment link field

**Action**:
Check middleware code and logs for actual QB invoice response:
```bash
# SSH to server
ssh roman@pve.atocomm.eu -p2323

# Check recent invoice creation logs
grep -A 50 "Invoice created\|createInvoice\|qbInvoiceId" /opt/qb-integration/server.log | tail -100
```

**OR examine middleware code**:
```bash
# Look at quickbooks-api.js to see what QB actually returns
cat /opt/qb-integration/src/services/quickbooks-api.js | grep -A 20 "createInvoice"
```

**Done when**:
- Know exact QB invoice response structure
- Know if payment link is in response (likely field names: `InvoiceLink`, `OnlinePaymentUrl`, `PaymentUrl`)
- OR know we need to construct URL from invoice ID

**Expected findings**:
- QB may NOT return payment link directly
- Payment link may need to be constructed as: `https://sandbox.qbo.intuit.com/app/invoices?txnId={invoiceId}`
- OR extracted from QB Send Invoice API response

**Document finding in PROGRESS.md - will affect Phase 2.1 approach**

---

### Task 0.7: Test Middleware Locally Before Deployment

**⏸️ OPTIONAL BUT RECOMMENDED**: Before deploying to production

**Action**:
SSH to middleware server and run local tests:
```bash
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration

# Run npm tests if available
npm test

# OR test API endpoints manually
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/opportunity-to-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" \
  -d '{"opportunityId":"test","name":"Test","amount":1000}'
```

**Done when**:
- Local middleware tests pass (or no test suite exists)
- API endpoints respond correctly to curl requests
- No errors in local middleware logs

**If fails**:
- Debug locally before deploying
- Check Node.js version, dependencies, environment variables
- Restart middleware after fixes

---

## 🔴 PHASE 1: FIX BROKEN INTEGRATION

### Task 1.1: Add Missing Fields to Test Account

**File**: `/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`

**Current code (lines 19-28)**:
```apex
Account testAccount = new Account(
    Name = 'Test US Supplier',
    BillingStreet = '123 Test St',
    BillingCity = 'Test City',
    BillingState = 'CA',
    BillingPostalCode = '12345',
    BillingCountry = 'USA',
    Phone = '555-555-5555'
);
```

**Change to** (add after Phone line):
```apex
Account testAccount = new Account(
    Name = 'Test US Supplier',
    BillingStreet = '123 Test St',
    BillingCity = 'Test City',
    BillingState = 'CA',
    BillingPostalCode = '12345',
    BillingCountry = 'USA',
    Phone = '555-555-5555',
    Supplierc = [VALUE_FROM_TASK_0.4],  // Add this
    Account_Type__c = 'Поставщик',       // Add this if exists
    Country__c = 'US'                     // Add this if exists
);
```

**Done when**:
- File saved with new fields
- No syntax errors

---

### Task 1.2: Run Tests Locally - All Pass

**Command**:
```bash
sf apex run test --test-level RunLocalTests --synchronous --target-org sanboxsf
```

**Done when**:
- All tests pass (0 failures)
- Specifically: `QBInvoiceIntegrationQueueableTest` - all methods pass
- Specifically: `OpportunityQuickBooksTriggerTest` - all methods pass

**If fails**:
- Read error message
- Fix the specific field issue
- Repeat until all pass

---

### Task 1.3: Verify Code Coverage >= 75%

**Command**:
```bash
sf apex run test --code-coverage --synchronous --target-org sanboxsf
```

**Done when**:
- Org-wide coverage >= 75%
- `OpportunityQuickBooksTrigger` coverage > 0%
- `QBInvoiceIntegrationQueueable` coverage > 70%

**If fails**:
- Identify uncovered lines
- Add test methods to cover them
- Repeat until 75%+

---

### Task 1.4: Deploy to Sandbox

**Command**:
```bash
sf project deploy start --source-dir force-app/main/default/classes/ --target-org sanboxsf --test-level RunLocalTests
```

**Done when**:
- Deployment succeeds
- All tests pass in deployment
- No rollback

**If fails**:
- Check deployment errors
- Fix issues
- Redeploy

---

### Task 1.5: E2E Test - Invoice ID Populates

**Steps**:
1. Log into Salesforce sandbox
2. Create new Account:
   - Name: "E2E Test Supplier"
   - Type: "Поставщик"
   - Country: "US"
   - Supplierc: [valid value]
3. Create new Opportunity:
   - Name: "E2E Test Opp [timestamp]"
   - Account: "E2E Test Supplier"
   - Amount: $1,000
   - Stage: "Prospecting"
   - Close Date: Tomorrow
4. Change Stage to "Proposal and Agreement"
5. Wait 2-5 minutes
6. Refresh Opportunity
7. Check `QB_Invoice_ID__c` field

**Done when**:
- `QB_Invoice_ID__c` is populated with QB invoice ID (not empty)
- No errors in debug logs
- Invoice exists in QuickBooks

**If fails**:
- Check Apex job status
- Check middleware logs: `ssh roman@pve.atocomm.eu -p2323` then `tail -100 /opt/qb-integration/server.log`
- Debug and fix

---

## 🟠 PHASE 2: ADD PAYMENT LINK

### Task 2.1: Research QB API for Payment Link Field

**Actions**:
1. Check QB API documentation: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice
2. Look for fields:
   - `InvoiceLink`
   - `OnlinePaymentUrl`
   - `PaymentUrl`
   - Or construction pattern like `https://sandbox.invoice.payments.intuit.com/qbo/invoice/txn/{invoiceId}?embed=true`

**Also check**:
- Current middleware code: `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
- What QB actually returns when creating invoice

**Done when**:
- Know exact field name or URL construction pattern
- Have example URL format

**Document finding here**: `________________`

---

### Task 2.2: Modify Middleware - Extract Payment Link

**File**: `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`

**Find**: `createInvoice` function

**Add after invoice creation**:
```javascript
// Extract payment link from QB response
const paymentLink = invoiceResponse.Invoice?.InvoiceLink ||
                    invoiceResponse.Invoice?.OnlinePaymentUrl ||
                    `https://sandbox.invoice.payments.intuit.com/qbo/invoice/txn/${invoiceResponse.Invoice?.Id}?embed=true`;
```

**Done when**:
- Code added to extract payment link
- No syntax errors

---

### Task 2.3: Modify Middleware - Return Payment Link

**File**: `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`

**Current (lines 106-110)**:
```javascript
res.json({
  success: true,
  qbInvoiceId: qbInvoiceId,
  message: 'Invoice created successfully in QuickBooks'
});
```

**Change to**:
```javascript
res.json({
  success: true,
  qbInvoiceId: qbInvoiceId,
  qbPaymentLink: paymentLink,  // ADD THIS
  message: 'Invoice created successfully in QuickBooks'
});
```

**Also modify** lines 82-96 to extract payment link from invoice response.

**Done when**:
- Response includes `qbPaymentLink`
- Test with curl shows payment link in response

---

### Task 2.4: Modify Salesforce - Parse Payment Link

**File**: `/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`

**Current (lines 46-49)**:
```apex
if (responseMap.containsKey('success') && (Boolean)responseMap.get('success')) {
    String qbInvoiceId = (String)responseMap.get('qbInvoiceId');
    updateOpportunityWithQBInvoiceId(opp.Id, qbInvoiceId);
```

**Change to**:
```apex
if (responseMap.containsKey('success') && (Boolean)responseMap.get('success')) {
    String qbInvoiceId = (String)responseMap.get('qbInvoiceId');
    String qbPaymentLink = (String)responseMap.get('qbPaymentLink');  // ADD THIS
    updateOpportunityWithQBData(opp.Id, qbInvoiceId, qbPaymentLink);  // MODIFY THIS
```

**Done when**:
- Code parses `qbPaymentLink` from response
- No syntax errors

---

### Task 2.5: Modify Salesforce - Store in QB_Payment_Link__c

**File**: `/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`

**Modify `updateOpportunityWithQBInvoiceId` method (lines 158-172)**:

**Current**:
```apex
private void updateOpportunityWithQBInvoiceId(Id opportunityId, String qbInvoiceId) {
    Opportunity oppToUpdate = new Opportunity(
        Id = opportunityId,
        QB_Invoice_ID__c = qbInvoiceId,
        QB_Last_Sync_Date__c = DateTime.now()
    );
    update oppToUpdate;
}
```

**Change to**:
```apex
private void updateOpportunityWithQBData(Id opportunityId, String qbInvoiceId, String qbPaymentLink) {
    Opportunity oppToUpdate = new Opportunity(
        Id = opportunityId,
        QB_Invoice_ID__c = qbInvoiceId,
        QB_Payment_Link__c = qbPaymentLink,  // ADD THIS
        QB_Last_Sync_Date__c = DateTime.now()
    );
    update oppToUpdate;
}
```

**Done when**:
- Method accepts payment link parameter
- Updates `QB_Payment_Link__c` field
- No syntax errors

---

### Task 2.6: Add Test for Payment Link

**File**: `/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`

**Add new mock class**:
```apex
public class SuccessfulHttpMockWithPaymentLink implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{"success": true, "qbInvoiceId": "QB-INV-12345", "qbPaymentLink": "https://invoice.payments.intuit.com/qbo/invoice/txn/12345"}');
        return res;
    }
}
```

**Add new test method**:
```apex
@isTest
static void testPaymentLinkPopulation() {
    QBInvoiceIntegrationQueueable.allowTestCallouts = true;

    Test.setMock(HttpCalloutMock.class, new SuccessfulHttpMockWithPaymentLink());
    Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];

    Test.startTest();
    QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
    System.enqueueJob(queueable);
    Test.stopTest();

    testOpp = [SELECT QB_Payment_Link__c FROM Opportunity WHERE Id = :testOpp.Id];
    System.assertNotEquals(null, testOpp.QB_Payment_Link__c, 'Payment link should be populated');
    System.assert(testOpp.QB_Payment_Link__c.contains('https://'), 'Payment link should be a URL');

    QBInvoiceIntegrationQueueable.allowTestCallouts = false;
}
```

**Done when**:
- Test method added
- Test passes locally
- Code coverage maintained >= 75%

---

### Task 2.7: Deploy to Sandbox

**Commands**:
```bash
# Deploy middleware (SSH to server)
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration
# Copy updated files
# Restart server
pm2 restart all  # or: node src/server.js

# Deploy Salesforce
sf project deploy start --source-dir force-app/main/default/classes/ --target-org sanboxsf --test-level RunLocalTests
```

**Done when**:
- Middleware updated and running
- Salesforce classes deployed
- All tests pass

---

### Task 2.8: E2E Test - Payment Link Populates

**Steps**:
1. Create new Opportunity (or use existing test one)
2. Change Stage to "Proposal and Agreement"
3. Wait 2-5 minutes
4. Refresh Opportunity
5. Check `QB_Payment_Link__c` field

**Done when**:
- `QB_Payment_Link__c` contains valid URL
- URL starts with `https://`
- Clicking URL opens QB payment widget (verify in browser)

---

## ✅ PHASE 3: FINAL VALIDATION

### Task 3.1: Full E2E Test in Sandbox

**Complete flow**:
1. Create Account (US Supplier)
2. Create Opportunity
3. Change to "Proposal and Agreement"
4. Wait for trigger/queueable
5. Verify:
   - `QB_Invoice_ID__c` populated ✓
   - `QB_Payment_Link__c` populated ✓
   - Invoice exists in QB ✓
   - Payment link works ✓

**Done when**:
- All 4 verifications pass
- No errors in logs

---

### Task 3.2: Deploy to Production

**Command**:
```bash
sf project deploy start --source-dir force-app/main/default/ --target-org [production_alias] --test-level RunLocalTests
```

**Done when**:
- Production deployment successful
- All tests pass
- No rollback

---

### Task 3.3: E2E Test in Production

**Same as 3.1 but in production org**

**Done when**:
- Real invoice created in production QB
- Payment link works in production

---

### Task 3.4: Notify Roman for Approval

**Create status update file or message**:
```
Роман!

Интеграция исправлена и дополнена:

1. ✅ Исправлена проблема с номером счета (QB_Invoice_ID__c теперь возвращается)
2. ✅ Добавлена ссылка на оплату (QB_Payment_Link__c)
3. ✅ Тест в sandbox пройден
4. ✅ Тест в production пройден

Готово к проверке.
```

**Done when**:
- Roman confirms integration works
- Roman tests payment link
- Roman approves

---

## 📊 SUCCESS CRITERIA SUMMARY

| Phase | Task | Done Criteria |
|-------|------|---------------|
| 0 | Prerequisites | All 4 verifications pass |
| 1 | Fix Integration | E2E: Invoice ID populates |
| 2 | Add Payment Link | E2E: Payment link populates and works |
| 3 | Final Validation | Roman approves |

---

## ⏱️ TIME ESTIMATES

| Phase | Estimated Time | Notes |
|-------|----------------|-------|
| Phase 0 | 30 min | Mostly verification |
| Phase 1 | 1-2 hours | Depends on Supplierc field |
| Phase 2 | 2-3 hours | Research + implementation |
| Phase 3 | 1 hour | Testing and communication |
| **Total** | **5-6 hours** | Can be split across sessions |

---

## 🚨 BLOCKING ISSUES

If any of these occur, STOP and document:

1. **SF CLI auth fails** → Need new credentials from Roman
2. **Middleware server down** → Need SSH access or wait
3. **Supplierc field not found** → Need to query production org or ask Roman
4. **QB API doesn't return payment link** → Need to research alternative approach
5. **Tests fail after fix** → Debug and iterate

---

## 📝 SESSION HANDOFF PROTOCOL

At end of each session:

1. **Update PROGRESS TRACKING section** at top of this file
2. **Mark completed tasks** with ✅ and date
3. **Note any blockers** in this section
4. **Save file**

Next agent reads this file and continues from where you left off.

---

## 🚨 ROLLBACK & TROUBLESHOOTING PLAN

### If Phase 1 Breaks Integration (Invoice ID Not Returning)

**Symptoms**:
- Opportunities change to "Proposal and Agreement" but QB_Invoice_ID__c stays empty
- Error in debug logs about missing fields or QB connection

**Rollback Steps**:
1. **Revert Salesforce changes**:
   ```bash
   sf project deploy start --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls --target-org sanboxsf --source-apiversion <previous_version>
   ```
2. **Rerun tests to verify fix**:
   ```bash
   sf apex run test --code-coverage --synchronous --target-org sanboxsf
   ```
3. **Document the issue** in BLOCKERS LOG

### If Phase 2 Breaks Payment Link Feature

**Symptoms**:
- QB_Payment_Link__c is null even after invoice creation
- Middleware returns 404 or error for invoice endpoint
- QB OAuth tokens expired

**Rollback Steps**:
1. **If middleware API changed**: Revert middleware code to previous version
2. **If QB OAuth expired**: Re-authenticate via QB Intuit portal
3. **If Salesforce parsing broken**: Revert QBInvoiceIntegrationQueueable to Phase 1 version
4. **Test with simpler scenario**: Create invoice manually via LWC button, verify it works

### If Production Deployment Fails

**DO NOT force deploy. Instead**:
1. Run deployment validation: `sf project deploy validate --source-dir force-app/ --test-level RunLocalTests -o production`
2. Check specific error messages
3. Fix issues in sandbox first
4. Redeploy to sandbox, verify end-to-end
5. Only then attempt production deployment

---

## ✅ FINAL CHECKLIST

Before declaring project complete:

- [ ] Integration works (Invoice ID returns)
- [ ] Payment link works (URL populates and opens widget)
- [ ] Tests pass (100% pass rate)
- [ ] Code coverage >= 75%
- [ ] Deployed to production
- [ ] Roman approved

---

*Plan created: December 6, 2025*
*Status: Ready for Phase 0*
*Next step: Run Task 0.1 - Verify SF CLI authentication*
