## Plan — Unified Demo Pilot (Employees + Scheduling)

Goal
- Create a single repo that mounts two existing demos — Employee Management and Scheduling — under one shell with separate routes so it looks like a single product for UAT. Keep code duplication minimal and prepare for adding more demos later.

Scope (pilot)
- Two demos only: Employee Management and Scheduling.
- Shell app with navigation and routes: `/employees`, `/schedule`.
- Do not re‑style or alter behaviour; visuals frozen. Behaviour parity remains per UAT loop.

Repo & Workspace
- New repo: `${UNIFIED_DEMO_REPO}` (Vite + React + TS)
- Workspace layout (npm or pnpm workspaces):
  - `apps/shell` — unified shell (React Router, RU registrar at root)
  - `packages/employee-management` — copied from `${EMPLOYEE_MGMT_REPO}` (trimmed app)
  - `packages/schedule` — copied from `${SCHEDULE_REPO}` (trimmed app)
  - `packages/shared-charts` — RU registrar + formatters + tokens (extracted, optional in pilot)

Mounting strategy (pilot)
- Each demo package exports a mountable `Root` component and a `setupRU()` registrar.
- Shell routes lazy‑load package `Root` components and call `setupRU()` once at app start.

Tasks
1) Bootstrap workspace
   - Create repo `${UNIFIED_DEMO_REPO}` with workspaces enabled.
   - Add `apps/shell` (Vite) + `packages/*` folders and root tsconfig.
2) Copy demos (pilot copy)
   - Copy minimal app code for Employee Management and Scheduling into `packages/employee-management` and `packages/schedule`.
   - Remove demo‑only routes; expose `export function Root()` from each package and ensure `setupRU()` is invoked from shell.
3) Shell routes
   - Add routes `/employees` → `packages/employee-management/Root`, `/schedule` → `packages/schedule/Root`.
   - Add top nav and favicon/title.
4) Build & Dev
   - Add root scripts: `dev`, `build`, `preview` to run workspaces via the shell.
   - Ensure imports resolve; dedupe deps where possible.
5) Docs & UAT
   - Add unified CodeMap in this repo: `docs/Workspace/Coordinator/unified-demo/CodeMap.md` (routes, packages, registrar, deps).
   - Add UAT: quick smoke that both routes render without console errors and look cohesive (copy only).

Acceptance (pilot)
- One Vercel deploy for `${UNIFIED_DEMO_REPO}` with two routes `/employees` and `/schedule`.
- No console errors on either route; RU locale loaded; visuals unchanged.
- UAT agent confirms “looks like a single product” (nav + shared shell). No behaviour regression.

Team & Sequencing
- Integrator (1): creates workspace + shell; wires routes and RU registrar.
- Prep agents (2, parallel): 
  - Employee Management prep: export `Root`; remove hardcoded top routers; ensure `setupRU` isolated.
  - Scheduling prep: export `Root`; ensure day/period + overlays work under a basename route.
- Orchestrator: tracks progress, runs auto‑review, coordinates first deploy.

Risks & Mitigation
- Dependency duplication: mitigate with workspace hoisting and a shared charts registrar.
- CSS collisions: isolate package CSS or namespace shell styles; verify with UAT smoke.
- Router basename issues: ensure each `Root` respects shell routing; avoid internal BrowserRouter.

Follow‑ups (post‑pilot)
- Add remaining demos (Analytics, Forecasting) as packages.
- Extract `packages/shared-charts` and `packages/shared-ui` to remove duplication.
- Add unified UAT packs covering cross‑route navigation and shared RU registrar.

