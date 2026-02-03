# Currency Fix Handoff (Dec 8, 2025)

Scope: document current state after currency fix deployment, Roman’s latest test, and next actions.

Current status
- Middleware code on server matches currency-fix build (`routes/api.js`, `transforms/opportunity-to-invoice.js`, `services/salesforce-api.js` md5 == local).
- Salesforce settings: endpoint https://sqint.atocomm.eu (API key stored in QB_Integration_Settings__c / env; value redacted here), realm stored in settings. Trigger `OpportunityQuickBooksTrigger` and `QBInvoiceIntegrationQueueable` are Active.
- Latest Opportunity test: `006So00000WWJa7IAH` (“test link”) has `QB_Invoice_ID__c = 2460`, `QB_Payment_Link__c` populated, Currency = EUR. Fix appears to work.
- Logs: `/tmp/server.log` and `/opt/qb-integration/server.log` are stale; `/opt/qb-integration/logs/combined.log` last written Aug 24. Current node proc started Dec 8 11:36 but stdout not captured to file.

What we told Roman (sent)
- “Роман, новая EUR Opportunity сработала: инвойс 2460 и ссылка на оплату уже в Salesforce, валюта EUR. Проверь в QuickBooks сам инвойс 2460 и саму ссылку — сумма должна отображаться в евро. If всё ок, фикc подтверждён.”

Recommended verifications
- In QuickBooks: open invoice 2460 and the payment link; confirm amounts display in EUR (not USD).
- If more tests are needed, create a brand-new EUR Opportunity (with Supplier and Contact Email), add Product, set Stage = “Proposal and Agreement”.

If logging is needed
- Restart to capture stdout: `cd /opt/qb-integration && pkill -f node && nohup node src/server.js > /tmp/server.log 2>&1 &`
- Then watch: `tail -f /tmp/server.log` during a fresh Opportunity test.

Security note
- API key was previously written in this doc; rotate the QuickBooks/middleware API key and update QB_Integration_Settings__c + .env after rotation. Keep secrets out of versioned docs.

Artifacts
- Plans/notes: `CURRENCY_FIX_DIAGNOSTIC_PLAN.md`, `TODO_CURRENCY_FIX.md`
- Status summary: this file
