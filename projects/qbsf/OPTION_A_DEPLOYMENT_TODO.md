# Option A Deployment — TODO / Progress Tracker

## 1) Salesforce deployment (coverage blocker)
- [x] Confirm target org and coverage status (dry-run deploy now passes with no coverage warning).
- [ ] Choose path:
  - [x] Production: tests/coverage fixed to reach ≥75% (validated via dry-run deploy).
  - [ ] Sandbox: deploy with `--test-level NoTestRun` (only if acceptable).
- [ ] Deploy from `deploy_temp/`:
  - [x] Dry-run (check-only): `sf project deploy start --source-dir deploy_temp --target-org myorg --test-level RunLocalTests --dry-run --wait 30`
  - [x] Real deploy: `sf project deploy start --source-dir deploy_temp --target-org myorg --test-level RunLocalTests --wait 30`
- [x] Last dry-run Deploy ID: `0AfSo0000037t65KAA` (Succeeded; 0 failures; no coverage warning)
- [x] REAL deploy ID: `0AfSo0000037w2LKAQ` (Succeeded; 42 tests; 0 failures; 0 coverage warning)

## 2) Post-deploy Salesforce config
- [x] Create/update `QB_Integration_Settings__c` org default record:
  - [x] `Middleware_Endpoint__c = https://sqint.atocomm.eu`
  - [x] `API_Key__c = UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=`
  - [x] `QB_Realm_ID__c = 9130354519120066`
- [ ] Verify Remote Site Setting `QuickBooksMiddleware` → `https://sqint.atocomm.eu` (should be deployed by `deploy_temp/`).

## 3) Middleware deployment
- [x] Backup current `/opt/qb-integration/` on `pve.atocomm.eu:2323` → `/home/roman/qb-integration.backup.20251229_093313`.
- [x] Copy `deployment/sf-qb-integration-final/src` + `package.json` to `/opt/qb-integration/` (exclude/remove `tests/`).
- [x] Restart `node src/server.js`, confirm process is running (skipped `npm install` due to root-owned `node_modules/`).
- [ ] Health check:
  - [x] `curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health`

## 0) One-shot helper (safety gate)
- [ ] `CONFIRM_DEPLOY=YES ./scripts/option_a_after_payment_deploy.sh`

## 4) End-to-end verification
- [ ] Run 3–5 internal test Opportunities (QB invoice id populated; payment link may be null if QB Payments disabled).
- [ ] Roman runs 20-Opportunity verification; capture any failures + Opportunity IDs.
- [ ] If failures: check `QB_*` diagnostic fields (status/error/correlation/skip reason) and fix (up to 3 cycles).
