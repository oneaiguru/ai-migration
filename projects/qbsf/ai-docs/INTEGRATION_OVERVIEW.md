# Integration Overview
Quick reference for how the Salesforce ↔ QuickBooks invoice flow works and what data it needs.

## Core flow
- Creates QuickBooks invoices from Opportunities; updates invoices when Opportunity Line Items change (via OpportunityLineItemTrigger).
- Invoice email target priority: `Opportunity.Email_for_invoice__c` → `Account.Email__c` → primary contact email.
- Payment/email links come from QuickBooks; set the Opportunity email to control who receives them.

## Supplier and scope rules
- `Supplier__c` points to `Account` (no custom Supplier object). ATO COMM Accounts are skipped by design.
- Proposal-stage validations remain: supplier/account required; validation messages enforced before invoice creation.
- VAT restrictions: VAT required only for ATO COMM; other accounts are not blocked on VAT.

## Required/validated fields
- Opportunity: `Email_for_invoice__c` (for BillEmail), `Account` (supplier), address fields as configured; respects existing proposal validations.
- Line items: changes auto-sync invoices; chunked processing; ATO COMM skip applies.
- Logs: `QB_Integration_Log__c` (success) and `QB_Integration_Error_Log__c` (errors) capture outcomes for monitoring.
