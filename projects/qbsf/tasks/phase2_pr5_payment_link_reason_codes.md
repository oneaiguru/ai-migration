# PR 2.5 — Payment Link Reason Codes (Middleware)

## Status
- [ ] Ready for implementation

## Scope (Single Change)
- Add a new method returning `{ link, reason, message, billEmail }` and keep existing `getInvoicePaymentLink` behavior for backward compatibility.

## Files to Modify
- `deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
  - Near existing `getInvoicePaymentLink` (lines ~431-442)

## Exact Code Change

```javascript
// NEW method (suggested)
async getInvoicePaymentLinkDetails(invoiceId) {
  try {
    const response = await this.request(
      'get',
      `invoice/${invoiceId}?minorversion=65&include=invoiceLink`
    );

    const invoice = response.Invoice;
    const invoiceLink = invoice?.InvoiceLink;
    const billEmail = invoice?.BillEmail?.Address || null;

    if (invoiceLink) {
      return { link: invoiceLink, reason: 'SUCCESS', billEmail };
    }

    if (!billEmail) {
      return {
        link: null,
        reason: 'INVOICE_NO_BILLEMAIL',
        billEmail: null,
        message: 'Invoice has no BillEmail - QB cannot generate payment link'
      };
    }

    return {
      link: null,
      reason: 'QB_PAYMENTS_DISABLED',
      billEmail,
      message: 'Invoice has BillEmail but no InvoiceLink - check QB Payments settings'
    };
  } catch (error) {
    if (error.statusCode === 401 || error.message.includes('Authentication failed')) {
      return {
        link: null,
        reason: 'AUTH_EXPIRED',
        message: 'QuickBooks authentication expired - reauthorization required'
      };
    }

    return { link: null, reason: 'API_ERROR', message: error.message };
  }
}

// Optional: keep old method by delegating
async getInvoicePaymentLink(invoiceId) {
  const result = await this.getInvoicePaymentLinkDetails(invoiceId);
  return result.link || null;
}
```

## Test Cases

| Test | QB Response | Expected reason |
| --- | --- | --- |
| InvoiceLink present | Invoice.InvoiceLink set | SUCCESS |
| No BillEmail | Invoice.BillEmail missing | INVOICE_NO_BILLEMAIL |
| BillEmail but no link | Invoice.BillEmail set, no InvoiceLink | QB_PAYMENTS_DISABLED |
| 401 | HTTP 401 | AUTH_EXPIRED |
| Other error | any error | API_ERROR |

## Test Requirements (Option C)

### Test File
- Path: `deployment/sf-qb-integration-final/tests/payment-link-reasons.test.js`

### Test Approach
Test `getInvoicePaymentLinkDetails` method directly:
1. Create QuickBooksAPI instance
2. Mock `this.request` to return different invoice payloads
3. Call `getInvoicePaymentLinkDetails(invoiceId)`
4. Assert return object matches expected reason code

For error cases, mock `request` to throw an `Error` with `statusCode = 401`
for `AUTH_EXPIRED`, and a generic `Error` for `API_ERROR`.

### Test Cases (All 5 Reason Codes)
| Test | QB Response | Expected Result |
|------|-------------|-----------------|
| SUCCESS | `{Invoice: {InvoiceLink: "https://...", BillEmail: {Address: "x@y.com"}}}` | `{link: "https://...", reason: "SUCCESS", billEmail: "x@y.com"}` |
| INVOICE_NO_BILLEMAIL | `{Invoice: {InvoiceLink: null, BillEmail: null}}` | `{link: null, reason: "INVOICE_NO_BILLEMAIL", billEmail: null, message: "..."}` |
| QB_PAYMENTS_DISABLED | `{Invoice: {InvoiceLink: null, BillEmail: {Address: "x@y.com"}}}` | `{link: null, reason: "QB_PAYMENTS_DISABLED", billEmail: "x@y.com", message: "..."}` |
| AUTH_EXPIRED | HTTP 401 error | `{link: null, reason: "AUTH_EXPIRED", message: "..."}` |
| API_ERROR | Any other error | `{link: null, reason: "API_ERROR", message: error.message}` |

### Command
```bash
cd deployment/sf-qb-integration-final && npm test
```

## Acceptance Criteria
- New method returns `{link, reason, message, billEmail}`.
- Existing callers of `getInvoicePaymentLink` still receive a string/null.

## NOT in This PR
- Response propagation to Salesforce (PR 2.6).
- Apex parsing changes (PR 2.7).

## Dependencies
- None.
