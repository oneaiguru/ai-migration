# Task: Fix Supplier__c Lookup Target & Validation (Roman 2025-12-16)

Status
- [ ] Open (implementation complete; pending review/deploy)
- Notes: Supplier__c already references Account; triggers/tests already use Account. No validation rule metadata in repo, so MarkComm/VAT exceptions remain an org-side check.
- Tests: `sf apex run test --target-org myorg --tests OpportunityQuickBooksTriggerTest,QBInvoiceIntegrationQueueableTest,QBInvoiceUpdateQueueableTest,QuickBooksComprehensiveTest,QuickBooksInvoiceControllerTest,QuickBooksInvoiceControllerExtraTest --result-format human --wait 30`

## Review
- [ ] Reviewed

Context / What Roman needs:
- Supplier__c lookup is misaligned. Metadata currently has `<referenceTo>Supplier__c</referenceTo>` but there is no Supplier__c object in the repo. Earlier Roman said Supplier__c on Opportunity points to Account. Deployments will fail in orgs that don’t have a custom Supplier__c object, and Apex using Supplier__r will break.
- VAT_ID__c should NOT block MarkComm. Integration feels intermittent; Roman needs clarity and monitoring.

Urgent decisions for agent:
1) Confirm the actual lookup target for Supplier__c in the org:
   - If the field is an Account lookup, set a single `<referenceTo>Account</referenceTo>` and refactor triggers/tests to use Account as Supplier__r.
   - If it truly points to a custom Supplier__c object, add that object’s metadata to the repo and keep the lookup; otherwise deployments will fail.
2) Validation rules on Proposal stage:
   - Roman says VAT_ID__c is not a requirement for MarkComm. Identify the VR(s) on Opportunity/Account that enforce VAT/Billing/Email_for_invoice__c on Proposal and relax for MarkComm if needed.

Files to inspect/update:
- Field: `force-app/main/default/objects/Opportunity/fields/Supplier__c.field-meta.xml`
- Triggers: `force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger`, `OpportunityLineItemTrigger.trigger` (both use Supplier__r.Name for ATO COMM skip)
- Tests: `OpportunityQuickBooksTriggerTest.cls`, `QBInvoiceIntegrationQueueableTest.cls`, `QBInvoiceUpdateQueueableTest.cls`, `QuickBooksComprehensiveTest.cls`, `QuickBooksInvoiceControllerTest.cls`, `QuickBooksInvoiceControllerExtraTest.cls` (currently create Supplier__c records; refactor to Account if lookup targets Account)
- Validation rules (org): find VRs that block Proposal when VAT/Address/Email_for_invoice__c missing; ensure MarkComm flow not blocked.

Steps:
1) Determine correct lookup target (Account vs Supplier__c object). Align field metadata and all Apex/tests accordingly.
2) Update triggers/tests to match the target (Supplier__r.Name from Account if Account; or keep if real Supplier__c object is added).
3) Review validation rules affecting Proposal stage; adjust or document exceptions for MarkComm (especially VAT_ID__c).
4) Run org tests in `myorg`:
   ```
   sf apex run test --target-org myorg --tests OpportunityQuickBooksTriggerTest,QBInvoiceIntegrationQueueableTest,QBInvoiceUpdateQueueableTest,QuickBooksComprehensiveTest,QuickBooksInvoiceControllerTest,QuickBooksInvoiceControllerExtraTest --result-format human --wait 30
   ```
   If async: run without `--synchronous` and fetch results with `sf apex get test --target-org myorg --test-run-id <RUN_ID>`.

Monitoring for Roman (keep/verify):
- Success: `QB_Integration_Log__c`
- Errors: `QB_Integration_Error_Log__c`
- Queueables: `AsyncApexJob` for `QBInvoiceIntegrationQueueable` / `QBInvoiceUpdateQueueable`

Deliverables:
- Field metadata corrected to the intended target.
- Triggers/tests consistent with the target; org tests passing.
- Clarified validation impact on MarkComm (VAT_ID__c not required), or changes applied.

Recommendation:
- Set Supplier__c to lookup Account (stable, deployable). If Roman insists on a separate Supplier__c object, provide/add that object metadata; otherwise deployments will fail.
- Keep the ATO COMM skip by Account name.
- No change to user flow: select the supplier Account in Supplier__c.
