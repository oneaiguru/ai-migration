# Next Agent Brief — Long Session 002 (Brief #1)

## Start Here
Read in this order, then run the UAT opener.

### Required Reading
1. progress.md — sections “2025-10-19 Stats/CI, Outcome, and UPS Alignment” and “2025-10-19 Churn Instrumentation (Commits 1–3)”; `docs/SessionReports/001_Learnings.md`.
2. docs/SOP/uat_opener.md — note the churn command now part of the opener.
3. docs/SOP/standard-operating-procedures.md — Product Focus Guardrails + BDD workflow.
4. docs/SOP/commit_conventions.md, docs/System/git_churn_strategy.md — commit tagging, churn cadence, preview behaviour.
5. docs/System/scheduler/standing_jobs.md — standing jobs list (ledger checkpoint placeholder still open).
6. docs/Tasks/tracker_cli_todo.md — Upcoming Tasks block.
7. docs/Tasks/git_churn_next_steps.md — confirms commits 1–3 are complete; review for context before tackling automation follow-ups.
8. docs/CurrentPlan/003_PRO_TLDR.md — operator-grade TLDR for this long session.
9. docs/CurrentPlan/002_PRO_TLDR.md — previous TLDR (archived for reference).
10. plans/005_long_session.plan.md — execution commits for this session.

### UAT Opener (run exactly)
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`

## Reset Capture (00:06 local, +5 min after 00:01)
- AFTER (W0-CHN):
  `codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live alias end codex --stdin --window W0-CHN --state-dir data/week0/live/state --notes after-clean`
- BEFORE (W0-CHP):
  `codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live alias start codex --stdin --window W0-CHP --state-dir data/week0/live/state --notes before-clean`
- If not online at wrap: a safety cross already exists; clean captures take precedence when present.

## What Changed Last Session
- Churn metadata is wired end-to-end: window records + ledgers carry commit range fields (`docs/Ledgers/Feature_Log.csv`, `docs/Ledgers/Churn_Ledger.csv`).
- New churn CLI (`tracker/src/tracker/churn.py`) computes git numstat diffs, writes JSONL via `JsonlStore`, and appends the ledger (pytest coverage in `tracker/tests/test_churn_cli.py`).
- Preview now prints a `Churn:` block; Behave scenario (`features/tracker_cli.feature`) and UAT SOP cover the full flow.

## Execute Long Session 002 — Phases & Tasks
Follow `plans/005_long_session.plan.md` strictly.

### Phase A — Automation pack
1) **Ledger checkpoint automation**
   - Implement the placeholder job in `docs/System/scheduler/standing_jobs.md`: create `scripts/tools/ledger_checkpoint.sh` (or similar) that runs `tracker churn`, updates `docs/Ledgers/Token_Churn_Ledger.csv`, and logs artifacts for the handoff.
   - Add pytest/behave coverage if the script writes to the repo; document usage in README/SOP.

2) **Docs & TODO sync**
   - Reflect the new automation in `docs/Tasks/tracker_cli_todo.md` and `docs/SESSION_HANDOFF.md` once the job exists.
   - Ensure wiki pointer (`~/wiki/.../TrackerAliases.md`) notes how churn integrates with aliases if you wire them together.

3) **Optional stretch** — If time remains, draft the plan for automatic churn capture inside the alias flow (e.g., `ox` triggering `tracker churn` once commit hashes are present) and log it under `docs/Backlog/`.

### Phase B — Parallel agents (isolation + lock)
- Use separate state: `TRACKER_ALIAS_STATE_DIR=data/week0/live/state/<AGENT_ID>`
- Stamp `AGENT_ID` in notes (e.g., `AGENT_ID=main` or `AGENT_ID=sub1`) and document a simple `flock` lock in wrappers.

### Phase C — Subagent telemetry (ingest only)
Note: For this session, scope is single‑lane (codex). Do not run or ingest proxy/remote telemetry. Skip this phase unless explicitly re‑enabled.
- Do NOT build any proxy/gateway. Assume the MITM addon exists outside your scope.
- Source of truth: consume telemetry from `logs/usage.jsonl` (fields: `ts, rid, lane, model, status, input_tokens, output_tokens, reason, latency_ms`).
- Parser/ingest: add tracker ingest that reads JSONL from stdin and writes `proxy_telemetry.jsonl` under the tracker data dir.
- Preview block: add a “Subagent Proxy” section showing routed_to_glm %, p50/p95 latency, error rate.
- Cost compare: provide `scripts/tools/proxy_cost_compare.py` to diff GLM vs baseline token costs per feature.
- CLI:
  - `PYTHONPATH=tracker/src python -m tracker.cli ingest proxy-telemetry --window <W0-XX> --stdin`
  - Example: `tail -n +1 logs/usage.jsonl | PYTHONPATH=tracker/src python -m tracker.cli ingest proxy-telemetry --window W0-CHN --stdin`

Acceptance for Phase C
- Ingest creates `data/week0/live/proxy_telemetry.jsonl` with stamped rows.
- Preview shows “Subagent Proxy” with routed %, latency p50/p95, error rate.
- Cost compare script outputs GLM vs baseline deltas for ≥3 matched features.

Log progress in `docs/Tasks/tracker_cli_todo.md` and keep `plans/2025-11-05_tracker-next.plan.md` updated with execution notes.

## Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>`
- `PYTHONPATH=tracker/src python -m tracker.cli churn --window <W0-XX> --provider <provider>`
- If automation script is executable, add a dry-run invocation (documented in the SOP).

## Guardrails
- Preserve append-only discipline across ledgers and JSONL files.
- Keep churn automation scoped to the documented jobs; do not trigger destructive git commands.
- Document blockers in `docs/SESSION_HANDOFF.md` immediately; no ad-hoc scope changes.

## Handoff
- Update progress.md and docs/SESSION_HANDOFF.md after each phase (tests run, files touched, next steps).
- Leave plans/2025-11-05_tracker-next.plan.md annotated or superseded if a new plan is drafted for automation.

## Optional End-of-Session Metrics (if you are online at wrap)
- ccusage (Codex):
  - `npx @ccusage/codex@latest session --json | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest codex-ccusage --window <W0-XX> --scope session --stdin`
  - `npx @ccusage/codex@latest daily --json | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest codex-ccusage --window <W0-XX> --scope daily --stdin`
- Codex /status wrappers (if ccusage unavailable): use the alias functions (`os/oe/ox`) from `scripts/tracker-aliases.sh` and respect the +5 minute buffer.
- Claude monitor (if applicable): `claude-monitor --view realtime | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest claude-monitor --window <W0-XX> --stdin`
- Then run `PYTHONPATH=tracker/src python -m tracker.cli preview --window <W0-XX>` and append notes to `docs/SESSION_HANDOFF.md`.

## Finalize Windows + Churn (when you finish a window)
- Complete: `PYTHONPATH=tracker/src python -m tracker.cli complete --window <W0-XX> --codex-features <#> --quality 1.0 --outcome pass --methodology <tag> --commit-start <sha> --commit-end $(git rev-parse HEAD)`
- Churn: `PYTHONPATH=tracker/src python -m tracker.cli churn --window <W0-XX> --provider codex --methodology <tag>`
- Preview: `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>`

## Logging & Handoff
- Update `docs/Tasks/tracker_cli_todo.md` after each phase.
- Append token entries in `docs/Ledgers/Token_Churn_Ledger.csv` (plan/mid/final).
- Verify churn rows in `docs/Ledgers/Churn_Ledger.csv`.
- Add a short handoff note with changed paths to `docs/SESSION_HANDOFF.md`.
- Create the review bundle at the end: `/Users/m/Downloads/agentos_tmp_review` (per SOP).
