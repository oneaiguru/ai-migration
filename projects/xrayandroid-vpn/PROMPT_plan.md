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
- Plan the FreeGate VPN localhost demo (Next.js UI + Node/SQLite mock API) based on `vpn-saas-spec.md`, preserving existing Android assets.

Non-negotiables (customize):
- `vpn-saas-spec.md` and `PROJECT_BRIEF.md` are the sources of truth.
- Localhost only; no external services or network dependencies.
- Keep `android/` assets unchanged.
- Use the specified stack: Next.js, Tailwind CSS, Node.js, SQLite.
- Break work into tasks small enough for one loop.
