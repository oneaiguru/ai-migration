# Task: Simplify structured JSON inputs to the minimal spec

Context
- Current structured outputs for calls (e.g., `call_05_structured.json`/`call_05_structured_input.json` on Desktop) include extra per-search flags:
  - `is_micro`, `is_flag_window_9_1`, `is_violation_9_1`, `gap_from_previous_search_ms`, `customer_interactive`
- The minimal sample we shared earlier only had: `announced_at_ms`, `ended_at_ms`, `duration_sec`, `thanks_given`, `customer_interactive` (optional), plus greeting/closing delays and utterances.

What to do
1) Add an option (or a separate export) to strip the extra search fields so the JSON matches the minimal spec:
   - Keep: `announced_at_ms`, `ended_at_ms`, `duration_sec`, `thanks_given` (and optionally `customer_interactive` and `announcement_text`).
   - Remove from the simplified output: `is_micro`, `is_flag_window_9_1`, `is_violation_9_1`, `gap_from_previous_search_ms`.
2) Add an optional `echo_method_instances` array to `pre_calculated` to flag where contact data was handled. Each item should include:
   - `data_type` (e.g., phone, name, address, email)
   - `timestamp_ms`
   - `pattern` (e.g., `new_entry`, `echo_with_confirmation`, `reuse_existing`)
   - `operator_text`
   - `customer_response`
   This helps the grader evaluate C07 accurately (including “reuse existing data” cases).
3) Regenerate the simplified call_05 JSON for Desktop as `call_05_structured_input.json` (or as a second file, e.g., `call_05_structured_input_min.json`), matching the minimal sample format (plus `echo_method_instances` if added).
4) Update tests or add a small check to ensure the simplified output contains only the allowed fields (and, if present, that `echo_method_instances` entries carry the expected keys).

Files to touch
- `phase1_analysis/structured_json_handoff/converter_stub.py` (add simplified export or toggle)
- `phase1_analysis/structured_json_handoff/test_converter.py` (if you add a simplified-output check)
- Regenerate desktop copy for call_05 after simplification.

Outputs expected
- Simplified JSON on Desktop for call_05 (no extra flags), matching the minimal sample structure.
- If adding a second output, keep the full version intact for internal use; the simplified version is for downstream graders that expect the minimal schema.
