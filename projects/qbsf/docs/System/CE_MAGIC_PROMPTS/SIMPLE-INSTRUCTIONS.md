# SIMPLE INSTRUCTIONS - T/R/P/I CADENCE

These guardrails apply to every role (T -> R -> P -> I) when working in this repo.

ROLE-SCOPED READING
- T/R: Read `AGENTS.md`, `HANDOFF_CODEX.md`, `PROJECT_BRIEF.md`, `docs/SESSION_HANDOFF.md`, `IMPLEMENTATION_PLAN.md`, and `specs/*`.
- R: Search the repo (`rg`, `ls`) before concluding anything is missing.
- P/I: Read `docs/Tasks/<slug>.task.md`, `docs/Tasks/<slug>.research.md`, and (for I) `docs/Tasks/<slug>.plan.md`. Avoid re-reading global specs unless explicitly needed.
- Confirm test commands; if tests are missing, plan to run `pnpm run typecheck` and log the gap.

NEVER DO
- Edit `HANDOFF_CODEX.md` or `specs/*` unless the user explicitly asks.
- Commit run artifacts or resume state.
- Invent new workflows when a template already exists.

STAGE 0 REALITY CHECK
- SQLite queue, system git, filesystem artifacts only.
- Run state lives outside the repo; `/output/runs/...` holds artifacts.
- `apps/extractor` may be a stub that only reads `meta.json`.

ROLE GATING (file-based)
- If `docs/Tasks/ACTIVE_TASK.md` is missing: T.
- If `<slug>.research.md` missing: R.
- If `<slug>.plan.md` missing: P.
- Else: I.

SUCCESS PATTERN
1. T: create `docs/Tasks/ACTIVE_TASK.md` + `docs/Tasks/<slug>.task.md`.
2. R: gather file:line evidence into `docs/Tasks/<slug>.research.md` (read-only).
3. P: main agent drafts `docs/Tasks/<slug>.plan.md` referencing R evidence.
4. I: implement, run tests, update `IMPLEMENTATION_PLAN.md` and `docs/SESSION_HANDOFF.md`, and archive in `PROGRESS.md`.
