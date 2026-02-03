# Task: Tracker BDD Standardization (2025-10-19)

## Goal
Bring every tracker behaviour under the BDD SOP so feature files, step definitions, and pytest coverage stay in sync with the codebase.

## Current State
- `features/tracker_aliases.feature` covers aliases (start/end/cross/delete) including the real W0-19/W0-20 rollback scenario.
- Parsers (`parse_codex_status`, `parse_claude_usage`), preview flow, overrides, and GLM ingestion still rely solely on pytest.
- Upcoming integrations (ccusage-codex, claude-monitor) lack any BDD scaffolding yet.

## Work Items
1. **Inventory & Gap List**
   - Catalogue all tracker commands/paths (ingest before/after, override, complete, preview, GLM ingest, alias delete, future ccusage/claude monitor).
   - For each, note existing feature coverage and create issues/subtasks for missing scenarios.

2. **Feature Authoring**
   - Add `.feature` scenarios for uncovered behaviours (e.g., ingest + override happy paths, preview output, GLM ingest, future ccusage/claude monitor).
   - Ensure fixtures live under `tests/fixtures/...` with clear naming and provenance.

3. **Step Definitions & Tests**
   - Implement reusable steps in `features/steps/` mirroring the SOP style (no bespoke parsing per scenario).
   - Keep companion pytest tests for unit-level assertions (parsers, estimators) while using Behave for end-to-end flows.

4. **Validation Pipeline**
   - Update documentation to require `behave features` alongside pytest for every change.
   - Ensure Saturday prep checklist references the behave run.

## Coverage Map (2025-10-19)
| Command | Scenario(s) | Notes |
| --- | --- | --- |
| `alias start/end/cross/delete` | `features/tracker_aliases.feature` | Includes live W0-19/W0-20 rollback + multi-pane regression.
| `ingest codex/claude` | `features/tracker_cli.feature` – “Ingest snapshots and preview window summary” | Validates before/after capture + preview summary output.
| `complete` + `preview` | `features/tracker_cli.feature` – “Ingest snapshots and preview window summary” | Asserts codex deltas and preview text.
| `override codex` | `features/tracker_cli.feature` – “Override codex snapshot via CLI” | Confirms manual override source + error tag.
| `ingest glm` | `features/tracker_cli.feature` – “Ingest GLM counts via CLI” | Verifies prompts total and provider metadata.
| `ingest codex-ccusage` | `features/tracker_cli.feature` – “Ingest Codex ccusage JSON via CLI” | Stores ccusage session summaries for Codex with pytest + Behave coverage (`tracker/tests/test_codex_ccusage.py`).
| `ingest claude-monitor` | `features/tracker_cli.feature` – “Ingest Claude monitor snapshot via CLI” | Text parser captures realtime monitor metrics (`tracker/tests/test_claude_monitor.py`).

Upcoming integrations (ccusage-codex alias bridge, claude-monitor ingest) will add dedicated scenarios once the parsers exist (tracked in `docs/Tasks/tracker_cli_todo.md` and `docs/Tasks/claude_monitor_integration.md`).

## Acceptance Criteria
- Every tracker command listed above has at least one Behave scenario; new commands must extend the coverage map when added.
- Pytest + Behave suites pass, and the SOP references the standard process.
- `docs/SESSION_HANDOFF.md` mentions the completed sweep once finished.
- New backlog items begin with a `.feature` stub (include placeholder scenario + fixtures) and are logged in the task ↔ spec table in `docs/Tasks/tracker_cli_todo.md` before code changes.

## References
- `docs/ai-docs/codex-status-refresh.md`
- `docs/SOP/standard-operating-procedures.md` (pending BDD section update)
- `features/tracker_aliases.feature`
