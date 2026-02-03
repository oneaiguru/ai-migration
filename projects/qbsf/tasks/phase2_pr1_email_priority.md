# PR 2.1 — Trim Email Values in Middleware

## Status
- [x] Complete (2025-12-27)
- [x] Reviewed (2025-12-27)
- Tests: `cd deployment/sf-qb-integration-final && npm test`

## Review Notes (2025-12-27)
- Verified `billingEmail` uses `?.trim()` in both `/opportunity-to-invoice` and `/update-invoice` flows in `deployment/sf-qb-integration-final/src/routes/api.js`.
- Verified Jest coverage for trim priority and blank-email omission in `deployment/sf-qb-integration-final/tests/billing-email-trim.test.js` (no explicit update-invoice test, per optional guidance).

## Scope (Single Change)
- Trim whitespace for the existing billing email chain in middleware route logic.
- Do not change the priority order (already: Opportunity.Email_for_invoice__c → Account.Email__c → Contact email).

## Files to Modify
- `deployment/sf-qb-integration-final/src/routes/api.js`
  - Lines ~51-53 (create invoice)
  - Lines ~331-333 (update invoice)

## Exact Code Change

### Create Invoice Endpoint
```javascript
// BEFORE (routes/api.js ~51-53)
const billingEmail = opportunityData.opportunity.Email_for_invoice__c || opportunityData.account.Email__c || opportunityData.contactEmail || '';

// AFTER (trim only, same priority order)
const billingEmail =
  opportunityData.opportunity.Email_for_invoice__c?.trim() ||
  opportunityData.account.Email__c?.trim() ||
  opportunityData.contactEmail?.trim() ||
  '';
```

### Update Invoice Endpoint
```javascript
// BEFORE (routes/api.js ~331-333)
const billingEmail = opportunityData.opportunity.Email_for_invoice__c || opportunityData.account.Email__c || opportunityData.contactEmail || '';

// AFTER (trim only, same priority order)
const billingEmail =
  opportunityData.opportunity.Email_for_invoice__c?.trim() ||
  opportunityData.account.Email__c?.trim() ||
  opportunityData.contactEmail?.trim() ||
  '';
```

## Test Cases

| Test | Input | Expected |
| --- | --- | --- |
| Priority 1 | Email_for_invoice__c = "test@x.com" | billingEmail = "test@x.com" |
| Priority 2 | Email_for_invoice__c blank, Account.Email__c set | billingEmail = Account.Email__c |
| Priority 3 | Email_for_invoice__c blank, Account.Email__c blank, contactEmail set | billingEmail = contactEmail |
| Trim | Email_for_invoice__c = "  test@x.com  " | billingEmail = "test@x.com" |

## Test Requirements (Option C)

### Jest Setup (verify)
Jest is already configured in `deployment/sf-qb-integration-final/package.json` (`test` script).
If missing on your branch, add it and ensure `tests/` exists.

### Test File
- Path: `deployment/sf-qb-integration-final/tests/billing-email-trim.test.js`
- Update: includes `/update-invoice` coverage for trimmed/blank BillEmail payloads.

### Test Approach
The trim logic is in `routes/api.js`, so follow the existing router.handle test style
(see `deployment/sf-qb-integration-final/tests/billing-email-trim.test.js`):
1. `jest.mock('../src/services/salesforce-api')` and `jest.mock('../src/services/quickbooks-api')`.
2. Set `process.env.API_KEY = 'test-key'` and include `x-api-key: test-key` in the request headers.
3. `SalesforceAPI.mockImplementation` returns `getOpportunityWithRelatedData` and
   `updateOpportunityWithQBInvoiceId`.
4. `QuickBooksAPI.mockImplementation` returns `findOrCreateCustomer`, `createInvoice`,
   and `getInvoicePaymentLink`.
5. Call `apiRoutes.handle(req, res, next)` with a POST `/opportunity-to-invoice` request.
6. Assert `customerData.PrimaryEmailAddr.Address` is trimmed.

Optional (covers update endpoint): add a second test calling `/update-invoice` via
`apiRoutes.handle` and assert `qbApi.updateInvoice` receives trimmed `BillEmail.Address`.

### Test Cases
| Test | Input Email | Expected |
|------|-------------|----------|
| Leading/trailing spaces | `"  test@x.com  "` | `"test@x.com"` |
| Already trimmed | `"test@x.com"` | `"test@x.com"` |

### Command
```bash
cd deployment/sf-qb-integration-final && npm test
```
## Acceptance Criteria
- All sources are trimmed.
- Existing priority order is preserved (no functional change beyond trimming).
- No other behavior changes.

## NOT in This PR
- OCR fallback logic (PR 2.2).
- ORDER BY for Contact query (PR 2.3).
- Avoid sending blank PrimaryEmailAddr (PR 2.4).
- Payment link status chain (PR 2.5–2.7).

## Dependencies
- None.
