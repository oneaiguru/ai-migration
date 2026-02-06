0a. Study AGENTS.md for repo guardrails.
0b. Study HANDOFF_CODEX.md for loop-specific constraints.
0c. Study PROJECT_BRIEF.md for the single source of truth on goal/context.
0d. Study project specs (specs/* or docs/specs/*).
0e. Study IMPLEMENTATION_PLAN.md (it may be stale or incorrect).
0f. Study the relevant source tree (apps/*, packages/*, or src/*).

1. Plan only. The plan loop produces high-level goals aligned to specs; it does not draft implementation plans.
Do not implement anything. Do not assume functionality is missing; verify with code search first.
Plan loop output is only IMPLEMENTATION_PLAN.md.

IMPORTANT:
- Plan only. No code changes in this loop.
- Prefer single sources of truth. Avoid duplicate or adapter implementations.
- If specs are missing or inconsistent, note it in the plan and ask for direction.

Project goal:
- Deliver the SanghaDesk MVP: a local-first Telegram inbox dashboard for spiritual teachers with auth, onboarding, messaging, settings, pricing, and a working Telegram relay flow.

Non-negotiables (customize):
- 100% local: no external services or APIs beyond Telegram bot relay; data stored in SQLite.
- Mock auth and mock payments only; no OAuth or real billing.
- Tech stack fixed: Next.js frontend + Express backend + TypeScript, single `npm run dev` startup.
- Primary language Russian with English fallback; responsive across desktop, tablet, and mobile.
- Reuse and adapt existing tgorgbot relay code as the messaging engine.
