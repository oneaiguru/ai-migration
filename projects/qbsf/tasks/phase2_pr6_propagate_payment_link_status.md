# PR 2.6 — Propagate Payment Link Status to Salesforce

## Status
- [ ] Ready for implementation

## Scope (Single Change)
- Use the new payment link details method, return `paymentLinkStatus` and `paymentLinkMessage` to Salesforce, and update `QB_Payment_Link_Status__c` + `QB_Error_Message__c` on the Opportunity.

## Files to Modify
- `deployment/sf-qb-integration-final/src/routes/api.js`
  - Payment link block around lines ~119-131
- `deployment/sf-qb-integration-final/src/services/salesforce-api.js`
  - Use existing `updateRecord()` helper (defined near the top of the file); no new method required

## Exact Code Change

```javascript
// routes/api.js (payment link block)
const linkResult = await qbApi.getInvoicePaymentLinkDetails(qbInvoiceId);
const paymentLink = linkResult.link || null;

await sfApi.updateRecord('Opportunity', opportunityId, {
  QB_Invoice_ID__c: qbInvoiceId,
  QB_Payment_Link__c: paymentLink,
  QB_Payment_Link_Status__c: linkResult.reason,
  QB_Error_Message__c: paymentLink ? null : linkResult.message
});

res.json({
  success: true,
  qbInvoiceId,
  paymentLink,
  paymentLinkStatus: linkResult.reason,
  paymentLinkMessage: linkResult.message || null,
  message: 'Invoice created successfully in QuickBooks'
});
```

Note: `updateRecord()` already exists in `salesforce-api.js`; use it instead of adding a new method unless you need a dedicated helper.

## Test Cases

| Test | Input | Expected |
| --- | --- | --- |
| SUCCESS | getInvoicePaymentLinkDetails returns link + SUCCESS | QB_Payment_Link_Status__c = SUCCESS |
| Missing BillEmail | reason = INVOICE_NO_BILLEMAIL | QB_Payment_Link_Status__c set, QB_Error_Message__c set |
| QB payments disabled | reason = QB_PAYMENTS_DISABLED | Status + message set |

## Test Requirements (Option C)

### Test File
- Path: `deployment/sf-qb-integration-final/tests/payment-link-status-propagation.test.js`

### Test Approach
Test the full route handler flow with the existing router.handle pattern:
1. `jest.mock('../src/services/salesforce-api')` and `jest.mock('../src/services/quickbooks-api')`.
2. Set `process.env.API_KEY = 'test-key'` and include `x-api-key: test-key` in headers.
3. `SalesforceAPI.mockImplementation` returns `getOpportunityWithRelatedData` and
   `updateRecord` (plus `updateOpportunityWithQBInvoiceId` if the route still calls it).
4. `QuickBooksAPI.mockImplementation` returns `findOrCreateCustomer`, `createInvoice`,
   and `getInvoicePaymentLinkDetails`.
5. Call `apiRoutes.handle(req, res, next)` with POST `/opportunity-to-invoice`.
6. Assert `updateRecord` was called with the status fields.

If the route performs multiple updates, assert the *last* `updateRecord` call contains
`QB_Payment_Link_Status__c` and `QB_Error_Message__c` using `mock.calls`.

### Test Cases
| Test | getInvoicePaymentLinkDetails Returns | Expected SF Update |
|------|-------------------------------------|-------------------|
| Success with link | `{link: "https://...", reason: "SUCCESS"}` | `QB_Payment_Link__c: "https://...", QB_Payment_Link_Status__c: "SUCCESS", QB_Error_Message__c: null` |
| No BillEmail | `{link: null, reason: "INVOICE_NO_BILLEMAIL", message: "..."}` | `QB_Payment_Link__c: null, QB_Payment_Link_Status__c: "INVOICE_NO_BILLEMAIL", QB_Error_Message__c: "..."` |
| QB Payments disabled | `{link: null, reason: "QB_PAYMENTS_DISABLED", message: "..."}` | `QB_Payment_Link_Status__c: "QB_PAYMENTS_DISABLED", QB_Error_Message__c: "..."` |

### Command
```bash
cd deployment/sf-qb-integration-final && npm test
```

## Acceptance Criteria
- Middleware response includes `paymentLinkStatus` and `paymentLinkMessage`.
- Salesforce Opportunity is updated with status + message even when no link exists.

## NOT in This PR
- Creating the reason codes method itself (PR 2.5).
- Apex parsing changes (PR 2.7).

## Dependencies
- Requires PR 2.5 merged or `getInvoicePaymentLinkDetails` present.
