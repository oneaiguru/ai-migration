# IMPLEMENTATION_PLAN

Project goal:
- Build SyncFlow, a local-only micro-SaaS based on the existing QB/SF integration, following `~/Downloads/qbsfsaas.md`.

Guardrails (from AGENTS.md / HANDOFF_CODEX.md / PROJECT_BRIEF.md):
- Localhost only; no external services or real API calls.
- Use Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, Zustand.
- Keep existing integration code and Salesforce metadata unchanged unless explicitly tasked.
- Prefer single sources of truth; avoid duplicate or adapter implementations.

Current state (verified):
- `syncflow/` does not exist yet; the existing middleware lives under `src/` and must remain untouched.

High-level goals (ordered, spec-aligned):
1) Establish SyncFlow as a new `syncflow/` app with the required stack, isolating it from legacy middleware and metadata.
2) Define one authoritative data model (Prisma + SQLite) for users/orgs/connections/automations/syncs/subscriptions and drive local mocks, seed data, and API/UI from that single schema.
3) Implement the public journey (landing, pricing, docs/blog placeholders) and mocked auth/onboarding flow per the spec’s user journeys, keeping all flows local-only.
4) Deliver core workflows end-to-end with local mocks: connections (mock OAuth), automations (builder + list), dashboard stats, sync execution, sync history, and sync detail/retry.
5) Provide billing + settings experiences (mock checkout, subscription management, usage limits, team/admin/API keys) aligned to the pricing tiers and journeys in the spec.
6) Ensure UX completeness: responsive layouts, empty/loading/error states, and clear success/failure paths for each P0 journey.

Resolved decisions (to keep loops non-interactive):
- Visual system: follow the spec’s content and IA, but use non-default typography (e.g., `Space Grotesk` for headings + `Work Sans` for body) and a blue-forward palette anchored on `#3B82F6` with warm accents; avoid purple dominance and default stacks (Inter/Roboto).
- Architecture: keep legacy integration code and Salesforce metadata untouched; reimplement required flows as local mocks inside `syncflow/` without importing runtime modules from `src/`.
