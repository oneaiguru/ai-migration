# Progress Log — liteLLM/API References

- Confirmed no active working docs reference **liteLLM** or advocate API-mode integration.
- `docs/SOP/*` and `docs/Tasks/AGENTS.md` remain subscription-only; existing API mentions are descriptive comparisons (kept per PRD policy).
- Historic research (`archive/deepresearch/2025-10-18/deep_research_2025-10-16_tracker_repo_summary.md`) still discusses liteLLM; it is archived for context only and clearly marked superseded.
- No changes were required in tracker code or scripts—the repo contains no liteLLM usage in active areas.

Outcome: subscription-only stance is enforced across active documentation. Any future API tooling must be reintroduced explicitly via SOP update.

## 2025-11-06 CCC Adapter BDD Alignment
- Added Behave coverage (`features/ccc_adapter.feature`) mirroring pytest privacy-tier scenarios; steps reuse CCC client for schema validation.
- Published operator guide `docs/integration/CCC_BRIDGE.md` plus README quick start; shipped sample session helper (`scripts/tools/ccc_sample_session.py`) and license fixtures.
- Validation: `pytest tests/integration/test_ccc_adapter.py`, `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature`, `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --output data/integration/ccp_metrics_summary.json`.

## 2025-11-06 AgentOS R4 Adapter (D+1/D+2)
- Mirrored CCP decision/model-health fields: added `agentos/schemas/v1/decision.json`, allowed turn events to carry decisions, and surfaced `model_health` in summaries (`agentos/metrics/rollup.py`).
- Backfill ingest extended: optional `--usage-json` snapshot support, decision envelope preserved, summary now includes warn/gap stats (`agentos/tools/backfill_ccp.py`).
- New ingest test `tests/integration/test_ccp_usage_ingest.py` uses the published CCC fixture to verify model-health fields.
- Docs updated: `docs/integration/CCC_BRIDGE.md` references fixtures + PUBKEY bundle; README/SOP commands now use `uv pip install -e .[dev,ccc]`; E2E smoke script added (`scripts/tools/ccc_e2e_smoke.sh`).
- Packaging: root `pyproject.toml` defines extras (`dev`, `ccc`) for installer parity.
- Validation: `pytest tests/integration/test_ccc_adapter.py`, `pytest tests/integration/test_ccp_usage_ingest.py`, `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature`, `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --usage-json ../ClaudeCodeProxy/fixtures/usage/ccc_usage_r35_full.json --output data/integration/ccp_metrics_summary.json`.

## 2025-10-18 Scripts/Switcher Documentation
- Confirmed `scripts/claude-switch/README.md` contains full instructions for running subscription and Z.ai sessions in parallel (`cc.sh`, `claude-sub.sh`, `claude-zai.sh`, `.env.zai` template, `ISOLATE_HOME` guidance).
- Added pointer in `docs/Tasks/AGENTS.md` so future agents know where the switcher lives and how to use it.

## 2025-10-18 Fixture Imports
- Extracted Codex /status samples from `/Users/m/Desktop/Untitled-6.tex` into `tests/fixtures/codex/{wide_status_82_1.txt,narrow_wrapped_status_82_1.txt,alt_reset_64_0.txt,too_narrow_missing_numbers.txt}`.
- Extracted Claude `/usage` samples from same source into `tests/fixtures/claude/{usage_wide_90_1_0.txt,usage_narrow_90_1_0.txt,usage_failed_to_load.txt,usage_status_dismissed.txt}`.
- These fixtures satisfy the references in `archive/v1_3/tests/bdd/features/*.feature`; no further action needed for Codex/Claude fixture setup.

## 2025-10-18 claude-trace Wrapper
- Copied `wrapper.sh` from `~/Documents/replica/tools/claude-trace-fork/` into `scripts/claude-trace/` with a short README so agents can reuse the no-auto-browser fork.
## 2025-10-18 Tool Verification (partial)
- `claude-monitor --view daily --help` executed successfully (help text captured in log above); confirms CLI availability.
- `npx --yes @ccusage/codex@latest --help` executed successfully; note the `--offline` option avoids fetching pricing data.
- Tracker CLI not yet runnable (implementation pending); document once tracker package is wired up.
## 2025-10-18 Folder Audit
- Archive files: 43
- Docs files: 8
- Scripts files: 10
- Tests files: 8
(Counts generated via `python3` over archive/docs/scripts/tests.)
- Tracker CLI not yet wired up—see `docs/Tasks/tracker_cli_todo.md` for the follow-up once the implementation exists.

## 2025-11-05 Tracker CLI Discovery
- Audited archived parsers and BDD specs; captured findings in `docs/Tasks/tracker_cli_discovery.md`.
- Confirmed active repo lacks tracker package files; planner must map implementation for ingest/complete commands and JSONL outputs.
- Noted missing `ai-docs/` workspace; flagged in discovery doc for follow-up.

## 2025-11-05 Tracker CLI Plan
- Drafted `plans/2025-11-05_tracker-cli.plan.md` to build the tracker package, CLI, and tests.
- Handed off to Executor with instructions for pytest run and CLI sanity checks.

## 2025-11-05 CE Magic Prompts Localized
- Imported SIMPLE/RESEARCH/PLAN/EXECUTE prompts into `docs/System/CE_MAGIC_PROMPTS/` and adjusted guidance for BDD workflow.
- Updated context engineering, SOPs, and agent guide to reference absolute paths in line with ADR-007.

## 2025-11-05 Tracker CLI Implementation
- Added `tracker` Python package (src layout) with JSONL storage helpers, Codex/Claude parsers, window normalization, and argparse CLI (`ingest`, `override`, `complete`).
- Seeded pytest suite covering parser fixtures and CLI ingest→complete flow; all tests pass via `uv` venv (`pytest`).
- Sanity-checked CLI manually using Codex fixture to populate `data/week0/snapshots.jsonl` and `data/week0/windows.jsonl`.

## 2025-11-05 Tracker Phase-2 Prep
- Hardened follow-up plan with required-reading checklist and command matrix (`plans/2025-11-05_tracker-next.plan.md`).
- Added ccusage sample fixtures under `tests/fixtures/glm/` for upcoming GLM bridge work; recorded pointers in discovery doc.
- Refreshed README and Saturday prep checklist to include tracker install, preview command, and ccusage verification.

## 2025-11-05 Tracker Phase-2 Execution
- Added estimator package (`tracker/src/tracker/estimators/*`) and wired `tracker preview` to summarize provider efficiency, including snapshot status.
- Implemented GLM ccusage bridge (parser, JSONL loader, CLI ingest) with pytest coverage (`tests/test_ccusage.py`) and updated docs for GLM workflow.
- Updated `docs/Tasks/tracker_cli_todo.md` with execution log + phase completion notes; README + Saturday prep checklist now call out GLM fixtures/tests.
- Commands: `pytest tests/test_parsers.py tests/test_cli_flow.py`, `pytest tests/test_ccusage.py`, `tracker preview --window W0-TEST`, `< ../tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-CC --stdin`, `tracker preview --window W0-CC`.
- Follow-ups: finalize a live Week-0 window with GLM data so `tracker preview --window W0-CC` shows capacity stats instead of "no windows recorded".

## 2025-11-05 Tracker Alias Planning & BDD Roadmap
- Documented alias/UX requirements in `docs/Tasks/tracker_cli_aliases.md` (covers `os/oe/ox`, `as/ae/ax`, `zs/ze/zx`, cross-session handling, risks).
- Added TODO entries for alias implementation, Behave/BDD coverage, and wiki knowledge transfer in `docs/Tasks/tracker_cli_todo.md`.
- Next: align feature file structure (`features/` vs `tests/bdd/`), introduce Behave scenarios for parsers/CLI + aliases, and publish alias usage guide to wiki once implemented.

## 2025-10-19 Codex Multi-pane Handling
- Extended `features/tracker_aliases.feature` with the multi-pane Codex scenario and supporting Behave steps to assert parsed metrics/errors.
- Updated `tracker/src/tracker/sources/codex.py` to isolate the final `/status` pane and flag `multi-pane-trimmed` when earlier panes are discarded.
- Added pytest coverage for the regression (`tracker/tests/test_parsers.py`, `tracker/tests/test_alias_cli.py`) ensuring aliases persist the corrected metrics.
- Validation: `cd tracker && . .venv/bin/activate && pytest tests/test_parsers.py tests/test_alias_cli.py && behave ../features`.
- Synced docs/tasks via `docs/Tasks/tracker_cli_todo.md` and `docs/Tasks/tracker_feature_log.md` to record completion and scenario provenance.

## 2025-10-19 Tracker BDD Parity Sweep
- Authored `features/tracker_cli.feature` with CLI ingest/complete/preview, override, and GLM scenarios, plus reusable steps in `features/steps/tracker_cli_steps.py`.
- Ensured CLI flows persist expected data (`JsonlStore` snapshots/windows, GLM counts) and preview output by exercising real fixtures.
- Ran full validation loop: `cd tracker && . .venv/bin/activate && pytest && behave ../features` (20 pytest cases, 10 Behave scenarios).
- Updated backlog docs (`docs/Tasks/tracker_cli_todo.md`, `docs/Tasks/bdd_tracker_standardization.md`) and feature log to capture new scenarios and remaining integration follow-ups.

## 2025-10-19 Codex ccusage Bridge
- Captured live ccusage session JSON (`tests/fixtures/ccusage/codex_sessions_sample.json`) via `npx @ccusage/codex@latest session --json`.
- Implemented `parse_codex_ccusage_sessions` with CLI wiring (`tracker ingest codex-ccusage`) storing summaries in `codex_ccusage.jsonl` and exposing alias helper `occ`.
- Added regression coverage (`tracker/tests/test_codex_ccusage.py`, `features/tracker_cli.feature` scenario) to assert session counts/totals and Behave end-to-end ingestion.
- Validation: `cd tracker && . .venv/bin/activate && pytest && behave ../features`.
- Synced docs (`docs/Tasks/tracker_cli_todo.md`, `docs/Tasks/bdd_tracker_standardization.md`, `docs/Tasks/tracker_feature_log.md`) with bridge status and usage notes.
- Extended the bridge set with `claude-monitor` parsing (text fixture, CLI ingest, alias `acm`) and mirrored coverage in pytest/Behave for realtime metrics (`claude-monitor --help`, `claude-monitor --view realtime`).
- Scaffolded methodology workspace (`docs/System/methodologies/`) to log alias/BDD/churn experiments and wired references into SOP/README/AGENTS.

## 2025-11-06 Tracker Alias Implementation
- Added `tracker alias` subcommand with provider-aware state manager (`tracker/src/tracker/alias_runtime.py`) supporting start/end/cross actions, Codex/Claude snapshot validation, and GLM baseline/delta handling.
- Introduced pytest coverage for alias flows (`tracker/tests/test_alias_cli.py`) validating state transitions, error messaging, GLM deltas, and cross-window seeding.
- Shipped operator wrappers at `scripts/tracker-aliases.sh` with default `data/week0/live` routing; README + Saturday prep checklist now instruct teams to source the script before runs.
- Laid down Behave suite for alias scenarios (`features/tracker_aliases.feature`, `features/steps/alias_steps.py`) and verified with `cd tracker && . .venv/bin/activate && behave ../features`.
- Logged claude-monitor integration notes in `docs/Tasks/claude_monitor_integration.md` after probing CLI help/output and wiki guidance; TODO list now tracks fixture capture + parser implementation.
- Cleared inaccurate W0-19 Codex snapshots (awaiting a clean re-ingest) and captured fresh W0-20 start pane with aliases so live data remains trustworthy.
- Implemented undo workflow: new CLI/alias deletion command rewrites JSONL safely, updates state, and is covered by pytest + Behave (`tracker/tests/test_alias_cli.py`, `features/tracker_aliases.feature`).
- Captured real Week-0 Codex scenario in fixtures (`tests/fixtures/codex/live_cases/*`) and baked it into pytest/Behave so undo flows mirror production usage (W0-19 clean, W0-20 corrected start).
- Restored live data: re-applied W0-19 before/after and clean W0-20 start via aliases so `data/week0/live/` now reflects the validated timeline.
- Documented Codex `/status` refresh lag and ingestion requirements in `docs/ai-docs/codex-status-refresh.md`; queued parser/BDD work to handle multi-pane inputs.
- SOP now includes `BDD Workflow (Tracker Tooling)` section; operator docs (README, Saturday prep) point to it and require `behave ../features` alongside pytest.
- Added long-session playbook (`docs/Tasks/tracker_long_session_plan.md`) and feature log to track shipped scenarios; TODO updated so the next agent follows the single-agent Codex cadence.
- Commands: `cd tracker && uv venv .venv && . .venv/bin/activate && uv pip install -e .[dev]`, `pytest` (14 tests).
- Follow-ups: update `docs/SESSION_HANDOFF.md` with alias rollout notes and create wiki page (`~/wiki/.../TrackerAliases.md`) once documentation finishes syncing.

## 2025-10-19 Autonomous Session Prep
- Logged Experiment 001 template under `docs/System/methodologies/tracker_alias_cycle/experiments/001_provider_windows.md` to guide Codex/Claude window comparisons.
- Authored `docs/Tasks/autonomous_long_session_plan.md` with numbered tasks, mermaid flows, and FAQ so next agent can operate end-to-end without prompts.
- Added archive curation task (`docs/Tasks/archive_curation.md`) and updated `docs/Tasks/tracker_cli_todo.md` with task ↔ spec mapping plus automation backlog status.
- Mirrored upstream Codex docs (`docs/ai-docs/codex/README.md`, `docs/ai-docs/codex/cli.md`) and linked the quick-reference index for future agents.
- Captured ccusage coverage plan in `docs/Tasks/ccusage_codex_coverage.md` outlining daily/weekly/session fixtures, BDD scenarios (future `features/tracker_ccusage.feature`), and automation requirements.
- Curated key archive docs into `docs/Archive/` (churn research, tooling notes, Claude findings, tracker survey) with overview summaries (`churn_research_overview.md`, `tooling_notes_overview.md`, updated `docs/Archive/README.md`). Remaining files are listed for next triage pass.
- Summarized `deep_research_2025-10-18_assumptions.md` into `docs/Archive/assumptions_overview.md`, moved source file to docs archive, and updated `docs/Archive/README.md`/`docs/Tasks/archive_curation.md` to reflect completion.
- Reviewed SUMMARYREPO example (`F/docs/EXPERIMENTAL_LINED_SUMMARY_3k.md`) and adopted its line-indexed summary pattern; documented workflow under `docs/System/methodologies/progressive_summary/overview.md` and referenced it in the archive curation plan.

- Copied sample planning note to docs/System/samples/est1_sample.md and authored docs/SOP/next_session_planning_sop.md to formalize the 70–80% token‑budgeted next‑session planning ritual.

- Stored session TLDR at docs/SessionReports/2025-10-19_TLDR.md and added SOP for reflections (docs/SOP/session_reflection_sop.md).
- Documented backlog anti-patterns/guardrails (docs/Backlog/anti_patterns.md) and updated specs with warnings (governor override, placeholders, drift thresholds, scheduler opt-in, low-n stats, bandit staging, event redaction).
- Added session thought logs (docs/SessionReports/2025-10-19_{Ideas,Decisions,Risks}.md), brainstorming/backlog SOPs, recipes index, and updated backlog index with quick wins.
- Added .gitignore for automation/event logs, README 'Next Agent: Start Here', ledger recipe, quick-wins plan, placeholder @todo tags, and Session+1 quick-wins plan.

## 2025-10-20 Tracker Phase-2 Extensions
- ccusage coverage expanded: parser now supports `--scope {session,daily,weekly}` (`tracker/src/tracker/sources/codex_ccusage.py:1`), CLI wiring (`tracker/src/tracker/cli.py:23`), JSONL storage scope flag (`tracker/src/tracker/storage/jsonl.py:14`), and preview ccusage block (`tracker/src/tracker/cli.py:218`). Added pytest + Behave coverage (`tracker/tests/test_codex_ccusage.py`, `features/tracker_ccusage.feature`).
- Codex `/status` automation delivered (`scripts/automation/codex_status.sh` + source-label plumbing in `tracker/src/tracker/alias_runtime.py:33`), with Behave scenarios in `features/tracker_automation.feature` and step harness `features/steps/tracker_automation_steps.py`.
- Alias step defs tightened (`features/steps/alias_steps.py`) so delete/inline-JSON flows run under full Behave suite.
- Experiment 001 dry-run executed via fixtures:
  - Codex window W0-21: `scripts/automation/codex_status.sh --phase before/after`, `python -m tracker.cli ingest codex-ccusage --scope session`, `python -m tracker.cli complete --window W0-21 --codex-features 3`.
  - Claude window W0-21C: `python -m tracker.cli alias start/end claude ...`, `python -m tracker.cli ingest claude-monitor ...`, `python -m tracker.cli complete --window W0-21C --claude-features 2`.
  - Preview confirms both providers and ccusage block (`python -m tracker.cli preview`). Ledgers updated (`docs/Ledgers/Token_Churn_Ledger.csv`, `docs/Ledgers/Feature_Log.csv`).
- Docs refreshed: README alias workflow + ccusage quick start (`README.md:37`), Saturday prep checklist automation notes (`docs/SOP/saturday_prep_checklist.md:112`), ccusage/automation tasks marked complete (`docs/Tasks/tracker_cli_todo.md:10`) and coverage plan updated (`docs/Tasks/ccusage_codex_coverage.md:12`). Archive summaries produced for tracker repo survey, reporting tasks, and magic prompts (`docs/Archive/*_summary.md`), context engineering references updated (`docs/System/context-engineering.md`).
- Documentation polish: Saturday prep checklist now calls for two `/status` polls and highlights PYTHONPATH; Codex automation recipe documents lockfiles/PYTHONPATH; contracts gain `snapshot_id` + optional index guidance; CODEx CLI notes and pruning checklist recorded in `docs/ai-docs/codex/*`.
- Final validation: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`, `python -m tracker.cli preview --data-dir data/week0/live`; archived TLDRs at `docs/SessionReports/2025-10-20_{TLDR,TLDR_PRO}.md` and changed-file manifest for review.
- Next session scaffold: `plans/001_next_session.plan.md` captures UAT opener + eight priorities (schema/tool versions, Claude automation, live ccusage, preview audit, bundle, docs/wiki, backlog hygiene).
- Archive curation task flipped to ✅ across remaining items (`docs/Tasks/archive_curation.md`), README reorganised to point at progressive summaries (`docs/Archive/README.md`).
- Validation:
  - `PYTHONPATH=tracker/src pytest`
  - `PYTHONPATH=tracker/src behave features`
  - `PYTHONPATH=tracker/src python -m tracker.cli preview --data-dir data/week0/live`
- Follow-ups: capture live ccusage daily/weekly exports once subscription access exists, script Claude automation equivalent, and migrate alias notes into wiki (`~/wiki/.../TrackerAliases.md`) per TODO.
- Session Board template ready: `docs/SessionBoards/001_board.md` (fill at next session start).

## 2025-10-21 UAT Opener
- Commands: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`, `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-21`.
- Results: pytest 29 passed, behave 18 scenarios passed, preview rendered Codex/GLM blocks without errors (`efficiency` currently n/a as no capacity logged).
- Contracts: checked `data/week0/live/windows.jsonl` and `snapshots.jsonl` for non-negative deltas + `reset_at` fields; ledgers present under `docs/Ledgers/`.

## 2025-10-21 Must-Ship Execution
- Added metadata stamping helper (`tracker/src/tracker/meta.py`) and updated `JsonlStore` so every append/write injects `schema_version`/`tool_version`; refreshed pytest expectations across CLI/ccusage/claude/glm suites.
- Implemented `scripts/automation/claude_monitor.sh` plus Behave coverage (`features/tracker_automation.feature`) so claude-monitor output can be piped directly into tracker with automation notes.
- Captured live Codex ccusage daily JSON via `npx @ccusage/codex@latest daily --json` and ingested session/daily/weekly scopes for window W0-21 (`tracker ingest codex-ccusage --scope {session,daily,weekly}`) — preview now shows percent/reset lines for all scopes.
- Preview snapshot list now prints consolidated sources/notes to support audit trails (see `tracker/src/tracker/cli.py`).
- Commands: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`, `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-21`.
- Docs updated: alias workflow in `README.md`, ccusage recipe (`docs/Recipes/ccusage_ingest.md`), and board checkpoints (`docs/SessionBoards/2025-10-21_board.md`).
- Data: `data/week0/live/codex_ccusage.jsonl` now contains stamped session/daily/weekly rows (daily via automation capture, weekly flagged `backfill:weekly`).

## 2025-10-21 Git Churn Documentation
- Added strategy note (`docs/System/git_churn_strategy.md`) describing the three-commit cadence and churn reporting workflow.
- Logged follow-up work in `docs/Tasks/git_churn_next_steps.md` to wire commit hashes + numstat exports into the ledgers and SOPs.

## 2025-10-19 Churn Prep Adjustments
- Token usage correction appended to `docs/Ledgers/Token_Churn_Ledger.csv` (actual 164k tokens; prior 270k entry retained for history).
- Standardised alias automation to use `TRACKER_ALIAS_STATE_DIR`; fallback defaults align across scripts/tests.
- Tracker CLI default data dir now `data/week0/live` (matches SOP/recipes).
- Backlog updated: new churn instrumentation card added to index/backlog spec.
- Token checkpoints: added backlog card + TODO follow-up for plan/mid/final tracking.
- Added commit conventions SOP (`docs/SOP/commit_conventions.md`) and populated scheduler standing jobs with automation commands.
- Removed obsolete `archive/v1_3/tests/bdd/steps/parse_steps.py` to keep history greppable (v1_3 archive intact).
- Validation: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`

## 2025-10-19 Stats/CI, Outcome, and UPS Alignment
- Preview now prints `ci`, `n`, and `power` per provider with low-n gating; added `_TARGET_EFFECT` helpers in `tracker/src/tracker/estimators/efficiency.py` and new coverage (`tracker/tests/test_efficiency.py`).
- `tracker complete` accepts `--outcome` (alias `--quality-score`) and persists `quality_score` + `outcome`; preview summarises UPS quality metadata for each window.
- Updated docs: README tracker quick start, Saturday prep checklist, tracker plan snippets, and Session Board now reference the CI/power output and `--outcome` flag; `docs/Tasks/tracker_cli_todo.md` table + checklist mark Ready-Next items as complete.
- Sample data at `data/week0/live/windows.jsonl` backfilled with `quality_score`/`outcome` fields to match UPS v0.1.
- Commands: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features` (green).

## 2025-10-19 Churn Instrumentation (Commits 1–3)
- Established churn schema hooks and ledgers: `docs/System/schemas/universal_provider_schema.md`, `docs/System/contracts.md`, `docs/Ledgers/Churn_Ledger.csv`, and `docs/Ledgers/Feature_Log.csv` now carry commit range + feature columns for churn reporting.
- Added `tracker/src/tracker/churn.py`, wired `tracker cli churn` to compute `git diff --numstat`, persist records via `JsonlStore.append_churn`, and append `docs/Ledgers/Churn_Ledger.csv`; pytest coverage lives in `tracker/tests/test_churn_cli.py`.
- Updated `tracker/src/tracker/cli.py` preview output to surface a `Churn:` block, added Behave scenario (`features/tracker_cli.feature`) and supporting steps so UAT now exercises churn flow end-to-end; `docs/SOP/uat_opener.md` instructs operators to run the churn command during start-of-session checks.
- Documentation refreshed: `docs/System/git_churn_strategy.md` captures preview visibility; `docs/Tasks/git_churn_next_steps.md` tracks remaining follow-up (handoff docs), and `docs/Tasks/tracker_cli_todo.md` notes Commit 3 completion.
- Validation commands: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`.

## 2025-10-19 – Long Session 002 (Phase A/B/C)
- UAT opener green: 32 pytest, 20 behave scenarios.
- Phase B: alias wrappers now isolate by AGENT_ID and use flock lock; notes stamp AGENT_ID by default.
- Phase C: added proxy cost-compare script (scripts/tools/proxy_cost_compare.py).
- Docs updated (alias multi-agent notes); review bundle staged at ~/Downloads/agentos_tmp_review.

- Recorded 1 feature for other agent (W0-CHN) in ledgers; added live ingest TODO.

## 2025-10-19 Long Session 002 — Phases 1–5 Execution
- UAT opener: pytest (32) and behave (20) passed; preview OK.
- Phase 1: closed W0-20 AFTER via alias end using fixture; ready for finalize.
- Phase 2: verified alias wrappers (AGENT_ID isolation + flock lock) are active.
- Phase 3: ingested subagent telemetry into proxy_telemetry.jsonl; added cost compare support and printed top rows.
- Phase 4: finalized W0-19 (features=2) and W0-20 (features=3); computed churn with HEAD~1→HEAD; preview now shows Providers, Outcome, Churn, Subagent Proxy, ccusage.
- Phase 5: appended Token_Churn_Ledger checkpoint for W0-20 and confirmed Churn_Ledger entries.
- Commands run are recorded in docs/SESSION_HANDOFF.md; artifacts updated under data/week0/live and docs/Ledgers/.
- Finalized W0-CHP (features=2, outcome pass), churned, ran ledger checkpoint, appended evidence rows, and recorded GO decision card.

## 2025-10-19 Long Session 002 — Phase 6 Prep
- Alias undo coverage expanded: Behave scenarios now exercise `od1`/`od2` flows and agent-specific state isolation; notes stamp `AGENT_ID=<id>` automatically (`features/tracker_aliases.feature`, `features/steps/alias_steps.py`, `tracker/tests/test_alias_state_isolation.py`).
- Decision card BDD in place: sandboxed feature (`features/decision_card.feature`) stages evidence/churn rows, runs `scripts/tools/decision_card.py`, and asserts `Status:   GO`; shared steps live in `features/steps/tracker_cli_steps.py`.
- Docs refreshed for operators: `docs/System/scheduler/standing_jobs.md` now includes ready-to-run codex status + ledger checkpoint recipes (with wiki pointer); `docs/Tasks/tracker_cli_aliases.md` quick reference documents multi-agent aliases and wiki link.
- UAT opener updated to include decision-card check (`docs/SOP/uat_opener.md`).
- TODO tracker adjusted: Phase B checklist marked complete; scheduler doc task marked done; remaining automation + proxy telemetry tasks flagged for next session (`docs/Tasks/tracker_cli_todo.md`).
- Validation: `PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features` (all green).

## 2025-10-20 W0-CHP-1 Feature Window
- Implemented CAP-LEDGER-CHECKPOINT-AUTO: `scripts/automation/ledger_checkpoint.sh` now supports `--decision-card`/`--data-dir`, prints decision summaries, and appends decision status to token ledger notes; documented in `docs/System/scheduler/standing_jobs.md`.
- Implemented CAP-FEATURE-RESERVE: new helper `scripts/tools/reserve_feature.py` appends planned rows to `docs/Ledgers/Feature_Log.csv`; W0-CHP-1 reservations logged.
- Knowledge migration (CAP-KNOWLEDGE-LINK): alias/automation docs plus `docs/SESSION_HANDOFF.md` link to the wiki (`~/wiki/dotfiles/AliasSystem.md`, `~/wiki/replica/work/KnownQuirks.md`).
- Window W0-CHP-1 finalized (`tracker complete --window W0-CHP-1 --codex-features 2 --quality 1.0 --outcome pass`), churned (0 net), and checkpointed with `scripts/automation/ledger_checkpoint.sh --decision-card` (Decision: GO).
- Evidence: pytest/behave reruns (`artifacts/test_runs/W0-CHP-1/pytest.txt`, `.../behave.txt`) plus manual artifacts for ledger automation and feature reserve appended via `scripts/tools/append_evidence.sh`.
- Validation snapshot: `python scripts/tools/decision_card.py --window W0-CHP-1` → GO; `PYTHONPATH=tracker/src python -m tracker.cli preview --window W0-CHP-1` shows Anomalies: 0.
- Proxy telemetry ingest + preview verified (`tracker/tests/test_cli_flow.py::test_preview_includes_subagent_proxy_block`); cost compare script covered via `tracker/tests/test_proxy_cost_compare_script.py`.
- PRO TLDR #6 ingested (`docs/CurrentPlan/006_PRO_TLDR.md`); new brief/board capture polishing tasks and tracker CLI TODO extended accordingly.
- Next session plan drafted at `plans/006_polishing-next.plan.md` (budget 210K tokens; observe-only polishing focus).

## 2025-10-20 PRO TLDR Brief 007 Intake
- Copied `/Users/m/Desktop/TLDR.markdown` to `docs/CurrentPlan/007_PRO_TLDR.md` with source/date header.
- Published new brief + session board (`docs/CurrentPlan/007_Agent_Brief.md`, `docs/SessionBoards/007_board.md`).
- Added Brief #7 tasks to `docs/Tasks/tracker_cli_todo.md` (evidence pack, PRD decision asks, window-audit JSON, 2xx status follow-up).
- Logged “PRO Review — Brief #7” in `docs/SESSION_HANDOFF.md`; noted Show & Ask cadence and PRD approvals.

## 2025-10-20 Brief 006 — Polishing & Proxy Hardening (Session 1)
- Centralised percent formatting via `tracker/src/tracker/formatting.py`; preview, decision card, and proxy cost compare now emit consistent `%` strings (`tracker/src/tracker/cli.py`, `scripts/tools/decision_card.py`, `scripts/tools/proxy_cost_compare.py`, plus updated unit tests).
- Proxy telemetry parser hardened (single `_to_float` pass, latency error tagging, status whitelist for ok/success/200/routed/cached); new pytest coverage exercises whitelist + malformed latency scenarios (`tracker/tests/test_proxy_telemetry.py`).
- Churn command now skips gracefully when commit bounds are missing, surfaces a warning, and records `decision=missing-commit-range` in JSONL/ledger entries (see `tracker/tests/test_churn_cli.py::test_churn_cli_skips_when_commit_missing`).
- Added read-only `tracker window-audit --window <id>` command that reports snapshot/finalize duplicates; scheduler standing jobs updated with usage notes, and CLI flow test asserts duplicates reporting.
- Pytest async scope warning cleared via repo-level `pytest.ini`; validation wall remains green (`PYTHONPATH=tracker/src pytest`, `PYTHONPATH=tracker/src behave features`).
- Validation artefacts captured post-change:
  - `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
  - `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-1`
- Docs updated: `docs/Tasks/tracker_cli_todo.md` Brief #6 items checked off (with notes), `docs/Tasks/subagent_proxy_telemetry_ingest.md` notes describe whitelist/latency handling, and `docs/System/scheduler/standing_jobs.md` includes the new window-audit recipe.

## 2025-10-20 Week-0 Execution — W0-CHP-2 Kickoff
- Fixed Behave alias steps to accept inline JSON/table syntax with trailing colons (`features/steps/alias_steps.py`), restoring green UAT opener.
- Hardened operator aliases: `scripts/tracker-aliases.sh` now passes `--data-dir` before the `alias` subcommand, preserves locks, and auto-injects `AGENT_ID` notes only when not provided; verified via `os/oe/od` flows.
- Captured Codex window `W0-CHP-2` using desktop status panes (`3.markdown` → `os`, `6.markdown` → `oe`); state isolated under `data/week0/live/state/main/`.
- Finalized the window (`tracker ... complete --window W0-CHP-2 --codex-features 2 --quality 1.0 --outcome pass --methodology week0`), ran churn (`tracker ... churn --window W0-CHP-2 --provider codex`), and checkpointed with `scripts/automation/ledger_checkpoint.sh --decision-card` (tokens plan 200k vs actual 195k, decision GO).
- Logged evidence for pytest/behave reruns (`artifacts/test_runs/W0-CHP-2/*`, appended via `scripts/tools/append_evidence.sh`); acceptance/churn/token ledgers updated automatically.
- Quality controls recorded: `tracker preview --window W0-CHP-2`, `tracker window-audit --window W0-CHP-2` (duplicate finalize row flagged), `python scripts/tools/decision_card.py --window W0-CHP-2`, `python scripts/tools/proxy_cost_compare.py --min 3`.
- Extended `tracker window-audit` with `--format json`/`--json`; added CLI coverage (`test_window_audit_json_format`) and updated scheduler standing job docs for machine-readable exports.

## 2025-11-06 CCC Adapter BDD Alignment
- Added Behave coverage (`features/ccc_adapter.feature`) mirroring pytest privacy-tier scenarios; steps reuse CCC client for schema validation.
- Published operator guide `docs/integration/CCC_BRIDGE.md` plus README quick start and sample session script (`scripts/tools/ccc_sample_session.py`).
- Validation: `pytest tests/integration/test_ccc_adapter.py`, `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature`, `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --output data/integration/ccp_metrics_summary.json`.
