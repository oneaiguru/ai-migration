# Task: ccusage-codex Coverage & BDD Plan (2025-10-19)

## Goal
Use `ccusage-codex` as the authoritative source for Codex token usage (daily / weekly / 5h) and capture the workflow via BDD scenarios so future agents can log usage without manual calculations.

## Metrics & Rituals to Cover
| Ritual | Fields Needed | CLI Command |
| --- | --- | --- |
| Weekly cap | `%` used, total tokens, cost | `ccusage-codex weekly --json` *(pending exact flag)* |
| Daily tracking | per-day totals, reset time | `ccusage-codex daily --json` |
| Session/5h blocks | per-session totals, latest activity | `ccusage-codex session --json` |
| Monthly rollover (optional) | monthly totals for historical benchmarking | `ccusage-codex monthly --json` |

## BDD Scenario Outline (to be implemented)
1. **Daily snapshot ingestion** *(implemented 2025-10-20)*
   - Given a JSON export for a specific date range
   - When the operator runs `tracker ingest codex-ccusage --window W0-DD --scope daily`
   - Then tracker stores daily totals and logs the reset timestamp
2. **Weekly allowance monitoring** *(implemented 2025-10-20)*
   - Given a weekly summary JSON (or derived from daily totals)
   - Then tracker updates a dashboard/JSONL entry with weekly % used and remaining tokens
3. **Session (5h window) reconciliation** *(implemented 2025-10-20)*
   - Given session-level JSON with `lastActivity`
   - Then tracker correlates session token usage with alias-captured windows (W0-XX)
4. **Monthly archive check**
   - Optional scenario verifying monthly totals and ensuring churn logs reference them
5. **Error handling** *(baseline in place 2025-10-20)*
   - Missing fields, stale caches, offline mode warnings

Each scenario should map to a `.feature` section (e.g., `features/tracker_ccusage.feature`) with matching step defs and fixtures under `tests/fixtures/ccusage/`.

## Implementation Tasks
- [ ] Identify exact CLI flags for daily/weekly/monthly JSON exports (verify `--view` + `--json`). *(still todo for live CLI validation)*
- [x] Capture fixtures: daily, weekly, session JSON (store under `tests/fixtures/ccusage/`).
- [x] Draft `features/tracker_ccusage.feature` with scenarios above.
- [x] Extend `tracker/src/tracker/sources/codex_ccusage.py` (if needed) to parse aggregated data (daily/weekly).
- [x] Add storage strategy (new JSONL or extend existing `codex_ccusage.jsonl`).
- [x] Update CLI/aliases (`occ`) to support additional modes (flags or metadata).
- [ ] Document workflow in `docs/Tasks/autonomous_long_session_plan.md` and Experiment 001 log.
- [x] Ensure `tracker_preview` or report command surfaces ccusage-derived weekly/daily figures.

## Dependencies
- Automation script capturing `/status` for cross-reference.
- Alias workflow for Codex windows (`os/oe/ox`) to correlate session IDs.

## Deliverables
- New feature file + step definitions + fixtures.
- Unit tests validating parser for daily/weekly JSON.
- Docs updated with command references.
- Tracker JSONL updated to include aggregated metrics.
