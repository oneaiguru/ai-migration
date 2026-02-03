# AGENTS

Purpose
- Preprocessor and signal pipeline for call transcripts (74 колеса). Includes converter, batch runner, tests, and spot-check runbooks.

How to run
- Batch (golden data): `python structured_json_handoff/run_all_calls.py`
  - Uses golden VTT/timestamps from `/Users/m/Documents/_move_back/desikotmoveafterjuryback/golden_review_package_full/calls/`
  - Writes outputs under `structured_json_handoff/output/` and copies signals JSONs to `~/Desktop/preprocessor_all_calls_signals/`
- Tests: `python -m pytest structured_json_handoff/test_converter.py`
- Behave: `behave structured_json_handoff/features/greeting.feature`

Notes
- Keep `converter_stub_standard.py` untouched (baseline). Work in `converter_stub.py`.
- Spot-check instructions: see `tasks/SPOTCHECK_RUNBOOK_FOR_AGENT.md` and `tasks/PREPROCESSOR_REVIEW_SUMMARY.md`.
- Uses word-level timestamps from the golden folder when available.
- BDD flow: start by adding/updating feature files (Behave) and pytest cases (red), then implement in `converter_stub.py` to turn them green. Do not skip tests before code changes.
