# Plan (2025-10-21) — Tracker UAT + Automation Enhancements

## Target Budget
- Window target: 70–80% of 272K → aim for **200K tokens** with ~20K buffer

## Required Reading (before any edits)
1. `docs/SOP/PRD_v1.6-final.md`
2. `docs/SOP/week0_final_protocol.md`
3. `docs/SOP/saturday_prep_checklist.md`
4. `docs/System/contracts.md` (snapshot_id, version stamp guidance)
5. `docs/Tasks/tracker_cli_todo.md` (Upcoming Tasks table)
6. `docs/Tasks/claude_monitor_integration.md`
7. `docs/Recipes/codex_status_capture.md`, `docs/Recipes/ccusage_ingest.md`

## Tasks

1. **UAT Sweep (15–20K tokens)**
   - Run `PYTHONPATH=tracker/src pytest`
   - Run `PYTHONPATH=tracker/src behave features`
   - Smoke preview: `python -m tracker.cli --data-dir data/week0/live preview --window W0-21`
   - Append UAT results to ledgers + handoff

2. **Schema Version Stamping (Option A from TLDR) (50K)**
   - Update all record writers (ingest, alias, complete) to include `schema_version` + `tool_version`
   - Extend tests verifying fields exist (pytest + behave)
   - Docs: note in progress/handoff summary

3. **Claude Automation Wrapper (45K)**
   - Draft feature stub (`features/tracker_claude_automation.feature`) + steps
   - Implement shell wrapper mirroring Codex script
   - Add Behave coverage and update recipes

4. **Live ccusage Daily/Weekly Capture (40K)**
   - Capture fresh exports (daily/weekly) → store fixtures
   - Ingest via CLI `--scope daily|weekly`
   - Verify `reset_at` and preview output; update docs with observations

5. **Preview Snapshot Context Line (20K)**
   - Append `(source=…, notes=…)` to preview snapshot output
   - Adjust tests accordingly

6. **Docs & Wiki Sync (10K)**
   - Add alias/automation notes to `~/wiki/.../TrackerAliases.md`
   - Update README/SOP references if Claude wrapper shipped

## Validation Checklist
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `python -m tracker.cli preview --data-dir data/week0/live --window W0-21`
- Alias smoke: `scripts/automation/codex_status.sh --phase before/after ...`, new Claude script equivalent
- Ledgers (`docs/Ledgers/*.csv`) updated
- Build deliverables bundle (if script exists)

## Handoff Requirements
- Update `progress.md` with work summary & commands
- Update `docs/SESSION_HANDOFF.md` with validation matrix + window stats
- Commit plan pointer + outcomes in ledgers
- Leave this plan updated or superseded for the following session

