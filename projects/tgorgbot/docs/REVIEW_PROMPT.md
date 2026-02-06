# Code Review Prompt (TG Org Bot)

You are doing a tough, high-signal code review of `~/Desktop/tgorgbot`.

## Scope
- Review all code under `backend/src`, `shared`, and any root-level configs and docs that affect behavior (e.g., `README.md`, `docs/RUNBOOK.md`, `docker-compose.yml`, `backend/Dockerfile`, `.env.example`).
- Cross-check against requirements in `docs/tasks/PRD.md`, `docs/tasks/ADR.md`, and `docs/tasks/TASKS.md` if present in the repo.

## What to focus on
- Bugs, reliability risks, and behavioral regressions.
- Error handling gaps (esp. Telegram copyMessage failures, retries, 429 handling, blocked users, missing topics).
- Data integrity and mapping correctness (participant_user_id <-> topic_thread_id).
- Concurrency/polling issues (long polling, single instance assumptions).
- Any mismatch with non-negotiables: GramIO, strict TS (no any), SQLite, long polling, copyMessage not forwardMessage, single-tenant with desk_id present.
- Missing tests or missing validation (config/env, sqlite schema usage).

## Output format
- Provide findings first, ordered by severity (P0/P1/P2), with file references and line numbers if possible.
- Then list open questions/assumptions.
- Then a short change summary (if needed).
- If no issues found, say so explicitly and note any residual risks or testing gaps.

## Constraints
- Do not modify code.
- Do not generate large refactors; this is a review only.
- If you run any commands, list them explicitly.
