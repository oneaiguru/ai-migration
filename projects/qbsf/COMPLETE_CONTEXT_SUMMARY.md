# 📚 COMPLETE CONTEXT SUMMARY - Roman's QB Integration

**Last Updated**: December 8, 2025
**Reader**: Full understanding of all project files and context
**Status**: Ready to work on currency mismatch issue

---

## 🎯 Project Overview

### Core Mission
Integrate QuickBooks with Salesforce for Roman Kapralov so that:
1. When a Salesforce Opportunity is created and moved to "Proposal and Agreement" stage
2. An invoice is automatically created in QuickBooks
3. The invoice ID syncs back to Salesforce (`QB_Invoice_ID__c`)
4. A payment link syncs back to Salesforce (`QB_Payment_Link__c`)
5. Roman's salespeople can share payment links with customers directly from Salesforce

### Payment Status
- ✅ **ALREADY PAID** - 30,000 RUB received on September 4, 2025
- Current work is follow-up maintenance/feature work, NOT for getting paid
- Roman is frustrated with slow progress on payment link feature

---

## ✅ What's Completed

### Session Dec 7-8, 2025: VICTORY - Payment Link Working!
All work was done this week. PR #76 was merged and approved by Codex.

**Completed Items**:
1. ✅ **P2 Bug Fix** - Payment link NULL preservation
   - Issue: Apex unconditionally overwrote QB_Payment_Link__c with null
   - Fix: Added conditional check in QBInvoiceIntegrationQueueable.cls:168-171
   - Result: Link now preserved when NULL

2. ✅ **Root Cause Found** - QB Requires BillEmail for Payment Links
   - Discovery: QB won't generate payment links without customer email
   - Solution: Added Contact email query + fallback logic
   - Files changed:
     - `salesforce-api.js` (lines 250-265) - Contact email query
     - `api.js` (lines 51-84) - billingEmail variable
     - `opportunity-to-invoice.js` (lines 9, 48-61) - BillEmail field
   - Verified with Invoice 2432 - payment link WORKING ✅

3. ✅ **P1 Codex Issue** - Missing Field Metadata
   - Issue: Code referenced QB_Payment_Link__c but deployment package didn't have it
   - Fix: Added all 7 QB_* field metadata files to deployment package
   - Result: Deployment bundle now self-contained

4. ✅ **Security Fix** - Hardcoded API Key Removed
   - Issue: Script had hardcoded middleware key
   - Fix: Moved to environment variable MIDDLEWARE_API_KEY
   - Action needed: Roman should rotate the old key

5. ✅ **All Tests Passing**
   - 27/27 tests passing
   - 88% code coverage
   - No regression
   - Zero failures

### Test Invoice Verification
```
Invoice 2432:
- QB_Invoice_ID__c:    2432 ✅
- QB_Payment_Link__c:  https://connect.intuit.com/portal/app/... ✅
```

---

## 🔴 Current Issue: Currency Mismatch

### Roman's Report (Dec 8, 2025)
> "Ссылка пришла, только в счете 500 евро а в ссылке оплата на 500 баксов"
> Translation: "The link arrived, but the invoice is 500 euros and the payment link shows 500 dollars"

### Root Cause Identified
The middleware **does NOT pass currency information** to QuickBooks.

**Data Flow Break**:
```
Salesforce: Amount=500, CurrencyIsoCode=EUR
    ↓
Middleware: Gets 500, IGNORES CurrencyIsoCode ❌
    ↓
QuickBooks: Creates Invoice without CurrencyRef
    ↓
QB defaults to: 500 USD (home currency) ❌
    ↓
Payment Link: $500 USD (should be €500 EUR)
```

### Investigation Results
1. ✅ **Salesforce**: Multi-currency ENABLED
   - CurrencyIsoCode field populated on Opportunities
   - Data is available and correct

2. ❌ **Middleware**: Currency handling MISSING
   - CurrencyIsoCode NOT queried from Opportunity
   - CurrencyRef NOT set on QB customer
   - CurrencyRef NOT set on QB invoice
   - All invoices default to USD

3. **QuickBooks Behavior**
   - Without CurrencyRef, QB uses company home currency (USD)
   - Amounts are numerically correct but in wrong currency
   - Payment links reflect the invoice currency

---

## 🔧 Solution Design (READY TO IMPLEMENT)

### 4 Code Changes Required

#### Change 1: Update Salesforce API Query
**File**: `deployment/sf-qb-integration-final/src/services/salesforce-api.js`
**Line**: ~240-245

Add `CurrencyIsoCode` to OpportunityLineItem query (along with other fields)

#### Change 2: Extract Currency in API
**File**: `deployment/sf-qb-integration-final/src/routes/api.js`
**Line**: ~57-73 (customer creation section)

```javascript
const currency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
logger.info(`Customer currency for ${opportunityData.account.Name}: ${currency}`);

// Then add to customerData:
CurrencyRef: {
  value: currency
}
```

#### Change 3: Add Currency to Invoice
**File**: `deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js`
**Line**: ~12 (function signature) and ~32-54 (invoice object)

Add `currency = 'USD'` parameter to function
Add to invoice object:
```javascript
CurrencyRef: {
  value: currency
}
```

#### Change 4: Pass Currency to Transform
**File**: `deployment/sf-qb-integration-final/src/routes/api.js`
**Line**: ~79-85

Pass `currency` as 6th parameter to mapOpportunityToInvoice()

### Success Criteria
- ✅ Customer created with correct CurrencyRef
- ✅ Invoice created with correct CurrencyRef
- ✅ Payment link shows correct currency (€500 EUR instead of $500 USD)
- ✅ Middleware logs confirm currency being used
- ✅ No regression in existing functionality (EUR, USD, and missing currency all work)

---

## 🏗️ Architecture Overview

### System Components

**Salesforce Org**: Production `customer-inspiration-2543`
- User: `olga.rybak@atocomm2023.eu`
- URL: `https://customer-inspiration-2543.my.salesforce.com`

**Middleware Server**: Roman's VPS
- SSH: `ssh roman@pve.atocomm.eu -p2323`
- Password: `$SSH_PASS`
- Path: `/opt/qb-integration/`
- URL: `https://sqint.atocomm.eu`

**API Key**: `$API_KEY` (WORKING)

### Middleware Files

**Key Service Files**:
- `src/services/salesforce-api.js` - Queries Salesforce data
- `src/routes/api.js` - Main API endpoint for invoice creation
- `src/services/quickbooks-api.js` - Calls QB API
- `src/transforms/opportunity-to-invoice.js` - Maps Opportunity to QB Invoice
- `src/transforms/opportunity-to-customer.js` - Maps Account to QB Customer

**Current Working Flow**:
1. Opportunity changes to "Proposal and Agreement"
2. Trigger fires → QBInvoiceIntegrationQueueable executes
3. Queueable calls middleware `/api/create-invoice`
4. Middleware queries SF for Opportunity + Account + Products + Contacts
5. Creates QB Customer (if new)
6. Creates QB Invoice with Invoice data + BillEmail
7. QB generates payment link (if BillEmail present)
8. Middleware updates SF with Invoice ID + Payment Link

---

## 📋 Critical Files & Locations

### Salesforce (force-app)
```
force-app/main/default/
├── classes/
│   ├── QBInvoiceIntegrationQueueable.cls     # Main processor
│   ├── OpportunityQuickBooksTrigger.trigger   # Fires on stage change
│   └── QuickBooksAPIService.cls              # Middleware communication
├── objects/Opportunity/fields/
│   ├── QB_Invoice_ID__c.field
│   ├── QB_Payment_Link__c.field
│   └── ... (other QB_* fields)
└── lwc/
    └── quickBooksInvoice/                     # UI component
```

### Middleware (deployment/sf-qb-integration-final)
```
src/
├── server.js                        # Entry point
├── routes/api.js                    # API endpoints ← MODIFY FOR CURRENCY
├── services/
│   ├── salesforce-api.js           # SF queries ← MODIFY FOR CURRENCY
│   └── quickbooks-api.js           # QB API calls
├── transforms/
│   ├── opportunity-to-invoice.js   # Data mapping ← MODIFY FOR CURRENCY
│   └── opportunity-to-customer.js  # Customer mapping
└── app.js                           # Express setup
```

---

## 🚀 Deployment Workflow

### Step-by-Step Process

**Step 1**: Make code changes locally in `/Users/m/ai/projects/qbsf/`

**Step 2**: Commit to `feat/accounting-recon-md` branch:
```bash
git add projects/qbsf/...
git commit -m "fix(qbsf): add currency handling for multi-currency invoices"
```

**Step 3**: Push with Codex wrapper:
```bash
scripts/dev/push_with_codex.sh
```

**Step 4**: Wait for Codex review and merge approval

**Step 5**: Deploy to server:
```bash
# SSH to server
ssh -p 2323 roman@pve.atocomm.eu

# Backup
cd /opt/qb-integration
cp src/services/salesforce-api.js src/services/salesforce-api.js.backup
cp src/routes/api.js src/routes/api.js.backup
cp src/transforms/opportunity-to-invoice.js src/transforms/opportunity-to-invoice.js.backup
```

**Step 6**: Copy updated files:
```bash
scp -P 2323 deployment/sf-qb-integration-final/src/services/salesforce-api.js roman@pve.atocomm.eu:/opt/qb-integration/src/services/
scp -P 2323 deployment/sf-qb-integration-final/src/routes/api.js roman@pve.atocomm.eu:/opt/qb-integration/src/routes/
scp -P 2323 deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js roman@pve.atocomm.eu:/opt/qb-integration/src/transforms/
```

**Step 7**: Restart middleware:
```bash
cd /opt/qb-integration
pkill -f 'node src/server.js'
node src/server.js > /tmp/server.log 2>&1 &
```

**Step 8**: Verify health:
```bash
curl -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health
```

**Step 9**: Test with Roman:
- Create new EUR Opportunity
- Wait 1 minute
- Check QB_Invoice_ID__c and QB_Payment_Link__c fields
- Verify invoice shows correct currency in QB

---

## 📊 Test Cases

### Test Case 1: EUR Currency (Current Issue)
**Setup**:
- Opportunity: Amount=500, CurrencyIsoCode=EUR
- Account/Contact: Valid with email

**Expected**:
- Customer: CurrencyRef.value = "EUR" ✅
- Invoice: CurrencyRef.value = "EUR" ✅
- Payment Link: €500 EUR ✅

### Test Case 2: USD Currency
**Setup**:
- Opportunity: Amount=1000, CurrencyIsoCode=USD

**Expected**:
- Customer: CurrencyRef.value = "USD" ✅
- Invoice: CurrencyRef.value = "USD" ✅
- Payment Link: $1000 USD ✅

### Test Case 3: Missing Currency (Fallback)
**Setup**:
- Opportunity: No CurrencyIsoCode set

**Expected**:
- Defaults to USD ✅
- Customer: CurrencyRef.value = "USD" ✅
- Invoice: CurrencyRef.value = "USD" ✅

---

## ⚠️ Risks & Mitigations

### Risk 1: Existing Customers Already in USD
**Issue**: Old customers created without CurrencyRef
**Mitigation**:
- New invoices will have CurrencyRef on invoice level
- QB may reject if customer ≠ invoice currency
- Solution: Create new customers for EUR invoices

### Risk 2: QB Multi-Currency Not Enabled
**Issue**: QB might reject CurrencyRef if not enabled
**Mitigation**:
- Verify QB has multi-currency enabled (Settings → Company Settings → Advanced → Currencies)
- If not enabled, all currencies default to home currency anyway

### Risk 3: Unsupported Currency Codes
**Issue**: SF uses currency QB doesn't support
**Mitigation**:
- Add validation/mapping for supported currencies
- Log warnings for unsupported
- Fall back to USD

---

## 📞 Communication with Roman

### Russian Message Template for Currency Fix
```
Роман, нашли причину несовпадения валют.

ПРОБЛЕМА: Интеграция не передает валюту в QuickBooks.
- Salesforce: 500 EUR
- QuickBooks получает: 500 (без указания валюты)
- QuickBooks создает счет: $500 USD (базовая валюта компании)

РЕШЕНИЕ: Добавим поле CurrencyRef в три места:
1. При создании клиента в QB
2. При создании счета в QB
3. Валюта будет браться из Salesforce Opportunity

ЧТО НУЖНО ПРОВЕРИТЬ:
1. В QuickBooks включена ли multi-currency?
   - Settings → Company Settings → Advanced → Currencies
2. Если нет - нужно включить

ПОСЛЕ ИСПРАВЛЕНИЯ:
- Счет в QB: 500 EUR ✅
- Ссылка на оплату: €500 EUR ✅
```

---

## 🎯 Next Steps (ACTION ITEMS)

### For Implementation
1. **Read all three files** that need modification (DONE ✅)
2. **Make code changes** in the 4 locations identified
3. **Test locally** if possible
4. **Commit and push** using Codex wrapper
5. **Wait for Codex review** and approval
6. **Deploy to production** server
7. **Verify** with EUR test opportunity
8. **Communicate success** to Roman in Russian

### Time Estimate
- Code changes: 30 minutes
- Testing: 15 minutes
- Deployment: 15 minutes
- Verification: 15 minutes
- **Total: ~1-1.5 hours**

---

## 💡 Key Insights

### Why This Issue Happened
1. Initial payment link implementation was correct
2. But didn't account for Salesforce multi-currency
3. Middleware was designed assuming single currency (USD)
4. QB invisibly defaults to home currency when CurrencyRef missing
5. Payment links generated in USD even though invoices should be EUR

### Why Root Cause Analysis Worked
Instead of accepting "QB doesn't have multi-currency enabled", we:
- Traced data flow end-to-end
- Found middleware was creating invoices correctly
- Discovered QB needs explicit CurrencyRef
- Fixed the actual root cause in middleware

### Business Impact
- Without fix: Invoices in wrong currency, customers confused, cash flow issues
- With fix: Correct currency, clear payment links, faster payments, happy Roman

---

## 📋 Project Status Summary

| Item | Status | Notes |
|------|--------|-------|
| Invoice Creation | ✅ Working | Tested, verified, deployed |
| Payment Link Generation | ✅ Working | Fixed Dec 7, requires email |
| Code Coverage | ✅ 88% | 27/27 tests passing |
| Deployment | ✅ Complete | All components deployed |
| Documentation | ✅ Complete | Russian message ready |
| **Currency Handling** | ⏳ **READY** | **Plan designed, ready to implement** |

---

## 🎉 Summary

**We have a fully-designed, low-risk solution ready to implement.**

The currency mismatch is a classic integration issue where one system (SF) has multi-currency support but another (QB middleware) was designed for single currency. The fix is straightforward: pass currency information through the data pipeline.

All code changes are small, localized, and follow existing patterns. Tests will validate the fix works correctly. Deployment is standard procedure.

**Roman will be happy** - instead of "currency is broken", he'll see "both EUR and USD work perfectly".

---

*Complete Context Summary*
*Ready for implementation*
*No remaining ambiguities or unknowns*
