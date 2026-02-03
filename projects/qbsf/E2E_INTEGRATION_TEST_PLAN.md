# END-TO-END INTEGRATION TEST PLAN
## QuickBooks-Salesforce Payment Sync Validation

### OBJECTIVE
Prove the integration works completely automatically with NEW entities before confirming to client.

## PRE-TEST CLEANUP

### 1. Verify Clean State
```bash
# Check no errors in last 100 lines
tail -100 /opt/qb-integration/server.log | grep -i error

# Check current invoice processing status
curl -X POST https://sqint.atocomm.eu/api/check-payment-status \
  -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" \
  -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://customer-inspiration-2543.my.salesforce.com","quickbooksRealm":"9130354519120066"}'
```

Expected: No errors, clean response

### 2. Document Starting Point
- Note current QB invoice count
- Note current SF opportunity count
- Clear server.log: `echo "" > /opt/qb-integration/server.log`

## TEST SCENARIO 1: SINGLE OPPORTUNITY FULL CYCLE

### Step 1.1: Create New Test Opportunity
**In Salesforce:**
- Name: "E2E_TEST_001_[timestamp]"
- Account: "test account" (or create new)
- Amount: EUR 1,000
- Close Date: Tomorrow
- Stage: "Prospecting" (NOT Proposal yet)
- Add Product: Any service item

### Step 1.2: Trigger Invoice Creation
- Change Stage to "Proposal and Agreement"
- Note exact time: ________

### Step 1.3: Verify Invoice Created (Wait 5 minutes)
**Check Points:**
- [ ] QB_Invoice_ID__c populated in Salesforce
- [ ] Invoice exists in QuickBooks with same ID
- [ ] Invoice amount matches opportunity
- [ ] Invoice status is "Pending" in QB

**Validation Commands:**
```bash
# Check server log for invoice creation
grep "E2E_TEST_001" /opt/qb-integration/server.log

# Check API for new invoices
curl -X POST https://sqint.atocomm.eu/api/check-payment-status \
  -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" \
  -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://customer-inspiration-2543.my.salesforce.com","quickbooksRealm":"9130354519120066"}'
```

### Step 1.4: Mark Invoice as Paid in QuickBooks
- Find invoice by ID from Step 1.3
- Mark as "Paid" 
- Add payment method: "Check"
- Note exact time: ________

### Step 1.5: Verify Payment Sync (Wait 5 minutes)
**Check Points:**
- [ ] Opportunity Stage = "Closed Won"
- [ ] QB_Payment_Date__c populated
- [ ] QB_Payment_Amount__c matches invoice
- [ ] QB_Payment_Method__c = "Check"
- [ ] QB_Payment_Reference__c populated

**If Step 1.5 FAILS - Permanent Fix:**
```javascript
// Check and fix in quickbooks-api.js
// Line ~445 - Ensure balance check works:
if (balance === 0 || invoice.Deposit > 0) {
  // Invoice is paid
}

// Add error handling for missing invoices:
if (error.code === 610) {
  logger.warn(`Invoice ${invoiceId} not found in QB, clearing from SF`);
  // Add code to clear QB_Invoice_ID__c from SF
}
```

## TEST SCENARIO 2: MULTIPLE OPPORTUNITIES BATCH

### Step 2.1: Create 3 New Opportunities
- E2E_TEST_002_[timestamp] - EUR 500
- E2E_TEST_003_[timestamp] - EUR 1,500  
- E2E_TEST_004_[timestamp] - EUR 2,000

### Step 2.2: Change All to "Proposal and Agreement"
- Change all 3 within 1 minute
- Note time: ________

### Step 2.3: Verify All Invoices Created (Wait 5 minutes)
- [ ] All 3 have QB_Invoice_ID__c
- [ ] All 3 exist in QuickBooks
- [ ] No duplicate invoices

### Step 2.4: Mark Only 2 as Paid in QB
- Pay E2E_TEST_002 and E2E_TEST_004
- Leave E2E_TEST_003 unpaid

### Step 2.5: Verify Selective Sync (Wait 5 minutes)
- [ ] E2E_TEST_002 = "Closed Won"
- [ ] E2E_TEST_003 = Still "Proposal and Agreement"
- [ ] E2E_TEST_004 = "Closed Won"

## TEST SCENARIO 3: ERROR RECOVERY

### Step 3.1: Stop Integration Server
```bash
pkill -f "node src/server.js"
```

### Step 3.2: Create Opportunity While Server Down
- Name: E2E_TEST_005_ERROR
- Change to "Proposal and Agreement"

### Step 3.3: Restart Server
```bash
cd /opt/qb-integration
nohup node src/server.js > server.log 2>&1 &
```

### Step 3.4: Verify Recovery (Wait 5 minutes)
- [ ] Invoice created after restart
- [ ] No duplicate creation attempts
- [ ] Clean error handling in logs

## TEST SCENARIO 4: EDGE CASES

### Test 4.1: Zero Amount Opportunity
- Create opportunity with EUR 0
- Verify handling (should skip or handle gracefully)

### Test 4.2: Already Paid Invoice
- Manually create paid invoice in QB
- Link to opportunity via QB_Invoice_ID__c
- Run payment sync
- Verify opportunity closes properly

### Test 4.3: Invalid Invoice ID
- Set QB_Invoice_ID__c to "99999" (non-existent)
- Run payment sync
- Verify error handling (should clear invalid ID)

**Permanent Fix for Invalid IDs:**
```javascript
// In salesforce-api.js, add validation:
async updateOpportunityPayment(opportunityId, paymentData) {
  try {
    // Update opportunity
  } catch (error) {
    if (error.message.includes('Object Not Found')) {
      // Clear invalid QB_Invoice_ID__c
      await this.clearInvalidInvoiceId(opportunityId);
    }
  }
}
```

## VALIDATION METRICS

### Success Criteria (ALL must pass):
1. [ ] 5/5 new invoices created successfully
2. [ ] 4/4 payments synced correctly (excluding unpaid)
3. [ ] 0 Error 610 occurrences
4. [ ] 0 manual interventions required
5. [ ] All status changes automatic

### Performance Metrics:
- Invoice creation: < 5 minutes from stage change
- Payment sync: < 5 minutes from QB payment
- Error recovery: < 10 minutes to self-heal

## POST-TEST VERIFICATION

### 1. Check Final State
```bash
# No errors in log
tail -500 /opt/qb-integration/server.log | grep -i error | wc -l
# Should return: 0

# All invoices accounted for
curl https://sqint.atocomm.eu/api/check-payment-status ...
# Should show all test invoices processed
```

### 2. Clean Test Data (Optional)
- Delete test opportunities from Salesforce
- Void test invoices in QuickBooks

## PERMANENT FIXES TO IMPLEMENT

### Fix 1: Handle Missing Invoices (Error 610)
**File**: `/opt/qb-integration/src/services/quickbooks-api.js`
```javascript
// Line ~495, wrap in try-catch:
async checkInvoicePaymentStatus(invoiceId) {
  try {
    // existing code
  } catch (error) {
    if (error.message.includes('Object Not Found')) {
      return { 
        status: 'not_found',
        shouldClearFromSF: true 
      };
    }
    throw error;
  }
}
```

### Fix 2: Clear Orphaned References
**File**: `/opt/qb-integration/src/services/salesforce-api.js`
```javascript
// Add new method:
async clearOrphanedInvoiceId(opportunityId) {
  const query = `UPDATE Opportunity SET QB_Invoice_ID__c = null WHERE Id = '${opportunityId}'`;
  await this.connection.query(query);
  logger.info(`Cleared orphaned QB_Invoice_ID from opportunity ${opportunityId}`);
}
```

### Fix 3: Prevent Duplicate Invoice Creation
**File**: `/opt/qb-integration/src/services/scheduler.js`
```javascript
// Before creating invoice, check if one exists in QB:
const existingInvoice = await checkExistingInvoice(opportunity.Id);
if (existingInvoice) {
  logger.info(`Invoice already exists for opportunity ${opportunity.Id}`);
  continue;
}
```

## CLIENT COMMUNICATION CRITERIA

Only inform Roman/client "system is ready" when:
1. ✅ All 4 test scenarios pass
2. ✅ 24 hours of operation with no errors
3. ✅ Permanent fixes deployed
4. ✅ Can demonstrate live working example

## TEST EXECUTION LOG

| Test | Start Time | End Time | Result | Notes |
|------|------------|----------|--------|-------|
| Scenario 1 | | | | |
| Scenario 2 | | | | |
| Scenario 3 | | | | |
| Scenario 4 | | | | |

## FINAL SIGN-OFF

- [ ] All tests passed
- [ ] Permanent fixes implemented
- [ ] 24-hour stability confirmed
- [ ] Ready to notify client

**DO NOT PROCEED TO CLIENT NOTIFICATION UNTIL ALL BOXES CHECKED**