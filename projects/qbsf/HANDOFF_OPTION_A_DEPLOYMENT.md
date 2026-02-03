# HANDOFF: Option A Deployment for Roman (20k RUB)

## Context
Negotiation completed Dec 28-29, 2025. Roman pays 20k RUB for minimal delivery.

## Key Documents
- **Plan**: `/Users/m/.claude/plans/jolly-crunching-wombat.md`
- **Manifest**: `/Users/m/ai/projects/qbsf/docs/OPTION_A_DELIVERY_MANIFEST.md`
- **Negotiation**: `/Users/m/Desktop/romanen.txt`

## What Roman Gets
- Invoice creation (`/api/opportunity-to-invoice`)
- Payment link (`QB_Payment_Link__c` field)
- Billing email priority (Opp > OCR > Account > Contact)
- Verification: 20 accounts, max 3 fix cycles

## Deployment Status (IN PROGRESS)

### SF CLI Connected
```
sf org list  # Shows myorg = olga.rybak@atocomm2023.eu (Connected)
```

### Issues Found & Fixed
1. **QB_Payment_Link__c** - removed `length` attribute (URL fields don't have length)
2. **Crypto.getRandomUUID()** - replaced with `EncodingUtil.convertToHex(Crypto.generateAesKey(128))`
3. **Supplier__c** - skip (already exists in org)
4. **Settings object** - use `QB_Integration_Settings__c` from `deployment-package/` not `QuickBooks_Settings__c`
5. **Production test coverage** - fixed; dry-run deploy with `RunLocalTests` now succeeds (Deploy ID `0AfSo0000037t65KAA`)

### Deployment Package Created
```
/Users/m/ai/projects/qbsf/deploy_temp/
├── classes/QBInvoiceIntegrationQueueable.cls (FIXED)
├── classes/QuickBooksAPIService.cls
├── triggers/OpportunityQuickBooksTrigger.trigger
├── objects/Opportunity/fields/QB_*.field-meta.xml (6 fields)
├── objects/Account/fields/Email__c.field-meta.xml
├── objects/QB_Integration_Settings__c/
└── remoteSiteSettings/
```

### Deploy Command
```bash
cd /Users/m/ai/projects/qbsf
sf project deploy start --source-dir=deploy_temp --target-org=myorg --test-level=RunLocalTests --wait=20
```

### After SF Deploy - Middleware
```bash
# Deploy to Roman's server
scp -r -P 2323 deployment/sf-qb-integration-final/* roman@pve.atocomm.eu:/opt/qb-integration/
ssh roman@pve.atocomm.eu -p2323 "rm -rf /opt/qb-integration/tests && cd /opt/qb-integration && npm install && pkill -f 'node src/server.js'; nohup node src/server.js &"

# Verify
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
```

## Verification Criteria
Roman tests 20 Opportunities:
1. Valid email in Opp/Account/Contact
2. Stage → "Proposal and Agreement"
3. Check: `QB_Invoice_ID__c` + `QB_Payment_Link__c` populated
4. All 20 pass = CLOSED

## Payment
20,000 RUB after verification passes.
