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
- Build the FleetPulse MVP (frontend + backend) per `specs/cortexfleet.md` using this repo as the base.

Non-negotiables (customize):
- Localhost-only; no external services or real payment processing.
- Tech stack: Next.js 14 + TypeScript + Tailwind; Flask + SQLite.
- Reuse alert rule patterns from `config/prometheus-rules.yml`.
- Reuse installer logic from `scripts/install_node_exporter.sh` and `scripts/install_windows_exporter.ps1`.
- Keep existing infrastructure assets intact unless a task explicitly requires changes.
