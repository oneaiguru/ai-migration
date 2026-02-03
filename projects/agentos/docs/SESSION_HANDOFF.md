# Session Handoff Log

Summaries of Scout → Planner → Executor cycles. Keep entries concise and archive older sections when the log grows too long.

## YYYY-MM-DD – <Role>: <Task>
- Agent: `<identifier>`
- Plan: `plans/YYYY-MM-DD_<task>.plan.md`
- Inputs: key docs, prompts, tasks referenced
- Work summary: bullet list with file:line references
- Validation: commands run and outcomes
- Next: remaining steps or blockers

## 2025-11-05 – Scout: Tracker CLI Foundations
- Agent: `codex`
- Plan: *(not drafted yet — planner required)*
- Inputs: `progress.md`, `docs/Tasks/tracker_cli_todo.md`, `docs/SOP/PRD_v1.6-final.md`, `docs/SOP/week0_final_protocol.md`, `archive/v1_3/tracker/sources/*`, `archive/v1_3/tests/bdd/*`
- Work summary: Documented current state and gaps in `docs/Tasks/tracker_cli_discovery.md`; noted empty `tracker/` package, archived parser sources, fixture coverage, and missing ai-docs workspace.
- Validation: No code executed (discovery only).
- Next: Draft change plan for implementing tracker CLI modules and wiring ingest/finalize commands per Week-0 protocol.

## 2025-11-05 – Planner: Tracker CLI MVP
- Agent: `codex`
- Plan: `plans/2025-11-05_tracker-cli.plan.md`
- Inputs: `docs/Tasks/tracker_cli_discovery.md`, `docs/SOP/PRD_v1.6-final.md`, `docs/SOP/week0_final_protocol.md`, `archive/v1_3/tracker/sources/*`
- Work summary: Authored plan to build `src`-layout tracker package, port Codex/Claude parsers, implement JSONL storage + CLI (`ingest`, `override`, `complete`), and add pytest coverage for parser fixtures and CLI flow.
- Validation: Plan review only; no code executed.
- Next: Execute plan, run pytest, sanity-check CLI with fixtures, update progress/handoff with results.

## 2025-11-05 – Executor: CE Prompt Localization
- Agent: `codex`
- Plan: *ad hoc prompt import*
- Work summary: Copied replica CE prompts into `docs/System/CE_MAGIC_PROMPTS/` with BDD-specific adaptations; updated `docs/System/context-engineering.md`, `AGENTS.md`, `docs/SOP/plan-execution-sop.md`, and `docs/SOP/code-change-plan-sop.md` to use absolute paths and new instructions.
- Validation: Manual doc review; no automated tests required.
- Next: Proceed with tracker CLI plan execution (`plans/2025-11-05_tracker-cli.plan.md`).

## 2025-11-05 – Executor: Tracker CLI MVP
- Agent: `codex`
- Plan: `plans/2025-11-05_tracker-cli.plan.md`
- Work summary: Built `tracker` package (`pyproject.toml`, `src/tracker/*`), implemented Codex/Claude parsers, JSONL storage, normalization helpers, and CLI handlers; added pytest coverage (`tracker/tests/test_parsers.py`, `tracker/tests/test_cli_flow.py`).
- Validation: `uv venv .venv`; `uv pip install -e .[dev]`; `pytest`; manual CLI dry run (`tracker ingest codex --window W0-TEST ...`, `tracker complete --window W0-TEST ...`) with results captured in `tracker/data/week0/{snapshots,windows}.jsonl`.
- Next: Extend CLI with GLM/ccusage bridge and estimator modules per PRD once additional fixtures are available.

## 2025-11-05 – Planner: Tracker Phase-2 Ready
- Agent: `codex`
- Plan: `plans/2025-11-05_tracker-next.plan.md`
- Work summary: Added required-reading gate, pre-flight checklist, and per-phase command matrix to the plan; created GLM ccusage fixtures (`tests/fixtures/glm/*.json`) and noted them in discovery; updated README, Saturday prep checklist, and tracker TODO to reflect new workflow.
- Validation: Documentation review; no code execution beyond fixture creation.
- Next: Execute the plan to implement preview command, efficiency estimator, and ccusage bridge following the documented steps.

## 2025-11-05 – Executor: Tracker Phase-2
- Agent: `codex`
- Plan: `plans/2025-11-05_tracker-next.plan.md`
- Inputs: Required doc stack from plan, GLM fixtures under `tests/fixtures/glm/`, ccusage CLI output.
- Work summary:
  - Added estimator module + preview integration (`tracker/src/tracker/estimators/efficiency.py:1`, `tracker/src/tracker/cli.py:17`) with provider snapshot status in CLI output.
  - Implemented GLM ccusage bridge and JSONL loader (`tracker/src/tracker/sources/ccusage.py:1`, `tracker/src/tracker/storage/jsonl.py:33`) plus ingest handling in CLI (`tracker/src/tracker/cli.py:127`).
  - Extended pytest coverage for preview + GLM workflows (`tracker/tests/test_cli_flow.py:119`, `tracker/tests/test_ccusage.py:21`).
  - Refreshed operator docs: `README.md:22`, `docs/SOP/saturday_prep_checklist.md:105`, `docs/Tasks/tracker_cli_todo.md:5`, `progress.md:56`.
- Validation:
  - `pytest tests/test_parsers.py tests/test_cli_flow.py`
  - `pytest tests/test_ccusage.py`
  - `tracker preview --window W0-TEST`
  - `< ../tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-CC --stdin`
  - `tracker preview --window W0-CC` (returns "no windows recorded" until a live window is finalized)
- Next: Capture a real Week-0 window with GLM prompts so preview surfaces capacity stats for `W0-CC`; continue with estimator refinements once live data arrives.

## 2025-11-06 – Executor: Tracker Alias UX
- Agent: `codex`
- Plan: `plans/2025-11-05_tracker-next.plan.md` (Phase 4 extension from TODO log)
- Inputs: `docs/Tasks/tracker_cli_aliases.md`, `docs/Tasks/tracker_cli_todo.md`, Codex/Claude fixtures under `tests/fixtures/{codex,claude}`, ccusage JSON reference.
- Work summary:
  - Added alias runtime/state manager (`tracker/src/tracker/alias_runtime.py:1`) and wired new CLI subcommand (`tracker/src/tracker/cli.py:11`) to support `start/end/cross` actions per provider, including GLM baseline/delta math.
  - Authored operator wrapper `scripts/tracker-aliases.sh:1` exposing `os/oe/ox`, `as/ae/ax`, `zs/ze/zx` commands with configurable data/state directories.
  - Codex multi-pane regression covered: scenario added to `features/tracker_aliases.feature:78`, parser isolates latest pane (`tracker/src/tracker/sources/codex.py:1`), and regression tests live in `tracker/tests/test_parsers.py:1` + `tracker/tests/test_alias_cli.py:1`.
  - Validation loop: `cd tracker && . .venv/bin/activate && pytest tests/test_parsers.py tests/test_alias_cli.py && behave features`.
  - Tracker CLI BDD sweep delivered: `features/tracker_cli.feature:1` with shared steps in `features/steps/tracker_cli_steps.py:1` exercises ingest/complete/preview, override, and GLM flows alongside pytest (`tests/test_cli_flow.py:1`).
  - Validation loop: `cd tracker && . .venv/bin/activate && pytest && behave features`.
  - Codex ccusage bridge added: parser (`tracker/src/tracker/sources/codex_ccusage.py:1`), CLI ingest + storage (`tracker/src/tracker/cli.py:18`, `tracker/src/tracker/storage/jsonl.py:12`), pytest coverage (`tracker/tests/test_codex_ccusage.py:1`), Behave scenario (`features/tracker_cli.feature:31`), and alias helper (`scripts/tracker-aliases.sh:70`).
  - Validation loop: `cd tracker && . .venv/bin/activate && pytest && behave features`; fixture captured via `npx @ccusage/codex@latest session --json`.
  - Claude monitor ingestion added: text parser (`tracker/src/tracker/sources/claude_monitor.py:1`), CLI branch + storage (`tracker/src/tracker/cli.py:18`, `tracker/src/tracker/storage/jsonl.py:12`), pytest coverage (`tracker/tests/test_claude_monitor.py:1`), Behave scenario (`features/tracker_cli.feature:37`), and alias helper (`scripts/tracker-aliases.sh:84`).
  - Fixtures captured under `tests/fixtures/claude_monitor/` (`claude_monitor_help.txt`, `realtime_sample.txt`) with current CLI limitations (no JSON export).
  - Autonomous session prep: Experiment 001 template (`docs/System/methodologies/tracker_alias_cycle/experiments/001_provider_windows.md`), task roadmap (`docs/Tasks/autonomous_long_session_plan.md`), archive curation task (`docs/Tasks/archive_curation.md`), and updated backlog/spec mapping (`docs/Tasks/tracker_cli_todo.md`).
  - Session reflection & planning assets added: `docs/SessionReports/2025-10-19_{TLDR,Ideas,Decisions,Risks}.md`, SOPs (`docs/SOP/{brainstorming_sop,backlog_naming_sop}.md`), recipes index (`docs/SOP/recipes_index.md`), backlog integration/feasibility maps, anti-pattern guardrails, and token ledgers under `docs/Ledgers/`.
  - Expanded documentation: README alias workflow (`README.md:33`), Saturday prep checklist sourcing step (`docs/SOP/saturday_prep_checklist.md:90`), alias task brief update (`docs/Tasks/tracker_cli_aliases.md:1`), and progress log entry (`progress.md:68`).
  - Added doc polish: Saturday prep checklist covers double `/status` polling + PYTHONPATH, contracts define `snapshot_id`, and AI-docs capture pruning/reset behaviour with CLI limitations.
  - Added pytest coverage for alias flows (`tracker/tests/test_alias_cli.py:1`) ensuring state persistence, error messaging, cross-window seeding, and GLM delta calculations.
  - Established Behave coverage for alias scenarios (`features/tracker_aliases.feature:1`, `features/steps/alias_steps.py:1`) to validate Codex/Claude snapshots and GLM baselines end-to-end.
  - Documented claude-monitor bridge plan in `docs/Tasks/claude_monitor_integration.md:1` after surveying CLI output and wiki notes.
  - Added deletion UX (`tracker alias delete` + `od/ad/zd`) to support undoing bad panes; JSONL rewrite + state refresh covered by `tracker/tests/test_alias_cli.py` and Behave scenario.
  - Replicated the W0-19/W0-20 Codex cleanup as fixtures + BDD scenario (`tests/fixtures/codex/live_cases/*`, `features/tracker_aliases.feature:39`) so the undo flow matches real field data.
  - Removed unreliable W0-19 Codex snapshots from `data/week0/live/snapshots.jsonl` pending a clean reread; W0-20 start pane logged for the next window.
  - Replayed the live commands to restore W0-19 before/after plus W0-20 start (`data/week0/live/snapshots.jsonl` now shows the validated set; state points to W0-20 awaiting end).
  - Documented Codex `/status` refresh lag in `docs/ai-docs/codex-status-refresh.md`; need to teach parsers/tests to ignore intermediate panes in multi-block outputs.
  - Captured long-session guidance (`docs/Tasks/tracker_long_session_plan.md`) and the running feature log so future agents continue the single-agent Codex cadence with measurable outputs.
- Validation:
  - `cd tracker && uv venv .venv`
  - `. .venv/bin/activate`
  - `uv pip install -e .[dev]`
  - `pytest`
- `behave features`
- Next: Document alias usage in wiki (`~/wiki/.../TrackerAliases.md`), then advance to Behave/BDD coverage and claude-monitor ingestion per TODO.

## 2025-10-20 – Executor: Tracker Phase-2 Extensions
- Agent: `codex`
- Plan: `plans/2025-10-20_next_session.plan.md`
- Inputs: `docs/Tasks/ccusage_codex_coverage.md`, `docs/Tasks/codex_status_automation.md`, `docs/System/methodologies/tracker_alias_cycle/experiments/001_provider_windows.md`, `docs/Tasks/archive_curation.md`.
- Work summary:
  - Added scope-aware ccusage parser/CLI/preview support (`tracker/src/tracker/sources/codex_ccusage.py`, `tracker/src/tracker/cli.py`, `tracker/src/tracker/storage/jsonl.py`) plus Behave/Pytest coverage (`features/tracker_ccusage.feature`, `tracker/tests/test_codex_ccusage.py`).
  - Delivered Codex `/status` automation script (`scripts/automation/codex_status.sh`) and wired alias source override (`tracker/src/tracker/alias_runtime.py` + `features/tracker_automation.feature`).
  - Smoothed alias Behave steps (`features/steps/alias_steps.py`) so delete + GLM inline JSON flows run under full suite.
  - Simulated Experiment 001 windows via fixtures: Codex W0-21 (automation script + ccusage ingest + `tracker complete`), Claude W0-21C (alias start/end, claude-monitor ingest, window finalize). Preview now surfaces ccusage block lines.
  - Updated operator docs: README alias workflow, Saturday prep automation notes, tracker TODO statuses, ccusage coverage task, archive summary README/context references. Added progressive summaries for tracker survey, reporting tasks, and magic prompts.
  - Ledgers/feature log appended with W0-21/W0-21C records (`docs/Ledgers/*.csv`); tracker CLI alias TODO + archive curation updated to ✅.
- Validation:
  - `PYTHONPATH=tracker/src pytest`
  - `PYTHONPATH=tracker/src behave features`
  - `PYTHONPATH=tracker/src python -m tracker.cli preview --data-dir data/week0/live`
  - TLDRs archived at `docs/SessionReports/2025-10-20_{TLDR,TLDR_PRO}.md`; changed-file manifest at `docs/SessionReports/2025-10-20_CHANGED_FILES.txt`.
- Next:
  - Capture live ccusage daily/weekly snapshots once subscription data available and extend Behave cases accordingly.
  - Build Claude automation wrapper analogous to codex script; document alias usage in wiki (`~/wiki/.../TrackerAliases.md`).
  - Migrate archive summary highlights into backlog specs where execution is pending.
  - Follow plan `plans/001_next_session.plan.md` (UAT opener + eight priorities) at session start.
  - Bundle: <bundle path here once created>
- Board: `docs/SessionBoards/001_board.md`
- PRO TLDR (reference): `docs/CurrentPlan/001_PRO_TLDR.md`

## Next Agent Brief
- See `docs/CurrentPlan/001_Agent_Brief.md` for the Ready‑Next execution plan (reading list, validation matrix, guardrails).
- PRO TLDR (ingested): `docs/CurrentPlan/002_PRO_TLDR.md` (source: `/Users/m/Desktop/TLDR.markdown`).
 - PRO TLDR (operator-grade, current): `docs/CurrentPlan/003_PRO_TLDR.md` (long-session plan)

## 2025-10-21 – Session Start UAT
- UAT commands: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`, `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-21`.
- Results: pytest 29 passed, behave 18 scenarios passed, preview rendered Codex/GLM sections without errors (efficiency currently n/a due to missing capacity data).
- Contracts spot-check: `data/week0/live/windows.jsonl` and `snapshots.jsonl` show non-negative deltas with `reset_at` fields; ledgers present under `docs/Ledgers/`.
- Session board: `docs/SessionBoards/2025-10-21_board.md` (filled at session start).

## 2025-10-21 – Must-Ship Execution
- Metadata: `tracker/src/tracker/storage/jsonl.py` + `tracker/src/tracker/meta.py` stamp `schema_version=1.0.0` and `tool_version=tracker.__version__` across snapshots/windows/ccusage/claude/glm; pytest updated in `tracker/tests/{test_cli_flow,test_codex_ccusage,test_claude_monitor,test_ccusage,test_alias_cli}.py`.
- Automation: added `scripts/automation/claude_monitor.sh` with Behave hook (`features/tracker_automation.feature`) so claude-monitor output ingests via automation notes.
- ccusage: ingested live daily JSON and weekly backfill for W0-21 (`tracker ingest codex-ccusage --scope {daily,weekly}`) — preview now surfaces `percent_used`/`reset_at`; recipe doc refreshed.
- Preview: `tracker/src/tracker/cli.py` prints snapshot audit details `(source=…, notes=…)`.
- Validation matrix: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`, `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-21`.
- Remaining follow-ups: fill `docs/System/scheduler/standing_jobs.md` when scheduler work begins; monitor live weekly ccusage availability to replace backfill sample.

## 2025-10-19 – Stats/CI, Outcome & UPS Delivery
- Efficiency estimator adds `sample_size` + `power` outputs with 95% CI gating (`tracker/src/tracker/estimators/efficiency.py`); preview prints `ci`, `n`, `power` per provider (`tracker/src/tracker/cli.py`).
- Finalize workflow persists `quality_score` + `outcome` (`tracker/src/tracker/cli.py`, `tracker/src/tracker/normalize/windows.py`); preview renders UPS summary lines for single/multi-window views. Existing Week-0 windows backfilled (`data/week0/live/windows.jsonl`).
- Documentation updates: README quick start, Saturday prep checklist, tracker plan snippets, Session Board, and `docs/Tasks/tracker_cli_todo.md` reflect the new CLI flags/output; Ready‑Next block marked complete.
- Added pytest for estimator stats (`tracker/tests/test_efficiency.py`); Behave scenario updated to pass `--outcome` (`features/tracker_cli.feature`, `features/steps/tracker_cli_steps.py`).
- Validation: `PYTHONPATH=tracker/src pytest`; `PYTHONPATH=tracker/src behave features`.
- Next: advance to churn instrumentation plan (`docs/Tasks/git_churn_next_steps.md`) and scheduler standing jobs script once stats release adopted.

## 2025-10-19 – Churn Prep Adjustments
- Token ledger: appended correction row (actual=164k) while keeping original 270k entry for audit history.
- Automation env: switched to `TRACKER_ALIAS_STATE_DIR`; codex/claude scripts + Behave steps use the same knob.
- CLI defaults: `DEFAULT_DATA_DIR` now `data/week0/live`.
- Added commit conventions SOP and populated scheduler standing jobs with automation commands.
- Trimmed obsolete `archive/v1_3/tests/bdd/steps/parse_steps.py` to keep archive greppable (v1_3 content otherwise untouched).
- Tests: `PYTHONPATH=tracker/src pytest`; `PYTHONPATH=tracker/src behave features`.

## 2025-10-19 – Executor: Churn Instrumentation CLI
- Agent: `codex`
- Plan: `docs/Tasks/git_churn_next_steps.md`
- Inputs: `docs/System/vision_snap.md`, `docs/System/git_churn_strategy.md`, `docs/SOP/uat_opener.md`, `docs/Tasks/tracker_cli_todo.md`
- Work summary:
  - Added churn data schema + ledgers (`docs/Ledgers/Churn_Ledger.csv`, `docs/Ledgers/Feature_Log.csv`, `docs/System/schemas/universal_provider_schema.md`, `docs/System/contracts.md`) so windows carry `commit_start/commit_end` metadata.
  - Implemented `tracker churn` subcommand (`tracker/src/tracker/churn.py`, `tracker/src/tracker/cli.py`, `tracker/src/tracker/storage/jsonl.py`) with git numstat bridge and pytest coverage (`tracker/tests/test_churn_cli.py`).
  - Surfaced `Churn:` output in preview and expanded BDD coverage (`features/tracker_cli.feature`, `features/steps/tracker_cli_steps.py`); UAT checklist now calls the churn command (`docs/SOP/uat_opener.md`).
- Validation: `PYTHONPATH=tracker/src pytest`; `PYTHONPATH=tracker/src behave features` (both green).
- Next: Scope churn automation follow-ups — schedule the end-of-session ledger script (`docs/System/scheduler/standing_jobs.md`) and evaluate whether alias wrappers should call `tracker churn` automatically once commit hashes are captured.

## 2025-10-19 – External TLDR Ingestion
- Source: `/Users/m/Desktop/TLDR.markdown`
- Dest: `docs/CurrentPlan/002_PRO_TLDR.md` (sequential numbering per SOP)
- Notes: Aligned SOPs with clean‑data invariants, parallel agents (AGENT_ID), subagent proxy telemetry contract, decision gates, and a 15h long‑session blueprint.

## 2025-10-19 – Pre‑reset cross snapshot (safety)
- Action: Stored Codex `cross` using `/Users/m/Desktop/7.markdown` to ensure an AFTER for the current window and a seeded BEFORE for the next window while cron is not set.
- Result: wrote BEFORE for `W0-CHN` (then AFTER) and seeded BEFORE for `W0-CHN-1`.
- Next agent: if you are present at wrap, prefer clean AFTER (+5 min) and new BEFORE captures per SOP; otherwise these snapshots keep the stream continuous for preview and finalize.

## 2025-10-19 – Executor: Long Session 002 (Phase A/B/C)
- Agent: `codex`
- Plan: `plans/002_long_session.plan.md`
- Work summary:
  - Phase A (Automation): confirmed anomalies count in preview; kept `JsonlStore.append_anomaly` wiring. Scheduler doc shows exact command for `scripts/automation/ledger_checkpoint.sh` (already present).
  - Phase B (Parallel agents): enhanced `scripts/tracker-aliases.sh` with `AGENT_ID` state isolation (`data/week0/live/state/<AGENT_ID>`) and a simple `flock` lock to avoid concurrent alias collisions; auto-stamps `AGENT_ID` into `--notes` when not provided.
  - Phase C (Telemetry ingest): added `scripts/tools/proxy_cost_compare.py` to compare GLM vs baseline token usage per feature (rid); keeps to ingest-only scope (no proxy).
  - Docs: updated `docs/Tasks/tracker_cli_aliases.md` with multi-agent isolation + locking notes.
- Validation:
  - `PYTHONPATH=tracker/src pytest` → 32 passed
  - `PYTHONPATH=tracker/src behave features` → 20 scenarios passed
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN` → no windows recorded (expected without live data)
- Next:
  - At reset (+5 min): capture AFTER for `W0-CHN` and BEFORE for `W0-CHP` via alias commands per brief.
  - Optionally run `scripts/tools/proxy_cost_compare.py --data-dir data/week0/live` after telemetry ingest to print top deltas.
  - If parallel agents are active, export `AGENT_ID` before sourcing aliases; verify separate `state/<id>` dirs are created.

## 2025-10-19 – Executor: Long Session 002 (Phases 1–5 run)
- Agent: `codex`
- Plan: `docs/CurrentPlan/003_PRO_TLDR.md`
- Inputs: Brief + TLDR, tracker CLI, alias wrappers, fixtures
- Work summary:
  - UAT opener: `PYTHONPATH=tracker/src pytest` (32 passed); `PYTHONPATH=tracker/src behave features` (20 passed);
    preview executed (W0-21 visible).
  - Phase 1: closed `W0-20` AFTER via alias using fixture input: `tests/fixtures/codex/live_cases/W0-20_after_multi_status.txt` → `data/week0/live/snapshots.jsonl` updated.
  - Phase 2: verified `scripts/tracker-aliases.sh` isolation and lock; AGENT_ID support present (no collisions expected).
  - Phase 3: ingested subagent telemetry: `logs/usage.jsonl` → `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest proxy-telemetry --window W0-CHN --stdin` → `data/week0/live/proxy_telemetry.jsonl`.
    Cost compare: `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live`.
    Top rows pasted below.
  - Phase 4: finalized and churned windows: `W0-19` (features=2), `W0-20` (features=3).
    - Finalize: `tracker complete --window W0-19 ...` and `tracker complete --window W0-20 ...`.
    - Churn: `tracker churn --window W0-19 --commit-start HEAD~1 --commit-end HEAD` and same for W0-20.
    - Preview shows Providers, Outcome, Churn, Subagent Proxy, ccusage blocks.
  - Phase 5: ledger checkpoint recorded for `W0-20` with planned/actual tokens; churn ledger appended.
- Validation (commands):
  - `PYTHONPATH=tracker/src pytest`
  - `PYTHONPATH=tracker/src behave features`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live alias end codex --stdin --window W0-20 --state-dir data/week0/live/state --notes after-clean < tests/fixtures/codex/live_cases/W0-20_after_multi_status.txt`
  - `tail -n +1 logs/usage.jsonl | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest proxy-telemetry --window W0-CHN --stdin`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live complete --window W0-19 --codex-features 2 --quality 1.0 --outcome pass`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live complete --window W0-20 --codex-features 3 --quality 1.0 --outcome pass`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live churn --window W0-19 --provider codex --methodology session002 --commit-start HEAD~1 --commit-end HEAD`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live churn --window W0-20 --provider codex --methodology session002 --commit-start HEAD~1 --commit-end HEAD`
  - `scripts/automation/ledger_checkpoint.sh --window W0-20 --provider codex --task end_of_session --plan 200000 --actual 168000 --features 3 --notes "session002 close"`
- Artifacts:
  - data/week0/live/snapshots.jsonl
  - data/week0/live/windows.jsonl
  - data/week0/live/proxy_telemetry.jsonl
  - docs/Ledgers/Churn_Ledger.csv
  - docs/Ledgers/Token_Churn_Ledger.csv
- Evidence:
  - docs/Ledgers/Acceptance_Evidence.csv — rows appended for W0-19/W0-20 (pytest, behave)
  - Artifacts: `artifacts/test_runs/TR-*/pytest.txt`, `artifacts/test_runs/TR-*/behave.txt`
- Decision: `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-20` → GO
- W0-CHP close-out:
    - AFTER: `codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live alias end codex --stdin --window W0-CHP --state-dir data/week0/live/state --notes after-clean`
    - Finalize: `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live complete --window W0-CHP --codex-features 2 --quality 1.0 --outcome pass --notes "long session close"`
    - Churn: `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live churn --window W0-CHP --provider codex --methodology long_session --commit-start HEAD~1 --commit-end HEAD`
    - Evidence: `scripts/tools/append_evidence.sh --window W0-CHP --capability CAP-UAT-PYTEST --runner pytest --result pass --artifacts artifacts/test_runs/TR-20251019T162256Z-pytest/pytest.txt --notes "uat opener"`
      and `scripts/tools/append_evidence.sh --window W0-CHP --capability CAP-UAT-BEHAVE --runner behave --result pass --artifacts artifacts/test_runs/TR-20251019T162256Z-behave/behave.txt --notes "uat opener"`
    - Ledger checkpoint: `scripts/automation/ledger_checkpoint.sh --window W0-CHP --provider codex --task end_of_session --plan 200000 --actual 174000 --features 2 --notes "long session close"`
    - Decision: `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP` → GO
- Next plan: `plans/005_long_session.plan.md` (commit A/B/C outline)
- Cost compare (top 3):
  - rid,baseline_tokens,glm_tokens,delta_glm_minus_base
  - R2,1000,1150,150
  - R3,600,750,150
  - R1,1500,1500,0
- Next:
  - If live telemetry continues, re-run cost compare and paste the latest three rows.
  - Close the next window (AFTER+BEFORE) at reset with +5 min buffer; then finalize and run ledger checkpoint.
  - Captured BEGIN of new window `W0-CHP` at reset (00:01) via alias start (notes: before-clean). When this window ends, wait +5 minutes, then capture AFTER:
    - codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live alias end codex --stdin --window W0-CHP --state-dir data/week0/live/state --notes after-clean
  - Single-lane scope: no proxy/remote ingest this session. Focus on codex windows, churn, ledgers, preview, and acceptance evidence.
  - Note: A mid-window progress AFTER was captured for `W0-CHP` (notes: after-progress). This will be superseded by the final AFTER at close; preview uses the latest snapshot.

## 2025-10-19 Phase 6 Prep — Alias + Decision Card Hardening
- Added alias undo coverage and agent isolation tests:
  - `features/tracker_aliases.feature` now covers `od1`/`od2` plus per-agent state (AGENT_ID) flows.
  - `features/steps/alias_steps.py` accepts `context.current_agent_id`; snapshots stamp `AGENT_ID=...` in notes; state files written under `state/<agent>`.
  - New pytest guardrail `tracker/tests/test_alias_state_isolation.py` protects per-agent state + notes behaviour.
- Decision card BDD in place:
  - `features/decision_card.feature` builds a sandbox (tools copied to `scripts/tools`), appends evidence via `append_evidence.sh`, and runs `decision_card.py` (asserts `Status:   GO`, `Anoms:    0`).
  - Shared step updates live in `features/steps/tracker_cli_steps.py` (sandbox helpers, artifact writer, decision-card runner).
- Operator docs updated:
  - `docs/System/scheduler/standing_jobs.md` now lists codex status + ledger checkpoint commands (AGENT_ID-aware) and links to wiki.
  - `docs/Tasks/tracker_cli_aliases.md` quick reference includes od1/od2 usage, AGENT_ID workflow, and wiki pointer.
  - `docs/SOP/uat_opener.md` adds decision-card check after evidence ledger append.
- Wiki follow-through: both docs above now point to `~/wiki/dotfiles/AliasSystem.md` and `~/wiki/replica/work/KnownQuirks.md`; this section serves as the handoff pointer for alias/automation background reading.
- TODO tracker synced: Phase B checklist marked complete; scheduler doc task closed (`docs/Tasks/tracker_cli_todo.md`).
- Validation for this block:
  - `PYTHONPATH=tracker/src pytest`
  - `PYTHONPATH=tracker/src behave features`

Outstanding follow-ups now tracked under Brief #6 (percent helper, latency refactor, proxy status whitelist, pytest config, churn resilience, window-audit command).

## 2025-10-20 W0-CHP-1 Execution
- Commands
  - `scripts/tools/reserve_feature.py --window W0-CHP-1 --capability CAP-LEDGER-CHECKPOINT-AUTO --description "Ledger checkpoint auto decision card" --notes "planned 2025-10-20"`
  - `scripts/tools/reserve_feature.py --window W0-CHP-1 --capability CAP-FEATURE-RESERVE --description "Feature ledger reserve helper" --notes "planned 2025-10-20"`
  - `scripts/automation/ledger_checkpoint.sh --window W0-CHP --provider codex --task automation_decision --plan 180000 --actual 176000 --features 2 --notes "session005 automation test" --decision-card`
  - `scripts/automation/ledger_checkpoint.sh --window W0-CHP-1 --provider codex --task end_of_session --plan 180000 --actual 175000 --features 2 --notes "W0-CHP-1 close" --decision-card`
  - `tail -n +1 tests/fixtures/proxy/telemetry_sample.jsonl | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest proxy-telemetry --window W0-CHN --notes "session005 sample" --stdin`
  - `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live override codex --window W0-CHP-1 --phase after --weekly-pct 24 --fiveh-pct 5 --notes "manual-dev after"`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live complete --window W0-CHP-1 --codex-features 2 --quality 1.0 --outcome pass --notes "session005 window"`
  - `PYTHONPATH=tracker/src python -m tracker.cli churn --window W0-CHP-1 --provider codex --methodology long_session --commit-start $(git rev-parse HEAD) --commit-end $(git rev-parse HEAD)`
  - Test evidence: `PYTHONPATH=tracker/src pytest | tee artifacts/test_runs/W0-CHP-1/pytest.txt`, `PYTHONPATH=tracker/src behave features | tee artifacts/test_runs/W0-CHP-1/behave.txt`
- Artifacts & ledgers updated
  - `docs/Ledgers/Feature_Log.csv` rows for CAP-LEDGER-CHECKPOINT-AUTO and CAP-FEATURE-RESERVE (window W0-CHP-1)
  - `docs/Ledgers/Token_Churn_Ledger.csv` row for W0-CHP-1 with decision status
  - `docs/Ledgers/Acceptance_Evidence.csv` rows for CAP-UAT-PYTEST, CAP-UAT-BEHAVE, CAP-LEDGER-CHECKPOINT-AUTO, CAP-FEATURE-RESERVE (window W0-CHP-1)
  - `artifacts/test_runs/W0-CHP-1/*` (pytest, behave, ledger checkpoint)
  - `artifacts/test_runs/TR-20251020-ledger/*` automation output
- Data note: `data/week0/live/windows.jsonl` includes an earlier manual-override finalize entry for W0-CHP-1; treat the later `after-long` row as canonical until we add a prune utility.
- Decision cards: `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP` and `... --window W0-CHP-1` → both GO.
- Latest Codex usage pane (session context): Context window 24% (209K/272K), 5h limit 5% (resets 13:13), weekly limit 24% (resets 25 Oct 21:11 on account www.yesplus.ru@gmail.com).

## PRO Review — Brief #6
- TLDR ingested: `docs/CurrentPlan/006_PRO_TLDR.md` (source `/Users/m/Desktop/TLDR.markdown`, captured 2025-10-20 02:05:42Z UTC).
- New artefacts: `docs/CurrentPlan/006_Agent_Brief.md`, `docs/SessionBoards/006_board.md` (polishing + proxy hardening focus).
- `docs/Tasks/tracker_cli_todo.md` extended with Brief #6 tasks (percent helper, latency refactor, proxy status whitelist, pytest config, churn resilience, window-audit command).
- Next-session plan: `plans/006_polishing-next.plan.md` (210K token budget, observe-only polishing).
- Immediate follow-ups (see TLDR):
  1. Centralize percent formatting across preview/decision-card/cost-compare.
  2. Refactor proxy latency parsing to avoid double conversions.
  3. Broaden proxy status whitelist to prevent false positive error rates.
  4. Set `asyncio_default_fixture_loop_scope=function` to remove pytest warnings.
  5. Harden `tracker churn` when commit bounds missing (warn, skip diff, mark decision).
  6. Add `tracker window-audit --window <id>` for duplicate detection.
- Longer-term substitution trials stay gated per TLDR (observe-only until decision-card criteria met).

## PRO Review — Brief #7
- TLDR ingested: `docs/CurrentPlan/007_PRO_TLDR.md` (source `/Users/m/Desktop/TLDR.markdown`, captured 2025-10-20 03:12:41Z UTC).
- New artefacts: `docs/CurrentPlan/007_Agent_Brief.md`, `docs/SessionBoards/007_board.md` (Show & Ask pack, gating decisions, JSON follow-up).
- `docs/Tasks/tracker_cli_todo.md` updated with Brief #7 items (evidence pack, PRD decision asks, window-audit JSON, 2xx status expansion, duplicate-prune plan).
- Immediate cadence (per TLDR):
  1. Gather and paste preview / decision-card / window-audit / cost-compare outputs for the next PRD briefing.
  2. Log the two PRD approvals needed: decision-card GO criteria and proxy error-rate whitelist vs 2xx rule.
  3. ✅ Add a JSON/`--format json` mode to `tracker window-audit` with coverage + docs (landed 2025-10-20; see validation + docs updates).
- Ready-next (after PRD response): generalise proxy “healthy” statuses to 2xx and design a read-only duplicate-prune helper.

## Week-0 Execution — W0-CHP-2 (2025-10-20)
- UAT opener rerun: `PYTHONPATH=tracker/src tracker/.venv/bin/python -m pytest`, `PYTHONPATH=tracker/src tracker/.venv/bin/behave features`.
- Alias capture (AGENT_ID=main, PATH includes tracker venv):
  - `cat /Users/m/Desktop/3.markdown | os`
  - `cat /Users/m/Desktop/6.markdown | oe`
  - `od --phase after --window W0-CHP-2` (cleanup prior after snapshot when re-seeding)
- Window finalize & hygiene:
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live complete --window W0-CHP-2 --codex-features 2 --quality 1.0 --outcome pass --methodology week0` (twice; second run after refreshed after snapshot)
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live churn --window W0-CHP-2 --provider codex --methodology week0 --commit-start 8afc41de41f2f23ff5bc73932ac47c41e2dc1ff1 --commit-end 8afc41de41f2f23ff5bc73932ac47c41e2dc1ff1`
  - `scripts/automation/ledger_checkpoint.sh --window W0-CHP-2 --provider codex --task end_of_session --plan 200000 --actual 195000 --features 2 --notes "week0 codex window" --commit-start 8afc41de41f2f23ff5bc73932ac47c41e2dc1ff1 --commit-end 8afc41de41f2f23ff5bc73932ac47c41e2dc1ff1 --decision-card`
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live preview --window W0-CHP-2`
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live window-audit --window W0-CHP-2`
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live window-audit --window W0-CHP-2 --format json`
  - `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-2`
  - `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- Evidence logging: `scripts/tools/append_evidence.sh --window W0-CHP-2 --capability CAP-UAT-PYTEST --runner pytest --result pass --artifacts artifacts/test_runs/W0-CHP-2/pytest.txt --notes "week0 W0-CHP-2"` and analogous behave command; artifacts stored under `artifacts/test_runs/W0-CHP-2/`.
- Resulting data updates:
  - `data/week0/live/snapshots.jsonl` gains W0-CHP-2 before/after entries (AGENT_ID=main notes).
  - `data/week0/live/windows.jsonl` now contains two finalize rows for W0-CHP-2 (window-audit flags the earlier entry as duplicate; latest row with delta fiveh=12/weekly=4 is canonical).
  - `docs/Ledgers/Acceptance_Evidence.csv`, `docs/Ledgers/Token_Churn_Ledger.csv`, and `docs/Ledgers/Churn_Ledger.csv` append W0-CHP-2 rows (note: churn ledger currently has two week0 rows due to initial manual churn + checkpoint churn; flagged for future prune utility).
  - `data/week0/live/state/main/codex.json` tracks the new agent-specific state (`current_window` seeded for next capture).
- Decision card outcome: GO with completeness 5/5, Anoms 0. Window audit reports duplicates=1 for finalize rows — document for upcoming `window-audit --json` + prune helper work.

## Pending Close — W0-CHP-3 (codex)
- State now: BEFORE and AFTER snapshots are captured; final AFTER to be re-captured at close (respecting ≥5‑min buffer) for a clean delta.
- Closing commands (run in order once AFTER card is copied):
  - `PATH="tracker/.venv/bin:$PATH"; source scripts/tracker-aliases.sh; export AGENT_ID=main`
  - `cat <after_pane.txt> | oe --window W0-CHP-3`
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live complete --window W0-CHP-3 --codex-features <N> --quality 1.0 --outcome pass --methodology week0 --notes after-clean`
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live churn --window W0-CHP-3 --provider codex --methodology week0 --commit-start $(git rev-parse HEAD) --commit-end $(git rev-parse HEAD)`
  - `tracker/.venv/bin/python -m tracker.cli --data-dir data/week0/live window-audit --window W0-CHP-3 --format json | tee logs/W0-CHP-3_window_audit.json`
  - `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-3`
  - Evidence rows: rerun tests and append via `scripts/tools/append_evidence.sh` (pytest/behave artifacts under `artifacts/test_runs/W0-CHP-3/`).

## Offload Telemetry Snapshot — W0-MITM-1 (proxy)
- Ingested telemetry from ClaudeCodeProxy logs for a measurement-only window:
  - `< ../ClaudeCodeProxy/logs/usage.jsonl PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest proxy-telemetry --window W0-MITM-1 --stdin`
- Note: this is telemetry-only; finalize will occur once BEFORE/AFTER snapshots exist for the same time block.

## 2025-10-20 Brief #6 — Polishing & Proxy Hardening (Session 1)
- Code changes
  - Introduced shared percent formatter (`tracker/src/tracker/formatting.py`) and wired preview, decision card, and proxy cost compare to use it (consistent `routed=50%`, `glm_share=52.1%`).
  - `tracker/src/tracker/sources/proxy_telemetry.py` now performs a single latency normalization pass, emits `latency:invalid` hints, and whitelists ok/success/200/routed/cached statuses; corresponding pytest coverage exercises whitelist + malformed latency paths.
  - `tracker/src/tracker/cli.py` gains `window-audit` (duplicate snapshot/finalize report), churn skips gracefully when commit bounds are missing (notes `decision=missing-commit-range`), and percent output updated across preview/ingest logs.
  - Repo-level `pytest.ini` added to set `asyncio_default_fixture_loop_scope=function`; tests run without warnings.
  - Scripts updated: `scripts/tools/decision_card.py` prints a completeness line using the shared formatter, and `scripts/tools/proxy_cost_compare.py` appends a totals summary with GLM share.
- Docs & checklists
  - `docs/Tasks/tracker_cli_todo.md` Brief #6 block marked complete with inline notes.
  - `docs/Tasks/subagent_proxy_telemetry_ingest.md` notes detail latency tagging + status whitelist.
  - `docs/System/scheduler/standing_jobs.md` documents the new window-audit hygiene command (`tracker window-audit --window <id>`).
- Validation commands (all green)
  - `PYTHONPATH=tracker/src pytest`
  - `PYTHONPATH=tracker/src behave features`
  - `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
  - `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-1`
- Artefacts & references
  - Formatting helper: `tracker/src/tracker/formatting.py`
  - Window audit command output recorded via CLI (see validation log above; no file mutations).
  - Updated tests: `tracker/tests/test_proxy_cost_compare_script.py`, `tracker/tests/test_proxy_telemetry.py`, `tracker/tests/test_churn_cli.py`, `tracker/tests/test_cli_flow.py` (window audit scenario).

### 2025-11-06 — CCC Adapter BDD & Docs
- Behave feature/spec added for CCC privacy tiers (`features/ccc_adapter.feature`, `features/steps/ccc_adapter_steps.py`); kept pytest suite in sync.
- Authored `docs/integration/CCC_BRIDGE.md` + README quick start; shipped sample session helper (`scripts/tools/ccc_sample_session.py`) and license fixtures.
- Validation log: `pytest tests/integration/test_ccc_adapter.py`, `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature`, `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --output data/integration/ccp_metrics_summary.json`.

### 2025-11-06 — AgentOS R4 Adapter D+1/D+2
- D+1: mirrored CCP decision/model-health fields (schemas + rollup), extended backfill ingest with `--usage-json`, and added ingest test using the R3.6 fixture.
- D+2: introduced root `pyproject.toml` with `[dev]`/`[ccc]` extras, added `scripts/tools/ccc_e2e_smoke.sh`, refreshed README/SOP install instructions.
- Validation: `pytest tests/integration/test_ccc_adapter.py`, `pytest tests/integration/test_ccp_usage_ingest.py`, `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature`, `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --usage-json ../ClaudeCodeProxy/fixtures/usage/ccc_usage_r35_full.json --output data/integration/ccp_metrics_summary.json`.
