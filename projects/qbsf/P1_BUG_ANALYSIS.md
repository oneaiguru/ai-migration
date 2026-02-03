# 🔴 P1 BUG: Payment Link Never Persists to Salesforce

## Issue Summary
- **Status**: CRITICAL - Payment link fetched but not saved to Salesforce
- **Impact**: QB_Payment_Link__c field remains NULL despite middleware successfully retrieving payment link
- **Identified**: During code review before E2E testing

## Root Cause Analysis

### The Flow (How it's SUPPOSED to work):
```
1. Apex calls middleware: /api/opportunity-to-invoice
2. Middleware creates QB invoice
3. Middleware updates SF with Invoice ID ONLY (line 104)
4. Middleware fetches QB payment link (lines 106-115)
5. Middleware returns response with BOTH invoiceId + paymentLink
6. Apex receives response, extracts paymentLink (line 49)
7. Apex calls updateOpportunityWithQBInvoiceId(id, invoiceId, paymentLink) (line 50)
8. Apex updates SF with BOTH QB_Invoice_ID__c + QB_Payment_Link__c (lines 162-169)
```

### The Bug (What's actually happening):
```
ISSUE 1: Dual Update Race Condition
- Middleware updates SF at step 3 (before payment link available)
- Apex updates SF at step 8 (after getting payment link)
- If Apex job fails or is cancelled, SF update never happens
- Result: Only QB_Invoice_ID__c is set, QB_Payment_Link__c stays NULL

ISSUE 2: Field May Not Be Deployed to Production
- QB_Payment_Link__c field metadata exists in code
- Deployment to PRODUCTION org was NOT verified
- Deployment only confirmed to SANDBOX (sanboxsf)
- Field may not actually exist in production Salesforce
```

## Code References

### Apex Code (CORRECT - Code is written properly)
- **File**: `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`
- **Line 49**: Extract paymentLink from response ✅
- **Line 50**: Pass paymentLink to update method ✅
- **Lines 160-175**: Update method correctly sets QB_Payment_Link__c field ✅

### Middleware Code (ISSUE - Double update pattern)
- **File**: `deployment/sf-qb-integration-final/src/routes/api.js`
- **Line 104**: ⚠️ Updates SF with ONLY invoice ID (before payment link fetch)
- **Lines 106-115**: Fetches payment link
- **Lines 117-122**: Returns response with paymentLink

### Field Metadata (EXISTS but may not be deployed)
- **File**: `force-app/main/default/objects/Opportunity/fields/QB_Payment_Link__c.field-meta.xml`
- **Type**: URL field ✅
- **Required**: false ✅
- **Status**: Created in code, needs deployment verification

## Solution Required

### Immediate Actions (for next agent):
1. **Verify QB_Payment_Link__c field exists in PRODUCTION**
   ```bash
   sf data query --query "SELECT Id, QB_Invoice_ID__c, QB_Payment_Link__c FROM Opportunity LIMIT 1" --target-org myorg
   ```
   - If field doesn't exist → Deploy it immediately
   - If field exists → Move to step 2

2. **Create NEW test opportunity and verify end-to-end**
   - Can't use old opportunities (QB_Payment_Link__c is null because field didn't exist when they were created)
   - Create fresh opportunity → Trigger flow → Check if QB_Payment_Link__c populates

3. **If payment link is still NULL after deployment**:
   - Check Apex debug logs for errors during update
   - Check middleware logs for payment link fetch failures
   - Verify BillEmail is set on QB invoice (required for payment link)

### Long-term Fix (Design improvement):
Instead of dual updates, modify middleware to:
1. Create QB invoice
2. Fetch payment link
3. Return response with both fields
4. Update SF ONCE with all data (not twice)

But for NOW, if field is deployed, the current code should work.

## Test Verification Checklist
- [ ] QB_Payment_Link__c field exists in production SF org
- [ ] New test opportunity created with proper Supplier__c account
- [ ] Stage changed to "Proposal and Agreement"
- [ ] Wait 2-3 minutes for async job to complete
- [ ] Check QB_Invoice_ID__c is populated ✅
- [ ] Check QB_Payment_Link__c is populated (should have URL)
- [ ] Check debug logs for any errors during update
- [ ] Compare OLD vs NEW opportunities (old ones won't have link because field didn't exist)

## Evidence Needed
- Screenshot showing QB_Payment_Link__c field value in production Salesforce
- Debug log from QBInvoiceIntegrationQueueable.execute showing "Updated Opportunity... Payment Link: https://..."
- Confirmation from Roman that payment link works when clicked

---

**Next Agent Priority**: Deploy QB_Payment_Link__c field to PRODUCTION and verify E2E works
