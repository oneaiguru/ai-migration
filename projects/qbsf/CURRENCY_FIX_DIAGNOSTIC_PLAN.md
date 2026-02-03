# CURRENCY FIX – E2E DIAGNOSTIC PLAN

Goal: give the next agent a deterministic path to finish the investigation when QB_Invoice_ID__c / QB_Payment_Link__c do not populate after the currency fix.

Context:
- Currency fix code is deployed on the production server `/opt/qb-integration` (routes/api.js, transforms/opportunity-to-invoice.js, services/salesforce-api.js).
- QuickBooks Payments must be enabled, and the Contact needs an email for payment links.
- Roman’s latest test: Opportunity “Test 0412 - 06c3F” moved to “Proposal and Agreement”; no invoice ID/link observed.

Steps (run in order):
1) Verify deployed code
   - `sshpass -p '3Sd5R069jvuy[3u6yj' ssh -p 2323 roman@pve.atocomm.eu "grep -n 'CurrencyRef' /opt/qb-integration/src/routes/api.js && grep -n 'currency' /opt/qb-integration/src/transforms/opportunity-to-invoice.js && grep -n 'CurrencyIsoCode' /opt/qb-integration/src/services/salesforce-api.js"`
   - If missing, scp the three files from `deployment/sf-qb-integration-final/src/...` and restart: `cd /opt/qb-integration && pkill -f node && nohup node src/server.js > /tmp/server.log 2>&1 &`

2) Ensure live logging
   - Check log freshness: `ls -l /tmp/server.log && tail -5 /tmp/server.log`
   - If stale, restart as above; keep `tail -f /tmp/server.log` running before the next test.

3) Live capture during Roman’s test
   - Ask Roman to create a new EUR Opportunity (with Supplier + Contact email), add Product, set Stage to “Proposal and Agreement”, then ping when done.
   - Keep `tail -f /tmp/server.log` open to capture request/response for that Opportunity ID.

4) Salesforce trigger validation (after the test)
   - Check Queueable run: `sf data query -q "SELECT Id, Status, MethodName, CreatedDate, NumberOfErrors FROM AsyncApexJob WHERE CreatedDate = TODAY ORDER BY CreatedDate DESC LIMIT 5" -o myorg`
   - If no job appears, confirm trigger is Active and Stage value matches exactly “Proposal and Agreement”.
   - If jobs exist, pull Apex log for the test user: set a short trace flag, rerun test, then `sf apex log list -o myorg` + `sf apex log get -i <LogId> -o myorg > /tmp/apex.log` to see callout/HTTP errors.

5) Confirm integration settings
   - `sf data query -q "SELECT Middleware_Endpoint__c, API_Key__c, QB_Realm_ID__c FROM QB_Integration_Settings__c" -o myorg`
   - Must point to `https://sqint.atocomm.eu/api` with the correct API key (`UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=`) and the right Realm ID.

6) If callout reaches middleware but fails
   - Inspect `/tmp/server.log` for 400s from QuickBooks. Common fix: ensure Contact email exists (needed for payment link).
   - If “TxnType does not match” or similar, retry with a fresh Opportunity name/Id to avoid stale invoice lookups.
   - You can replay manually: POST to the middleware invoice endpoint with the failing Opportunity Id to reproduce outside Salesforce.

7) Success criteria for sign-off
   - New EUR Opportunity → QB_Invoice_ID__c populated → QB_Payment_Link__c populated.
   - QuickBooks invoice shows EUR amount; payment link displays € amount (not $).

Artifacts to hand over
- User-facing steps in Russian: `MESSAGE_FOR_ROMAN.md`
- This plan: `CURRENCY_FIX_DIAGNOSTIC_PLAN.md`
