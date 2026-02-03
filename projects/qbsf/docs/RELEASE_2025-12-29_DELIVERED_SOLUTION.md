# Release Dossier: Delivered Solution (2025-12-29)

Commit: delivered solution
Scope: Option A deployment verification (20 opportunities)

## Summary
- Option A confirmed: deploy current version, verify invoice + payment link for 20 opportunities with valid email.
- Logging, backfill, and extended support are out of scope for Option A.

## Investigation Summary
- Reported issue: Opportunity 006So00000XWJ1LIAX had no invoice or status fields.
- Reality: fields were populated; integration ran and returned a QuickBooks error.

### Evidence (Salesforce)
- QB_Sync_Status__c: Error
- QB_Error_Code__c: HTTP_ERROR
- QB_Error_Message__c: You can only use one foreign currency per transaction.
- QB_Last_Attempt__c: 2025-12-29T15:05:29Z
- OpportunityQuickBooksTrigger is active.

### Root Cause
QuickBooks multicurrency is enabled, but existing customers are still USD. The
invoice attempt used a non-USD currency (e.g., EUR), which QBO rejects when
customer currency does not match invoice currency.

## Decision / Current Fix
- Keep CurrencyRef in the payload (multi-currency mode).
- Roman will delete existing customers in QBO so new customers are recreated
  with the correct currency, then re-run verification.

## Options if Roman wants alternate behavior
1) USD-only mode (remove CurrencyRef); all invoices in USD.
2) Multi-currency with manual customer fixes (delete/recreate or adjust
   currency in QBO).
3) Smart currency handling (extra scope): lookup existing customer currency
   and create invoice in that currency; estimate +25k.

## Next Steps
- Roman: delete QBO customers and re-trigger the 20 opportunities.
- If errors persist: capture QB_Error_Message__c and share for follow-up.
