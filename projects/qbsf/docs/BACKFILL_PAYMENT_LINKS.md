# Backfill Payment Links

## Purpose
Populate `QB_Payment_Link__c` and `QB_Payment_Link_Status__c` for Opportunities that already have a QuickBooks invoice.

## Usage
```bash
export SF_INSTANCE_URL="https://your-instance.my.salesforce.com"
export QB_REALM_ID="1234567890"
node projects/qbsf/scripts/backfill-payment-links.js
```

### Safer runs

```bash
# Preview changes without updating Salesforce
node projects/qbsf/scripts/backfill-payment-links.js --dry-run --limit 5

# Process a small batch (default sleep is 500ms)
node projects/qbsf/scripts/backfill-payment-links.js --limit 25 --sleep-ms 750
```

## Notes
- The script waits ~500ms between records by default to avoid QuickBooks rate limits (`--sleep-ms` to change).
- Records with `QB_Payment_Link_Status__c = 'QB_PAYMENTS_DISABLED'` are skipped.
- This script only updates payment link fields; it does not create invoices.
