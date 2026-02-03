# Tracker CLI Discovery — 2025-11-05

## Scope & Drivers
- Tracker CLI remains unimplemented; progress log confirms ingestion tooling pending (`progress.md:24`).
- Active task requires end-to-end CLI verification once built, including ingest/finalize flows (`docs/Tasks/tracker_cli_todo.md:1`).
- PRD mandates subscription-only ingestion with append-only JSONL outputs for Week-0 readiness (`docs/SOP/PRD_v1.6-final.md:59`).

## Existing Assets
- Legacy parsers for Codex and Claude live under the archived v1.3 tree and can be ported (`archive/v1_3/tracker/sources/codex.py:1`, `archive/v1_3/tracker/sources/claude.py:1`).
- BDD feature files describe expected parser behaviour and fixtures for wide/narrow/error panes (`archive/v1_3/tests/bdd/features/codex_status_parse.feature:6`, `archive/v1_3/tests/bdd/features/claude_usage_parse.feature:6`).
- Step definitions reference `tracker.sources.codex` and `tracker.sources.claude`, so live modules must expose identical function names (`archive/v1_3/tests/bdd/steps/parse_steps.py:5`).
- Fixtures already reside in `tests/fixtures/{codex,claude}` and match the BDD scenarios (`progress.md:14`).
- Added ccusage JSON samples for GLM prompt counts under `tests/fixtures/glm/` (normal + empty blocks) to unblock bridge implementation.

## Required Outcomes
- CLI should support `tracker ingest` (phase before/after) and `tracker complete` commands as described in Week-0 protocol (`docs/SOP/week0_final_protocol.md:104`).
- Parser implementations must flag narrow panes and usage failures with `insufficient-data` / `usage-not-loaded` to satisfy PRD guarantees (`docs/SOP/PRD_v1.6-final.md:64`).
- Results need to populate `snapshots.jsonl`, `glm_counts.jsonl`, and `windows.jsonl` in append-only form (`docs/SOP/PRD_v1.6-final.md:59`, `docs/SOP/week0_final_protocol.md:154`).

## Gaps & Open Questions
- No `tracker` package files exist yet; need to establish package structure (`tracker/`).
- GLM ingestion/ccusage bridge referenced by PRD lacks any stub; scope for Week-0 MVP should confirm expectation (likely placeholder until GLM onboarding) (`docs/SOP/PRD_v1.6-final.md:309`).
- Archive-only test suite references behave BDD; decision needed on whether to port to pytest or adopt behave for new suite.
- `ai-docs/` workspace not present in repo; confirm whether alternative knowledge base replaces it or if import is pending.

## AI-Docs References
- None available — `ai-docs/` directory missing (gap recorded above).
