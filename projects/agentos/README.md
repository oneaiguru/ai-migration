# Subscription Optimizer Prototype Repo

This repo tracks the implementation around the PRD v1.6 subscription-optimizer. Current layout in this import (docs-first slice; code to follow):

```
docs/
  SOP/        # Week-0 protocol, Saturday prep, PRD/timeline/spinoff brief
  System/     # CE magic prompts, ADRs, context engineering guide
  Tasks/      # Discovery notes, TODO briefs, agent guidance
  Archive/    # Historical research, churn studies, tooling notes
plans/
progress.md
final_docs_summary.md
```

## Next Agent: Start Here

1. Read the dated plan: `plans/2025-10-20_next_session.plan.md` (targets 70–80% of the Codex window)
2. Skim the SOPs: `docs/SOP/next_session_planning_sop.md`, `docs/SOP/session_reflection_sop.md`, `docs/SOP/brainstorming_sop.md`, `docs/SOP/backlog_naming_sop.md`
3. Load the recipes index (`docs/SOP/recipes_index.md`) and referenced cards under `docs/Recipes/`
4. Review the latest session reports (`docs/SessionReports/2025-10-19_{TLDR,Ideas,Decisions,Risks}.md`)
5. Confirm ledgers (`docs/Ledgers/*.csv`) and backlog index (`docs/Backlog/index.md`) before planning new work

## Tracker Quick Start (deferred — tracker code not imported yet)

```bash
uv --version                  # confirm uv installed
cd tracker
uv venv .venv
. .venv/bin/activate
uv pip install -e .[dev,ccc]
pytest                        # run tracker parser + CLI suite
pytest tests/test_ccusage.py  # GLM bridge coverage

# Sample workflow using fixtures
< ../tests/fixtures/codex/alt_reset_64_0.txt tracker ingest codex --window W0-TEST --phase before --stdin
< ../tests/fixtures/codex/wide_status_82_1.txt tracker ingest codex --window W0-TEST --phase after --stdin
< ../tests/fixtures/claude/usage_wide_90_1_0.txt tracker ingest claude --window W0-TEST --phase before --stdin
< ../tests/fixtures/claude/usage_narrow_90_1_0.txt tracker ingest claude --window W0-TEST --phase after --stdin
< ../tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-TEST --stdin
< ../tests/fixtures/ccusage/codex_sessions_sample.json tracker ingest codex-ccusage --window W0-TEST --scope session --stdin
tracker complete --window W0-TEST --codex-features 0 --claude-features 0 --glm-features 0 --quality 1.0 --outcome pass
tracker preview --window W0-TEST
```

Preview output includes provider efficiency with CI/n/power plus the recorded quality/outcome metadata (UPS v0.1 fields).

## CCC Adapter Quick Start (deferred until code lands)

```bash
# Install extras (inside repo root)
uv venv .venv
. .venv/bin/activate
uv pip install -e .[dev,ccc]

# Run integration checks
pytest tests/integration/test_ccc_adapter.py
PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature

# Backfill CCP metrics history
python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --output data/integration/ccp_metrics_summary.json

# Sample session (uses fixture license)
PYTHONPATH=. python scripts/tools/ccc_sample_session.py --privacy minimized --license tests/fixtures/licenses/minimized_pack.json
# Optional E2E smoke (shim on :8082)
scripts/tools/ccc_e2e_smoke.sh --ccp-root ../ClaudeCodeProxy
```

The commands above exercise the privacy tiers, validate schema compatibility, and capture a trend summary for dashboards.

## Alias Workflow (deferred)

To mirror the planned operator UX, source `scripts/tracker-aliases.sh` and pipe meter panes directly into the tracker:

```bash
source scripts/tracker-aliases.sh

# Codex automation (wrapper waits for ADR-004 buffer unless overridden)
scripts/automation/codex_status.sh --phase before --window W0-SESSION --pipe-alias os --data-dir data/week0/live --buffer-seconds 0
scripts/automation/codex_status.sh --phase after  --window W0-SESSION --pipe-alias oe --data-dir data/week0/live --buffer-seconds 0
scripts/automation/codex_status.sh --phase after  --window W0-SESSION --pipe-alias ox --data-dir data/week0/live --buffer-seconds 0
od --phase after                           # Delete the latest Codex AFTER snapshot if a pane was wrong

# Claude usage
claude -p <<<"/usage" | ae                 # Claude end snapshot after waiting 5 minutes (manual)
claude-monitor --view realtime | scripts/automation/claude_monitor.sh --window W0-SESSION --data-dir data/week0/live
scripts/automation/claude_monitor.sh --fixture tests/fixtures/claude_monitor/realtime_sample.txt --window W0-SESSION --data-dir data/week0/live --notes automation:claude-monitor

# GLM usage via ccusage
ccusage blocks --json | zs                  # Baseline prompts
ccusage blocks --json | ze                  # Delta prompts
```

The aliases store state under `data/week0/live/state/` by default. Override targets with `TRACKER_DATA_DIR` or `TRACKER_ALIAS_STATE_DIR` when operating against alternate datasets.

## Orientation

- Read `docs/Tasks/AGENTS.md` for the operating cadence and absolute CE prompt paths.
- `docs/System/context-engineering.md` + `/docs/System/CE_MAGIC_PROMPTS/` define the Scout → Planner → Executor flow.
- `docs/SOP/PRD_v1.6-final.md`, `docs/SOP/week0_final_protocol.md`, and `docs/SOP/saturday_prep_checklist.md` are mandatory before new tracker work.
- `docs/ai-docs/` holds mirrored upstream documentation for external tooling (e.g., `claude-monitor`); keep it synced as part of Week-0 prep.
- `docs/SOP/standard-operating-procedures.md#bdd-workflow-tracker-tooling` defines the spec/test cadence—follow it before touching tracker code (write feature, step, pytest, then run `behave ../features`).
- `docs/System/methodologies/README.md` tracks experimental workflows (alias cycle, BDD cadence, churn measurement) with metrics/experiment logs.
- Track progress via `progress.md`; new development plans live in `plans/` (see `plans/2025-11-05_tracker-next.plan.md`).
- See the docs Glossary in `AGENTS.md` for concise definitions (Methodologies vs Workflows vs SOP/Tasks) and where to place new files to keep the docs flat.
- Code, tests, and scripts referenced above are planned for later slices; keep notes in `progress.md` and `plans/` until they are imported.
