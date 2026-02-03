# Decisions & Release Notes
Key decisions, scope boundaries, and PR references for quick context.

## Decisions and scope
- Supplier model: `Supplier__c` points to `Account` (no custom Supplier object). ATO COMM Accounts are skipped intentionally.
- Email for invoices: use `Opportunity.Email_for_invoice__c` first, then Account email, then contact email.
- Validations: proposal-stage checks stay in place (supplier/account required); VAT required only for ATO COMM.
- Line-item syncing: OpportunityLineItemTrigger keeps invoices updated; chunked processing with ATO COMM skip.

## Release notes / PRs
- PR #95: Supplier refactor, trigger/test alignment, OpportunityLineItemTrigger, trailing-comma/test fixes, callout coverage.
- PR #96: convertpdf cleanup (import maintenance).
- PR #100: Monitoring tabs/layout updates and docs (error log layout, tabs for logs).
- PR #101/#102: Monitoring permission set and `Email_for_invoice__c` field added to deployment manifests.

## Risks / edge cases
- If a separate Supplier object is ever required, add metadata and update lookups/tests before changing the model.
- Keep ATO COMM skip unless business requests otherwise; VAT rules tied to that skip.
- Ensure deployment manifests include tabs/layouts/fields (CustomTab, Layout, CustomField) so monitoring is available post-deploy.
