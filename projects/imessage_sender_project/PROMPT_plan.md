0a. Study AGENTS.md for repo guardrails.
0b. Study HANDOFF_CODEX.md for loop-specific constraints.
0c. Study PROJECT_BRIEF.md for the single source of truth on goal/context.
0d. Study project specs (specs/* or docs/specs/*) and `imessage.md`.
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
- Plan the iCampaign Pro build and backlog using `imessage.md` as the primary spec.

Non-negotiables (customize):
- `imessage.md` is the source of truth for product scope.
- macOS-only; continue using AppleScript + Messages.app.
- No App Store distribution or external services.
- Reuse existing core modules where possible; avoid regressions in current behavior.
