# Ralph Loop Workflow

## Purpose
Keep the Ralph loop as the primary workflow while adopting the R/P/I cadence for build implementation.

## Definitions
- Task: A backlog item in `IMPLEMENTATION_PLAN.md` (source of truth) materialized into `docs/Tasks/<slug>.task.md`.
- T/R/P/I labels:
  - T: Task intake (create `ACTIVE_TASK.md` + task file).
  - R#: Research subtask (search/read only, file:line ranges).
  - P#: Planning subtask (plan file only; no edits).
  - I#: Implementation subtask (single-threaded, main agent only).

## Plan Loop (High-Level)
- Produces high-level goals aligned with `specs/*`.
- Updates only `IMPLEMENTATION_PLAN.md` (and optionally brief discovery notes in `docs/Tasks/`).
- No implementation plans and no code changes.

## Build Loop (Per Task)
- Role gating via file existence:
  - If `docs/Tasks/ACTIVE_TASK.md` is missing -> T.
  - If `<slug>.research.md` missing -> R.
  - If `<slug>.plan.md` missing -> P.
  - Else -> I.
- Run one role per loop, then stop.
- T/R: read `AGENTS.md`, `docs/SESSION_HANDOFF.md`, `IMPLEMENTATION_PLAN.md`, `HANDOFF_CODEX.md`, and `specs/*`.
- P/I: read the task + research (+ plan for I); avoid re-reading global specs unless needed.
- I: run required tests (or `pnpm run typecheck` if tests are missing) and log any gaps.

## Storage Rules
- Task files + R/P outputs: `docs/Tasks/`.
- Handoff details: `docs/SESSION_HANDOFF.md`.
- Progress highlights: `progress.md` (use `ARCHIVE: <task file>` when done).
 - After a task is fully complete, and only once the next task has been created and its completion is confirmed, copy the completed task's research/plan artifacts into `/output/runs/...` and remove them from `docs/Tasks/`.

## Guardrails
- Do not edit `HANDOFF_CODEX.md` or `specs/*` unless explicitly asked.
