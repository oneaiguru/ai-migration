# Runbook & Monitoring
How to check integration health, find errors, and retrigger invoice updates.

## Quick paths
- Tabs (requires perm set `QB Integration Monitoring`): App Launcher → QB Integration Log → All; App Launcher → QB Integration Error Log → All (shows `Error_Message__c`).
- SOQL (Dev Console):
  - Success logs: `SELECT Id, Opportunity__c, QB_Invoice_ID__c, Status__c, Message__c, CreatedDate FROM QB_Integration_Log__c ORDER BY CreatedDate DESC`
  - Error logs: `SELECT Id, Opportunity__c, Error_Message__c, Error_Type__c, CreatedDate FROM QB_Integration_Error_Log__c ORDER BY CreatedDate DESC`
  - Queue jobs: `SELECT Id, Status, JobType, ApexClass.Name, NumberOfErrors, CreatedDate FROM AsyncApexJob WHERE ApexClass.Name IN ('QBInvoiceIntegrationQueueable','QBInvoiceUpdateQueueable') ORDER BY CreatedDate DESC`

## What to check when email/payment link is missing
1) Logs: find the Opportunity/QB Invoice ID in QB Integration Log (success) or Error Log (`Error_Message__c`).
2) Async jobs: Failed/NumberOfErrors>0 → open Apex log for details.
3) Target email: set `Email_for_invoice__c` on the Opportunity; fallback is Account email, then contact email. Confirm QBO email sending is enabled and the contact has an email.

## Retriggering updates
- Edit Opportunity Line Items to resync quantities/amounts (trigger-driven).
- For manual re-sync, use the middleware endpoint `/api/update-invoice` with the Opportunity/QB Invoice ID (see middleware README for auth/usage).

## Access
- Assign perm set `QB Integration Monitoring` to users who need tabs/SOQL on custom fields.
- Objects/fields: read access to `QB_Integration_Log__c` and `QB_Integration_Error_Log__c` with key fields (`QB_Invoice_ID__c`, `Status__c`, `Message__c`, `Error_Message__c`, `Error_Type__c`, `Opportunity__c`, `Timestamp__c`).
