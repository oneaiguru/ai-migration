# E2E Testing Handoff — Option A Live Verification

## Status
**Deployment COMPLETE** (Dec 29, 2025):
- SF Deploy ID: `0AfSo0000037w2LKAQ` (42 tests, 0 failures)
- Middleware: `https://sqint.atocomm.eu/api/health` → healthy
- Settings: QB_Realm `9130354519120066`, endpoint configured

## Your Task
Verify the integration works end-to-end before telling Roman it's ready.

## Scope
Test that Opportunities moving to "Proposal and Agreement" stage:
1. Create QB invoice in QuickBooks
2. Populate `QB_Invoice_ID__c` on the Opportunity
3. Populate `QB_Payment_Link__c` (where email exists)

## Test Procedure

### Step 1: Check Prerequisites
```bash
# Verify SF connection
sf org display -o myorg

# Verify middleware is up
curl -s https://sqint.atocomm.eu/api/health | jq
```

### Step 2: Create Test Opportunity
Use SF CLI or Salesforce UI:
- Create an Account with `Email__c` filled
- Create a Supplier (lookup target depends on org schema)
- Create Opportunity with:
  - `AccountId` = the account
  - `Supplier__c` = the supplier (NOT "ATO COMM")
  - `StageName` = "Prospecting" initially
  - `Email_for_invoice__c` = valid email (optional, uses priority fallback)
  - `CloseDate` = any future date
  - `Name` = "E2E Test - [timestamp]"

### Step 3: Trigger Integration
Move Opportunity to `StageName = "Proposal and Agreement"`

### Step 4: Verify Results (within 30 seconds)
Query the Opportunity:
```bash
sf data query -q "SELECT Id, Name, QB_Invoice_ID__c, QB_Payment_Link__c, QB_Sync_Status__c, QB_Error_Code__c FROM Opportunity WHERE Name LIKE 'E2E Test%' ORDER BY CreatedDate DESC LIMIT 1" -o myorg
```

**Expected**:
- `QB_Invoice_ID__c` = populated with QB invoice ID
- `QB_Payment_Link__c` = populated with payment URL (if email was valid)
- `QB_Sync_Status__c` = "Success" or "Warning"

### Step 5: Verify in QuickBooks (optional)
Check that invoice appears in QB sandbox/production matching the ID.

## Success Criteria
- [ ] At least 3 test Opportunities successfully create invoices
- [ ] `QB_Invoice_ID__c` populated on all
- [ ] `QB_Payment_Link__c` populated where email exists
- [ ] No `QB_Sync_Status__c = "Error"` with unrecoverable codes

## Failure Handling
If any fail, check:
1. `QB_Error_Code__c` and `QB_Error_Message__c` on the Opportunity
2. Middleware logs: `ssh roman@pve.atocomm.eu -p2323 "tail -100 /opt/qb-integration/logs/app.log"`
3. QB_Integration_Settings__c is correctly configured

## Output Required
After testing, report:
- **GREEN LIGHT**: "E2E verified, ready for Roman's 20-account test"
- **FIX LIST**: Specific issues found with error codes/messages

## Reference Files
- `docs/SESSION_2025-12-29_COVERAGE_FIX_HANDOFF.md` - deployment details
- `docs/OPTION_A_DELIVERY_MANIFEST.md` - what Roman gets
- `scripts/option_a_after_payment_deploy.sh` - deployment script used
