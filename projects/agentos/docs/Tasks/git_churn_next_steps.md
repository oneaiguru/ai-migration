
# Task: Git Churn Instrumentation

## Objective
Implement the three-commit churn workflow so every tracker window can be tied to git diff statistics and logged in `Churn_Ledger.csv`.

## Checklist

### Commit 1 — Docs & Schema Hooks
- [x] Extend `docs/Ledgers/Feature_Log.csv` with commit + churn columns (`baseline_commit`, `implementation_commit`, `docs_commit`, `lines_added`, `lines_removed`).
- [x] Create `docs/Ledgers/Churn_Ledger.csv` with headers: `date,window,provider,methodology,commit_start,commit_end,files_changed,insertions,deletions,net,features,normalized_churn,notes`.
- [x] Update schema/contract docs (`docs/System/schemas/universal_provider_schema.md`, `docs/System/contracts.md`) with optional `methodology`, `feature_ids`, `commit_start`, `commit_end` fields.
- [x] Reinforce commit conventions (`docs/SOP/commit_conventions.md`) and churn strategy (`docs/System/git_churn_strategy.md`) so baseline/implementation hashes are captured explicitly.
- [x] Add SOP touchpoint for session close (e.g., `docs/SOP/session_reflection_sop.md` or `docs/SOP/uat_opener.md`) calling out the need to log commit hashes and churn stats.

### Commit 2 — CLI Collector & Ledger Append
- [x] Implement `tracker churn --window <W0-XX> [--methodology ...] [--paths ...]` to run `git diff --numstat` using `commit_start`/`commit_end` from windows or CLI flags.
- [x] Write JSONL output (`data/week0/live/churn.jsonl`) plus append a CSV row to `docs/Ledgers/Churn_Ledger.csv`.
- [x] Add pytest coverage with a temporary git repo fixture covering default + path-filter cases.

### Commit 3 — Preview Integration & UAT
- [x] Surface a `Churn:` block in `tracker preview` summarising files/insertions/deletions/net and per-feature churn.
- [x] Update UAT (`docs/SOP/uat_opener.md`) and Behave/pytest smoke checks to run the churn command after preview.
- [x] Document the workflow in `progress.md`, `docs/SESSION_HANDOFF.md`, and `docs/Tasks/tracker_cli_todo.md`.

## References
- `docs/System/git_churn_strategy.md`
- `docs/Ledgers/Feature_Log.csv`
- `docs/Ledgers/Churn_Ledger.csv`
- `progress.md` (latest entries)

## Notes
Manual logging is acceptable until Commit 2 lands. Once automation is in place, tighten SOPs to enforce append-only churn reporting per window.
