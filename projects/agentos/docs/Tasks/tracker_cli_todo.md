# TODO: Tracker CLI Follow-ups (Week-0)

Initial verification is complete (see `progress.md` section **2025-11-05 Tracker CLI Implementation**). Remaining work shifts to the follow-up plan at `plans/2025-11-05_tracker-next.plan.md`.

## Execution Log — Tracker Phase 2 (2025-11-05)

- [x] Phase 0 — complete required reading (`docs/SOP/PRD_v1.6-final.md`, `docs/SOP/week0_final_protocol.md`, `docs/SOP/saturday_prep_checklist.md`, `docs/Tasks/tracker_cli_discovery.md`, `docs/Tasks/tracker_phase2_executor.md`, `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`, `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md`, `~/wiki/replica/work/KnownQuirks.md`).
- [x] Phase 0.5 — tooling pre-flight (`uv --version`; `cd tracker && uv venv .venv`; `. .venv/bin/activate && uv pip install -e .[dev]`; confirm fixtures; `pytest`).
  - `uv --version` → `uv 0.5.4`
  - `uv venv .venv` (tracker) → reused interpreter; env ready
  - `uv pip install -e .[dev]` → deps ok
  - Fixture check via `ls` → codex/claude/glm samples present
  - `pytest` → all 6 tests passed
- [x] Phase 1 — preview command and efficiency estimator (run `pytest tests/test_parsers.py tests/test_cli_flow.py`; `tracker preview --window W0-TEST`).
  - Added estimator module + CLI preview; updated tests covering preview output
  - `pytest tests/test_parsers.py tests/test_cli_flow.py` → pass
  - `tracker preview --window W0-TEST` → verified provider summary
- [x] Phase 2 — GLM ccusage bridge (run `pytest tests/test_ccusage.py`; `< ../tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-CC --stdin`; `tracker preview --window W0-CC`).
  - Added ccusage parser + CLI ingest path + JSONL loader; introduced coverage tests and preview check for GLM
  - `pytest tests/test_ccusage.py` → pass
  - `tracker ingest glm --window W0-CC --stdin` (fixture) → prompts appended to `glm_counts.jsonl`
  - `tracker preview --window W0-CC` → returns `no windows recorded` (expected until window finalized)
- [x] Phase 3 — documentation updates (`README.md`, `docs/SOP/saturday_prep_checklist.md`, `docs/Tasks/tracker_cli_todo.md`).
  - README quick start now covers GLM ingest + targeted pytest commands
  - Saturday prep checklist refreshed with ccusage fixture capture and expanded dry-run steps
  - TODO log reflects completed phases + notes for future preview behaviour (awaiting finalized windows)

See `plans/2025-11-05_tracker-next.plan.md` for detailed steps, validation commands, and acceptance criteria.

## Upcoming Tasks (see `plans/005_long_session.plan.md`)

### Task ↔ Spec Mapping (keep updated)
| Task | Status | Primary Spec | Notes |
| --- | --- | --- | --- |
| Aliases UX & session chaining | in progress | `features/tracker_aliases.feature` | Additional scenarios to capture CLI automation once ready. |
| BDD parity sweep | open | (tbd per command) | Draft new scenarios before implementation. |
| Wiki migration follow-up | open | n/a | Documentation only. |
| Claude monitor integration | ✅ | `features/tracker_cli.feature` (Scenario: Ingest Claude monitor snapshot) | Maintain fixtures under `tests/fixtures/claude_monitor/`. |
| Codex `/status` automation | ✅ | `features/tracker_automation.feature` | Shell script + Behave coverage in place; see recipe + automation task for usage. |
| ccusage-codex coverage | ✅ | `features/tracker_ccusage.feature` | Daily/weekly/session scenarios implemented with CLI `--scope` and preview integration. |
| Archive curation | ✅ | n/a | 2025-10-18 backlog summarised; see detailed plan for remaining folders. |
| Long-session tracking | open | `docs/System/methodologies/tracker_alias_cycle/experiments/001_provider_windows.md` | Reference for experiment logging rather than BDD. |
| Subagent telemetry ingest | open | `docs/Tasks/subagent_proxy_telemetry_ingest.md` | Ingest only; preview block + cost compare script. |
| Stats/CI in preview | ✅ | docs/Tasks/tracker_cli_todo.md | Preview now prints efficiency, CI, n, power with gating for `n < 3`. |
| Outcome & quality capture | ✅ | docs/Tasks/tracker_cli_todo.md | Window finalize stores `quality_score` + `outcome`; preview renders UPS line. |
| UPS v0.1 cross-links | ✅ | docs/System/schemas/universal_provider_schema.md | README, SOPs, and recipes updated to match UPS fields. |
| Churn instrumentation | open | docs/Tasks/git_churn_next_steps.md | Implement commit-range + churn ledger workflow. |

- Long Session 002 — Single-lane (codex)
  - [x] Close W0-20 AFTER (alias end; +5 min buffer)
  - [x] Finalize W0-20 (features, quality, outcome)
  - [x] Churn W0-20 (commit range HEAD~1→HEAD)
  - [x] Acceptance evidence ledger rows (W0-19, W0-20) — pytest + behave
  - [x] Capability map for project: docs/System/capability_map/agentos/capabilities.csv
  - [x] Specs seeded (6+):
    - docs/Tasks/specs/CAP-PREVIEW-NOTES.md
    - docs/Tasks/specs/CAP-LEDGER-EVIDENCE.md
    - docs/Tasks/specs/CAP-CLI-ALIAS-DEL.md
    - docs/Tasks/specs/CAP-FINALIZE.md
    - docs/Tasks/specs/CAP-CHURN.md
  - [x] Implement CAP-PREVIEW-NOTES (code + test)
  - [x] Implement CAP-CLI-ALIAS-DEL (od1/od2 wrappers)
  - [x] Implement CAP-DECISION-CARD (decision script + SOP)
  - [x] Open/close next window (W0-CHP) — captured AFTER, finalized, churned
  - [x] Append end-of-session ledger checkpoint for W0-CHP

- [ ] Aliases UX & session chaining (`docs/Tasks/tracker_cli_aliases.md`) — expose `os/oe/ox`, `as/ae/ax`, `zs/ze/zx` entrypoints that accept pasted panes, update docs/wiki, and integrate with tracker CLI (BDD plan drafted; awaiting implementation).
    - [x] Implement `tracker alias` subcommand with start/end/cross actions and provider state management under `data/week0/live/state/`.
    - [x] Ship `scripts/tracker-aliases.sh` plus sourcing instructions in README + wiki; validate aliases via pytest.
    - [x] Backfill `progress.md` and `docs/SESSION_HANDOFF.md` after alias rollout with command logs and guardrail notes.
    - [x] Add deletion/undo support (`tracker alias delete`) with matching shell shortcuts and BDD/pytest coverage.

- [ ] Subagent telemetry ingest (`docs/Tasks/subagent_proxy_telemetry_ingest.md`)
    - [ ] Implement `tracker ingest proxy-telemetry --stdin` to write `proxy_telemetry.jsonl` (append-only, stamped)
    - [ ] Preview block: show routed %, p50/p95 latency, error rate
    - [ ] `scripts/tools/proxy_cost_compare.py` prints GLM vs baseline deltas for ≥3 matched features
    - [ ] Do NOT build any proxy/gateway; scope limited to ingestion + visualization; inputs from `logs/usage.jsonl`
    - [ ] Live ingest other agent (W0-CHN) telemetry while they work:
          `tail -n +1 logs/usage.jsonl | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest proxy-telemetry --window W0-CHN --stdin`
    - [ ] After ingest, run cost compare and paste top-3 rows into `docs/SESSION_HANDOFF.md`:
          `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live`
    - [ ] If running aliases concurrently, set `AGENT_ID=sub1` before sourcing aliases to isolate state
- [x] Stats/CI in preview — expose efficiency CI, sample size, and power with low-n gating.
    - [x] Extended `compute_efficiency` to return `sample_size` + `power`; added pytest coverage (`tracker/tests/test_efficiency.py`).
    - [x] Preview prints CI/n/power per provider and defers CI when `n < 3`.
- [x] Outcome & UPS alignment — persist quality metadata and surface it consistently.
    - [x] `tracker complete` records `quality_score` + `outcome`; preview renders UPS summary lines.
    - [x] README + Saturday prep checklist now demonstrate `--outcome` usage alongside CI/power output notes.
    - [x] Contracts/recipes reference UPS v0.1 quality/outcome fields for operators.
- [x] BDD/Behave coverage — port existing parser/CLI behaviour into feature files under `features/` (or `tests/bdd/`) aligned with PRD; include alias scenarios once implemented.
    - [x] Establish `features/` layout with alias scenarios + step definitions (`features/tracker_aliases.feature`, `features/steps/alias_steps.py`).
    - [x] Migrate parser/CLI behaviour from pytest suite into BDD scenarios; ensure behave execution wired into CI ritual (`features/tracker_cli.feature`, `features/steps/tracker_cli_steps.py`; commands: `cd tracker && . .venv/bin/activate && pytest && behave features`).
- [ ] Wiki migration follow-up — outline knowledge transfer from archive docs into wiki (`~/wiki/replica/...`) so agents have a central reference outside repo SOPs.
- [x] Churn instrumentation — Commits 1–3 shipped (docs/schema, CLI collector, preview + BDD/UAT). Follow-up automation lives under `docs/System/scheduler/standing_jobs.md`.
- [x] Claude monitor integration — add parser/ingest path for `claude-monitor` realtime output so Claude percentage bars can be captured without `/usage` pane; document usage alongside aliases (command refs: `claude-monitor --view realtime`, `claude-monitor --help`).
    - [x] Capture investigation notes + proposed bridge (`docs/Tasks/claude_monitor_integration.md`).
    - [x] Record sample output (`tests/fixtures/claude_monitor/claude_monitor_realtime_help.txt`, `tests/fixtures/claude_monitor/realtime_sample.txt`) with current CLI limitations (no JSON export available).
    - [x] Implement ingest command + alias wiring once parser and fixtures are ready (`tracker/src/tracker/sources/claude_monitor.py`, `tracker/tests/test_claude_monitor.py`, `features/tracker_cli.feature`, `scripts/tracker-aliases.sh`).
- [x] Codex `/status` multi-pane handling — parser should keep only the latest block and aliases must ignore intermediate panes (`docs/ai-docs/codex-status-refresh.md`).
    - [x] Add fixture (`tests/fixtures/codex/live_cases/W0-20_after_multi_status.txt`) to pytest/Behave coverage (`features/tracker_aliases.feature`).
    - [x] Update `parse_codex_status` and alias flow to strip earlier panes; verify with tests (`pytest tests/test_parsers.py tests/test_alias_cli.py`; `behave features`).
- [ ] BDD parity sweep — align all tracker behaviours with the BDD SOP (`docs/Tasks/bdd_tracker_standardization.md`).
    - [ ] Review `docs/SOP/standard-operating-procedures.md#bdd-workflow-tracker-tooling` before planning.
    - [ ] Inventory uncovered commands (ingest/override/preview/GLM/etc.) and plan scenarios.
    - [ ] Add feature files + step defs for missing flows; ensure fixtures exist.
    - [ ] Make `behave features` part of the standard validation checklist.
- [ ] Token usage checkpoints — update ledger schema and SOP to record plan/mid/final estimates for each session (ref: docs/Backlog/token_tracking_checkpoints.md).
- [ ] SOP update — document the tracker BDD workflow (feature authoring, fixtures, validation) inside `docs/SOP/standard-operating-procedures.md` and reference it from prep checklists.
- [x] ccusage-codex bridge — ingest Codex session data from ccusage for 5h cost tracking.
    - [x] Capture fixture (`tests/fixtures/ccusage/codex_sessions_sample.json`) via `npx @ccusage/codex@latest session --json`.
    - [x] Implement parser + CLI ingest + alias integration; add pytest/Behave coverage (`tracker/src/tracker/sources/codex_ccusage.py`, CLI wiring, `tracker/tests/test_codex_ccusage.py`, `features/tracker_cli.feature`; alias `occ` in `scripts/tracker-aliases.sh`).
- [x] Codex `/status` automation — shell wrapper emits panes and pipes into aliases (`docs/Tasks/codex_status_automation.md`).
    - [x] `scripts/automation/codex_status.sh` seeds sessions (`codex exec "hi"`), enforces configurable buffer, and calls `python -m tracker.cli alias`.
    - [x] Fixtures drive Behave coverage (`features/tracker_automation.feature`) and notes stored in `docs/Recipes/codex_status_capture.md`.
    - [ ] Schedule automation (Keyboard Maestro/`launchd`) once live runs validate the wrapper.
- [x] Archive curation — 2025-10-18 backlog summarised (`docs/Tasks/archive_curation.md`).
    - [x] Summaries published under `docs/Archive/` (tracker repo survey, reporting tasks, magic prompts) with README/context links.
    - [x] `docs/System/context-engineering.md` and planner prompts now reference progressive summaries.
    - [ ] Continue migrating remaining archive folders (raw feedback, legacy PRDs) as cycles permit.
- [x] Documentation polish — capture Codex pruning/reset behaviour, alias/automation tips, and BDD troubleshooting (see current session notes).
- [ ] Long-session tracking — operate per `docs/Tasks/tracker_long_session_plan.md` and log shipped scenarios in `docs/Tasks/tracker_feature_log.md`.
### Session Rituals
- [ ] Session TLDR — follow `docs/SOP/session_reflection_sop.md`, save reflection to `docs/SessionReports/<date>_TLDR.md`, update `progress.md` + `docs/SESSION_HANDOFF.md`.
- [ ] Token/Churn/Feature ledgers — update CSVs under `docs/Ledgers/` at end of session.
- [x] Document creative expansion set from 2025-10-19:
    - [x] Add session reports (`docs/SessionReports/2025-10-19_Ideas.md`, `..._Decisions.md`, `..._Risks.md`).
    - [x] Capture brainstorming/triage SOP (`docs/SOP/brainstorming_sop.md`).
    - [x] Add backlog naming SOP (`docs/SOP/backlog_naming_sop.md`).
    - [x] Create recipes index + specific recipes (`docs/Recipes/*.md` and `docs/SOP/recipes_index.md`).
    - [x] Update backlog index with quick wins & spec files.
    - [x] Note contracts update (tool/schema version, optional reset_at).
    - [x] Log anti-patterns (no hard reset assumptions, local security posture, flat docs).
- [x] Follow-up actions from 2025-10-19 planning review:
    - [x] Add `.gitignore` entries to exclude event logs (e.g., `data/events*.jsonl`, automation logs).
    - [x] Insert "Next Agent: Start Here" block in `README.md` linking plan, SOPs, recipes, session reports.
    - [x] Extend recipes index with a quick ledger update example.
    - [x] Ensure placeholder BDD scenarios are flagged (e.g., `@todo`) until replaced.
    - [x] Update next-session plan with an "If ahead of schedule" quick-wins list.
    - [x] Add reminder in ccusage/automation tasks about recording `reset_at` (no hard-coded reset times).
    - [x] Prepare quick-wins sprint plan (Session +1) covering NAV generator, snapshot/restore, coverage map, scenario harvester, token governor, bundle, etc.
- Long Session 002
  - [x] Phase A — Automation pack (ledger checkpoint + anomalies in preview)
    - [x] Add `scripts/automation/ledger_checkpoint.sh` to append plan/mid/final tokens, run `tracker churn`, update handoff paths (auto decision card)
    - [x] Ensure `JsonlStore.append_anomaly` writes are surfaced; preview prints `Anomalies: N`
    - [x] Update `docs/System/scheduler/standing_jobs.md` with ready-to-run snippets
  - [x] Phase B — Parallel agents
    - [x] Stamp `AGENT_ID` into snapshots and isolate state under `data/week0/live/state/<agent>`
    - [x] Document simple lock (flock) in wrappers to avoid collisions
    - [x] Extend `docs/Tasks/tracker_cli_aliases.md` + wiki pointer for multi-agent setup
  - [x] Phase C — Subagent proxy telemetry
    - [x] Parser `tracker/src/tracker/sources/proxy_telemetry.py` + `tracker ingest proxy-telemetry --stdin` → `proxy_telemetry.jsonl`
    - [x] Preview block: routed %, latency p50/p95, error rate
    - [x] `scripts/tools/proxy_cost_compare.py` (GLM vs baseline per feature)
    - [x] Doc `docs/Tasks/subagent_poc_tracking.md` with telemetry fields + acceptance

### W0-CHP-1 Feature Work
- [x] CAP-LEDGER-CHECKPOINT-AUTO — `scripts/automation/ledger_checkpoint.sh --decision-card`
- [x] CAP-FEATURE-RESERVE — `scripts/tools/reserve_feature.py` helper for planned rows
- [x] CAP-KNOWLEDGE-LINK — docs link to alias/scheduler wiki + handoff pointer
- [x] Cleanup superseded W0-CHP-1 window entry (documented in handoff; future prune utility optional)

### Brief #6 — Polishing & Proxy Hardening
- [x] Add `_format_percent` helper and reuse across preview/decision-card/cost-compare. ✅ tracker/src/tracker/formatting.py + CLI/scripts updated, tests adjusted.
- [x] Refactor `parse_proxy_telemetry_stream` latency handling to single `_to_float` pass.
- [x] Introduce proxy status whitelist (avoid marking routed/cached as errors) and update tests.
- [x] Set `asyncio_default_fixture_loop_scope = function` in pytest config to remove warnings (pytest.ini).
- [x] Harden `tracker churn` when commit hashes missing (warn, skip diff, mark decision=missing-commit-range).
- [x] Implement `tracker window-audit --window <id>` (read-only duplicate report) and document usage.

### Brief #7 — Optimizer Hardening Follow-up
- [ ] Generate Show & Ask evidence pack (preview, decision card, window-audit, cost compare) and embed outputs in board + handoff. *(Codex W0-CHP-2 captured; need additional windows/Claude+GLM runs before final bundle.)*
- [ ] Document PRD decision requests (GO criteria, proxy error whitelist vs 2xx rule) in `docs/SESSION_HANDOFF.md` and leave TODOs for follow-up.
- [x] Add `--json` (or `--format json`) output to `tracker window-audit`, with pytest coverage and docs updates. ✅ CLI now supports `--format json`/`--json`; tests (`test_window_audit_json_format`) and scheduler docs updated.
- [ ] After PRD approval: generalize proxy “healthy” statuses to cover 2xx responses; update parser/tests/docs.
- [ ] Draft read-only duplicate-prune helper plan and capture backlog entry.
