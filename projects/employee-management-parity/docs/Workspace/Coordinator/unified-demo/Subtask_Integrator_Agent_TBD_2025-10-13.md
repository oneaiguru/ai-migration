## Subtask — Unified Demo Integrator (Executor)

Agent Header
- Agent: unified-demo-exec-2025-10-14-codex
- Role: Executor
- Demo: Unified (Employees + Scheduling)
- Repo: ${UNIFIED_DEMO_REPO}
- Plan: plans/2025-10-14_unified-shell-top-nav.plan.md
- Outcome: Sidebar shell replaced with Naumen top navigation, secondary tab strip, RU header actions, schedule stubs, refreshed palette, docs & deploy updated.

Steps
- Capture colors/spacing from `/Users/m/Desktop/xds/*.png`; enumerate primary/secondary tab structure.
- Replace Admin shell with top navigation (`TopNavShell`) and mobile drawer; update navigation config/types.
- Implement secondary schedule tabs + placeholders; restyle module wrappers to span full width.
- Refresh Tailwind tokens, ship structure drawer placeholder, rebuild, deploy, and update documentation.

Outcome
- Shell boot still registers RU locale before render (`${UNIFIED_DEMO_REPO}/apps/shell/src/main.tsx:1-15`).
- Router now mounts through `App.tsx` with nested `ProtectedRoute`s and schedule sub-routes (`apps/shell/src/App.tsx:1-145`).
- Shell state + demo users handled via `ShellContext` (`apps/shell/src/state/ShellContext.tsx:11-77`, `.../auth/mockUsers.ts:3-34`); nav config + role filters live in `config/navigation.ts:1-40`.
- Top navigation + actions implemented via `TopNavShell` (`apps/shell/src/components/layout/TopNavShell.tsx:9-127`), `PrimaryNav` (`apps/shell/src/components/navigation/PrimaryNav.tsx:1-44`), `SecondaryNav` (`.../SecondaryNav.tsx:1-46`), and `HeaderActions` (`apps/shell/src/components/layout/HeaderActions.tsx:1-62`).
- Schedule stubs + full-width module wrapper align with new layout (`apps/shell/src/pages/SchedulePage.tsx:1-9`, `.../ScheduleStubPage.tsx:1-12`, `apps/shell/src/pages/EmployeesPage.tsx:1-9`).
- Placeholders share the refreshed panel styling (`apps/shell/src/pages/ModulePlaceholder.tsx:1-19`, `apps/shell/src/pages/NotFoundPage.tsx:1-18`).
- Tailwind config holds the new nav/shell palette (`tailwind.config.cjs:13-66`); global CSS sets the shell background (`apps/shell/src/index.css:1-35`).
- Latest production deploy: https://wfm-unified-demo-rd4u3hbbl-granins-projects.vercel.app (`npm run build` ✅, `vercel deploy --prod --yes` ✅, curl smoke on `/forecasts`, `/schedule/graph`, `/employees`, `/reports` → 200).

Acceptance (smoke)
- Header shows Прогнозы/Расписание/Сотрудники/Отчёты with RU actions (download, notifications, help, avatar); mobile nav drawer toggles correctly.
- Secondary schedule tabs render RU labels; `/schedule/graph` mounts Schedule package, other tabs show placeholders noting pending modules.
- Employees route mounts package full-width; Forecasts/Reports continue to show RU TODO copy.
- Demo-user switcher redirects to the first allowed route per role; unauthorized access redirects or surfaces notice.
- Deep links (`/forecasts`, `/schedule/graph`, `/reports`, etc.) resolve on the new deploy without console noise.
