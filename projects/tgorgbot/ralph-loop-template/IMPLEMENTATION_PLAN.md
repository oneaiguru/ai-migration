# IMPLEMENTATION_PLAN

Project goal:
- Deliver the SanghaDesk MVP: a local-first Telegram inbox dashboard for spiritual teachers with auth, onboarding, messaging, settings, pricing, and a working Telegram relay flow.

P0
- [ ] Scope and acceptance criteria agreed from `PROJECT_BRIEF.md` (until specs exist): user roles, onboarding/auth (mocked), inbox/dashboard flows, settings, pricing/checkout with mock payments, and out-of-scope items.
- [ ] Domain model and API boundaries agreed for local-only storage (SQLite) and Telegram relay integration, including what tgorgbot relay code will be reused.
- [ ] Repo structure and dev workflow agreed (frontend/backend/shared/data, single `npm run dev`) to align implementation boundaries.

P1
- [ ] Localization and responsive UX requirements agreed (RU primary, EN fallback), including copy sources.
- [ ] MVP validation approach agreed (smoke flows, relay end-to-end, local persistence) aligned to available tooling.

Notes
- Specs are missing beyond a placeholder (`specs/README.md`); the plan treats `PROJECT_BRIEF.md` as the current source of truth until specs are created.
- No source tree found under `apps/`, `packages/`, `src/`, `frontend/`, `backend/`, `shared/`, or `data/` at repo root; confirm where existing code lives.
- `AGENTS.md` and `HANDOFF_CODEX.md` include placeholders that need project-specific values.
