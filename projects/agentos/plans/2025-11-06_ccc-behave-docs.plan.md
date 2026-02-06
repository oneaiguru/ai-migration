# Plan — CCC Adapter BDD & Docs Alignment

## Required Reading
- `docs/integration/CCC_ADAPTER_PROPOSALS.md`
- `docs/integration/INTEGRATION-ROADMAP-and-EXECUTION.md`
- `ClaudeCodeProxy/docs/System/integration/agentos-ccc-decision-log.md`
- `docs/SOP/standard-operating-procedures.md#bdd-workflow-tracker-tooling`

## Objectives
1. Add Behave coverage that mirrors the CCC pytest integration scenarios (local-only, minimized, full tier).
2. Publish operator-facing guidance for the CCC bridge (install, licensing, validation commands, sample flows).
3. Update quick-start docs/CLI wiring so orchestration agents can run the adapter, tests, and backfill in <5 steps.

## Tasks
- Author `features/ccc_adapter.feature` with three scenarios covering privacy tiers.
- Implement shared steps in `features/steps/ccc_adapter_steps.py` reusing the CCC client + schema helpers.
- Run `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature`.
- Update README quick start with CCC adapter smoke commands.
- Create `docs/integration/CCC_BRIDGE.md` summarizing setup, telemetry tiers, and license options (`cryptography` vs injected verifier).
- Note the new Behave asset in `docs/SOP/standard-operating-procedures.md` and link to the CCC bridge doc.
- Extend `progress.md` / `docs/SESSION_HANDOFF.md` with validation notes.

## Validation Matrix
| Command | Purpose |
| --- | --- |
| `pytest tests/integration/test_ccc_adapter.py` | Guard existing integration cases. |
| `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature` | Validate new BDD flow. |
| `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --dry-run` (add flag) | Sanity-check docs command path. |

## Deliverables
- Feature file + step definitions checked in.
- Updated docs (README, CCC bridge, SOP snippet).
- Behave + pytest logs captured per SOP.
