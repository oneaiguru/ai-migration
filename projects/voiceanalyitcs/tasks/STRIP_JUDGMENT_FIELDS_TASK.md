# Task: Remove precomputed judgment fields from structured JSON outputs

Goal
- Make the main structured JSON outputs “facts-only” (no precomputed violation flags) per the format analysis.

Keep (per search):
- `announced_at_ms`
- `ended_at_ms`
- `duration_sec`
- `thanks_given`
- `customer_interactive`
- `announcement_text` (if available)

Remove:
- `is_violation_9_1`
- `is_flag_window_9_1`
- `is_micro`
- `gap_from_previous_search_ms`

Scope
- Apply this to the main outputs, not just the “_input_min” files. After this change, both full and minimal outputs should be facts-only.

Files to update
- `phase1_analysis/structured_json_handoff/converter_stub.py` (drop these fields from the full output; adjust simplify_output if needed).
- `phase1_analysis/structured_json_handoff/test_converter.py` (update assertions to reflect the removal from the full outputs).
- Regenerate outputs in `phase1_analysis/structured_json_handoff/output/` (calls 05 and 02).

Expected result (DoD)
- Converter writes both full and minimal structured JSONs with searches containing only the “keep” fields above.
- No precomputed violation/flag/micro/gap fields remain in any output.
- Tests updated and passing (`python -m pytest phase1_analysis/structured_json_handoff/test_converter.py`).
- Outputs regenerated for calls 05 and 02 in `phase1_analysis/structured_json_handoff/output/`.
- Verify end-to-end by inspecting the regenerated outputs: search objects contain only the allowed keys; no judgment fields present.***

BDD acceptance (for manual/automated checks)
- Given the converter runs on call_05, when I open `output/call_05_structured.json`, then each search object contains only `announced_at_ms`, `ended_at_ms`, `duration_sec`, `thanks_given`, `customer_interactive`, `announcement_text` (if present), and no `is_micro`, `is_flag_window_9_1`, `is_violation_9_1`, `gap_from_previous_search_ms`.
- Given the converter runs on call_02, when I open `output/call_02_structured.json`, then search objects meet the same condition.
- Given the minimal outputs `*_input_min.json` are produced, when inspected, then search objects also contain only the allowed keys above.
- Given tests are run, when executing `python -m pytest phase1_analysis/structured_json_handoff/test_converter.py`, then all tests pass.***
