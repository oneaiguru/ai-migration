# ⚡ Currency Fix - Quick Reference Guide

**Time to read**: 2 minutes
**Status**: Ready to implement
**Complexity**: LOW - 4 small, localized changes

---

## 🎯 The Issue in 30 Seconds

Roman created a 500 EUR opportunity in Salesforce.
Invoice was created in QB as €500.
But payment link shows $500 USD.

**Why?** Middleware doesn't send currency to QB, so QB defaults to home currency (USD).

---

## 🔧 The Fix in 30 Seconds

Send currency information to QB at 2 points:
1. When creating customer
2. When creating invoice

QB will then create invoice in correct currency (EUR) and payment link will show €500.

---

## 📝 4 Files to Modify

### File 1: `src/services/salesforce-api.js`
**What**: Query OpportunityLineItem
**Where**: Line ~240-245
**Change**: Add `CurrencyIsoCode` to SELECT clause
**Complexity**: 1 line added

```javascript
// Add CurrencyIsoCode to this query:
const lineItemsQuery = `
  SELECT Id, Product2Id, Quantity, UnitPrice, TotalPrice,
         Product2.Id, Product2.Name, Product2.Description, Product2.QB_Item_ID__c,
         CurrencyIsoCode  ← ADD THIS
  FROM OpportunityLineItem
  WHERE OpportunityId = '${opportunityId}'
`;
```

---

### File 2: `src/routes/api.js`
**What**: Extract currency and add to customer
**Where**: Line ~57-73 (customer creation)
**Change**: Extract currency, add CurrencyRef to customer
**Complexity**: 5 lines added

```javascript
// Add BEFORE customerData creation:
const currency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
logger.info(`Customer currency for ${opportunityData.account.Name}: ${currency}`);

// Add IN customerData object:
CurrencyRef: {
  value: currency
}
```

---

### File 3: `src/transforms/opportunity-to-invoice.js`
**What**: Add currency parameter, set CurrencyRef on invoice
**Where**: Line ~12 (function) and ~32-54 (invoice object)
**Change**: Add currency parameter, add CurrencyRef to invoice
**Complexity**: 3 lines added

```javascript
// Change function signature from:
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '') {
// To:
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '', currency = 'USD') {

// Add IN invoice object:
CurrencyRef: {
  value: currency
},

// Add log:
logger.info(`Invoice will be created in ${currency} for Opportunity ${opportunity.Id}`);
```

---

### File 4: `src/routes/api.js`
**What**: Pass currency to invoice transform
**Where**: Line ~79-85 (mapOpportunityToInvoice call)
**Change**: Add currency as 6th parameter
**Complexity**: 1 line added

```javascript
// Change from:
const invoiceData = mapOpportunityToInvoice(
  opportunityData.opportunity,
  opportunityData.account,
  opportunityData.products,
  qbCustomerId,
  billingEmail
);

// To:
const invoiceData = mapOpportunityToInvoice(
  opportunityData.opportunity,
  opportunityData.account,
  opportunityData.products,
  qbCustomerId,
  billingEmail,
  currency  ← ADD THIS
);
```

---

## ✅ Verification

After deployment, test with:

1. **Create EUR Opportunity**
   - Amount: 500
   - CurrencyIsoCode: EUR
   - Add product, change stage to "Proposal and Agreement"

2. **Check Salesforce**
   - QB_Invoice_ID__c: Should have invoice number (e.g., 2432)
   - QB_Payment_Link__c: Should have payment URL

3. **Check QB Invoice**
   - Currency: Should be EUR (not USD)
   - Amount: 500 EUR (not $500)

4. **Check Logs**
   - Middleware should log: "Customer currency: EUR"
   - Middleware should log: "Invoice will be created in EUR"

---

## 🚀 Deployment Checklist

- [ ] Make 4 code changes
- [ ] Commit: `git commit -m "fix(qbsf): add currency handling for multi-currency invoices"`
- [ ] Push: `scripts/dev/push_with_codex.sh`
- [ ] Wait for Codex review and approval
- [ ] SSH to server and backup files
- [ ] Copy 3 files to server (salesforce-api.js, api.js, opportunity-to-invoice.js)
- [ ] Restart middleware: `pkill -f 'node src/server.js' && node src/server.js &`
- [ ] Verify health endpoint
- [ ] Test with EUR opportunity
- [ ] Verify both QB_Invoice_ID__c and QB_Payment_Link__c populated
- [ ] Verify QB invoice shows EUR currency
- [ ] Message Roman with results

---

## 🧪 Test Cases

| Case | Setup | Expected | Pass |
|------|-------|----------|------|
| EUR | Opp: 500 EUR | QB: €500 EUR, Link: €500 | ✅ |
| USD | Opp: 1000 USD | QB: $1000 USD, Link: $1000 | ✅ |
| Missing | No currency set | Defaults to USD | ✅ |

---

## ⏱️ Time Budget

- Code changes: 15 mins
- Local verification: 10 mins
- Git workflow: 10 mins
- Deployment: 15 mins
- Testing: 15 mins
- Communication: 5 mins
- **Total: ~70 minutes**

---

## 📞 Message for Roman (Russian)

```
Роман, исправили несовпадение валют!

БЫЛО: 500 EUR в Salesforce → $500 USD в QuickBooks ❌
СТАЛО: 500 EUR в Salesforce → €500 EUR в QuickBooks ✅

Изменения:
- Теперь передаем валюту в QuickBooks
- Счета создаются в правильной валюте
- Ссылки на оплату показывают правильную валюту

Проверь: Создай новую Opportunity с EUR
- QB_Invoice_ID__c: Должен быть номер
- QB_Payment_Link__c: Должна быть ссылка с € символом

Готово! 🎉
```

---

**Ready to implement?** All changes are small, safe, and follow existing patterns. No new dependencies, no breaking changes.

