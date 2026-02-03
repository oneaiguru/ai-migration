# Next Agent Brief — Long Session Follow-ups (Codex Lane)

## Read First
1. docs/CurrentPlan/001_Agent_Brief.md (baseline SOP)
2. docs/SESSION_HANDOFF.md (latest commands + artifacts)
3. docs/Tasks/tracker_cli_todo.md (Upcoming Tasks section)
4. docs/SOP/decision_card.md and docs/SOP/uat_opener.md (updated steps)
5. docs/System/capability_map/agentos/capabilities.csv (new capability seeds)

## Required Pre-flight
```
PYTHONPATH=tracker/src pytest
PYTHONPATH=tracker/src behave features
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHP
python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP
```
- Expect: preview shows Anomalies: 0, outcome pass, churn block present.
- Decision card should report GO (evidence rows already appended).

## Primary Objectives
1. **Phase A polish — Automation pack**
   - Finalise scheduler doc snippets for routine jobs (ledger checkpoint, codex status automation).
   - Add Behave/pytest coverage if needed to ensure anomalies surfaced.
   - Confirm automation scripts (`codex_status.sh`, `ledger_checkpoint.sh`) reference latest guardrails.
2. **Phase B — Multi-agent docs/tests**
   - Document AGENT_ID usage in docs/Tasks/tracker_cli_aliases.md and wiki stub.
   - Add tests covering simultaneous alias usage (two state dirs).
3. **Phase C — Telemetry follow-ups**
   - Add pytest for `tracker/src/tracker/sources/proxy_telemetry.py` edge cases (malformed lines, latency extremes).
   - Add preview smoke test ensuring Subagent Proxy block prints when data exists.
   - Update `docs/Tasks/subagent_proxy_telemetry_ingest.md` with acceptance / log instructions.
4. **BDD parity sweep**
   - Extend `features/tracker_aliases.feature` with scenarios for od1/od2 undo flow.
   - Draft scenarios covering decision card, ledger checkpoint process.
5. **Wiki migration**
   - Port alias/automation knowledge from archive into `~/wiki/replica/` per TODO.

## Guardrails
- Stay on single-lane codex scope unless plan explicitly expands.
- +5 min buffer before AFTER captures.
- Append-only JSONL/CSV; use alias delete (od/od1/od2) for corrections.
- Absolute paths in docs (ADR-007).

## Artifacts to Update
- docs/Tasks/tracker_cli_todo.md (checklist progress)
- docs/SESSION_HANDOFF.md (commands, artifacts, decision outcomes)
- docs/Ledgers/*.csv (append-only)
- progress.md (brief note on completed Phase A/B/C items)

