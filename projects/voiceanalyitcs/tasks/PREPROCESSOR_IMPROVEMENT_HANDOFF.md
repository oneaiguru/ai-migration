# Handoff: Preprocessor Improvement Loop

## Objective
Use the reviewer’s spot-check findings to improve `converter_stub.py` signals vs. the golden transcripts. Keep the baseline `converter_stub_standard.py` untouched.

## Read These First
- Reviewer’s spot-check report (19 calls) – false positives/misses.
- `phase1_analysis/tasks/SPOTCHECK_RUNBOOK_FOR_AGENT.md`
- Current preprocessor: `phase1_analysis/structured_json_handoff/converter_stub.py`
- Batch runner: `phase1_analysis/structured_json_handoff/run_all_calls.py`

## Data Paths (golden set only)
- VTT: `/Users/m/Documents/_move_back/desikotmoveafterjuryback/golden_review_package_full/calls/call_##/transcript-2.vtt`
  - call_06 uses `transcript-3.vtt`
- Word-level (optional checks): matching `timestamps-2.json` / `timestamps-3.json` in the same folder.
- Outputs to inspect: `~/Desktop/preprocessor_all_calls_signals/call_##_structured_input_signals.json`

## Rules
- Do **not** modify `converter_stub_standard.py`.
- Apply fixes in `converter_stub.py` and tests.
- After changes, run:
  - `python phase1_analysis/structured_json_handoff/run_all_calls.py` (rebuild all 20 from golden set; copies signals to Desktop)
  - `python -m pytest phase1_analysis/structured_json_handoff/test_converter.py`
  - `behave phase1_analysis/structured_json_handoff/features/greeting.feature`

## Expected Outputs
- Refreshed signals JSONs in `~/Desktop/preprocessor_all_calls_signals/` with reduced false positives/misses.
- Tests/Behave green.
- Optional: brief note of fixes applied.
