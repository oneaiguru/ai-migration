# Phase 3 Task Stub — OAuth Self-Heal + Runbook

Status
- [x] Complete (2025-12-27)
- [x] Reviewed (2025-12-27)
- Tests: `cd deployment/sf-qb-integration-final && npm test`
- Tests: `sf apex run test --tests QBInvoiceIntegrationQueueableTest --synchronous --target-org myorg`

Scope (from COMPLETION_PLAN_V2.md)
- Surface AUTH_EXPIRED and NO_TOKENS cleanly from middleware.
- Update Apex handling to mark Opportunity with clear error.
- Add a runbook for Roman (`docs/ROMAN_AUTH_RUNBOOK.md`).

Known Target Files
- `deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
- `deployment/sf-qb-integration-final/src/routes/api.js`
- `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`
- `docs/ROMAN_AUTH_RUNBOOK.md`

Validation
- Run targeted Apex tests after changes.
- Confirm API returns `errorCode` + `reauthorizeUrl` on auth failures.
