0a. Study AGENTS.md for repo guardrails.
0b. Study HANDOFF_CODEX.md for loop-specific constraints.
0c. Study PROJECT_BRIEF.md for the single source of truth on goal/context.
0d. Study product specs: `~/Downloads/qbsfsaas.md` (primary) and `specs/README.md` (legacy index).
0e. Study IMPLEMENTATION_PLAN.md (it may be stale or incorrect).
0f. Study the relevant source tree (`syncflow/` once created, or existing `src/` for the middleware).

1. Plan only. The plan loop produces high-level goals aligned to specs; it does not draft implementation plans.
Do not implement anything. Do not assume functionality is missing; verify with code search first.
Plan loop output is only IMPLEMENTATION_PLAN.md.

IMPORTANT:
- Plan only. No code changes in this loop.
- Prefer single sources of truth. Avoid duplicate or adapter implementations.
- If specs are missing or inconsistent, note it in the plan and ask for direction.

Project goal:
- Build SyncFlow, a local-only micro-SaaS that turns the existing QB/SF integration into a self-serve CRM-to-accounting automation product.

Non-negotiables (customize):
- Localhost only; no external services or real API calls.
- Follow the SyncFlow spec in `~/Downloads/qbsfsaas.md`.
- Use Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, Zustand.
- Keep existing integration code and Salesforce metadata unchanged unless explicitly tasked.
