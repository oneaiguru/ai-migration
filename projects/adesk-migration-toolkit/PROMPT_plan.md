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
- Build the local-only MigrateFlow web app described in `specs/adesk.md`, porting the PHP migration toolkit into a Next.js + Express + SQLite stack while keeping the legacy CLI intact.

Non-negotiables (customize):
- `specs/adesk.md` is the single source of truth for product scope and sequence.
- No external services; all auth, billing, and destination APIs are mocked locally.
- Keep existing PHP scripts and classes unchanged; port logic into new JS modules instead.
- Use Next.js 14 + Tailwind for frontend and Express + SQLite for backend.
- Preserve migration entity order and mapping behavior from `migrate.php` and `config.php`.
