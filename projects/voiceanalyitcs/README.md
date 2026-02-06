# voiceanalyitcs preprocessor

Preprocessor and signal extraction for the 74 колеса QA pipeline, using golden VTT + word-level data.

## Key files
- `structured_json_handoff/converter_stub.py`: active preprocessor (searches, signals, echo).
- `structured_json_handoff/converter_stub_standard.py`: preserved baseline (do not modify).
- `structured_json_handoff/run_all_calls.py`: batch runner (golden inputs → outputs; copies signals to `~/Desktop/preprocessor_all_calls_signals/`).
- `structured_json_handoff/test_converter.py`: pytest checks.
- `structured_json_handoff/features/greeting.feature` (+steps): Behave sanity check.
- `structured_json_handoff/output/`: sample outputs (call_05 tracked; others ignored by .gitignore).
- `tasks/`: runbooks (`SPOTCHECK_RUNBOOK_FOR_AGENT.md`), review findings (`PREPROCESSOR_REVIEW_SUMMARY.md`), improvement handoff (`PREPROCESSOR_IMPROVEMENT_HANDOFF.md`), and planning notes.
- `AGENTS.md`: quick start with commands and paths.

## Usage
- Batch (golden data): `python structured_json_handoff/run_all_calls.py`
  - Reads VTT/timestamps from `/Users/m/Documents/_move_back/desikotmoveafterjuryback/golden_review_package_full/calls/`
  - Writes outputs under `structured_json_handoff/output/` and copies signals JSONs to `~/Desktop/preprocessor_all_calls_signals/`
- Tests: `python -m pytest structured_json_handoff/test_converter.py`
- Behave: `behave structured_json_handoff/features/greeting.feature`

Note: Work only in `converter_stub.py`; keep `converter_stub_standard.py` unchanged.
