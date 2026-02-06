# IMPLEMENTATION_PLAN

Project goal:
- Build a localhost-only FreeGate VPN demo (Next.js UI + Node/SQLite mock API) per `vpn-saas-spec.md`, preserving existing Android assets.

Sources of truth and constraints:
- Primary specs: `vpn-saas-spec.md`, `PROJECT_BRIEF.md`.
- Localhost only; no external services or network dependencies.
- Use Next.js + Tailwind CSS + Node.js + SQLite.
- Keep `android/` assets unchanged.

Current state check:
- No web source tree found under `apps/`, `packages/`, or `src/`; plan assumes new web app/API scaffolding.

P0 (MVP, one-loop tasks)
- [ ] Scaffold Next.js + Tailwind UI and a Node/SQLite API surface with local-only config; add route shells for the spec-required pages (onboarding/auth, dashboard, servers, pricing, settings, account, admin).
- [ ] Create SQLite schema + seed data per `vpn-saas-spec.md`, using the database as the single source of truth for mock API responses.
- [ ] Implement onboarding + auth/guest flows with mock session handling and the corresponding auth/user endpoints from the spec.
- [ ] Implement VPN session simulation: connect/disconnect/status endpoints, quota/usage tracking, and dashboard UI states.
- [ ] Implement server browsing/selection: list, filters, details/config, favorites, and ping simulation endpoints + UI.
- [ ] Implement pricing/subscription + mock payment flows (plans, checkout, confirm/cancel) with UI that reflects plan state.
- [ ] Implement admin dashboard (stats, users, revenue, server health) with mock-backed API endpoints and UI.
- [ ] Document local run steps and the Ralph loop usage in README/docs.

P1 (Follow-up, one-loop tasks)
- [ ] Implement settings UI + persistence for protocol, DNS, kill switch, split tunneling, auto-connect, and related controls per spec.
- [ ] Implement account management details: profile, subscription info, devices, and usage history views.
- [ ] Implement support/help content (FAQ, contact, report problem, diagnostics placeholders) per spec.

Notes / questions:
- HANDOFF_CODEX.md appears to be a template with placeholders; confirm whether it should be customized as part of this project.
