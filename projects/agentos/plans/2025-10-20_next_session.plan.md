# Plan (2025-10-20) — Autonomous Session (70–80% Context Window)

## Target Budget
- Window target: 70–80% of 272K ≈ 190–218K tokens
- Buffer: 12–20K tokens reserved
- Buckets:
  - ccusage coverage: 58K
  - Codex `/status` automation: 42K
  - Experiment 001 windows (Codex/Claude): 34K
  - Archive progressive summaries (4 files): 28K
  - Preview/report tweaks: 10K
  - Wiki migration updates: 5K
  - Validation & handoff: 19K

## Required Reading (Pre-flight)
1. docs/SOP/next_session_planning_sop.md
2. docs/SOP/session_reflection_sop.md (for TLDR/ledger ritual)
3. docs/SOP/brainstorming_sop.md & docs/SOP/backlog_naming_sop.md
4. docs/SOP/recipes_index.md (skim linked recipes)
5. docs/SessionReports/2025-10-19_TLDR.md and companion Ideas/Decisions/Risks files
6. docs/Tasks/autonomous_long_session_plan.md
7. docs/Tasks/ccusage_codex_coverage.md
8. docs/Tasks/codex_status_automation.md
9. docs/Tasks/archive_curation.md (Detailed Reading Plan)
10. docs/System/methodologies/progressive_summary/overview.md

## Tasks

1. **ccusage-codex Coverage (58K)**
   - Draft `features/tracker_ccusage.feature` + steps
   - Capture fixtures: `tests/fixtures/ccusage/{daily,weekly,session}.json`
   - Extend parser/storage/CLI → support daily/weekly/session
   - Update preview, CLI docs, TODO table
   - Replace existing placeholder scenario/steps before calling feature done
   - Record observed `reset_at` values; do not hard-code reset hours—infer via timeline builder

2. **Codex `/status` Automation (42K)**
   - Draft `features/tracker_automation.feature`
   - Implement `scripts/automation/codex_status.sh`
   - Add alias doc / integration instructions
   - Remove placeholder scenario once real BDD is in place
   - Respect ADR-004: wait +5 minutes and record `reset_at` when capturing "after"

3. **Experiment 001 Windows (34K)**
   - Run one Codex window: capture `os/oe/ox`, `occ`
   - Run one Claude window: capture `as/ae/ax`, `acm`
   - Log results, update feature log & experiment file

4. **Archive Progressive Summaries (28K)**
   - Summaries with line indices for remaining reports
   - Update `docs/Archive/README.md`, curation task progress, cross-links

5. **Preview/Report Tweaks (10K)**
   - Surface ccusage metrics in `tracker preview`

6. **Wiki / Backlog Updates (5K)**
   - Notes on wiki migration or referencing knowledge base

7. **Validation & Handoff (19K)**
   - Targeted pytest (new tests)
   - Full pytest + behave
   - Update `progress.md`, `docs/SESSION_HANDOFF.md`, `docs/Tasks/tracker_feature_log.md`

## If Ahead of Schedule (Quick Wins)
- **Progressive NAV Generator** — `docs/Backlog/progressive_nav_generator.md` (~8K)
- **Snapshot/Restore State** — `docs/Backlog/snapshot_restore_state.md` (~6K)
- **Spec Coverage Map** — `docs/Backlog/spec_coverage_map.md` (~7K)

## Validation Checklist
- `cd tracker && . .venv/bin/activate`
- `pytest tests/test_ccusage.py tests/test_codex_ccusage.py tests/test_claude_monitor.py` (updated)
- `pytest` (full)
- `behave ../features`
- alias dry run: `os` w/ fixture, `occ`, `acm`
- `tracker preview --window <latest>`

## Handoff Requirements
- Update `progress.md` with major tasks, commands, metrics
- Update `docs/SESSION_HANDOFF.md` with validation matrix + window stats
- Update Task ↔ Spec table (`docs/Tasks/tracker_cli_todo.md`)
- Ensure `docs/Archive/README.md` and curation task reflect new summaries
- Leave plan pointer for subsequent session (if unfinished work remains)

## Build Order Reminder
- Follow integration map (`docs/Backlog/integration_map.md`): Schemas → Timeline → Capture automation → Stats → Routing, with Ops guardrails active.
- Consult feasibility review (`docs/Backlog/feasibility_review.md`) when selecting additional backlog items to keep within budget and avoid conflicts.
