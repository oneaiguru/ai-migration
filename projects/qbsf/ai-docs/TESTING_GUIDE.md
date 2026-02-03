# Testing Guide
Minimal commands and expectations for the Salesforce ↔ QuickBooks integration.

## Apex tests (org alias `myorg`)
Run key suites:
```
sf apex run test --target-org myorg --tests OpportunityQuickBooksTriggerTest,QBInvoiceIntegrationQueueableTest,QBInvoiceUpdateQueueableTest,QuickBooksComprehensiveTest,QuickBooksInvoiceControllerTest,QuickBooksInvoiceControllerExtraTest --result-format human --wait 30
```

## Expectations
- All listed tests should pass; they cover trigger flows, queueables, controller paths, and callout coverage.
- If you modify invoice logic or line-item triggers, rerun the above suite; no additional data setup should be required.

## Last known status
- Last recorded run (Dec 2025) passing on feature branches; rerun on your org after metadata changes to confirm.
