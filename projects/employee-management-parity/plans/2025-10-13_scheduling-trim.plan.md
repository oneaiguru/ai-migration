# Scheduling Trim – Production Reference Build (Planner)

> Role: Planner (no code executed in this repo). Executor will perform changes in the scheduling code repo after approval.

Repo variables (see `docs/System/path-conventions.md`)
- `${SCHEDULE_REPO}` → Scheduling demo (code)
- `${EMPLOYEE_MGMT_REPO}` → This docs/library repo

Purpose
- Produce a trimmed, production‑ready reference of the Scheduling demo that preserves only MVP behaviours validated by UAT. Keep the current mock repo intact for ongoing development; create a separate trimmed repo and deploy it to Vercel for stakeholders and downstream demos.

Preconditions
- UAT (behaviour) passed for in‑scope checks on Scheduling; gate recorded at 60% reuse and “Isolated” in `docs/System/DEMO2_VALIDATION_GATE.md`.
- Defaults (confirm or override):
  1) Remove the “UI/UX” advanced page from production trimmed (default: remove)
  2) Remove the inert search field (“Поиск по навыкам”) from production trimmed (default: remove)
  3) Keep virtualization switch (“🚀 500+ сотрудников”), default Off (visible, non‑blocking)

Scope (what stays vs removed)
- Keep (MVP behaviours):
  - View tabs: Прогноз + план / Отклонения / Уровень сервиса
  - День/Период regrouping (adapter + time scale)
  - Σ / 123 overlays on Forecast + Plan only
  - KPI grid: Coverage, Service Level; Adherence = “—”
  - RU locale/formatting and clamps
  - Virtualization toggle (default Off)
- Remove (non‑MVP/dev):
  - “UI/UX” advanced page and any debug routes or panels
  - Storybook stubs, development stories, demo‑only sample pages
  - Inert controls (search field), console debugging, unused sample assets

Deliverables
- New repo (code‑only): `schedule-grid-system-prod` (final name can be `…-trimmed`).
- Vercel project: `schedule-grid-system-prod` (Production URL recorded in `docs/SESSION_HANDOFF.md`).
- Minimal mock dataset (non‑PII) and a concise `README.md` describing supported MVP behaviours.

Detailed Execution Steps (Executor)
1) Repository bootstrap
   - Create new repo `schedule-grid-system-prod` (private, code‑only)
   - Copy from `${SCHEDULE_REPO}` the minimal app code required for the main Scheduling screen
   - Exclude Storybook, local dev scripts, and staging assets
   - Ensure `registerCharts()` (RU registrar) is called at startup

2) Routes and surfaces
   - Remove “UI/UX” advanced page and any non‑MVP routes from the router/App entry
   - Ensure only the main Scheduling view is routed by default

3) Header controls
   - Keep: view tabs (Прогноз/Отклонения/SL), День/Период toggle, Σ/123 overlays (Forecast + Plan only)
   - Remove: search field control; do not render it in the trimmed build
   - Keep: virtualization switch; set default Off

4) Datasets and adapters
   - Ensure day→period aggregation adapter is included and used for the Период view
   - Ensure overlay series (headcount/FTE) derive from schedules mocks without PII

5) Data and assets
   - Replace large/mock datasets with a minimal representative sample
   - Remove unused images/attachments/assets not shown in trimmed UI

6) Tests/build
   - Keep a minimal smoke test (mount main page; confirm tabs and toggles present; RU formatting)
   - `npm ci && npm run build` must pass

7) Deploy
   - Create new Vercel project `schedule-grid-system-prod`
   - Deploy with `vercel deploy --prod --yes`
   - Record URL in `${EMPLOYEE_MGMT_REPO}/docs/SESSION_HANDOFF.md`

Validation (Executor + UAT)
- Behaviour parity: identical to UAT‑passed build (tabs, regrouping, overlays, KPI grid)
- No inert controls remaining; virtualization default Off
- RU formatting present; no console errors
- README lists supported behaviours and links back to the library repo

Rollback
- If trimmed build fails UAT: pause adoption; fix in `schedule-grid-system-prod` or revert stakeholders to the current Scheduling mock URL. No changes are made to `${SCHEDULE_REPO}`.

Risks/Notes
- Do not move or alter `${SCHEDULE_REPO}`; trimmed reference is separate
- If subsequent UAT reveals missing behaviour, patch the trimmed repo and redeploy

Owner Approvals (required before execution)
- Confirm defaults (UI/UX page removal, search removal, virtualization keep)
- Confirm repo name and Vercel project name
- Go/no‑go to proceed with execution

Handoff
- Log plan approval and final trimmed deploy URL in `${EMPLOYEE_MGMT_REPO}/docs/SESSION_HANDOFF.md`
