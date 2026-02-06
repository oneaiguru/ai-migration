## Unified Demo Code Map — Shell + Packages

**Meta**
- Repo `${UNIFIED_DEMO_REPO}` tracked by plan `plans/2025-10-14_unified-shell-top-nav.plan.md`.
- Root workspace scripts live in `package.json:1`; build output targets `apps/shell/dist` per `vercel.json:1-11`.
- Latest production deploy: https://wfm-unified-demo-rd4u3hbbl-granins-projects.vercel.app.

**Shell**
- RU locale registrars still execute before render (`apps/shell/src/main.tsx:1-15`).
- React Router nests all modules under the new top-nav layout (`apps/shell/src/App.tsx:1-145`), redirecting `/schedule` to `/schedule/graph` and exposing stub routes for secondary tabs.
- Shared shell state + mock auth are provided by `ShellContext` (`apps/shell/src/state/ShellContext.tsx:11-77`) backed by demo users (`apps/shell/src/auth/mockUsers.ts:3-34`).
- Nav data now models primary + secondary tabs with role filtering (`apps/shell/src/config/navigation.ts:1-40`, `apps/shell/src/types.ts:1-45`).
- Layout chrome renders the Naumen-style header and secondary strip via `TopNavShell` (`apps/shell/src/components/layout/TopNavShell.tsx:9-127`), `PrimaryNav` (`apps/shell/src/components/navigation/PrimaryNav.tsx:1-44`), `SecondaryNav` (`apps/shell/src/components/navigation/SecondaryNav.tsx:1-46`), and `HeaderActions` (`apps/shell/src/components/layout/HeaderActions.tsx:1-62`).
- The mock "Рабочая структура" drawer placeholder lives inside `TopNavShell` and toggles through `ShellContext`.
- `/login` hosts the role selector and notices for employee-only users; it now derives fallbacks from `getPrimaryNavForRole` (`apps/shell/src/pages/LoginPage.tsx:1-94`).
- Route-level gating handled via `ProtectedRoute` (`apps/shell/src/routes/ProtectedRoute.tsx:1-41`); unauthorized roles fall back to the first permitted module.
- Forecasts/Reports placeholders use the updated full-width component (`apps/shell/src/pages/{ForecastsPage.tsx,ReportsPage.tsx}`, `apps/shell/src/pages/ModulePlaceholder.tsx:1-19`).
- Schedule secondary routes render `SchedulePage` for `/schedule/graph` and stubs via `ScheduleStubPage` (`apps/shell/src/pages/SchedulePage.tsx:1-9`, `apps/shell/src/pages/ScheduleStubPage.tsx:1-12`).

**Styling**
- Tailwind base + utilities updated to the new shell palette (`apps/shell/src/index.css:1-35`).
- `tailwind.config.cjs:13-66` introduces `shell.*`, `nav.*`, and `secondary.*` tokens along with `shadow-shell-header`; component classes (`bg-nav-background`, `text-shell-ink`, etc.) map directly to screenshot samples.
- Embedded packages mount inside neutral panels using `shadow-shell` (`apps/shell/src/pages/{SchedulePage.tsx:1-9,EmployeesPage.tsx:1-9}`).
**Packages**
- Employee Management exports `Root` + `setupRU` via `packages/employee-management/src/index.ts:1`; main mount `packages/employee-management/src/Root.tsx:1`.
- Schedule exports `Root` + `setupRU` via `packages/schedule/src/index.ts:1`; schedule mount keeps `basename` support (`packages/schedule/src/Root.tsx:1`).

**Build & Deploy**
- Commands: `npm install`, `npm run build`, `vercel deploy --prod --yes`.
- Vite build emits the expected >500 kB warning because both packages bundle (`npm run build` output OK 2025-10-14).
- SPA rewrites keep deep links resolving after deploy (`vercel.json:6-10`).

**Open Gaps**
- Forecasts/Reports modules remain TODO stubs until dedicated packages land.
- Schedule secondary tabs (Смены/Схемы/…) render placeholders until their packages arrive.
- Auth still uses in-memory demo accounts; persistence/real login deferred per plan.
