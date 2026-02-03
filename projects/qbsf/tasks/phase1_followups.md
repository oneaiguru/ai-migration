# Phase 1 Follow-ups / Temporary Steps

Status
- [ ] Open (manual UI steps pending)

These items are required to complete Phase 1 in the org and are tracked here for the next phase.

## Review
- [ ] Reviewed

## Manual Salesforce UI Updates (Required)
- Add a "QB Integration Status" section to the Opportunity page layout and include:
  - QB_Sync_Status__c
  - QB_Last_Attempt__c
  - QB_Invoice_ID__c
  - QB_Payment_Link__c
  - QB_Payment_Link_Status__c
  - QB_Skip_Reason__c
  - QB_Error_Code__c
  - QB_Error_Message__c
  - QB_Correlation_Id__c
- Add related lists to the Opportunity layout:
  - QB_Integration_Log__c
  - QB_Integration_Error_Log__c
- Instructions: `ADD_QB_INTEGRATION_STATUS_LAYOUT_INSTRUCTIONS.md`.

## Verification Notes
- Phase 1 tests must be run in the target org (Apex tests):
  - QBInvoiceIntegrationQueueableTest
  - OpportunityQuickBooksTriggerTest
- If org validation rules block inserts, update test data or document the rule.
