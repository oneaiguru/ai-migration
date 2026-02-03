# AGENTS

## Read First
- `PROGRESS.md` (current role + task pointer).
- If you are planning/executing a task, start from `tasks/` and `plans/`.

## Summary
- Salesforce ↔ QuickBooks integration project with Node.js middleware (`src/`), PKCE flows/scripts, and Salesforce metadata/deployment bundles (force-app, deployment-package*, sf-deploy, sfdx-deploy, DEMO_PACKAGE).

## Install & Run
- Requires Node 18+ and npm.
- Copy `.env.example` to `.env` and fill Salesforce/QuickBooks credentials plus server settings.
- Install deps: `npm install`.
- Start dev: `npm run dev`; start server: `npm start`.

## Tests
- No automated tests provided; none run for this import slice (multiple app variants included, node_modules excluded).

## Dependencies
- npm: express, axios, jsforce, node-quickbooks, node-cron, helmet, cors, dotenv, winston; dev: nodemon.
- External: Salesforce org credentials and QuickBooks API keys per docs.

## Docs & Notes
- Read `README.md`, `.claude/`, `ai-docs/`, `AI Docs/`, and `specs/` for architecture, prompts, and deployment plans.
- Quick references: `ai-docs/INTEGRATION_OVERVIEW.md`, `ai-docs/RUNBOOK_MONITORING.md`, `ai-docs/TESTING_GUIDE.md`, `ai-docs/DECISIONS_AND_RELEASE_NOTES.md`.
- Middleware code lives in `src/`; additional variants and demos live under `deployment*/`, `DEMO_PACKAGE/`, `automated-integration/`, `final-integration/`, `deployment/sf-qb-integration-final/`, etc.
- PKCE workflow scripts live under `PKCE/fresh-integration/fresh-integration/scripts/`; API gracefully degrades if missing.
- Salesforce metadata is under `force-app/`, `deployment-package*/force-app/`, `sf-deploy/force-app/`, and `sfdx-deploy/force-app/`.
- Token storage paths: `data/tokens.json` (sample) and `data/sf_verifier.json` (generated at runtime).
- Store real credentials only in gitignored `SECRETS.local.md` and `.env`; use `SECRETS.local.example.md` as the template. Node_modules and binaries/zips are excluded from the import.

## Agent Roles, Magic Prompts, and Handoff
Magic prompts (authoritative copies):
- Simple: `/Users/m/ai/projects/forecastingrepo/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`
- Research: `/Users/m/ai/projects/forecastingrepo/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
- Plan: `/Users/m/ai/projects/forecastingrepo/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
- Execute: `/Users/m/ai/projects/forecastingrepo/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md`

Roles
- Scout: read Simple + Research prompts, capture file:line evidence, write task brief in `tasks/`.
- Planner: read Simple + Plan prompts, produce sed-friendly plan in `plans/`.
- Executor: read Simple + Execute prompts, implement plan and update `PROGRESS.md`.

Tasks/Plans mapping
- Tasks: `tasks/*.md` (single task briefs with file:line anchors).
- Plans: `plans/*.plan.md` (planner output; include commands + validation steps).

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.

## Current QB/SF Middleware Status (2026-01-10)
- Code changes (local): `deployment/sf-qb-integration-final/src/services/quickbooks-api.js` (removed unsupported CurrencyRef in Item/Customer queries; FX fallback today→yesterday; duplicate-customer flow clean), `src/routes/api.js` (uses TxnDate for FX when present), `PROGRESS.md`, `HANDOFF.md`.
- Added lint/tests: `scripts/lint_qbo_queries.js` + npm script `lint:qbo`; Jest cases for FX fallback and duplicate existing-customer path.
- Server deploy: `/opt/qb-integration/src/services/quickbooks-api.js` and `/opt/qb-integration/src/routes/api.js`; last backup `20260110-020102`; restart via nohup (pm2 absent); health 401 without API key.
- Tests (local): `npm run lint:qbo` pass; `npm test` all suites pass after updates. USD duplicate Opp 006So00000Y4ZDKIA3 succeeded (QB_Invoice_ID__c=2604). EUR today still lacks rate; fallback uses yesterday.
- Timezones/FX: Server TZ CET (UTC+1), dev HK (UTC+8), QBO likely US/Pacific. If today’s rate missing, fallback uses yesterday; if both missing, FX_RATE_MISSING. For EUR tests, set TxnDate to a date with a known rate (e.g., 2026-01-09); do not add new rates.
