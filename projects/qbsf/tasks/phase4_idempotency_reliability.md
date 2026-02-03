# Phase 4 Task Stub — Idempotency + Reliability

Status
- [x] Complete (2025-12-27)
- [x] Reviewed (2025-12-27)
- Tests: `cd deployment/sf-qb-integration-final && npm test`
- Tests: `sf apex run test --target-org myorg --tests OpportunityQuickBooksTriggerTest,QBInvoiceIntegrationQueueableTest --result-format human --wait 30`

## Review
- [x] Reviewed

Scope (from COMPLETION_PLAN_V2.md)
- Middleware-side idempotency: find existing invoice by Opportunity ID.
- Add Opportunity ID tag to invoice PrivateNote.
- Remove placeholder invoice IDs; reconcile existing invoices.
- Apex should skip when QB_Invoice_ID__c is already set.

Known Target Files
- `deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
- `deployment/sf-qb-integration-final/src/routes/api.js`
- `deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js`
- `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`

Validation
- Run targeted Apex tests after changes.
- Add/adjust middleware checks in scripts or manual runbook.
