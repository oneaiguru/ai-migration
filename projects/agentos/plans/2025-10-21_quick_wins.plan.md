# Plan (2025-10-21) — Quick Wins Sprint (70–80% Context Window)

## Target Budget
- Window target: 70–80% of 272K ≈ 190–218K tokens
- Buffer: 15K tokens reserved
- Buckets:
  - Progressive NAV Generator: 8K
  - Spec Coverage Map: 7K
  - Scenario Harvester: 8K
  - Token Estimator & Governor: 14K
  - Snapshot/Restore State: 6K
  - Plan/Term Lint: 11K
  - Window Index + Snapshot ID utilities: 6K
  - Deliverables Bundler: 6K
  - Validation & handoff: 15K

## Required Reading (Pre-flight)
1. docs/SOP/next_session_planning_sop.md
2. docs/SOP/definition_of_done.md
3. docs/SOP/recipes_index.md (NAV, ledger, bundler)
4. docs/Backlog/index.md (Quick Wins rows) + relevant specs:
   - `docs/Backlog/progressive_nav_generator.md`
   - `docs/Backlog/spec_coverage_map.md`
   - `docs/Backlog/scenario_harvester.md`
   - `docs/Backlog/token_estimator_governor.md`
   - `docs/Backlog/snapshot_restore_state.md`
   - `docs/Backlog/coverage_and_lint.md`
   - `docs/Backlog/integration_map.md` + `docs/Backlog/feasibility_review.md`
5. Latest session reports (`docs/SessionReports/<YYYY-MM-DD>_{TLDR,Ideas,Decisions,Risks}.md`)

## Tasks
1. **Progressive NAV Generator (8K)**
   - Implement `scripts/tools/build_nav_index.py`
   - Generate NAV files for top archive docs; link from summaries
2. **Spec Coverage Map (7K)**
   - Implement `scripts/tools/spec_coverage.py`
   - Emit markdown table + suggestions; integrate into wrap-up
3. **Scenario Harvester (8K)**
   - Implement `scripts/tools/harvest_scenarios.py`
   - Append to `docs/Ledgers/Feature_Log.csv` idempotently; add to wrap-up ritual
4. **Token Estimator & Governor (14K)**
   - Implement `scripts/tools/estimate_tokens.py` and `scripts/tools/session_governor.sh`
   - Governor warns >75%, suggests deferral >80%; support `--force`
5. **Snapshot/Restore State (6K)**
   - Implement `scripts/tools/state_snapshot.sh` (save/restore)
   - Document usage; respect lockfile to avoid automation collisions
6. **Plan/Term Lint (11K)**
   - Implement `scripts/tools/plan_lint.py` and `scripts/tools/term_lint.py`
   - Enforce naming SOP + glossary
7. **Window Index & Snapshot ID (6K)**
   - Implement utilities for `snapshot_id` hashing and `windows.idx.json`
   - Integrate into ingestion + preview
8. **Deliverables Bundler (6K)**
   - Implement `scripts/tools/build_bundle.sh`
   - Update recipes + wrap-up checklist
9. **Validation & Handoff (15K)**
   - Targeted + full pytest/behave
   - Update ledgers, progress, handoff; run bundler

## Validation Checklist
- All new scripts have executable bit + README snippets
- Tests cover new utilities (unit where applicable)
- Wrap-up ritual updated to include harvester, bundler, governor warnings
- `progress.md` and `docs/SESSION_HANDOFF.md` log commands + bundle path

## Handoff Requirements
- Commit specs, scripts, and README/SOP updates
- Update `docs/Backlog/index.md` (move completed items, note next phases)
- Append ledger rows and note token usage
- Leave plan for Session +2 (Data Foundations)
