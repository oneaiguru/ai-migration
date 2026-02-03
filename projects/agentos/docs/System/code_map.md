# Code Map — Tracker and Docs Layout (v0)

Purpose
- Give operators and contributors a 1-page map of where things live, what to edit, and how changes surface in preview/tests.

Tracker (Python package)
- `tracker/src/tracker/cli.py` — argparse entry; subcommands: `ingest`, `override`, `complete`, `preview`, `alias`, `churn`.
- `tracker/src/tracker/storage/jsonl.py` — JSONL append/load helpers; files: `snapshots.jsonl`, `windows.jsonl`, `glm_counts.jsonl`, `codex_ccusage.jsonl`, `claude_monitor.jsonl`, `churn.jsonl`.
- `tracker/src/tracker/sources/` — parsers:
  - `codex.py` (/status), `claude.py` (/usage), `codex_ccusage.py`, `ccusage.py` (GLM), `claude_monitor.py`.
- `tracker/src/tracker/estimators/` — efficiency estimator (`efficiency.py` → CI/n/power).
- `tracker/src/tracker/alias_runtime.py` — alias state machine (os/oe/ox, etc.).
- `tracker/src/tracker/churn.py` — git numstat bridge + record builder.

Behaviours and Tests
- Behave features: `features/*.feature`; steps in `features/steps/*.py`.
- Pytest: `tracker/tests/*.py` (parsers, alias CLI, ccusage, claude_monitor, churn, efficiency, cli flow).
- Fixtures: `tests/fixtures/{codex,claude,glm,claude_monitor,ccusage}/`.

Data & Outputs (append-only JSONL)
- `data/week0/live/` — default store for snapshots/windows/ccusage/claude_monitor/glm/churn.
- Preview reads windows + optional ccusage/glm/churn to render:
  - Providers block (features, capacity, efficiency, CI, n, power)
  - Outcome line (quality, outcome)
  - Churn block (files, +adds/-dels, net, per-feature)
  - ccusage scopes (weekly/daily/session)

Docs & SOPs (where to update)
- Commit & churn: `docs/SOP/commit_conventions.md`, `docs/System/git_churn_strategy.md`.
- UAT/openers: `docs/SOP/uat_opener.md`.
- Housekeeping/jobs: `docs/System/scheduler/standing_jobs.md`.
- Handoff/progress: `docs/SESSION_HANDOFF.md`, `progress.md`.
- Value system/schemas/contracts: `docs/System/value_system.md`, `docs/System/schemas/universal_provider_schema.md`, `docs/System/contracts.md`.

Add a new source (quick recipe)
1) Parser in `tracker/src/tracker/sources/<name>.py` returning `{provider, parsed:{...}, errors:[]}`.
2) Register in `PARSERS` (CLI) and wire `ingest` path to corresponding JSONL file.
3) Add pytest with fixtures, and optional Behave scenario.
4) Update preview printer if the source has a summary line.

Add a new preview metric
1) Implement computation in estimators or a new module under `estimators/`.
2) Extend `preview` printer to display the metric; keep formatting consistent.
3) Add tests for edge cases and formatting.

Churn quick-run
- Finalize a window with commit hashes, then:
  `PYTHONPATH=tracker/src python -m tracker.cli churn --window W0-XX --provider <p>`
  See `docs/Ledgers/Churn_Ledger.csv` and preview `Churn:` block.

