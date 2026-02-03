# 🔍 Currency Mismatch Investigation & Fix Plan

## 🚨 Problem Statement

**Roman's Issue**: "Ссылка пришла, только в счете 500 евро а в ссылке оплата на 500 баксов"
- Translation: "The link arrived, but the invoice is 500 euros and the payment link shows 500 dollars"

**Impact**: Invoice shows 500 EUR but payment link requires payment in 500 USD (wrong currency)

---

## ✅ Root Cause Identified

The integration **does NOT pass currency information to QuickBooks**, causing all invoices to default to QB's home currency (USD), even though Salesforce Opportunities are in EUR.

### Data Flow Shows the Break

```
Salesforce Opportunity: Amount=500, CurrencyIsoCode=EUR
    ↓
Middleware: Gets amount=500 but IGNORES CurrencyIsoCode ❌
    ↓
QuickBooks Invoice: Amount=500, NO CurrencyRef field
    ↓
QuickBooks defaults to: Amount=500, Currency=USD (home currency)
    ↓
Payment Link: $500 USD ❌ (should be €500 EUR)
```

### Investigation Findings

1. **Salesforce Configuration**: ✅ Multi-currency ENABLED
   - All recent opportunities are in EUR (500 EUR, 1050 EUR)
   - CurrencyIsoCode field exists and is properly populated
   - Data is available in Salesforce

2. **Middleware Implementation**: ❌ Currency handling MISSING
   - CurrencyIsoCode is NOT queried from Opportunity
   - CurrencyRef is NOT set on QB invoice
   - CurrencyRef is NOT set on QB customer
   - All invoices default to USD

3. **QuickBooks Behavior**:
   - Without CurrencyRef, QB uses company home currency (USD)
   - Invoice amounts are numerically correct (500) but in wrong currency
   - Payment link reflects the invoice currency = $500 instead of €500

---

## 🔧 Solution Design

### Fix Strategy

We need to add currency handling at **THREE points** in the integration:

1. **Customer Creation** - Set CurrencyRef when creating QB customers
2. **Invoice Creation** - Set CurrencyRef on QB invoices
3. **Data Retrieval** - Ensure CurrencyIsoCode is available from Salesforce

### Implementation Details

#### Change 1: Update Salesforce API Query

**File**: `deployment/sf-qb-integration-final/src/services/salesforce-api.js`
**Line**: ~240-245 (OpportunityLineItem query)

**Current Code**:
```javascript
const lineItemsQuery = `
  SELECT Id, Product2Id, Quantity, UnitPrice, TotalPrice,
         Product2.Id, Product2.Name, Product2.Description, Product2.QB_Item_ID__c
  FROM OpportunityLineItem
  WHERE OpportunityId = '${opportunityId}'
`;
```

**New Code**:
```javascript
const lineItemsQuery = `
  SELECT Id, Product2Id, Quantity, UnitPrice, TotalPrice,
         Product2.Id, Product2.Name, Product2.Description, Product2.QB_Item_ID__c,
         CurrencyIsoCode
  FROM OpportunityLineItem
  WHERE OpportunityId = '${opportunityId}'
`;
```

*(Note: The Opportunity record already gets CurrencyIsoCode via getRecord(), so no change needed there)*

---

#### Change 2: Add Currency to Customer Creation

**File**: `deployment/sf-qb-integration-final/src/routes/api.js`
**Line**: ~57-73 (customer creation)

**Current Code**:
```javascript
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  PrimaryEmailAddr: {
    Address: billingEmail
  },
  // ... rest of fields
};
```

**New Code**:
```javascript
// Get currency from Opportunity (default to USD if not set)
const currency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
logger.info(`Customer currency for ${opportunityData.account.Name}: ${currency}`);

const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  CurrencyRef: {
    value: currency
  },
  PrimaryEmailAddr: {
    Address: billingEmail
  },
  // ... rest of fields
};
```

---

#### Change 3: Add Currency to Invoice Creation

**File**: `deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js`
**Line**: ~12 (function signature) and ~32-54 (invoice object)

**Current Function Signature**:
```javascript
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '') {
```

**New Function Signature**:
```javascript
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '', currency = 'USD') {
```

**Current Invoice Object**:
```javascript
const invoice = {
  CustomerRef: {
    value: qbCustomerId,
    name: account.Name
  },
  Line: lineItems,
  TxnDate: ...,
  // ... rest of fields
};
```

**New Invoice Object**:
```javascript
const invoice = {
  CustomerRef: {
    value: qbCustomerId,
    name: account.Name
  },
  CurrencyRef: {
    value: currency
  },
  Line: lineItems,
  TxnDate: ...,
  // ... rest of fields
};

// Log currency for debugging
logger.info(`Invoice will be created in ${currency} for Opportunity ${opportunity.Id}`);
```

---

#### Change 4: Pass Currency to Transform

**File**: `deployment/sf-qb-integration-final/src/routes/api.js`
**Line**: ~79-85 (invoice transform call)

**Current Code**:
```javascript
const invoiceData = mapOpportunityToInvoice(
  opportunityData.opportunity,
  opportunityData.account,
  opportunityData.products,
  qbCustomerId,
  billingEmail
);
```

**New Code**:
```javascript
const invoiceData = mapOpportunityToInvoice(
  opportunityData.opportunity,
  opportunityData.account,
  opportunityData.products,
  qbCustomerId,
  billingEmail,
  currency  // Pass currency as 6th parameter
);
```

---

## 🧪 Testing Strategy

### Test Case 1: EUR Currency (Current Issue)

**Setup**:
- Opportunity with Amount=500, CurrencyIsoCode=EUR
- Account with valid BillEmail

**Expected Result**:
- Customer created with `CurrencyRef: { value: "EUR" }`
- Invoice created with `CurrencyRef: { value: "EUR" }`
- Payment link shows €500 EUR ✅

### Test Case 2: USD Currency

**Setup**:
- Opportunity with Amount=1000, CurrencyIsoCode=USD

**Expected Result**:
- Customer created with `CurrencyRef: { value: "USD" }`
- Invoice created with `CurrencyRef: { value: "USD" }`
- Payment link shows $1000 USD ✅

### Test Case 3: Missing Currency (Fallback)

**Setup**:
- Opportunity with no CurrencyIsoCode set

**Expected Result**:
- Defaults to USD
- Customer and invoice both use USD
- Payment link shows USD ✅

### Verification Steps

After deployment:
1. Check middleware logs for "Customer currency: EUR" message
2. Check middleware logs for "Invoice will be created in EUR" message
3. Query QB invoice to verify `CurrencyRef.value = "EUR"`
4. Test payment link to verify it shows correct currency symbol (€ for EUR, $ for USD)

---

## 🚀 Deployment Plan

### Step 1: Backup Current Files

```bash
ssh -p 2323 roman@pve.atocomm.eu
cd /opt/qb-integration
cp src/services/salesforce-api.js src/services/salesforce-api.js.backup
cp src/routes/api.js src/routes/api.js.backup
cp src/transforms/opportunity-to-invoice.js src/transforms/opportunity-to-invoice.js.backup
```

### Step 2: Copy Updated Files

```bash
# From local machine:
scp -P 2323 deployment/sf-qb-integration-final/src/services/salesforce-api.js roman@pve.atocomm.eu:/opt/qb-integration/src/services/
scp -P 2323 deployment/sf-qb-integration-final/src/routes/api.js roman@pve.atocomm.eu:/opt/qb-integration/src/routes/
scp -P 2323 deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js roman@pve.atocomm.eu:/opt/qb-integration/src/transforms/
```

### Step 3: Restart Middleware

```bash
# On server:
cd /opt/qb-integration
pkill -f 'node src/server.js'
node src/server.js > /tmp/server.log 2>&1 &
```

### Step 4: Verify Health

```bash
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
```

### Step 5: Test with New Opportunity

Create new Opportunity in Salesforce:
- Amount: 500
- Currency: EUR
- Add product, change stage to "Proposal and Agreement"
- Wait 1 minute
- Verify invoice and payment link both show EUR

---

## ⚠️ Risks & Mitigation

### Risk 1: Existing Customers Already in USD

**Impact**: Customers already created without CurrencyRef
**Mitigation**:
- New invoices for existing customers will have CurrencyRef on invoice
- QB may reject if customer currency ≠ invoice currency
- May need to update existing customers or create new ones

### Risk 2: QuickBooks Multi-Currency Not Enabled

**Impact**: QB might reject CurrencyRef if multi-currency not enabled
**Mitigation**:
- Roman needs to verify QB has multi-currency enabled
- If not enabled, all currencies default to home currency anyway

### Risk 3: Unsupported Currency Codes

**Impact**: If Salesforce uses currency QB doesn't support
**Mitigation**:
- Add validation/mapping for supported currencies
- Log warnings for unsupported currencies
- Fall back to USD

---

## 💬 Message for Roman (Russian)

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

## ⏱️ Time Estimate

- Code changes: 30 minutes
- Testing: 15 minutes
- Deployment: 15 minutes
- Verification: 15 minutes

**Total**: ~1-1.5 hours

---

## ✅ Success Criteria

- ✅ Customer created with correct CurrencyRef
- ✅ Invoice created with correct CurrencyRef
- ✅ Payment link shows correct currency symbol and code
- ✅ Middleware logs confirm currency being used
- ✅ No regression in existing functionality

---

*Investigation completed: December 8, 2025*
*Status: Ready for implementation*
