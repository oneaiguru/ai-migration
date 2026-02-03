# Codebase Map

High-level view of the `~/ai/projects/agentos` repository: directories, key modules, and where supporting docs/tests live.

## Root Layout

| Path | Purpose | Key Docs/Notes |
| --- | --- | --- |
| `AGENTS.md` | Operator onboarding summary and validation commands | Updated with alias/test instructions |
| `README.md` | Project overview, required reading list, SOP pointers | Links to BDD workflow, methodologies |
| `progress.md` | Running session log, command history | Append after every micro-cycle |
| `docs/` | SOPs, PRD, ADRs, task briefs, methodologies | See `docs/System/codebase-map/docs.md` |
| `features/` | Behave feature files + step definitions | BDD coverage for tracker workflows |
| `tracker/` | Python package for the subscription tracker CLI | Detailed modules map below |
| `tests/` | Pytest suites + fixtures (`codex/`, `claude/`, `glm/`, `ccusage/`, `claude_monitor/`) | Fixtures sourced from live panes |
| `scripts/` | Shell helpers (`tracker-aliases.sh`, claude tooling) | Source before field work |
| `plans/` | Execution plans for upcoming tracker phases | Reference before picking tasks |
| `data/week0/live/` | JSONL outputs captured by aliases/CLI | Ensure integrity before handoff |
| `archive/` | Legacy analyses/raw assets awaiting triage | Root curation task pending |

## Tracker Package (`tracker/src/tracker/`)

| Module | Description |
| --- | --- |
| `cli.py` | CLI entrypoint (ingest/override/alias/preview); wires parsers & storage |
| `alias_runtime.py` | Alias state machine (start/end/cross/delete) for codex/claude/glm |
| `sources/` | Parsers: `codex.py`, `claude.py`, `ccusage.py`, `codex_ccusage.py`, `claude_monitor.py` |
| `storage/jsonl.py` | Append/load helpers for snapshots, windows, glm counts, ccusage, monitor |
| `estimators/` | Efficiency computation (`efficiency.py`) used by preview |
| `normalize/windows.py` | Snapshot grouping + delta calculations |
|

## Tests & Fixtures

| Path | Contents |
| --- | --- |
| `tests/test_alias_cli.py` | Alias CLI unit coverage (start/end/cross/delete, multi-pane regression) |
| `tests/test_cli_flow.py` | End-to-end ingest→complete→preview flow |
| `tests/test_parsers.py` | Unit tests for Codex/Claude parsers |
| `tests/test_ccusage.py` | GLM ccusage parser + CLI ingest coverage |
| `tests/test_codex_ccusage.py` | Codex ccusage bridge tests |
| `tests/test_claude_monitor.py` | Claude monitor parser + ingest tests |
| `features/tracker_aliases.feature` | Behave scenarios for alias flows (including multi-pane) |
| `features/tracker_cli.feature` | Behave scenarios for core CLI commands (ingest, override, ccusage, monitor) |
| `features/steps/` | Shared Behave step definitions |

## Documents & Methodologies

See `docs/System/codebase-map/docs.md` for SOP/task references and `docs/System/methodologies/README.md` for workflow experiments (alias cycle, BDD cadence, churn measurement).

## Scripts & Automation

| Script | Purpose |
| --- | --- |
| `scripts/tracker-aliases.sh` | Sources alias functions (`os/oe/ox`, `occ`, `acm`, etc.) |
| `scripts/claude-trace/` | Anthropic trace helpers (legacy) |
| `docs/Tasks/codex_status_automation.md` | Shell-only plan to capture Codex `/status` |

Keep this codebase map updated when structure changes or new modules land.
