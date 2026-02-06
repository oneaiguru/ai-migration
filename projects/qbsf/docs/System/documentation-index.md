# Documentation Index

Purpose
- Single map of where project docs and core code live for the Salesforce ↔ QuickBooks integration.
- Update this index when major paths change or new primary documents are added.

Start Here
- `README.md` — project overview, run steps, and entry points.
- `AGENTS.md` — contributor rules and workflow constraints.
- `COMPLETION_PLAN_V2.md` — master plan and phase checklist.
- `docs/COMPLETION_PLAN_V2_EXECUTION.md` — actionable, copy/paste plan aligned to phases.
- `PROGRESS.md` — running change log; append after each milestone.

Project Plans, Reports, and Handoffs
- Plans and status: `MASTER_PLAN.md`, `IMPLEMENTATION_PLAN.md`, `TARGETED_PLAN.md`, `NEXT_SESSION_ACTION_PLAN.md`.
- Status and handoffs: `HANDOFF_*`, `SESSION_*`, `NEXT_AGENT_*`, `COMPLETE_HANDOFF_*`, `URGENCY_*`, `FINAL_*`.
- Verification and testing: `E2E_INTEGRATION_TEST_PLAN.md`, `TESTING_*`, `FINAL_VERIFICATION_REPORT.md`.

SOPs and Runbooks
- Deployment instructions: `DEPLOYMENT_*`, `deployment_plan.md`, `deployment-guide.md`.
- OAuth and auth: `OAUTH_*`, `SF_CLI_AUTH_CHEATSHEET.md`.
- Demo scripts and guides: `DEMO-*`, `demo-*.md`, `demo-*.sh`.
- Follow-up notes and fixes: `CURRENCY_*`, `PAYMENT_*`, `P1_*`.

Core Code (Primary Paths)
- Salesforce metadata: `force-app/` (Apex classes, triggers, objects, layouts).
- Middleware (current target): `deployment/sf-qb-integration-final/src/` (Express server, routes, services, transforms).
- Runtime API entrypoints:
  - Salesforce side: `force-app/main/default/classes/*.cls`, `force-app/main/default/triggers/*.trigger`.
  - Middleware routes: `deployment/sf-qb-integration-final/src/routes/`.
  - Middleware services: `deployment/sf-qb-integration-final/src/services/`.
  - Mapping/transforms: `deployment/sf-qb-integration-final/src/transforms/`.

Alternate/Legacy Variants (Reference Only)
- Other code variants: `src/`, `automated-integration/`, `final-integration/`.
- Deployment bundles: `deployment-package*/`, `sf-deploy/`, `sfdx-deploy/`, `DEMO_PACKAGE/`.
- PKCE scripts: `PKCE/` (only needed for OAuth flow support).

Secrets and Credentials
- Use `.env` for local runtime settings (copy from `.env.example`).
- Store real credentials only in `SECRETS.local.md` (template: `SECRETS.local.example.md`).

Testing and Validation
- No automated test harness; follow `TESTING_*` and `E2E_*` docs.
- Salesforce tests: Apex test classes in `force-app/main/default/classes/*Test.cls`.
- Middleware checks: scripts under `test-*.sh` and `test-*.js` as applicable.

Change Workflow
- Track progress in `PROGRESS.md` after each milestone.
- Keep PRs small and follow `AGENTS.md` push rules (`scripts/dev/push_with_codex.sh`).
