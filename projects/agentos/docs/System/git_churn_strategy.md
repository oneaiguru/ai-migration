
# Git-Based Churn Measurement Strategy

## Why
We want churn metrics that tell us how expensive each methodology window is. Git already captures
file-level diffs, so we standardise how we use commits to make churn quantifiable and auditable.

## Core Ideas
- **Three-commit cadence:**
  1. Baseline (pre-session state).
  2. Implementation (code + tests + fixtures).
  3. Documentation/ops (plans, progress, handoff).
  This isolates the methodology work item from prep/post ops and lets churn tooling attribute lines
  changed per commit category.
- **Commit conventions:** follow `docs/SOP/commit_conventions.md` so every tracker commit carries
  `window:` (and ideally `method:`) tags. This is the anchor for the churn collector.
- **Metadata in data rows:** Every JSONL record carries `schema_version` + `tool_version`, letting us map
  tracker outputs back to the exact commit range that produced them. Windows may also store
  `methodology`, `feature_ids`, `commit_start`, and `commit_end` so downstream churn tooling does not
  guess hashes later.
- **Ledgers bridge:** `Token_Churn_Ledger.csv` logs commit hashes, window IDs, and token usage. A dedicated
  `Churn_Ledger.csv` captures `files_changed/insertions/deletions/net` once automation lands.
- **Preview visibility:** After the churn CLI writes a record, `tracker preview` prints a `Churn:` block so
  operators can inspect diff statistics alongside efficiency metrics without opening ledgers mid-session.
- **Commit hygiene:**
  - No squashing across commit types.
  - One methodology feature per implementation commit.
  - Keep commit messages prefixed (`tracker:`, `docs:`) for easy filtering.

## How to Use in Practice
1. **Before window:** create (or ensure) a clean baseline commit. If prior automation already did this,
   record the hash in the session plan.
2. **During window:**
   - Track code changes under the implementation branch. Run specs/tests before committing.
   - Attach window IDs to commit message body (e.g. `Window: W0-21`).
3. **After window:**
   - Update docs/ledgers, commit separately with `docs:` prefix.
   - Record `baseline → implementation → docs` hashes in `progress.md` and the Feature Log.
4. **Churn reporting:**
   - `git diff --stat <baseline>..<implementation>` gives code churn per methodology.
   - `git diff --shortstat` feeds directly into churn calculators.
   - Capture hashes in the window record (`commit_start`/`commit_end`) and ledger so churn automation can
     resolve diffs without re-parsing plan notes.
   - For multi-provider work, group windows by feature ID and sum the stats.

## Guardrails
- Never mix fixture/data updates for multiple windows in one commit—create one implementation commit per
  window or feature.
- Keep automation scripts in a separate namespace (`scripts/automation/`) so churn tools can opt-in/out of
  shell changes.
- Add git hygiene checks to the future CI pipeline (e.g., lint commit messages and enforce max files per
  implementation commit).

## Next Steps
- Pair the Feature Log with commit hashes so the ledger can show `tokens_used`, `lines_added`, `lines_removed`.
- Automate a `git diff --numstat` export at the end of each window to feed a churn dashboard.
- Define churn thresholds per methodology (e.g. plan, execute) and alert when a window exceeds them.
