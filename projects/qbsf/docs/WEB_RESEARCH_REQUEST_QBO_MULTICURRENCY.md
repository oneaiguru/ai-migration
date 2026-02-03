# Web Research Request: QuickBooks Online Multi‑Currency + QBSF Integration Assumptions

Date: 2026-01-08  
Repo context: `/Users/m/ai/projects/qbsf`

## 1) Goal

Validate (via web research) that our integration assumptions about QuickBooks Online (QBO) API behavior are correct, especially around:
- Multi‑currency prerequisites and limitations
- `CurrencyRef` rules on Customer + Invoice
- Exchange rate retrieval (`ExchangeRate` endpoint) and “as of date” best practice
- Item currency behavior (`Item.CurrencyRef`) and invoice line constraints
- Payment link generation (`InvoiceLink` via `include=invoiceLink`)

**Deliverable requested from the research agent**: a short, structured report that, for each assumption below, includes:
- authoritative sources (prefer Intuit docs; fall back to reputable community posts when necessary),
- exact error messages/codes where available,
- conclusion (supports / contradicts / unclear),
- practical guidance we can send to a client admin.

## 2) System overview (what our integration does)

### High-level flow
1. Salesforce stage change triggers Apex Queueable: `projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`
2. Queueable POSTs to middleware: `POST /api/opportunity-to-invoice`
3. Middleware loads the Opportunity + related data from Salesforce
4. Middleware finds/creates the Customer in QBO (with `CurrencyRef`)
5. Middleware decides invoice currency:
   - If customer exists: use the customer’s currency from QBO; if mismatch vs Opportunity currency → convert amounts using QBO exchange rates and emit a warning
   - If customer is new: create in Opportunity currency and invoice in the same currency
6. Middleware maps Opportunity → Invoice (sets `Invoice.CurrencyRef`)
7. If SF product lacks `QB_Item_ID__c`, invoice line uses `ItemRef.value = "DYNAMIC"` and QBO wrapper replaces it with a real QBO Item (currency-aware selection)
8. Middleware creates invoice, then fetches `InvoiceLink` (payment link)
9. Middleware updates Salesforce fields + returns `qbInvoiceId`, payment link details, and optional warnings

### Where the “truth” lives in code
- Middleware route: `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`
- Invoice transform: `projects/qbsf/deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js`
- QBO API wrapper: `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
- Salesforce Queueable + warning persistence: `projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`

## 3) Code snippets (ground truth of intent)

### 3.1 Middleware: currency selection + FX conversion + warning emission
File: `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js` (key region: ~L139–L294)

```js
// Opportunity currency (defaults to USD)
const sourceCurrency = normalizeCurrencyCode(opportunityData.opportunity.CurrencyIsoCode) || 'USD';

// Customer creation payload includes CurrencyRef (requires QBO Multi-Currency)
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  CurrencyRef: { value: sourceCurrency },
  // ...
};

const customerResult = await qbApi.findOrCreateCustomer(customerData);
const customerResultIsObject = customerResult && typeof customerResult === 'object';
const qbCustomerId = customerResult?.id ?? customerResult;
const isExistingCustomer = customerResultIsObject ? customerResult.isExisting : true;
const customerCurrency = customerResultIsObject ? customerResult.currency : null;

// For existing customer: resolve currency from QBO; invoice must match
let targetCurrency = sourceCurrency;
if (isExistingCustomer) {
  const resolvedCurrency = await resolveExistingCustomerCurrency(qbApi, qbCustomerId, customerCurrency);
  if (!resolvedCurrency) {
    throw new AppError(
      `Existing customer ${qbCustomerId} currency is unavailable in QuickBooks`,
      422,
      'QB_CUSTOMER_CURRENCY_UNKNOWN'
    );
  }
  targetCurrency = resolvedCurrency;
}

// If currency mismatch: get FX rate from QBO and convert amounts
let fxRate = null;
let convertedProducts = opportunityData.products;
let warningCode = null;
let warningMessage = null;
if (sourceCurrency !== targetCurrency) {
  const asOfDate = new Date().toISOString().split('T')[0];
  fxRate = await qbApi.getExchangeRate(sourceCurrency, targetCurrency, asOfDate);
  const normalizedFxRate = normalizeFxRate(fxRate);
  if (!normalizedFxRate || normalizedFxRate <= 0) {
    throw new AppError(`No FX rate for ${sourceCurrency} -> ${targetCurrency} as of ${asOfDate}`, 422, 'FX_RATE_MISSING');
  }
  fxRate = normalizedFxRate;
  convertedProducts = convertProductsForCurrency(opportunityData.products, fxRate);
  warningCode = 'CURRENCY_MISMATCH_CONVERTED';
  warningMessage = `Converted ${sourceCurrency} to ${targetCurrency} at ${fxRate} as of ${asOfDate}`;
}

// Invoice is created in targetCurrency
const invoiceData = mapOpportunityToInvoice(
  opportunityData.opportunity,
  opportunityData.account,
  convertedProducts,
  qbCustomerId,
  billingEmail,
  targetCurrency
);

// Response includes warningCode/warningMessage when conversion happened
res.json({
  success: true,
  qbInvoiceId,
  paymentLink,
  paymentLinkStatus,
  paymentLinkMessage,
  ...(warningCode ? { warningCode, warningMessage } : {}),
  ...(fxRate ? { fxRate, sourceCurrency, targetCurrency } : {})
});
```

### 3.2 Invoice mapping: Invoice.CurrencyRef + DYNAMIC ItemRef + BillEmail for payment links
File: `projects/qbsf/deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js` (starts ~L70)

```js
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '', currency = 'USD') {
  const lineItems = products.map(product => ({
    DetailType: "SalesItemLineDetail",
    Amount: /* derived from UnitPrice/TotalPrice/Qty */,
    SalesItemLineDetail: {
      ItemRef: {
        value: product.Product2?.QB_Item_ID__c ? product.Product2.QB_Item_ID__c : "DYNAMIC",
        name: product.Product2 ? product.Product2.Name : "Service"
      },
      Qty: /* normalized qty */,
      UnitPrice: /* normalized unit price */
    }
  }));

  return {
    CustomerRef: { value: qbCustomerId, name: account.Name },
    CurrencyRef: { value: currency },
    Line: lineItems,
    AllowOnlineCreditCardPayment: true,
    AllowOnlineACHPayment: true,
    ...(billingEmail && { BillEmail: { Address: billingEmail } })
  };
}
```

### 3.3 QBO exchange rates: ExchangeRate endpoint shape
File: `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js` (~L695)

```js
async getExchangeRate(sourceCurrency, targetCurrency, asOfDate) {
  // Intuit docs: ExchangeRate is returned for a *source currency* and is anchored to company home currency:
  //   GET .../exchangerate?sourcecurrencycode=<code>[&asofdate=YYYY-MM-DD]
  // (QBO returns TargetCurrencyCode = home currency; Rate = home per 1 source).
  //
  // Our implementation computes cross rates by pivoting through home currency:
  //   source->target = (source->home) / (target->home)
}
```

### 3.4 QBO item selection: choose an active item that matches invoice currency (or base currency)
File: `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js` (~L308)

```js
async getFirstAvailableItem(currencyCode = null) {
  const normalizedCurrency = normalizeCurrencyCode(currencyCode);
  let baseCurrency = normalizedCurrency ? null : await this.getCompanyCurrency();

  // Query active service items and pick one by CurrencyRef match.
  const query = encodeURIComponent(
    "SELECT Id, Name, Type, CurrencyRef FROM Item WHERE Type = 'Service' AND Active = true"
  );
  const response = await this.request('get', `query?query=${query}`);
  const serviceItems = response.QueryResponse?.Item || [];

  // Selection rules:
  // - if invoice currency present: prefer exact CurrencyRef match; else base item (no CurrencyRef); else baseCurrency match
  // - if invoice currency missing: prefer base item; else baseCurrency match
  // (throws QB_ITEM_CURRENCY_UNAVAILABLE if nothing fits)
}
```

### 3.5 Salesforce: preserve warnings + preserve existing payment link when middleware omits it
File: `projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls` (~L94–L134)

```apex
String paymentLink = (String) responseMap.get('paymentLink');
String paymentStatus = (String) responseMap.get('paymentLinkStatus');
String paymentMessage = (String) responseMap.get('paymentLinkMessage');
String warningCode = (String) responseMap.get('warningCode');
String warningMessage = (String) responseMap.get('warningMessage');

String finalStatus = (String.isBlank(paymentStatus) || paymentStatus == 'SUCCESS') ? 'Success' : 'Warning';
if (String.isNotBlank(warningCode)) {
  finalStatus = 'Warning';
}

String combinedWarningMessage = null;
if (String.isNotBlank(warningMessage) && String.isNotBlank(paymentMessage)) {
  combinedWarningMessage = warningMessage + ' | ' + paymentMessage;
} else if (String.isNotBlank(warningMessage)) {
  combinedWarningMessage = warningMessage;
} else if (String.isNotBlank(paymentMessage)) {
  combinedWarningMessage = paymentMessage;
}

Opportunity finalUpdate = buildStatusUpdate(
  opp.Id,
  finalStatus,
  String.isNotBlank(warningCode) ? warningCode : null,
  combinedWarningMessage,
  correlationId
);
finalUpdate.QB_Invoice_ID__c = qbInvoiceId;
if (String.isNotBlank(paymentLink)) {
  finalUpdate.QB_Payment_Link__c = paymentLink; // If missing, existing link is preserved (not overwritten with null)
}
finalUpdate.QB_Payment_Link_Status__c = paymentStatus;
finalUpdate.QB_Error_Message__c = combinedWarningMessage;
```

## 4) Recent commits that matter (for context)

These commits changed `projects/qbsf` recently and encode the intent above:
- `c5940cb` (2025-12-29): restore `CurrencyRef` in customer creation (assumes Multi‑Currency enabled in QBO)
- `2a38937` → `15b5dc9` (2025-12-31 → 2026-01-05): currency-aware QBO Item selection + better fallback/errors for DYNAMIC ItemRef
- `3f4b324` (2026-01-05): handle legacy QB customer IDs (middleware accepts string IDs and object `{id,...}`)
- `7f3f451` (2026-01-05): preserve payment warning messages + preserve existing `QB_Payment_Link__c` when middleware omits link

## 5) Assumptions to verify (web research tasks)

### A1) Multi‑Currency prerequisites for `CurrencyRef`
**Question**: If Multi‑Currency is disabled in QBO, does sending `Customer.CurrencyRef` or `Invoice.CurrencyRef` cause a validation error?  
**Observed/expected error** (from our prior ops): “Multi Currency should be enabled to perform this operation” (often referenced with error code `6000`).

**Need from research**:
- confirm this is the correct behavior and message (Customer create + Invoice create),
- confirm whether specifying *home currency only* behaves differently vs foreign currency.

### A2) Customer currency vs invoice currency constraints
**Question**: When Multi‑Currency is enabled, must `Invoice.CurrencyRef` equal the customer’s `CurrencyRef`?  
**Observed/expected**: QBO rejects mismatches with an error like “You can only use one foreign currency per transaction.”

**Need from research**:
- confirm the rule and the exact constraint,
- identify what exactly triggers that message (customer currency mismatch? mixed line item currencies?).

### A3) ExchangeRate endpoint details + availability constraints
**Question**: Is the ExchangeRate endpoint stable and correct as used:
`/v3/company/<realmId>/exchangerate?sourcecurrencycode=...&asofdate=YYYY-MM-DD`

**Need from research**:
- confirm parameter names and casing,
- confirm response shape (where `Rate`, `SourceCurrencyCode`, `TargetCurrencyCode`, `AsOfDate` are located),
- confirm that QBO exchange rates are anchored to the company home currency (so cross-currency conversions must pivot through home),
- confirm prerequisites (Multi‑Currency enabled, currency activated in QBO, etc),
- confirm best practice for `asofdate` (invoice TxnDate vs “today”).

### A4) Does `Item` actually have `CurrencyRef` in QBO, and what does it mean?
Our code queries: `SELECT Id, Name, Type, CurrencyRef FROM Item ...` and uses `CurrencyRef` to choose a compatible Item.

**Need from research**:
- confirm the `Item.CurrencyRef` field exists in QBO (and under what conditions it’s populated),
- confirm whether QBO enforces item currency compatibility with invoice/customer currency,
- collect exact error messages for item-currency mismatch cases (if any).

### A5) Customer currency mutability (operational guidance)
**Question**: Can a QBO Customer’s currency be changed after transactions exist? If not, what’s the recommended remediation?

**Need from research**:
- confirm mutability rules,
- recommended procedure for “existing customers created in USD but now need EUR” scenarios (delete/recreate vs new customer vs other).

### A6) Payment link / `InvoiceLink` requirements
Our integration fetches invoice payment link via:
`GET invoice/{id}?minorversion=65&include=invoiceLink`

**Need from research**:
- confirm how `include=invoiceLink` works (supported minorversion, response shape),
- confirm prerequisites for `Invoice.InvoiceLink` to appear (QB Payments enabled? invoice has BillEmail? online payment flags?),
- confirm behavior for foreign currency invoices (does payment link reflect the invoice currency?).

## 6) Search query pack (copy/paste)

Use multiple variants; prefer Intuit docs and official support articles.

### Multi‑currency / CurrencyRef validation errors
- `QuickBooks API "Multi Currency should be enabled to perform this operation" CurrencyRef 6000`
- `QBO API customer CurrencyRef multi currency should be enabled`
- `QuickBooks Online API invoice CurrencyRef multi currency disabled error`

### Invoice vs customer currency mismatch
- `"You can only use one foreign currency per transaction" QuickBooks invoice customer currency`
- `QBO invoice currency must match customer currency`
- `QuickBooks Online foreign currency transaction validation error`

### ExchangeRate endpoint
- `QuickBooks Online API exchangerate sourcecurrencycode targetcurrencycode asofdate`
- `Intuit developer ExchangeRate endpoint Rate field response`
- `QBO ExchangeRate API minorversion include`

### Item.CurrencyRef and item currency rules
- `QuickBooks Online Item CurrencyRef field`
- `QBO Item CurrencyRef multi-currency`
- `QuickBooks item different currency invoice error ItemRef`

### InvoiceLink / payment link
- `QuickBooks Online API include=invoiceLink InvoiceLink`
- `QBO InvoiceLink requires BillEmail`
- `QuickBooks Payments InvoiceLink foreign currency`

## 7) Output format requested from the researcher

1. **Assumption-by-assumption table**: A1–A6 → “supported/contradicted/unclear”, plus links and key quotes.
2. **Scenario matrix** (optional but ideal):
   - Multi‑currency OFF / ON × customer currency × invoice currency × BillEmail × QB Payments ON/OFF → expected API outcomes.
3. **Client instruction draft**: short checklist we can send to a client admin to configure QBO correctly (multi‑currency, currencies activated, items available per currency, exchange rates availability, QB Payments + BillEmail).
