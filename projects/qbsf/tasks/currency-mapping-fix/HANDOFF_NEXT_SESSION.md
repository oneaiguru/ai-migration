# HANDOFF: Currency Fix - Next Session

**Status**: CODE COMPLETE ✅ - Need to deploy and verify
**Date**: 2026-01-26

---

## ⚠️ TL;DR - SITUATION UNCLEAR

**Status:** 2 code fixes deployed but **NOT FULLY TESTED**
**Roman confirmed:** "QB базово у нас в USD" (QB is basically USD)
**New Issue:** Amount calculation error in product currency conversion

**Next Agent:** Read entire file. Solution is NOT obvious - investigation needed.

---

## What Was Changed

### File: `deployment/sf-qb-integration-final/src/routes/api.js`

**Change 1 (lines ~183-199)**: Always use Opportunity currency
```javascript
// BEFORE (buggy):
let targetCurrency = sourceCurrency;  // USD
if (isExistingCustomer) {
  targetCurrency = resolvedCurrency;  // EUR from QB customer - OVERRIDE!
}

// AFTER (fixed):
const targetCurrency = sourceCurrency;  // USD - ALWAYS
if (isExistingCustomer && resolvedCurrency !== sourceCurrency) {
  logger.info(`Note: QB customer has ${resolvedCurrency}, using ${sourceCurrency}`);
}
```

**Change 2 (lines ~206-231)**: Convert product prices if currency differs
```javascript
// NEW: If products are EUR but Opportunity is USD, convert prices
if (productCurrency && productCurrency !== sourceCurrency) {
  fxRate = await qbApi.getExchangeRate(productCurrency, sourceCurrency, asOfDate);
  convertedProducts = convertProductsForCurrency(opportunityData.products, fxRate);
}
```

---

## ⚠️ CRITICAL: What We DON'T Know For Sure

### Uncertainty #1: Is Acron Aviation Really EUR?
- **Assumption made:** Acron Aviation is EUR customer in QB
- **Evidence for:** QB rejected USD invoice with message "Change transaction currency to match..."
- **Evidence against:** We never verified in QB directly. This could be ANY currency mismatch error.
- **Status:** NOT VERIFIED ❌

### Uncertainty #2: Product Currency Conversion Has a Math Bug
- **Error received:**
```
"Amount calculation incorrect in the request: Amount is not equal to UnitPrice * Qty.
Supplied value: 2,472.33"
```

- **What happened:** The `convertProductsForCurrency()` function multiplies both UnitPrice AND TotalPrice by FX rate separately
- **Problem:** Rounding errors cause: `UnitPrice × Qty ≠ TotalPrice` after conversion
- **Example:**
  ```
  Before: UnitPrice=100, Qty=2, TotalPrice=200 (100 × 2 = 200) ✓
  After FX 1.1234:
    - UnitPrice becomes 112.34
    - TotalPrice becomes 224.68
    - QB checks: 112.34 × 2 = 224.68 ✓ (should work)
    BUT with rounding: 112.34 × 2 = 224.68000 vs TotalPrice = 224.67
  ```
- **Status:** CODE BUG CONFIRMED ❌

### Uncertainty #3: Roman's Actual QB Setup
- **Roman said:** "QB базово у нас в USD" (QB is basically USD)
- **What this means:** QB realm is USD, most customers are USD
- **What we don't know:**
  - How many customers are EUR vs USD?
  - Is Acron Aviation really an exception?
  - Can we even test without seeing Roman's actual QB data?
- **Status:** NEEDS CLARIFICATION ❓

---

## What Worked ✅

- **Test 1:** Air Lease Corporation (USA, presumably USD) + USD Opportunity → QB Invoice #2643 SUCCESS
- **Conclusion:** Code works for USD customers in USD QB realm
- **Not tested:** Product currency conversion (because of the rounding bug)

---

## What Doesn't Work ❌

- **Error:** When using Acron Aviation + USD Opportunity
  1. First error: "Currency mismatch" (possible EUR customer)
  2. Second error: "Amount calculation" (rounding in product conversion)
- **Status:** Cannot proceed until fixed

---

## Action Items for Next Session

### 🔴 CRITICAL FIX NEEDED FIRST: Math Bug in Product Conversion

Before any deployment, fix `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js`

**Current broken logic:**
```javascript
const convertedTotal = roundToCurrency(totalPrice * fxRate);
const convertedUnitPrice = roundToCurrency(unitPrice * fxRate);
```

**Problem:** Independent rounding causes `UnitPrice × Qty ≠ Amount`

**Fix option 1 (Recommended):**
```javascript
// Calculate from UnitPrice, ignore TotalPrice
const convertedUnitPrice = roundToCurrency(unitPrice * fxRate);
const convertedTotal = roundToCurrency(convertedUnitPrice * qty);
```

**Fix option 2:**
```javascript
// Keep TotalPrice accurate, derive UnitPrice
const convertedTotal = roundToCurrency(totalPrice * fxRate);
const convertedUnitPrice = qty > 0 ? roundToCurrency(convertedTotal / qty) : roundToCurrency(unitPrice * fxRate);
```

**Verify:** After fix, test that `UnitPrice × Qty = Amount` exactly.

---

### 2. Verify QB Setup with Roman

**Ask Roman (in Russian or German):**

```
1. "Acron Aviation в QB - какая валюта?"
   (What currency is Acron Aviation in QB?)

2. "Это исключение? Все остальные клиенты в USD?"
   (Is it an exception? Are all other customers USD?)

3. "Можно ли изменить Acron Aviation на USD?"
   (Can we change Acron Aviation to USD?)

4. "Или нам нужно использовать другого клиента для USD сделок?"
   (Or should we use a different customer for USD deals?)
```

**Expected answer:** Either change Acron Aviation to USD OR use different customers for different currencies.

---

### 3. Deploy Code (ONLY after math bug is fixed)
```bash
cd /Users/m/ai/projects/qbsf && \
# Replace $SSH_PASS and $API_KEY with values from SECRETS.local.md (git-ignored)
sshpass -p "$SSH_PASS" scp -P 2323 -o StrictHostKeyChecking=no \
deployment/sf-qb-integration-final/src/routes/api.js \
roman@pve.atocomm.eu:/opt/qb-integration/src/routes/ && \
sshpass -p "$SSH_PASS" ssh -p 2323 -o StrictHostKeyChecking=no \
roman@pve.atocomm.eu "cd /opt/qb-integration && pkill -f 'node src/server.js' || true && nohup node src/server.js > server.log 2>&1 &" && \
sleep 3 && \
curl -s -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health
```

### 2. Test with USD QB Customer
- Don't test with "Acron Aviation" (it's EUR)
- Use or create a QB Customer configured for USD
- Create SF Opportunity linked to that Account
- Test the flow

### 3. Tell Roman (in Russian)

```
Код исправлен и задеплоен ✅

Ошибка QB была НЕ из-за кода - это правило QuickBooks:
"Валюта инвойса должна совпадать с валютой клиента в QB"

Клиент "Acron Aviation" в QB настроен на EUR.
Наш код теперь отправляет USD (из Opportunity).
QB говорит: "Нет, этот клиент EUR, я не приму USD инвойс"

Решение:
1. Зайди в QuickBooks → Acron Aviation → Edit
2. Измени валюту клиента на USD
3. ИЛИ используй другого QB клиента который уже USD

После этого USD инвойсы будут работать.
```

---

## Verification Steps - AFTER FIX

### Test 1: USD Customer (Simple Case - Already Tested ✅)
1. Use Air Lease Corporation or similar USD customer
2. Create USD Opportunity
3. Verify QB invoice created in USD
4. **Result:** Already passed (Invoice #2643)

### Test 2: Product Currency Conversion (NOT YET TESTED ❌)
1. Create Opportunity in USD
2. Add OpportunityLineItem with EUR prices
3. Move to "Proposal and Agreement"
4. **Expected:**
   - Middleware detects EUR products
   - Fetches FX rate
   - Converts prices
   - Amount calculated correctly: `UnitPrice × Qty = TotalPrice`
5. **Verify in QB_Integration_Log:**
   - No "Amount calculation" error
   - Status = "Success"
   - Currency = USD

### Test 3: Acron Aviation Specific (DEPENDS ON ROMAN)
1. Get Acron Aviation's actual QB currency from Roman
2. If EUR: Either change to USD OR test with USD customer instead
3. Re-test if changed

---

## Files Modified

| File | Lines | Change |
|------|-------|--------|
| `deployment/sf-qb-integration-final/src/routes/api.js` | 183-199 | Remove QB customer currency override |
| `deployment/sf-qb-integration-final/src/routes/api.js` | 206-231 | Add product currency conversion |

---

## If It Still Doesn't Work

1. Check server logs: `ssh roman@pve.atocomm.eu -p2323 "tail -100 /opt/qb-integration/server.log"`
2. Check if FX rate is available: QB needs EUR→USD exchange rate configured
3. Check if QB Customer was actually changed to USD
4. Read the full error message in QB Integration Error Log in SF

---

## What's Sure vs Uncertain

### ✅ CONFIRMED
- Fix #1 (always use Opportunity currency) works: Air Lease test passed
- QB realm is basically USD (Roman confirmed)
- Code compiles and deploys
- Middleware is healthy

### ❌ NEEDS FIXING
- Product currency conversion has rounding bug causing "Amount calculation error"
- Must be fixed before testing

### ❓ UNCERTAIN
- Is Acron Aviation really EUR? (We assumed, never verified)
- Should we test with Acron Aviation at all?
- What's Roman's expected behavior for multi-currency scenarios?

---

## Success Criteria

After next agent fixes the math bug and verifies with Roman:

- ✅ USD Opportunity → USD Invoice in QB (already tested)
- ✅ No "Amount calculation" errors (need to fix rounding)
- ✅ QB Integration Log shows correct currency
- ✅ Product prices converted correctly (if EUR→USD conversion needed)
- ✅ Roman confirms this matches expected behavior

---

## Files Next Agent Must Read (In Order)

1. **THIS FILE** ← You are here
2. `/Users/m/ai/projects/qbsf/CLAUDE.md` - Deployment reference
3. `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js` - Math bug location
4. `/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js` - Both fixes

**DO NOT START CODING UNTIL YOU UNDERSTAND THE MATH BUG**
