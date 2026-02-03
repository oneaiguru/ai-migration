# Experiment 001 — Provider Window Cadence

**Goal:** Compare Codex 5 h windows and Claude Sonnet 4.5 focus blocks while logging data autonomously (aliases + CLI bridges).

## Hypotheses
- Alias workflow + automation scripts will allow uninterrupted single-agent sessions for both providers.
- Codex windows will yield higher spec throughput per hour; Claude windows will offer clearer usage metrics via `claude-monitor`.

## Metrics
| Metric | Source |
| --- | --- |
| BDD specs shipped per window | `docs/Tasks/tracker_feature_log.md` |
| Snapshot count by provider | `data/week0/live/snapshots.jsonl` (via aliases) |
| Prompt usage | Codex `occ` logs + Claude `acm` entries (`codex_ccusage.jsonl`, `claude_monitor.jsonl`) |
| Churn delta per window | `git diff --stat` scoped to tracker directories |
| Alias undo frequency | Alias stdout logs (`progress.md`) |

## Procedure
1. **Pre-flight (per window)**
   - Read `docs/Tasks/tracker_long_session_plan.md`, `docs/Tasks/tracker_cli_todo.md` upcoming entries.
   - Source `scripts/tracker-aliases.sh` and activate tracker venv.
   - Run `pytest` + `behave features` as baseline.
2. **Codex window (W0-XX)**
   - Capture start/end panes with `os`/`oe`/`ox`.
   - Record `/status` via automation script (once implemented) and ingest with `occ`.
   - Log commands/tests in `progress.md`.
3. **Claude window (W0-XX-C)**
   - Use `as`/`ae`/`ax` for usage panes; capture `claude-monitor` output with `acm`.
   - Note any manual `/usage` overrides.
4. **Post-window**
   - Update `docs/Tasks/tracker_feature_log.md` (rows for new scenarios).
   - Append experiment notes to this file (Window ID, duration, highlights, blockers).
   - Update `docs/SESSION_HANDOFF.md` with validations, metrics, and which provider ran.

## Logging Template
```
## Window W0-XX (Provider, Date, Duration)
- Specs shipped: <count> (references)
- Aliases used: os/oe/ox, occ, acm
- Prompt usage: Codex <value>, Claude <value>
- Commands/tests: pytest …; behave …
- Highlights: …
- Follow-ups: …
```

## Status
- **Ready for execution.** Automation scripts (Codex `/status`, Claude monitor ingestion) noted in backlog.
- Next agent should clone this template for each window and update metrics accordingly.

## Window W0-21 (Codex, 2025-10-20, simulated)
- Specs shipped: 4 BDD scenarios (`features/tracker_ccusage.feature`) and supporting pytest coverage (`tracker/tests/test_codex_ccusage.py`).
- Aliases used: `os`/`oe` via `scripts/automation/codex_status.sh` (fixtures), `occ` for ccusage session ingest.
- Prompt usage: Codex session total `7,372,723,263` tokens (fixture `codex_sessions_sample.json`).
- Commands/tests: `pytest tracker/tests/test_codex_ccusage.py`; `PYTHONPATH=tracker/src behave features/tracker_ccusage.feature features/tracker_automation.feature`; `python -m tracker.cli --data-dir data/week0/live preview`.
- Highlights: Automation script now tags snapshots with `source=automation`; preview surfaces ccusage scopes; window finalized with `tracker complete --window W0-21`.
- Follow-ups: Capture live ccusage daily/weekly exports once subscription available; add launchd recipe for automation script.

## Window W0-21C (Claude, 2025-10-20, simulated)
- Specs shipped: Existing `features/tracker_cli.feature` claude monitor scenario exercised; no new specs shipped.
- Aliases used: `as`/`ae` (`tracker alias start/end claude` with fixtures), `acm` for claude monitor ingestion.
- Prompt usage: Claude monitor realtime sample (0% usage) ingested via fixture.
- Commands/tests: `pytest tracker/tests/test_cli_flow.py`; `python -m tracker.cli --data-dir data/week0/live preview` (verifying providers list).
- Highlights: Window finalized as `W0-21C`; claude snapshots stored with `notes=experiment-001` and linked in ledgers.
- Follow-ups: Automate Claude capture (future `claude-monitor` script) and add Behave scenarios once tooling exists.
