# Plan — Unified Demo Shell Integration (Layout + Nav)

## Goal
Reshape the unified shell so it mirrors Naumen’s four-module chrome (Прогнозы/Расписание/Сотрудники/Отчёты), introduces lightweight role-aware navigation/auth scaffolding, and replaces the bare two-tab layout with a reusable frame that can host future packages.

## Required Reading
- docs/Workspace/Coordinator/unified-demo/README.md
- docs/Workspace/Coordinator/unified-demo/CodeMap.md
- docs/Tasks/unified-demo_integration-audit-scout-2025-10-13-codex.md
- docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md
- docs/Workspace/Coordinator/employee-portal/Visio_Scout_2025-10-14.md
- Reference repo: `/Users/m/Documents/wfm/main/intelligence/naumen/demo of early prototypes based on html/naumen/wfm-integration` (layouts/auth/navigation slices)

## Scope
- Shell layout (header, sidebar, responsive behaviour) within `apps/shell`
- Navigation config & role gating (mock auth)
- Top-level routes for Forecasts/Расписание/Сотрудники/Отчёты (Employees & Schedule wired to packages; Forecasts/Reports stubbed for now)
- SPA routing + Vercel rewrites to support deep links
- Tailwind/global styles needed for the layout visuals
- Documentation updates (CodeMap, Subtask outcome, tracker, handoff)

Out of scope: pulling Redux or iframe module wrappers from the reference, wiring real login persistence, implementing Forecasts/Reports package content.

## Implementation Tasks
1. **Shell State & Utilities**
   - Create a lightweight shell context (or simple hook) to track sidebar open state and active user meta. Seed mock users/roles using the structure from `wfm-integration/src/store/authSlice.ts:29-133` but without Redux.
   - Define a nav item array mirroring the reference order/labels with associated routes and required roles.

2. **Layout Components**
   - Implement a new layout component (e.g. `apps/shell/src/layouts/AdminShell.tsx`) that borrows markup/classes from `wfm-integration/src/layouts/AdminLayout.tsx:43-129` and `.../components/Navigation/AdminNavigation.tsx:71-135`, adjusted to mount React Router `NavLink`s without iframe wrappers.
   - Replace existing `App.tsx` content so routes render inside this layout; ensure sidebar toggle, mobile overlay, header controls (notifications placeholder, help link, avatar) use RU copy per vision doc.

3. **Routing & Stubs**
   - Extend routing to include `/forecasts`, `/schedule`, `/employees`, `/reports`, plus an index redirect and 404 catch-all.
   - Wire `/schedule` and `/employees` to the existing package `Root` components (retain basename prop). For `/forecasts` and `/reports`, create placeholder components with RU headings and TODO copy indicating future package integration.

4. **Role Gating & Auth Mock**
   - Introduce a simple login selector (e.g. dropdown or quick buttons) on a minimal `/login` route using patterns from `wfm-integration/src/auth/LoginPage.tsx:47-167`.
   - Ensure navigation hides disallowed routes and `useNavigate` redirects unauthorized access, following `ProtectedRoute` logic in `.../auth/ProtectedRoute.tsx:11-25`.

5. **Styling & Tailwind Adjustments**
   - Update `tailwind.config.cjs` and shell CSS to support the new layout classes (sidebar widths, text colours, backgrounds). Reuse the primary palette from `wfm-integration/tailwind.config.js:3-29` as needed.
   - Confirm body/root styles (per vision doc) no longer conflict with package CSS.

6. **Routing Infrastructure**
   - Add SPA rewrites in `vercel.json` (`[{ "source": "/(.*)", "destination": "/index.html" }]`) so deep links (e.g. `/reports`) resolve after deploy.
   - Verify `vite.config.ts` doesn’t need additional base adjustments.

7. **Validation & Docs**
   - Run `npm run build` (workspace root) and capture warnings/errors.
   - Deploy via `vercel deploy --prod --yes` and smoke `/forecasts`, `/schedule`, `/employees`, `/reports` for console errors and RU copy.
   - Update docs: `docs/Workspace/Coordinator/unified-demo/CodeMap.md`, `.../Subtask_Integrator_Agent_TBD_2025-10-13.md`, `docs/Tasks/post-phase9-demo-execution.md`, `docs/SESSION_HANDOFF.md` with new layout/auth details and deploy URL.

## Acceptance Criteria
- Unified shell shows the four RU modules with responsive sidebar/header; Employees & Schedule routes render existing packages without regression.
- Forecasts/Reports routes display RU placeholders and are hidden/blocked for unauthorized roles.
- Mock auth allows switching roles and demonstrates role-based nav gating.
- Tailwind build includes the required utilities; console free of errors in local dev and production.
- Deep links to each route resolve (no 404) thanks to SPA rewrites.
- Documentation updated to reflect new layout, routes, and auth scaffolding.

## Open Questions / Risks
- Decide whether the login experience belongs in prod deploy (even as a mock) or should be guarded behind a feature flag.
- Confirm final copy for notifications/help placeholders (vision doc lists components but not exact phrasing).
- Ensure packages’ global CSS doesn’t override the shell’s background/typography; may require namespace selectors.
