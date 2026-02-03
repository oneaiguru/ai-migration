## Metadata
- Task: Normalize QuickBooks customer ID passed to invoice mapping
- Discovery: PR #124 Codex review comment + file evidence in `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js` and `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`.
- Related docs: `projects/qbsf/AGENTS.md`, `projects/qbsf/plans/README.md`

## Desired End State
The `/opportunity-to-invoice` route always passes a plain QuickBooks customer ID string to `mapOpportunityToInvoice`, even when `findOrCreateCustomer` returns an object. Jest suite runs via `cd projects/qbsf/deployment/sf-qb-integration-final && npm test` without regressions.

### Key Discoveries
- `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js:533` returns `{ id, currency, isExisting }` from `findOrCreateCustomer`.
- `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js:131-139` passes `qbCustomerId` straight into `mapOpportunityToInvoice` after `findOrCreateCustomer`, so if `qbCustomerId` is an object the CustomerRef becomes `[object Object]`.

## What We're NOT Doing
- No changes to QuickBooks currency conversion logic, email handling, or other routes.
- No new fixtures, JSONL/BDD artifacts, or ADR updates.
- No deployment or push steps.

## Implementation Approach
Normalize the value passed into `mapOpportunityToInvoice` by extracting `.id` when `qbCustomerId` is an object, leaving the value unchanged when it is already a string. Keep the change localized to the `/opportunity-to-invoice` invoice-mapping call.

## Phase 1: Normalize Customer ID for Invoice Mapping
### Overview
Ensure the invoice mapper receives a string customer ID without changing the upstream customer lookup behavior.

### Changes Required
1. **File**: `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`
   **Changes**: Update the `mapOpportunityToInvoice` call to pass `qbCustomerId?.id || qbCustomerId`.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js
   @@
     const invoiceData = mapOpportunityToInvoice(
       opportunityData.opportunity,
       opportunityData.account,
       convertedProducts,
-      qbCustomerId,
+      qbCustomerId?.id || qbCustomerId,
       billingEmail,  // Pass billing email for BillEmail field
       targetCurrency // Pass currency for CurrencyRef field
     );
   *** End Patch
   PATCH
   ```

## Tests & Validation
- `cd projects/qbsf/deployment/sf-qb-integration-final && npm test`
  - Expect all Jest tests to pass.

## Rollback
- `git restore --source=HEAD -- projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`
- Or `git revert <new_commit_sha>` after commit if rollback is needed.

## Handoff
- No `PROGRESS.md` or session handoff updates planned for this small fix.
