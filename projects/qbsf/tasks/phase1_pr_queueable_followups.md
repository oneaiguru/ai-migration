# PR X — Phase 1 Queueable Follow-ups (Preserve Payment Link + Log Warning)

## Status
- [x] Complete (2025-12-27)
- [x] Reviewed (2025-12-27)
- Tests: `sf apex run test --tests QBInvoiceIntegrationQueueableTest --synchronous --target-org myorg`

## Review Notes (2025-12-27)
- Verified `QB_Payment_Link__c` is only set when the middleware returns a non-blank link in `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`.
- Verified integration log status now uses `finalStatus` and 401 auth failures insert `QB_Integration_Error_Log__c` records in `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`.
- Verified test coverage for payment link preservation, warning log status, and auth expired logging in `force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`.

## Context
Two regressions were flagged in `QBInvoiceIntegrationQueueable` after Phase 1 changes:
1) Payment link can be cleared when middleware omits `paymentLink`.
2) Warning outcomes are logged as `Success` in `QB_Integration_Log__c`.
3) 401 auth failures do not create `QB_Integration_Error_Log__c` records.

This PR should be atomic and independent of Phase 2 work.

## Required Reading
- `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`
- `force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`
- `force-app/main/default/objects/QB_Integration_Log__c/fields/Status__c.field-meta.xml`

## Evidence (file:line)
- Payment link null overwrite:
  - `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls:99-103`
- Log status always Success even when finalStatus is Warning:
  - `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls:110-115`
- 401 branch missing error logs:
  - `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls:130-134`
- Log picklist supports Warning:
  - `force-app/main/default/objects/QB_Integration_Log__c/fields/Status__c.field-meta.xml`

## Change 1: Preserve Existing Payment Link

### Problem
The success path sets `QB_Payment_Link__c = null` when `paymentLink` is blank, which clears any existing link if the job is retried.

### Fix
Only set `QB_Payment_Link__c` when a non-blank `paymentLink` is returned.

### Suggested Code Change
```apex
// BEFORE
finalUpdate.QB_Payment_Link__c = (paymentLink != null && !String.isBlank(paymentLink))
    ? paymentLink
    : null;

// AFTER (preserve existing if link not returned)
if (paymentLink != null && !String.isBlank(paymentLink)) {
    finalUpdate.QB_Payment_Link__c = paymentLink;
}
```

## Change 2: Log Warning Outcomes

### Problem
`finalStatus` is set to `Warning` when payment link status is not `SUCCESS`, but the log always records `Status__c = 'Success'`.

### Fix
Set the log status to match `finalStatus` (Success or Warning).

### Suggested Code Change
```apex
// BEFORE
Status__c = 'Success',

// AFTER
Status__c = finalStatus,
```

## Change 3: Log 401 Auth Failures

### Problem
When the middleware returns 401, the opportunity is updated but no `QB_Integration_Error_Log__c` is created, which removes the audit trail for auth outages.

### Fix
Add `QB_Integration_Error_Log__c` inserts in the 401 branch (both `AUTH_EXPIRED` and other auth errors).

## Tests (Apex)

### 1) Preserve Payment Link
Add a new test that pre-populates `QB_Payment_Link__c`, runs the queueable with a mock response that omits `paymentLink`, and asserts the link remains unchanged.

Pseudo steps:
- Create Opportunity and set `QB_Payment_Link__c = 'https://existing.link'`.
- Use `allowTestCallouts = true` and a mock that returns `success=true`, `qbInvoiceId`, `paymentLink=null`, `paymentLinkStatus='INVOICE_NO_BILLEMAIL'`.
- Assert `QB_Payment_Link__c` is still `https://existing.link` after `Test.stopTest()`.

### 2) Log Warning Status
Add a test that returns `paymentLinkStatus='INVOICE_NO_BILLEMAIL'` and asserts the latest `QB_Integration_Log__c.Status__c` is `Warning`.

### 3) Log 401 Auth Failures
Add a test that returns `statusCode=401` with `errorCode='AUTH_EXPIRED'` and asserts a `QB_Integration_Error_Log__c` record exists.

## Acceptance Criteria
- `QB_Payment_Link__c` is preserved when middleware omits a link.
- `QB_Integration_Log__c.Status__c` matches `finalStatus` (Success/Warning).
- 401 responses create `QB_Integration_Error_Log__c` entries for auth failures.
- Targeted Apex tests pass:
  - `QBInvoiceIntegrationQueueableTest`

## NOT in This PR
- Any middleware changes (Phase 2).
- Any new fields or layout changes.
