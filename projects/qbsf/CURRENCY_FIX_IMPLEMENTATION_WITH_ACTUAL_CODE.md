# 💾 Currency Fix - Implementation with Actual Code

**Status**: All source files read, exact code locations identified
**Last Updated**: December 8, 2025
**Confidence Level**: 100% - Code already analyzed

---

## 🔍 Complete Analysis of Current Code

### File 1: `salesforce-api.js`

**Current State** (lines 240-245):
```javascript
// Get OpportunityLineItems (Products)
const lineItemsQuery = `
  SELECT Id, Product2Id, Quantity, UnitPrice, TotalPrice,
         Product2.Id, Product2.Name, Product2.Description, Product2.QB_Item_ID__c
  FROM OpportunityLineItem
  WHERE OpportunityId = '${opportunityId}'
`;
```

**Issue**: CurrencyIsoCode field is NOT in the SELECT clause

**Impact**: CurrencyIsoCode data is available on Opportunity (line 234) but NOT on OpportunityLineItem

---

### File 2: `api.js`

**Current State** (lines 47-85):
```javascript
// Get Opportunity data from Salesforce
logger.info(`Fetching Opportunity data from Salesforce: ${opportunityId}`);
const opportunityData = await sfApi.getOpportunityWithRelatedData(opportunityId);

// Get billing email: prefer Account email, fallback to Contact email
const billingEmail = opportunityData.account.Email__c || opportunityData.contactEmail || '';
logger.info(`Billing email for customer: ${billingEmail || '(none)'}`);

// Create or find customer in QuickBooks
logger.info(`Creating/finding customer in QuickBooks: ${opportunityData.account.Name}`);
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  PrimaryEmailAddr: {
    Address: billingEmail
  },
  PrimaryPhone: {
    FreeFormNumber: opportunityData.account.Phone || ''
  },
  BillAddr: {
    Line1: opportunityData.account.BillingStreet || '',
    City: opportunityData.account.BillingCity || '',
    CountrySubDivisionCode: opportunityData.account.BillingState || '',
    PostalCode: opportunityData.account.BillingPostalCode || '',
    Country: opportunityData.account.BillingCountry || ''
  }
};

const qbCustomerId = await qbApi.findOrCreateCustomer(customerData);

// Transform Opportunity to Invoice (include billing email for payment link)
logger.info('Transforming Opportunity data to QuickBooks Invoice format');
const invoiceData = mapOpportunityToInvoice(
  opportunityData.opportunity,
  opportunityData.account,
  opportunityData.products,
  qbCustomerId,
  billingEmail  // Pass billing email for BillEmail field
);
```

**Issue**:
- Currency is NOT extracted from opportunityData.opportunity
- Currency is NOT passed to QB customer
- Currency is NOT passed to mapOpportunityToInvoice function

---

### File 3: `opportunity-to-invoice.js`

**Current State** (lines 1-54):
```javascript
/**
 * Maps Salesforce Opportunity data to QuickBooks Invoice structure
 * @param {Object} opportunity - The Salesforce Opportunity record
 * @param {Object} account - The related Salesforce Account record
 * @param {Array} products - The related Opportunity Products
 * @param {String} qbCustomerId - The QuickBooks Customer ID for this account
 * @param {String} billingEmail - Email address for BillEmail (required for payment links)
 * @returns {Object} - QuickBooks Invoice object ready for API submission
 */
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '') {
  logger.info(`Mapping Opportunity ${opportunity.Id} to QuickBooks Invoice`);

  try {
    // Create Invoice line items from Opportunity products
    const lineItems = products.map(product => ({
      DetailType: "SalesItemLineDetail",
      Amount: product.TotalPrice,
      SalesItemLineDetail: {
        ItemRef: {
          value: product.Product2 && product.Product2.QB_Item_ID__c ? product.Product2.QB_Item_ID__c : "DYNAMIC",
          name: product.Product2 ? product.Product2.Name : "Service"
        },
        Qty: product.Quantity,
        UnitPrice: product.UnitPrice
      },
      Description: product.Product2 && product.Product2.Description ? product.Product2.Description : (product.Product2 ? product.Product2.Name : "Product")
    }));

    // Create Invoice object structure according to QuickBooks API
    const invoice = {
      CustomerRef: {
        value: qbCustomerId,
        name: account.Name
      },
      Line: lineItems,
      TxnDate: new Date().toISOString().split('T')[0],
      DueDate: opportunity.CloseDate,
      DocNumber: opportunity.Opportunity_Number__c || opportunity.Id,
      PrivateNote: `Created from Salesforce Opportunity: ${opportunity.Name}`,
      CustomerMemo: {
        value: opportunity.Description || ''
      },
      AllowOnlineCreditCardPayment: true,
      AllowOnlineACHPayment: true,
      ...(billingEmail && {
        BillEmail: {
          Address: billingEmail
        }
      })
    };
```

**Issue**:
- Function signature does NOT have currency parameter
- Invoice object does NOT have CurrencyRef field

---

## ✅ Exact Changes Required

### Change 1: `salesforce-api.js` (Line 240-245)

**OLD CODE**:
```javascript
      // Get OpportunityLineItems (Products)
      const lineItemsQuery = `
        SELECT Id, Product2Id, Quantity, UnitPrice, TotalPrice,
               Product2.Id, Product2.Name, Product2.Description, Product2.QB_Item_ID__c
        FROM OpportunityLineItem
        WHERE OpportunityId = '${opportunityId}'
      `;
```

**NEW CODE**:
```javascript
      // Get OpportunityLineItems (Products)
      const lineItemsQuery = `
        SELECT Id, Product2Id, Quantity, UnitPrice, TotalPrice,
               Product2.Id, Product2.Name, Product2.Description, Product2.QB_Item_ID__c,
               CurrencyIsoCode
        FROM OpportunityLineItem
        WHERE OpportunityId = '${opportunityId}'
      `;
```

**Change Summary**: Add `CurrencyIsoCode` to SELECT clause (1 line added)

---

### Change 2: `api.js` (Line 47-85)

**OLD CODE**:
```javascript
    // Get Opportunity data from Salesforce
    logger.info(`Fetching Opportunity data from Salesforce: ${opportunityId}`);
    const opportunityData = await sfApi.getOpportunityWithRelatedData(opportunityId);

    // Get billing email: prefer Account email, fallback to Contact email
    const billingEmail = opportunityData.account.Email__c || opportunityData.contactEmail || '';
    logger.info(`Billing email for customer: ${billingEmail || '(none)'}`);

    // Create or find customer in QuickBooks
    logger.info(`Creating/finding customer in QuickBooks: ${opportunityData.account.Name}`);
    const customerData = {
      DisplayName: opportunityData.account.Name,
      CompanyName: opportunityData.account.Name,
      PrimaryEmailAddr: {
        Address: billingEmail
      },
      PrimaryPhone: {
        FreeFormNumber: opportunityData.account.Phone || ''
      },
      BillAddr: {
        Line1: opportunityData.account.BillingStreet || '',
        City: opportunityData.account.BillingCity || '',
        CountrySubDivisionCode: opportunityData.account.BillingState || '',
        PostalCode: opportunityData.account.BillingPostalCode || '',
        Country: opportunityData.account.BillingCountry || ''
      }
    };
```

**NEW CODE**:
```javascript
    // Get Opportunity data from Salesforce
    logger.info(`Fetching Opportunity data from Salesforce: ${opportunityId}`);
    const opportunityData = await sfApi.getOpportunityWithRelatedData(opportunityId);

    // Get billing email: prefer Account email, fallback to Contact email
    const billingEmail = opportunityData.account.Email__c || opportunityData.contactEmail || '';
    logger.info(`Billing email for customer: ${billingEmail || '(none)'}`);

    // Get currency from Opportunity (default to USD if not set)
    const currency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
    logger.info(`Customer currency for ${opportunityData.account.Name}: ${currency}`);

    // Create or find customer in QuickBooks
    logger.info(`Creating/finding customer in QuickBooks: ${opportunityData.account.Name}`);
    const customerData = {
      DisplayName: opportunityData.account.Name,
      CompanyName: opportunityData.account.Name,
      CurrencyRef: {
        value: currency
      },
      PrimaryEmailAddr: {
        Address: billingEmail
      },
      PrimaryPhone: {
        FreeFormNumber: opportunityData.account.Phone || ''
      },
      BillAddr: {
        Line1: opportunityData.account.BillingStreet || '',
        City: opportunityData.account.BillingCity || '',
        CountrySubDivisionCode: opportunityData.account.BillingState || '',
        PostalCode: opportunityData.account.BillingPostalCode || '',
        Country: opportunityData.account.BillingCountry || ''
      }
    };
```

**Changes**:
1. Add 3 lines before customerData creation (lines 54-56):
   - Extract currency from opportunity
   - Log the currency

2. Add CurrencyRef to customerData (lines 60-62):
   - CurrencyRef object with value

---

### Change 3: `api.js` (Line 79-85)

**OLD CODE**:
```javascript
    // Transform Opportunity to Invoice (include billing email for payment link)
    logger.info('Transforming Opportunity data to QuickBooks Invoice format');
    const invoiceData = mapOpportunityToInvoice(
      opportunityData.opportunity,
      opportunityData.account,
      opportunityData.products,
      qbCustomerId,
      billingEmail  // Pass billing email for BillEmail field
    );
```

**NEW CODE**:
```javascript
    // Transform Opportunity to Invoice (include billing email for payment link)
    logger.info('Transforming Opportunity data to QuickBooks Invoice format');
    const invoiceData = mapOpportunityToInvoice(
      opportunityData.opportunity,
      opportunityData.account,
      opportunityData.products,
      qbCustomerId,
      billingEmail,  // Pass billing email for BillEmail field
      currency       // Pass currency for CurrencyRef field
    );
```

**Change**: Add `currency` as 6th parameter to mapOpportunityToInvoice call (1 line modified)

---

### Change 4: `opportunity-to-invoice.js` (Line 12)

**OLD CODE**:
```javascript
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '') {
```

**NEW CODE**:
```javascript
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '', currency = 'USD') {
```

**Change**: Add `currency = 'USD'` as 6th parameter (1 line modified)

---

### Change 5: `opportunity-to-invoice.js` (Line 32-54)

**OLD CODE**:
```javascript
    // Create Invoice object structure according to QuickBooks API
    const invoice = {
      CustomerRef: {
        value: qbCustomerId,
        name: account.Name
      },
      Line: lineItems,
      TxnDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      DueDate: opportunity.CloseDate, // Use Opportunity close date as due date
      DocNumber: opportunity.Opportunity_Number__c || opportunity.Id, // Custom field or default to Id
      PrivateNote: `Created from Salesforce Opportunity: ${opportunity.Name}`,
      CustomerMemo: {
        value: opportunity.Description || ''
      },
      // Enable online payment to generate payment link
      AllowOnlineCreditCardPayment: true,
      AllowOnlineACHPayment: true,
      // BillEmail is REQUIRED for QuickBooks to generate payment links
      ...(billingEmail && {
        BillEmail: {
          Address: billingEmail
        }
      })
    };
```

**NEW CODE**:
```javascript
    // Create Invoice object structure according to QuickBooks API
    const invoice = {
      CustomerRef: {
        value: qbCustomerId,
        name: account.Name
      },
      CurrencyRef: {
        value: currency
      },
      Line: lineItems,
      TxnDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      DueDate: opportunity.CloseDate, // Use Opportunity close date as due date
      DocNumber: opportunity.Opportunity_Number__c || opportunity.Id, // Custom field or default to Id
      PrivateNote: `Created from Salesforce Opportunity: ${opportunity.Name}`,
      CustomerMemo: {
        value: opportunity.Description || ''
      },
      // Enable online payment to generate payment link
      AllowOnlineCreditCardPayment: true,
      AllowOnlineACHPayment: true,
      // BillEmail is REQUIRED for QuickBooks to generate payment links
      ...(billingEmail && {
        BillEmail: {
          Address: billingEmail
        }
      })
    };

    // Log currency for debugging
    logger.info(`Invoice will be created in ${currency} for Opportunity ${opportunity.Id}`);
```

**Changes**:
1. Add CurrencyRef object after CustomerRef (lines 36-38)
2. Add log statement after invoice object creation (lines 56-57)

---

## 📋 Summary of All Changes

| File | Location | Type | Lines | Change |
|------|----------|------|-------|--------|
| `salesforce-api.js` | Line 242 | Add | 1 | Add CurrencyIsoCode to SELECT |
| `api.js` | Lines 54-56 | Add | 3 | Extract and log currency |
| `api.js` | Lines 60-62 | Add | 3 | Add CurrencyRef to customer |
| `api.js` | Line 85 | Modify | 1 | Pass currency to transform |
| `opportunity-to-invoice.js` | Line 12 | Modify | 1 | Add currency parameter |
| `opportunity-to-invoice.js` | Lines 36-38 | Add | 3 | Add CurrencyRef to invoice |
| `opportunity-to-invoice.js` | Lines 56-57 | Add | 2 | Log currency |

**Total Impact**: ~14 lines across 3 files
**Complexity**: LOW - All changes are straightforward additions/modifications

---

## 🧪 Expected Behavior After Changes

### Data Flow with Currency

```
Salesforce Opportunity
├── Amount: 500
├── CurrencyIsoCode: EUR
└── Account with Contact email

     ↓ (salesforce-api.js queries)

Middleware receives:
├── opportunity.CurrencyIsoCode: EUR
├── account info
├── products
└── contactEmail

     ↓ (api.js extracts currency)

Extract: currency = 'EUR'

     ↓ (api.js creates customer)

QB Customer created with:
├── DisplayName: "Smith Company"
├── CurrencyRef: { value: "EUR" }
└── PrimaryEmailAddr: john.smith@example.com

     ↓ (opportunity-to-invoice.js maps)

QB Invoice created with:
├── CustomerRef: "123" (Smith Company)
├── CurrencyRef: { value: "EUR" }
├── Line items: [products]
├── BillEmail: john.smith@example.com
└── AllowOnlineCreditCardPayment: true

     ↓ (QB generates payment link)

Payment Link Generated: https://connect.intuit.com/...

QB Internal Processing:
├── Invoice Amount: 500 EUR (NOT $500 USD)
└── Payment Link: €500 EUR ✅

     ↓ (Middleware fetches link)

SF Update:
├── QB_Invoice_ID__c: 2432
└── QB_Payment_Link__c: https://connect.intuit.com/... (€500)
```

---

## ✅ Verification Checklist

After making all 5 changes:

- [ ] All 5 files modified correctly
- [ ] No syntax errors
- [ ] Currency parameter flows through all functions
- [ ] CurrencyRef added to both customer and invoice
- [ ] Logging in place for debugging
- [ ] Code committed to git
- [ ] Changes pushed with Codex wrapper
- [ ] Codex review passed
- [ ] Code deployed to production server
- [ ] Health check passes
- [ ] Test EUR opportunity created
- [ ] QB_Invoice_ID__c populated
- [ ] QB_Payment_Link__c populated
- [ ] QB invoice shows EUR currency
- [ ] Payment link shows € symbol
- [ ] Middleware logs show currency being used

---

## 🚀 Implementation Order

1. **First**: Modify `opportunity-to-invoice.js` (function signature + invoice object)
2. **Second**: Modify `api.js` (extract currency + add to customer + pass to function)
3. **Third**: Modify `salesforce-api.js` (add field to query)
4. **Fourth**: Test locally if possible
5. **Fifth**: Commit and push
6. **Sixth**: Deploy to server

---

## 📊 Code Quality

- ✅ No breaking changes - all changes are additive
- ✅ Backward compatible - currency defaults to USD
- ✅ Proper logging in place
- ✅ Follows existing code patterns
- ✅ JSDoc comments present
- ✅ No new dependencies required
- ✅ Error handling preserved

---

**Ready to implement?** All code locations, exact changes, and verification steps are documented above.

