# SOP — Commit Conventions (Tracker Project)

Purpose
- Keep git history attributable to individual tracker windows/methodologies.
- Ensure churn tooling can map commits back to the correct window and feature set.

Commit cadence (per window)
1. **Baseline (`prep`)** — optional, only when a clean reference is needed (`prep: tracker ready for W0-21`).
2. **Implementation (`tracker:`)** — code/tests/fixtures for a single feature or window.
3. **Documentation (`docs:`)** — progress/handoff/ledger updates after implementation.

Message format
```
<prefix(scope): summary [window:W0-XX] [method:<methodology>] [feature:<id>] [brief:00N]
```
- Prefix examples: `tracker:`, `docs:`, `chore:`, `sop:`.
- `window:` is mandatory for any commit touching tracker code/tests/data.
- `method:` optional but recommended (e.g. `alias_cycle`, `api_battery`).
- `feature:` optional for high-granularity linking to task batteries.
- `brief:` optional but recommended to point to the current NextAgent brief number (e.g., `[brief:001]`).

Rules
- One window/feature per implementation commit. Do not mix unrelated windows.
- Do not squash the implementation + docs commits together; keep them distinct.
- Ledger or JSONL corrections are append-only: create a new commit with `[correction]` note.
- Keep automation scripts under `scripts/automation/` so churn filters can include/exclude them cleanly.
- Commit timing: batch changes and commit near session handoff (after validation) unless you have an explicit instruction (PRO/PRD/customer) to publish mid-session. Capture intermediate state locally but avoid spamming history.
- Record the baseline hash (`commit_start`) before implementation and the implementation hash (`commit_end`) once
  tests pass. Store both in the session plan, window metadata, and `Churn_Ledger.csv` so churn tooling can run
  `git diff --numstat` without guessing.

Examples
- `tracker: add stats CI preview [window:W0-23] [method:ready_next]`
- `docs: session handoff updates [window:W0-23]`
- `chore: fix alias fixture regression [window:W0-18] [method:alias_cycle]`

Review checklist before pushing
- Does the implementation commit include window tag(s)?
- Are docs/ledger updates separate commits with the same window tag?
- Have you captured baseline/implementation/doc hashes in `progress.md` or the Feature Log?

References
- docs/System/git_churn_strategy.md
- docs/Tasks/git_churn_next_steps.md
