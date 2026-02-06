# Agent Start Here

Purpose: align a new agent quickly on repo context, current status, and where to write updates.

## Read Order (10 minutes)
1. `AGENTS.md` — commands + guardrails
2. `docs/System/Overview.md` — system scope, demo defaults, endpoints
3. `docs/System/Onboarding.md` — setup + sample delivery
4. `docs/System/Repo_Layout.md` — code map
5. `docs/System/Testing.md` + `docs/System/Spec_Sync.md` — test/spec gates
6. `docs/SESSION_HANDOFF.md` — latest entry for current status
7. `docs/Tasks/TASKS_OPEN.md` — current queue
8. `docs/Tasks/NEXT_AGENT_BRIEF.md` — only if it matches the current sprint
9. `reviews/README_STATUS.md` — only when demo/tunnel work is in play

## Stable vs Dynamic Docs
- Stable (update rarely): `README.md`, `docs/System/*`, `specs/*`, `docs/ADR/*`.
- Dynamic (update every session): `docs/SESSION_HANDOFF.md`, `docs/Tasks/TASKS_OPEN.md`, `reviews/README_STATUS.md`, `reviews/NOTES/*`.

## Where to Record Work
- Summary + validation: append to `docs/SESSION_HANDOFF.md`.
- Evidence/curls: `reviews/NOTES/*` and `reviews/README_STATUS.md` (demo/tunnel only).
- Task changes: update `docs/Tasks/TASKS_OPEN.md`.

## Archived
- Rolling-cutoff demo task specs: `docs-internal/archive/rolling-cutoff-demo/`.

## Guardrail Reminder
- Keep default forecasts unchanged unless explicitly instructed; use `docs/System/Golden_Bump.md` when needed.
