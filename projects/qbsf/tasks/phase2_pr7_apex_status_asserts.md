# PR 2.7 — Apex Test Assertions for Payment Link Status

## Status
- [x] Complete (2025-12-27)
- [x] Reviewed (2025-12-27)
- Tests: `sf apex run test --tests QBInvoiceIntegrationQueueableTest --synchronous --target-org myorg`

## Scope (Single Change)
- Add assertions in Apex tests to verify `QB_Payment_Link_Status__c` is set when middleware returns `paymentLinkStatus`.

## Files to Modify
- `force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`
  - `testSuccessfulHttpResponse` around lines ~203-218

## Exact Code Change

```apex
// BEFORE (testSuccessfulHttpResponse)
Opportunity updatedOpp = [SELECT Id, QB_Invoice_ID__c FROM Opportunity WHERE Id = :testOpp.Id];
System.assertNotEquals(null, updatedOpp.QB_Invoice_ID__c);

// AFTER
Opportunity updatedOpp = [
    SELECT Id, QB_Invoice_ID__c, QB_Payment_Link_Status__c
    FROM Opportunity
    WHERE Id = :testOpp.Id
];
System.assertNotEquals(null, updatedOpp.QB_Invoice_ID__c);
System.assertEquals('SUCCESS', updatedOpp.QB_Payment_Link_Status__c);
```

## Test Cases

| Test | Input | Expected |
| --- | --- | --- |
| SuccessfulHttpMock | paymentLinkStatus = SUCCESS | QB_Payment_Link_Status__c = SUCCESS |

## Acceptance Criteria
- Test passes with existing `SuccessfulHttpMock` response (already includes `paymentLinkStatus`).
- No behavior change outside tests.

## NOT in This PR
- Middleware changes (PR 2.1–2.6).

## Dependencies
- None. The mock response is self-contained and already includes `paymentLinkStatus`.
