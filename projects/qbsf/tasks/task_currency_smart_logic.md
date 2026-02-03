# Task: Smart Currency Logic (Auto Currency Handling)

Status
- Scout complete; next role: Planner.

Scope
- Add "smart" currency handling when QuickBooks customer currency differs from Salesforce Opportunity currency.
- This is extra scope beyond Option A (new feature, new price).

Required Reading (Planner)
- `PROGRESS.md`
- `docs/RELEASE_2025-12-29_DELIVERED_SOLUTION.md:1-40`
- `docs/OPTION_A_DELIVERY_MANIFEST.md:121-152`
- `docs/SESSION_2025-12-29_MULTI_CURRENCY_FIX_HANDOFF.md:1-27`
- `CURRENCY_MISMATCH_INVESTIGATION.md:1-59`

Key Findings (file:line evidence)
1) Opportunity currency is read and passed into customer creation + invoice mapping.
   - `deployment/sf-qb-integration-final/src/routes/api.js:101-142`
   - `deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js:13-61`
2) `findOrCreateCustomer` only returns an ID; existing customer currency is not surfaced.
   - `deployment/sf-qb-integration-final/src/services/quickbooks-api.js:359-459`
3) Invoice amounts are sent as-is (no conversion); QuickBooks createInvoice uses line items verbatim.
   - `deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js:18-58`
   - `deployment/sf-qb-integration-final/src/services/quickbooks-api.js:289-331`
4) Update-invoice path uses Opportunity currency but does not reconcile with existing QB customer/invoice currency.
   - `deployment/sf-qb-integration-final/src/routes/api.js:392-429`
5) Salesforce queueable maps middleware error codes to Opportunity fields; new codes must flow through response JSON.
   - `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls:94-178`
   - `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls:240-248`
6) QuickBooks API test scaffolding exists for `findOrCreateCustomer`.
   - `deployment/sf-qb-integration-final/tests/quickbooks-customer-email-update.test.js:1-92`
7) Route test fixtures already include `CurrencyIsoCode` and can be extended for conversion scenarios.
   - `deployment/sf-qb-integration-final/tests/billing-email-trim.test.js:8-57`

Planner Deliverable
- Produce a sed-friendly plan under `plans/` with exact edits and validation commands.
- Confirm the QBO exchange-rate endpoint + rounding rules before coding.

Open Questions / Gaps
- QBO exchange-rate endpoint is not documented in this repo; planner must confirm the API path and response.
- Decide behavior for existing QBO customers with fixed currency (convert amounts vs. error).
- Decide whether update-invoice should convert line items to the customer/invoice currency.

Estimated Effort (Requester)
- Modify findOrCreateCustomer to return CurrencyRef: 30 min
- Add FX rate lookup from QB API: 1-2 hours
- Currency comparison logic: 30 min
- Conversion calculation: 1 hour
- Modified invoice creation with converted amounts: 1-2 hours
- New status codes (CURRENCY_MISMATCH_CONVERTED, FX_RATE_MISSING): 1 hour
- Testing: 2-3 hours
- Deployment + verification: 1-2 hours
Total: ~8-12 hours
