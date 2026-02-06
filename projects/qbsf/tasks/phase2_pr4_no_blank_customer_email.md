# PR 2.4 — Never Send Blank Customer Email

## Status
- [ ] Ready for implementation

## Scope (Single Change)
- Only include `PrimaryEmailAddr` in QuickBooks customer data when billingEmail is non-blank.

## Files to Modify
- `deployment/sf-qb-integration-final/src/routes/api.js`
  - Customer payload around lines ~61-69

## Exact Code Change

```javascript
// BEFORE (routes/api.js ~61-69)
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  CurrencyRef: { value: currency },
  PrimaryEmailAddr: {
    Address: billingEmail
  },
  PrimaryPhone: { FreeFormNumber: opportunityData.account.Phone || '' },
  BillAddr: { ... }
};

// AFTER
const normalizedBillingEmail = billingEmail && billingEmail.trim();
const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  CurrencyRef: { value: currency },
  ...(normalizedBillingEmail && {
    PrimaryEmailAddr: { Address: normalizedBillingEmail }
  }),
  PrimaryPhone: { FreeFormNumber: opportunityData.account.Phone || '' },
  BillAddr: { ... }
};
```

## Test Cases

| Test | Input | Expected |
| --- | --- | --- |
| Blank email | billingEmail = '' | customerData has no PrimaryEmailAddr |
| Email present | billingEmail = "user@x.com" | customerData.PrimaryEmailAddr.Address set |

## Test Requirements (Option C)

### Test File
- Path: `deployment/sf-qb-integration-final/tests/customer-email-blank.test.js`

### Test Approach
The change is in `routes/api.js`, so use the existing router.handle style:
1. `jest.mock('../src/services/salesforce-api')` and `jest.mock('../src/services/quickbooks-api')`.
2. Set `process.env.API_KEY = 'test-key'` and include `x-api-key: test-key` in headers.
3. `SalesforceAPI.mockImplementation` returns `getOpportunityWithRelatedData` and
   `updateOpportunityWithQBInvoiceId`.
4. `QuickBooksAPI.mockImplementation` returns `findOrCreateCustomer`, `createInvoice`,
   and `getInvoicePaymentLink`.
5. Call `apiRoutes.handle(req, res, next)` with POST `/opportunity-to-invoice`.
6. Assert `customerData` omits `PrimaryEmailAddr` when billingEmail is blank/whitespace.

### Test Cases
| Test | billingEmail | Expected customerData |
|------|--------------|----------------------|
| Blank email | `""` | No `PrimaryEmailAddr` property |
| Whitespace only | `"   "` | No `PrimaryEmailAddr` property |
| Valid email | `"user@x.com"` | `PrimaryEmailAddr: {Address: "user@x.com"}` |

### Command
```bash
cd deployment/sf-qb-integration-final && npm test
```

## Acceptance Criteria
- No blank emails sent to QuickBooks.
- No other payload changes.

## NOT in This PR
- Email priority chain (PR 2.1).
- OCR fallback or ORDER BY (PR 2.2–2.3).
- Payment link status changes (PR 2.5–2.7).

## Dependencies
- None.
