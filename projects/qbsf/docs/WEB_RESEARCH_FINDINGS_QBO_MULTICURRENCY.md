# Web Research Findings: QBO Multi‑Currency + CurrencyRef + ExchangeRate + InvoiceLink

Date: 2026-01-08  
Scope: Confirm key QuickBooks Online API behaviors that the QBSF middleware relies on.

## Sources (Intuit Developer)

1. Customer entity: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/customer  
2. Invoice entity: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice  
3. Exchangerate entity: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/exchangerate  
4. Tutorial “Manage multiple currencies”: https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-multiple-currencies

## Confirmed behaviors (with doc quotes)

### 1) Multi‑currency is OFF by default; must be enabled (UI-only); cannot be disabled; not available on Simple Start

From “Manage multiple currencies”:
- “By default, multicurrency is disabled in a QuickBooks company. It must be enabled in order to track transactions with currencies other than the company’s home currency.”
- “Multicurrency affects many accounts and balances in the company file, and therefore, cannot be disabled once it’s been enabled.”
- “Multicurrency is enabled from the QuickBooks Online UI, only. It cannot be enabled via the API.”
- “Multicurrency is not available with QuickBooks Simple Start.”

**Client impact**:
- If the client cannot enable Multi‑Currency (plan limitation), any flow that requires `CurrencyRef` for non-home currency will fail; the only safe alternative is “USD-only/home-currency-only” behavior.

### 2) Customer currency is set via `Customer.CurrencyRef` and cannot be changed

From Customer entity (`CurrencyRef`):
- “Reference to the currency in which all amounts associated with this customer are expressed. Once set, it cannot be changed.”
- “If specified currency is not currently in the company's currency list, it is added. If not specified, currency for this customer is the home currency of the company, as defined by Preferences.CurrencyPrefs.HomeCurrency.”

From “Manage multiple currencies” → “Customer currency configuration”:
- “Define the currency in which customers pay you. Once configured, it cannot be changed.”
- “Define the currency with the Rest API Customer create request, using the CurrencyRef attribute.”

**Client impact**:
- If customers were historically created in the wrong currency (e.g., USD), they usually must be recreated (or otherwise handled in QB UI constraints) to invoice them in the desired currency without conversion logic.

### 3) Invoice currency (`Invoice.CurrencyRef`) is required when multi‑currency is enabled

From Invoice entity (`CurrencyRef`):
- “Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company.”
- “Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true.”

**Client impact**:
- In a multi‑currency-enabled QBO company, invoice creation should explicitly set `CurrencyRef` to avoid ambiguous/default behavior.

### 4) Exchange rates are anchored to the company home currency; ExchangeRate endpoint returns home-per-foreign

From “Manage multiple currencies”:
- “Exchange rates are always recorded as the number of home currency units it takes to equal one foreign currency unit.”

From “Manage multiple currencies” → “Retrieving an exchange rate”:
- “Operation: GET /company/<realmId>/exchangerate?sourcecurrencycode=<code>[&asofdate=<yyyy-mm-dd>]”
- “Exchange rates are stored based on a combination of currency code and the rate’s effective date (the as-of date).”
- “For a given request, the company’s active currency list is queried followed by the global currency list. If neither list has the requested entry, an empty response is returned.”

From Exchangerate entity (“Get an exchangerate for an individual currency code”):
- “GET /v3/company/<realmID>/exchangerate?sourcecurrencycode=<currencycode>[&asofdate=<yyyy-mm-dd>]”

**Client impact**:
- Missing/empty exchange rate data for a currency+date pair must be addressed in the QBO Currency Center (or via API override) or invoice creation with conversion will fail (our middleware surfaces `FX_RATE_MISSING`).
- Cross-currency conversions (foreign↔foreign, home↔foreign) must pivot through home currency rates.

### 5) Payment link (`InvoiceLink`) is returned only when online payments are enabled and customer email is valid

From Invoice entity (`InvoiceLink`):
- “Sharable link for the invoice sent to external customers. The link is generated only for invoices with online payment enabled and having a valid customer email address.”
- “Include query param `include=invoiceLink` to get the link back on query response.”

**Client impact**:
- If the customer has no email (BillEmail), or online payment is not enabled / QB Payments not configured, invoices can still be created but `InvoiceLink` will be absent (our integration surfaces this as a Warning, not a hard failure).

## What this means for the QBSF client checklist (practical)

1. Confirm QBO plan supports Multi‑Currency (not Simple Start).
2. Enable Multi‑Currency in QBO UI (one-way switch).
3. Confirm home currency is correct (cannot be changed after set).
4. Ensure each customer is created in the correct currency (cannot be changed afterward).
5. Ensure exchange rates exist for currencies used on the relevant dates (Currency Center).
6. For payment links: ensure invoices have a valid customer email and online payment/QB Payments is configured.

