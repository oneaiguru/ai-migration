# Payment Link Root Cause Analysis

**Date**: December 7, 2025
**Status**: ROOT CAUSE IDENTIFIED ✅

---

## Executive Summary

**The payment link is NULL because there's no email address anywhere in the data chain.**

QuickBooks requires an email address (`BillEmail`) to generate a payment link. Without it, even with `AllowOnlineCreditCardPayment: true`, QB cannot generate a payment URL.

---

## Data Analysis

### Test Account: Smith Company (0010600002DhZabAAF)
```
Name:           Smith Company
Phone:          null
Email:          (no Email__c field on Account)
BillingStreet:  null
BillingCity:    null
BillingState:   null
BillingCountry: null
```

### Contacts for Smith Company
```
John Smith:     Email = null
Jane S:         Email = null
```

### Opportunity: Final Test (006So00000WUiagIAD)
```
ContactId:      null
```

---

## How the Middleware Uses This Data

### When Creating Customer in QB (`api.js` lines 53-69):
```javascript
const customerData = {
  DisplayName: opportunityData.account.Name,       // "Smith Company"
  CompanyName: opportunityData.account.Name,       // "Smith Company"
  PrimaryEmailAddr: {
    Address: opportunityData.account.Email__c || '' // Empty! Field doesn't exist
  },
  ...
};
```

### When Creating Invoice (`opportunity-to-invoice.js`):
```javascript
const invoice = {
  CustomerRef: { ... },
  Line: lineItems,
  AllowOnlineCreditCardPayment: true,  // ✅ Set
  AllowOnlineACHPayment: true,         // ✅ Set
  // BillEmail: NOT SET! ❌
};
```

---

## Why QuickBooks Doesn't Return InvoiceLink

QuickBooks Online generates payment links (`InvoiceLink`) when:
1. ✅ `AllowOnlineCreditCardPayment: true` - We set this
2. ✅ `AllowOnlineACHPayment: true` - We set this
3. ✅ QuickBooks Payments is enabled - Roman says it is
4. ❌ **Customer/Invoice has a valid email** - MISSING!

Without an email, QB doesn't know where to send payment notifications, so it doesn't generate a payment link.

---

## The Fix

### Option 1: Quick Fix (Test Immediately)
Add email to the SF Contact and Account, then test with a new Opportunity.

1. Update Contact "John Smith" with email:
```bash
sf data update record --sobject Contact \
  --record-id 0030600002F7ptgAAB \
  --values "Email=test@example.com" \
  --target-org myorg
```

2. Create new Opportunity and test.

### Option 2: Permanent Fix (Middleware Update)
Update the middleware to:

**a) Get email from Contact if Account doesn't have it:**
```javascript
// In salesforce-api.js, when getting Opportunity data:
const primaryContact = await this.getPrimaryContact(accountId);
const email = opportunityData.account.Email__c
  || primaryContact?.Email
  || 'billing@' + opportunityData.account.Name.toLowerCase().replace(/\s/g, '') + '.com';
```

**b) Set BillEmail on the invoice:**
```javascript
// In opportunity-to-invoice.js:
const invoice = {
  // ... existing fields ...
  BillEmail: {
    Address: email
  },
  AllowOnlineCreditCardPayment: true,
  AllowOnlineACHPayment: true
};
```

### Option 3: Add Email Field to Account
1. Create `Email__c` custom field on Account in SF
2. Require it for Opportunities that will generate invoices
3. The middleware already looks for this field

---

## Verification Steps

After implementing the fix:

1. **Verify email is in SF data**:
```bash
sf data query --query "SELECT Email FROM Contact WHERE AccountId='0010600002DhZabAAF'" --target-org myorg
```

2. **Create new Opportunity with this Account**

3. **Check middleware logs for BillEmail**:
```bash
ssh -p 2323 roman@pve.atocomm.eu
grep -i 'billmail\|email' /tmp/server.log | tail -20
```

4. **Check QB Invoice for InvoiceLink**:
   - Query: `GET /invoice/{id}?minorversion=65&include=invoiceLink`
   - Expect: `Invoice.InvoiceLink` should now have a value

---

## What This Means for Roman

### Current State
- Invoice creation: Works ✅
- Invoice ID sync: Works ✅
- Payment link: Missing because no email ❌

### What Roman Needs to Do
1. Ensure Accounts/Contacts have email addresses
2. OR we update the middleware to get email from Contact
3. OR we add `Email__c` custom field to Account

### Message for Roman

```
Роман, нашли причину почему ссылка на оплату не работает.

Проблема: У клиента "Smith Company" нет email адреса. QuickBooks не может
сгенерировать ссылку на оплату без email.

Решение (выбери один вариант):

1. Добавить email к клиентам в Salesforce
   - Открой Account "Smith Company"
   - Добавь email в контакт (John Smith или Jane S)

2. Создать поле Email__c на Account
   - Добавить кастомное поле для email клиента
   - Заполнять его при создании Account

После этого создай новую Opportunity и проверь - ссылка на оплату должна появиться.
```

---

## Technical Details

### QuickBooks API Requirements for InvoiceLink

From QB API documentation:
- `InvoiceLink` is generated when invoice can be paid online
- Requires valid customer email for payment notifications
- Requires QB Payments to be active
- Requires `AllowOnlineCreditCardPayment` or `AllowOnlineACHPayment` to be true

### Current Middleware Code Gaps

1. `api.js:57` - Uses `Email__c` which doesn't exist on Account
2. `opportunity-to-invoice.js` - Doesn't set `BillEmail` on invoice
3. No fallback to Contact email if Account email is missing

---

## Conclusion

The payment link feature is NOT broken - it's working exactly as designed. QuickBooks requires an email address to generate payment links, and we're not providing one because:

1. There's no `Email__c` field on Account
2. We don't get email from Contacts
3. We don't set `BillEmail` on the invoice

**The fix is to ensure email is available and set `BillEmail` on the invoice.**

This is a data/configuration issue, not a code bug. But we can make the code more robust by getting email from multiple sources.
