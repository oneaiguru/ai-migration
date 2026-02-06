# Session Handoff: 2025-12-29 Multi-Currency Fix

## 🔄 UPDATE (14:21 UTC): CurrencyRef RESTORED

**Roman agreed to enable Multi-Currency in QuickBooks.** We rolled back the temporary fix and restored proper currency handling.

### Latest State:
- **CurrencyRef**: RESTORED in `api.js` (lines 111-113)
- **Git Commit**: `c5940cb` on branch `refactor-api-300loc`
- **Middleware**: Redeployed and healthy (verified 14:21:55 UTC)
- **Awaiting**: Roman to test after enabling Multi-Currency in QB

### What Changed:
The temporary removal of CurrencyRef has been undone. Customers will now be created with their correct currency (CNY, EUR, USD, etc.) once Roman enables Multi-Currency in his QuickBooks account.

---

## Executive Summary (Original Issue)

**Problem**: Roman reported invoice creation stopped working after initial successful tests.

**Root Cause Found**: QuickBooks rejected customer creation because `CurrencyRef` was being passed but Multi-Currency was NOT enabled in Roman's QB account.

**Temporary Fix Applied**: Removed `CurrencyRef` from customer creation payload.

**Final Fix**: Roman enables Multi-Currency in QB, we restore CurrencyRef. ✅ DONE

---

## What Was Wrong (Detailed)

### The Error (from Salesforce Opportunity fields)
```
QB_Sync_Status__c: Error
QB_Error_Code__c: HTTP_ERROR
QB_Error_Message__c: HTTP Error: 500 Internal Server Error. Body: {"success":false,"error":{"message":"Failed to create customer \"深圳普罗空运有限公司\" in QuickBooks: QuickBooks API validation error (Field: 6000): A business validation error has occurred while processing your request: Business Validation Error: Multi Currency should be enabled to perform this operation"}}
```

### Why It Happened
The middleware code was passing `CurrencyRef` when creating QuickBooks customers:
```javascript
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  CurrencyRef: {        // <-- THIS CAUSED THE ERROR
    value: currency     // e.g., 'CNY', 'EUR', etc.
  },
  // ...
};
```

QuickBooks requires Multi-Currency to be enabled in account settings to accept customers with non-default currencies. Roman's QB account doesn't have this enabled.

### Why Some Tests Worked
The successful tests (test 3, E2E Test 1, 2, etc.) likely used accounts with the default USD currency, which QB accepted. The failures were for international accounts (Chinese, Saudi, etc.) with non-USD currencies.

---

## What Was Fixed

### Code Change
**File**: `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`

**Lines 108-113 changed from:**
```javascript
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  CurrencyRef: {
    value: currency
  },
  ...(normalizedBillingEmail && {
```

**To:**
```javascript
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  ...(normalizedBillingEmail && {
```

The `CurrencyRef` block was removed. QuickBooks will now use the company's default currency for all customers.

### Deployment
- Code deployed via SCP to `roman@pve.atocomm.eu:2323:/opt/qb-integration/src/routes/api.js`
- Middleware restarted and confirmed healthy at `https://sqint.atocomm.eu/api/health`

---

## Other Fixes Applied This Session

### 1. Permission Set Deployment
- Deployed `QB_Integration_User` permission set to Salesforce org
- Assigned to user `olga.rybak@atocomm2023.eu`
- **Purpose**: Grants Field-Level Security (FLS) access to QB_* custom fields
- **Deploy ID**: `0AfSo00000380PJKAY`

### 2. Error Fields Cleared
- Cleared `QB_Sync_Status__c`, `QB_Error_Code__c`, `QB_Error_Message__c`, `QB_Correlation_Id__c` on opportunity `006So00000XVQzOIAX` (test 4)

---

## What Next Agent Must Do

### Immediate: Verify the Fix Works

1. **Ask Roman to re-trigger invoice creation** for a failed opportunity:
   - Change the Opportunity stage from "Proposal and Agreement" to something else (e.g., "Prospecting")
   - Change it back to "Proposal and Agreement"
   - This fires the trigger which enqueues the invoice creation

2. **Query to verify success**:
   ```bash
   sf data query --query "SELECT Id, Name, QB_Sync_Status__c, QB_Error_Code__c, QB_Invoice_ID__c FROM Opportunity WHERE Id='006So00000XVQzOIAX'" -o myorg
   ```

   **Expected**: `QB_Sync_Status__c = 'Success'` and `QB_Invoice_ID__c` populated

3. **If still errors**, check the new error message - it will indicate what else might be wrong

### Alternative: Direct Test Without Roman

Run anonymous Apex to manually enqueue the opportunity:
```bash
sf apex run -o myorg --file - <<'EOF'
List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE Id = '006So00000XVQzOIAX'];
System.enqueueJob(new QBInvoiceIntegrationQueueable(opps));
EOF
```

Then query the result after a few seconds.

---

## Key Information for Next Agent

### Credentials & Access

**Salesforce:**
- Org: `myorg` (alias) - `customer-inspiration-2543.my.salesforce.com`
- User: `olga.rybak@atocomm2023.eu`

**Middleware Server:**
- Host: `pve.atocomm.eu` port `2323`
- User: `roman`
- Password: `$SSH_PASS`
- Path: `/opt/qb-integration/`
- URL: `https://sqint.atocomm.eu`
- API Key: `$API_KEY`

**QuickBooks:**
- Realm ID: `9130354519120066`
- Environment: Production

### Key Files

| File | Purpose |
|------|---------|
| `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js` | Middleware API routes (EDITED this session) |
| `/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls` | Salesforce async invoice processor |
| `/Users/m/ai/projects/qbsf/force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger` | Fires on stage change to "Proposal and Agreement" |

### Test Opportunities (from SOQL query)

| ID | Name | Status | Invoice ID |
|----|------|--------|------------|
| 006So00000XVQzOIAX | test 4 | Cleared (was Error) | null |
| 006So00000XVOXkIAP | TEST fee | Error (Multi-Currency) | null |
| 006So00000XVE25IAH | Test_attendees fee | Error (Multi-Currency) | null |
| 006So00000XUrjqIAD | test 3 | Success | 2543 |
| 006So00000XUbYeIAL | E2E Test 2 | Success | 2542 |

---

## Diagnostic Commands

### Check Middleware Health
```bash
curl -s -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health
```

### Check Middleware Logs
```bash
sshpass -p "$SSH_PASS" ssh -p 2323 roman@pve.atocomm.eu "tail -50 /opt/qb-integration/server.log"
```

### Query Opportunity Sync Status
```bash
sf data query --query "SELECT Id, Name, QB_Sync_Status__c, QB_Error_Code__c, QB_Error_Message__c, QB_Invoice_ID__c FROM Opportunity WHERE StageName='Proposal and Agreement' ORDER BY LastModifiedDate DESC LIMIT 10" -o myorg
```

### Manually Trigger Invoice Creation
```bash
sf apex run -o myorg --file - <<'EOF'
List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE Id = '006So00000XVQzOIAX'];
System.enqueueJob(new QBInvoiceIntegrationQueueable(opps));
EOF
```

---

## Communication with Roman

### Last Message Sent (Russian)
> Проверил всё. Middleware работает, токены QB валидны, права доступа исправлены. Попробуй создать новую Opportunity и перевести в "Proposal and Agreement". Если не работает - посмотри поле QB_Sync_Status__c на этой Opportunity и скажи что там написано.

### What Roman Asked
> "и вот как без логов ты поймешь из-за чего? или ты просто запросом через SQL Console это делаешь?"
> Translation: "How will you understand without logs? Or do you just do it through SQL Console query?"

**Answer given**: We use SOQL queries to check the `QB_Sync_Status__c`, `QB_Error_Code__c`, and `QB_Error_Message__c` fields on Opportunities - these contain all diagnostic info.

### Awaiting Roman's Reply
Roman should either:
1. Try creating a new invoice and report the result
2. Tell us what `QB_Sync_Status__c` shows after re-triggering

---

## What Was NOT the Problem (False Leads)

### 1. Permission Sets / FLS
The permission set deployment was useful for CLI diagnostics but NOT the root cause. The Salesforce Apex code runs in system context and could already read/write the fields.

### 2. OAuth Token Expiry
The investigation found tokens.json shows fake expiry dates (year 2100), but middleware logs showed NO auth errors - tokens are working fine.

### 3. Missing salesforceInstance Parameter
Early (incorrect) diagnosis by Haiku. The Salesforce Apex code DOES send this parameter correctly (line 232 of QBInvoiceIntegrationQueueable.cls).

---

## Session Timeline

| Time (UTC) | Action |
|------------|--------|
| ~11:30 | Roman reports invoices stopped working |
| ~12:00 | Initial incorrect diagnosis (salesforceInstance) |
| ~12:15 | Opus deep analysis reveals permission set + token issues |
| ~12:25 | SOQL query reveals REAL issue: Multi-Currency error |
| ~12:30 | Plan created to remove CurrencyRef |
| ~12:35 | Haiku executes: edits api.js, deploys to server |
| ~12:40 | Middleware restarted and healthy |
| ~12:45 | Test opportunity cleared, awaiting Roman re-test |

---

## Success Criteria

The fix is successful when:
1. ✅ Middleware is healthy (already confirmed)
2. ⏳ Roman re-triggers invoice creation on a previously failed opportunity
3. ⏳ `QB_Sync_Status__c` shows "Success"
4. ⏳ `QB_Invoice_ID__c` is populated with a valid QuickBooks invoice ID
5. ⏳ No more "Multi Currency should be enabled" errors

---

## If the Fix Doesn't Work

If after re-testing there are still errors:

1. **Check the new error message** - it will be different from Multi-Currency
2. **Possible issues**:
   - QB OAuth token actually expired (check for 401 errors in logs)
   - Customer name already exists in QB with different data
   - Missing required fields on the Opportunity/Account
3. **Re-deploy if needed**: The local code at `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/` is the source of truth

---

*Handoff created: 2025-12-29 ~20:30 UTC+8*
*Session model: Claude Opus 4.5 (with Haiku 4.5 for execution)*
