# Phase 2 Discovery — Payment Link Correctness

Status
- Scout complete; file:line evidence captured below.

## Review
- [x] Reviewed (2025-12-27)

## Review Notes (2025-12-27)
- Findings 1-4 are now addressed in current code (OCR/ORDER BY, billing email trim + blank omission, payment link reason codes); the file:line references reflect the pre-fix snapshot.
- Findings 5-8 still match the current baseline (Apex expects status fields, middleware update scope, invoice transform behavior, and customer email update gaps).

Scope (from COMPLETION_PLAN_V2.md)
- Deterministic billing email selection.
- Never overwrite QuickBooks customer email with blank.
- Payment link reason codes + status propagation back to Salesforce.

Required Reading (Scout)
- `PROGRESS.md`
- `COMPLETION_PLAN_V2.md` (Phase 2 section)
- `CRITICAL_FILES_TO_READ.md`
- `CRITICAL_CODE_LOCATIONS.md`
- `.claude/skills/quickbooks-api-dev/SKILL.md`
- `.claude/skills/qb-sf-integration-testing/SKILL.md`
- `ai-docs/quickbooks-api-reference.md`
- `ai-docs/salesforce-api-reference.md`

Key Findings (file:line evidence)
1. Contact email selection is non-deterministic (`LIMIT 1`, no `ORDER BY`) and only provides `contactEmail`.
   - `deployment/sf-qb-integration-final/src/services/salesforce-api.js:251-259`
2. Middleware billing email falls back to empty string and can send blank `PrimaryEmailAddr` when no email exists.
   - `deployment/sf-qb-integration-final/src/routes/api.js:51-69`
3. Update-invoice flow uses the same empty-string billing email fallback.
   - `deployment/sf-qb-integration-final/src/routes/api.js:331-333`
4. `getInvoicePaymentLink` returns only a link (string/null), no reason codes or message.
   - `deployment/sf-qb-integration-final/src/services/quickbooks-api.js:431-442`
5. Apex queueable expects `paymentLinkStatus` + `paymentLinkMessage` in middleware response and writes `QB_Payment_Link_Status__c`.
   - `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls:85-107`
6. `updateOpportunityWithQBInvoiceId` only updates `QB_Invoice_ID__c` and optional `QB_Payment_Link__c`; no status/error fields.
   - `deployment/sf-qb-integration-final/src/services/salesforce-api.js:300-319`
7. Invoice transform uses `billingEmail = ''` by default; BillEmail is only set when truthy.
   - `deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js:13-56`
8. `findOrCreateCustomer` returns existing customers without updating email; no non-blank email update logic.
   - `deployment/sf-qb-integration-final/src/services/quickbooks-api.js:289-305`
   - `deployment/sf-qb-integration-final/src/services/quickbooks-api.js:323-340`

Gaps vs Phase 2 Acceptance Criteria
- Email selection priority (Opportunity.Email_for_invoice__c → OCR primary → Account.Email__c → latest Contact) is not implemented; current flow uses a single Contact query.
- Blank emails are still passed to QuickBooks customer creation.
- Payment link status reasons are not surfaced to Salesforce; Apex expects fields that middleware does not return.

Open Questions
- Confirm if any other middleware variant (e.g., `src/` or `final-integration/`) must be updated in addition to `deployment/sf-qb-integration-final/src/`.

Next Step
- Planner to create `plans/` file with explicit edits for salesforce-api.js, routes/api.js, quickbooks-api.js, opportunity-to-invoice.js, and any Apex response handling.
