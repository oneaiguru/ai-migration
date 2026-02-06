# Handoff – QB/SF Middleware (2026-01-10)

## Repo code state
- Files touched this session (local repo):
  - `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
    - Removed unsupported `CurrencyRef` usage in Item/Customer queries.
    - Added FX fallback: if rate is missing, retry the prior day (applies both when `asOfDate` is provided and when it is omitted).
    - Cleaned item selection to avoid schema errors; duplicate-customer flow now resolves cleanly.
    - Added cross-entity name-conflict detection (Vendor/Employee/OtherName), inactive exact-match lookup for Customers, and optional auto-suffix creation when conflicts exist.
    - New error code for conflicts when auto-suffix is disabled: `QB_NAME_CONFLICT` (HTTP 422).
    - Removed `CurrencyRef` from Customer lookup queries to satisfy QBO lint rules; currency is resolved via follow-up customer fetch when needed.
  - `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`
    - Uses `TxnDate` when present to drive FX lookup (falls back to today/yesterday logic in `quickbooks-api.js`).
  - `projects/qbsf/deployment/sf-qb-integration-final/src/config/index.js`
    - Added `QB_DUPLICATE_NAME_AUTOSUFFIX` (default false) and `QB_DUPLICATE_NAME_SUFFIX` (default ` (SF)`) under QuickBooks config.
  - `projects/qbsf/deployment/sf-qb-integration-final/tests/quickbooks-customer-duplicate-name.test.js`
    - Added inactive-match, vendor-conflict, and auto-suffix coverage.
  - `projects/qbsf/PROGRESS.md` updated with deploy/test notes.
- Uncommitted changes: handoff + progress updates + new lint script + updated tests.
- Tests/lint added: QBO query denylist lint (`scripts/lint_qbo_queries.js`, `npm run lint:qbo`), new Jest cases for FX fallback and duplicate resolution.

## Server state (pve.atocomm.eu:2323, user roman)
- Deployed files (from `projects/qbsf/deployment/sf-qb-integration-final`):
  - `/opt/qb-integration/src/services/quickbooks-api.js`
  - `/opt/qb-integration/src/routes/api.js`
  - `/opt/qb-integration/src/config/index.js` (added duplicate-name autosuffix config flags)
- Deployed after backup `20260114-010358` (latest).
- Process: pm2 absent. Running via nohup: `node src/server.js` (last seen PID 125269) from `/opt/qb-integration`.
- Restart method used: `pkill -f '[n]ode .*server.js' || true; cd /opt/qb-integration && nohup node src/server.js >> /opt/qb-integration/server.log 2>&1 &`
- Health: `curl -s -o /dev/null -w "%{http_code}\\n" https://sqint.atocomm.eu/api/health` → `401` (expected without API key).
 - 2026-01-14 deploy: backup `20260114-010358`, copied `services/quickbooks-api.js` + `config/index.js`, restarted via pkill+nohup, health 401.

## Backups on host
- `20260110-074625`: full `src`, `package.json`, `package-lock.json`, `.env`, manifest.
- `20260110-020102`: full `src`, `package.json`, `package-lock.json`, `.env`, manifest (sha256 of api.js and quickbooks-api.js).
- Earlier backups (still present): `20260110-073745`, `20260110-013512`.
  - Paths: `/opt/qb-integration/backups/<timestamp>/`
 - `20260114-010358`: full `src`, `package.json`, `package-lock.json`, `.env`, manifest (sha256 of quickbooks-api.js and config/index.js).

## Tests/executions (manual)
- USD duplicate test (post-fix): Opp `006So00000Y4ZDKIA3` → `QB_Sync_Status__c=Success`, `QB_Invoice_ID__c=2604`, no errors; log shows `Found existing customer in QuickBooks by exact name match` (e.g., lines ~2480+ in server.log).
- EUR tests:
  - Opp `006So00000Y4mC9IAJ` (EUR) → `HTTP_ERROR`, `FX_RATE_MISSING` (EUR→USD 2026-01-10 missing), `QB_Invoice_ID__c=null`.
  - Prior EUR: `006So00000Y4PnSIAV` similar FX_RATE_MISSING.
- FX fallback verified via direct call: no rate for 2026-01-10; yesterday (2026-01-09) returns 1.163467. Fallback now returns prior-day rate when today is absent (even when `asOfDate` is provided).
- 2026-01-10: `npm run lint:qbo` pass; `npm test` 13/13 suites (61 tests) passing (added asOfDate-aware FX fallback coverage).
- 2026-01-13: `npm run lint:qbo` pass; `npm test` 13/13 suites (64 tests) passing (added duplicate-name conflict coverage).
- 2026-01-14: Host `npm test` failed in `/opt/qb-integration` because `/opt/qb-integration/backups` contains duplicate `package.json` names (jest-haste-map collision) and no tests are present on the host.
- 2026-01-14: Host tests run from `/tmp/qb-integration-test` (copied `src/` + `tests/`, symlinked `node_modules` from `/opt/qb-integration`): `npm test` 13/13 suites, 64 tests passing.
- 2026-01-13: `npm run lint:qbo` pass; `npm test` 13/13 suites (64 tests) passing (added duplicate-name conflict coverage).
- 2026-01-10: Health check `curl -s -o /dev/null -w "%{http_code}\\n" https://sqint.atocomm.eu/api/health` → `401` (expected without API key) after deploy.
- 2026-01-10: USD duplicate runtime re-check — Opp `006So00000Y534vIAB` (Account=testiruem, Currency=USD, Email_for_invoice__c set, Stage=Proposal and Agreement, OLI qty=1 TotalPrice=100, PricebookEntryId=01uSo000006KfunIAC) → `QB_Sync_Status__c=Success`, `QB_Invoice_ID__c=2605`, payment link populated.
- 2026-01-10: EUR runtime re-check with TxnDate=today using fallback — Opp `006So00000Y57LRIAZ` (Account=testiruem, Currency=EUR, Email_for_invoice__c set, Stage=Proposal and Agreement, OLI qty=1 TotalPrice=100, PricebookEntryId=01u0600000beGIoAAM) → `QB_Sync_Status__c=Success`, `QB_Invoice_ID__c=2606`, payment link populated; prior-day (2026-01-09) rate used automatically because today’s rate missing.
- Duplicate-resolution log grep: latest entries include
  - `2026-01-10T00:29:53.667Z Found existing customer in QuickBooks by exact name match`
  - `2026-01-10T01:04:13.925Z Found existing customer in QuickBooks by exact name match`
- Lint/tests (local): `npm run lint:qbo` (pass). `npm test` (all 13 suites pass after updates). New tests: FX fallback (today missing -> yesterday; asOfDate provided missing -> prior day; both days missing -> null) and duplicate existing-customer path. Server-side mock FX check: `getExchangeRate(EUR,USD)` with no date → 1.163467 (yesterday); today explicit → null; yesterday explicit → 1.163467.

## Known issues/risks
- FX data gap: QBO lacks EUR→USD rate for today (2026-01-10). Fallback uses prior day even when `asOfDate` is provided; if both today and prior day lack a rate, `FX_RATE_MISSING` persists. Requires adding the rate in QBO Currency Center for the invoice date.
- No process manager: node runs via nohup; no pm2/systemd. A crash requires manual restart.
- Health endpoint requires API key; unauthenticated returns 401 (expected).

## Next actions (recommended)
1) Ensure TxnDate-aware FX lookup on server matches repo (api.js already deployed with TxnDate logic).
2) Keep QBO query denylist lint in CI (`npm run lint:qbo`).
3) Keep/extend Jest tests for duplicate resolution and FX fallback; ensure CI runs `npm test`.
4) Ensure QBO Currency Center has rates for currencies used (today’s date, and for backdated TxnDate when applicable).
5) Consider adding a simple systemd service for `node src/server.js` to survive reboot.

## Useful commands (no passwords)
- SSH: `ssh -p 2323 roman@pve.atocomm.eu`
- Backup template: `ts=$(date +%Y%m%d-%H%M%S); mkdir -p /opt/qb-integration/backups/$ts && cp -a /opt/qb-integration/src /opt/qb-integration/backups/$ts/ && cp -a /opt/qb-integration/package.json /opt/qb-integration/package-lock.json /opt/qb-integration/.env /opt/qb-integration/backups/$ts/ && sha256sum /opt/qb-integration/src/services/quickbooks-api.js /opt/qb-integration/src/routes/api.js > /opt/qb-integration/backups/$ts/manifest.txt`
- Deploy (from repo root):  
  `scp -P 2323 projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js roman@pve.atocomm.eu:/opt/qb-integration/src/services/`  
  `scp -P 2323 projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js roman@pve.atocomm.eu:/opt/qb-integration/src/routes/`
- Restart node: `ssh ... "pkill -f 'node .*server.js' || true; nohup node /opt/qb-integration/src/server.js >> /opt/qb-integration/server.log 2>&1 &"`
- Health: `curl -s -o /dev/null -w "%{http_code}\\n" https://sqint.atocomm.eu/api/health` (401 expected without API key)
- Log grep (duplicate path): `grep -n 'Found existing customer\\|Resolved duplicate\\|Failed to look up customer after duplicate-name error\\|Finding or creating customer' /opt/qb-integration/server.log | tail -n 60`

## Environment notes
- Server timezone: CET (UTC+1); local dev HK (UTC+8); QBO realm timezone likely US/Pacific → early-day HK/CET may not have “today” rates yet.
- FX note: server “today” (CET) can precede QBO’s US/Pacific day. If today’s rate is missing, fallback uses yesterday (even when `asOfDate` is provided). For EUR tests, set `TxnDate` to a date that already has a rate (e.g., 2026-01-09) or rely on prior-day fallback; do not add new rates. Today’s EUR→USD (2026-01-10) is missing in QBO; yesterday exists.
- Endpoints: Middleware base `https://sqint.atocomm.eu`; health `/api/health` (API key required for 200).
- No pm2/systemd; nohup-run node only.

## Next agent checklist (ignore unrelated dirty files)
- Proceed despite dirty tree; do NOT touch/revert unrelated files—only qbsf paths.
- Lint/tests (run in `projects/qbsf/deployment/sf-qb-integration-final`):
  - `npm run lint:qbo`
  - `npm test`
  - Record outputs. No new FX rates—use existing data only.
- Runtime checks (no new rates):
  - Health: `curl -s -o /dev/null -w "%{http_code}\\n" https://sqint.atocomm.eu/api/health` → expect `401`.
  - USD duplicate: create a fresh Opp for customer “testiruem” (USD), Stage “Proposal and Agreement”; expect `QB_Sync_Status__c=Success`, `QB_Invoice_ID__c` populated, log shows “Found existing customer in QuickBooks by exact name match.”
  - EUR test: Stage change with Currency=EUR (TxnDate today) should succeed via prior-day fallback if yesterday’s rate exists; expect `QB_Sync_Status__c=Success` and invoice ID.
- Status on runtime checks: USD duplicate validated on Opp `006So00000Y534vIAB` (Success, Invoice 2605, payment link present); EUR re-check on Opp `006So00000Y57LRIAZ` succeeded (Invoice 2606, payment link present) via prior-day fallback; today’s EUR→USD rate still missing in QBO.
- If any code change is needed: take a timestamped backup on host, deploy `src/routes/api.js` and `src/services/quickbooks-api.js`, restart via nohup, then recheck health (401). Confirm host code matches repo after deploy.
- After checks, update `PROGRESS.md` and `HANDOFF.md` with lint/test outputs, runtime results (Opp IDs, currency, status, TxnDate), and keep timezone note (server CET, dev HK, QBO likely US/Pacific; today’s EUR→USD 2026-01-10 missing, yesterday exists).
