# Unified Demo – Integration Audit (Scout)

## Objective
Survey the `wfm-integration` prototype to capture layout, navigation, and auth patterns we can borrow for the unified shell, while flagging iframe-based module wrappers we must avoid.

## Key Findings
- **Sidebar + top-bar frame.** `AdminLayout.tsx` wires the exact four-module chrome (Forecasting/Расписание/Сотрудники/Отчёты) with responsive sidebar behaviour and a sticky header (`/Users/m/Documents/wfm/main/intelligence/naumen/demo of early prototypes based on html/naumen/wfm-integration/src/layouts/AdminLayout.tsx:43-129`). The sidebar width collapses via `sidebarOpen` and mobile menu toggles through Redux actions, giving us a reusable shell skeleton.
- **Role-aware navigation.** `AdminNavigation.tsx` builds the primary nav array and filters entries by role before rendering `<NavLink>` items (`.../src/components/Navigation/AdminNavigation.tsx:29-103`). Managers automatically lose access to Forecasting (`includes('forecasting')` guard at line 65), illustrating a pattern for menu gating without extra router wrappers.
- **Protected route redirect rules.** The `ProtectedRoute` component centralises auth checks and redirects users lacking roles to either `/employee` or `/admin` (`.../src/auth/ProtectedRoute.tsx:11-25`). This is the lightest-weight guard we can adapt without pulling Redux itself.
- **Demo-user auth scaffolding.** `authSlice.ts` bundles demo accounts, modules, and helper functions (`validateLogin`, `getModuleAccess`) so a fake login drive can swap available modules (`.../src/store/authSlice.ts:29-133`). The login form exposes one-click credential fills and spinner UI (`.../src/auth/LoginPage.tsx:47-167`), useful for parity smoke flows.
- **UI state management.** `uiSlice.ts` tracks sidebar width, mobile drawer, and active module title (`.../src/store/uiSlice.ts:3-55`). Even if we do not adopt Redux, the state shape is a ready-made checklist for shell behaviour.

## Borrow vs. Avoid
| Pattern | Action | Evidence |
| --- | --- | --- |
| Sidebar layout & header toggles | **Borrow** – the JSX structure and Tailwind classes map directly to Naumen screenshots | `AdminLayout.tsx:43-107` |
| Role-gated nav items | **Borrow** – filter logic is concise and matches real roles | `AdminNavigation.tsx:29-70` |
| Demo login + credential presets | **Borrow (optional)** – handy for smoke flows; can be ported without Redux | `LoginPage.tsx:29-167` |
| Module iframe wrapper | **Avoid** – embeds external modules via `<iframe>` and sandbox flags, which we must not bring into the pilot | `ModuleWrapper.tsx:64-93` |
| Tailwind design tokens | **Borrow selectors/colors** – primary palette already matches RU demos | `tailwind.config.js:3-29` |
| Vercel config | **Extend** – current file lacks SPA rewrites; use its structure but add our `/index.html` fallback | `vercel.json:1-5` |

## Screens & Behaviour Notes
- Sidebar branding + avatar block already uses Lucide icons with Russian labels, matching live Naumen chrome (`AdminNavigation.tsx:71-135`).
- Mobile behaviour uses `setMobileMenuOpen` with overlay and slide-in transitions (`AdminLayout.tsx:43-63`).
- Top bar nests both hamburger triggers (mobile + desktop) and shows user info, aligning with the screenshot callouts (`AdminLayout.tsx:68-101`).

## Open Questions
- We need to decide whether to port the Redux slices as-is or reproduce the state machine locally (context/provider) so we avoid a heavy dependency just for menu toggles.
- `AdminLayout` currently renders iframe wrappers for each module route; we must replace those with our package roots when we wire Employees/Schedule/Forecasts/Reports.
- Confirm whether the login screen should live inside the unified repo or remain a coordinator-only asset.

## Recommendations for Planner/Executor
1. Port the `AdminNavigation` item list + filtering logic into the unified shell, swapping `<ModuleWrapper>` routes for package `Root` components.
2. Recreate `ProtectedRoute` semantics around whatever auth mock we keep so Forecasts/Reports links can be gated per role.
3. Introduce a `vercel.json` rewrite block mirroring other demos (`[{ "source": "/(.*)", "destination": "/index.html" }]`) since the reference file omits it.
4. If Redux is out of scope, mirror the state structure from `uiSlice` in a lightweight context to preserve sidebar collapse + mobile behaviour.

_Collected by unified-demo-exec-2025-10-13-codex (Scout)._ 
