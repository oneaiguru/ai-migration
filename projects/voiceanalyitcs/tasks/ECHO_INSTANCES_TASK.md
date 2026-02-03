# Task: Add echo_method_instances to structured JSON and prompt

Goal
- Enrich the structured JSON with `echo_method_instances` so the grader can evaluate C07 accurately, including “reuse existing data” confirmations.

What to do (JSON)
- In `pre_calculated`, populate `echo_method_instances` (not empty) with entries that describe where contact data was handled. Each entry should include:
  - `data_type` (e.g., phone, name, surname, address, email)
  - `timestamp_ms`
  - `pattern` (e.g., `new_entry`, `echo_with_confirmation`, `reuse_existing`)
  - `operator_text`
  - `customer_response`
- Keep searches facts-only (no judgment flags), as already implemented.
- Regenerate outputs for call_05 and call_02 with populated echo_method_instances.
- Update tests to assert presence and basic structure of echo_method_instances (no judgments, just facts).

What to do (prompt/spec)
- Update the C07 section in the prompt/spec to include the “reuse existing data” PASS pattern:
  - “Номер телефона такой же, да?” → “Да” → PASS (confirmation of existing data)
  - “Используем адрес из прошлого заказа?” → “Да” → PASS
  - Clarify this is confirmation of reuse, not new data entry.

Files to touch
- `phase1_analysis/structured_json_handoff/converter_stub.py` (populate echo_method_instances)
- `phase1_analysis/structured_json_handoff/test_converter.py` (add checks)
- Regenerate outputs: `phase1_analysis/structured_json_handoff/output/` for calls 05/02

DoD / Acceptance (BDD)
- Given the converter runs on call_05/call_02, when inspecting the outputs, then `echo_method_instances` is non-empty and each item has the five factual fields above (no judgment flags).
- Searches remain facts-only (announced/ended/duration_sec/thanks_given/customer_interactive/announcement_text).
- Tests updated and passing: `python -m pytest phase1_analysis/structured_json_handoff/test_converter.py`.
