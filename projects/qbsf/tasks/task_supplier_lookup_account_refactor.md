# Task: Refactor Supplier__c to Account Lookup (Decision: Account)

## Status
- [x] Complete

## Notes
- Supplier__c already references Account; triggers/tests already use Account lookups.

Decision: Supplier__c must be a lookup to Account (deployable; aligns with Roman’s description). No custom Supplier__c object exists in the repo; remove all dependency on a missing object.

## Review
- [ ] Reviewed

What to change:
1) Field metadata
   - `force-app/main/default/objects/Opportunity/fields/Supplier__c.field-meta.xml`
   - Set a single `<referenceTo>Account</referenceTo>` (remove any other referenceTo).

2) Triggers
   - `force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger`
   - `force-app/main/default/triggers/OpportunityLineItemTrigger.trigger`
   - Ensure queries use Account (Supplier__r.Name from Account) and no dependency on a custom Supplier__c object.

3) Tests
   Replace creation/use of `new Supplier__c(...)` with Account records used as Supplier__c lookup:
   - `OpportunityQuickBooksTriggerTest.cls`
   - `QBInvoiceIntegrationQueueableTest.cls`
   - `QBInvoiceUpdateQueueableTest.cls`
   - `QuickBooksComprehensiveTest.cls`
   - `QuickBooksInvoiceControllerTest.cls`
   - `QuickBooksInvoiceControllerExtraTest.cls`

4) Validation context (for awareness, no change):
   - VAT rule only for Supplier name = "ATO COMM" at Proposal stage; MarkComm not blocked by VAT.
   - Other Proposal VRs: Email_for_invoice__c required; Account.BillingStreet required.

5) Tests to run in org `myorg`:
   ```
   sf apex run test --target-org myorg --tests OpportunityQuickBooksTriggerTest,QBInvoiceIntegrationQueueableTest,QBInvoiceUpdateQueueableTest,QuickBooksComprehensiveTest,QuickBooksInvoiceControllerTest,QuickBooksInvoiceControllerExtraTest --result-format human --wait 30
   ```
   If async required: run without --synchronous and fetch with `sf apex get test --target-org myorg --test-run-id <RUN_ID>`.

## Tests Run
- `sf apex run test --target-org myorg --tests OpportunityQuickBooksTriggerTest,QBInvoiceIntegrationQueueableTest,QBInvoiceUpdateQueueableTest,QuickBooksComprehensiveTest,QuickBooksInvoiceControllerTest,QuickBooksInvoiceControllerExtraTest --result-format human --wait 30`

Deliverables:
- Supplier__c field points to Account (single referenceTo), triggers/tests updated accordingly.
- All tests above pass in `myorg`.
- Note to Roman: Supplier__c uses Accounts; ATO COMM skip stays by Account name. If a separate Supplier__c object is ever needed, its metadata must be added later.
