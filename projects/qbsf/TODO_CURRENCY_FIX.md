# TODO — Currency Fix Investigation

- [ ] Keep `tail -f /tmp/server.log` running during a fresh EUR Opportunity test and capture timestamp + Opportunity Id.
- [ ] After the test, confirm an AsyncApexJob ran for the Opportunity and pull the Apex log for the test user (save as `/tmp/apex.log`).
- [ ] Re-check `QB_Integration_Settings__c` values (endpoint, API key, realm) match production and adjust if needed.
- [ ] If middleware receives the call, inspect `/tmp/server.log` for QuickBooks 400s; validate Contact email + QuickBooks Payments enabled.
- [ ] Validate success criteria: QB_Invoice_ID__c and QB_Payment_Link__c populated; QuickBooks invoice/payment page shows EUR amounts; then update Roman.
