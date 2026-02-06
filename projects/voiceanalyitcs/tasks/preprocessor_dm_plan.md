# DM Plan: Preprocessor Signals + C06_EXTENDED Integration

## Objectives
- Land the external C06_EXTENDED prompt and the rr two-layer architecture note inside the repo.
- Define the target schema additions for preprocessor-produced signals so the C06_EXTENDED prompt can rely on facts, not regex in the LLM.
- Outline converter_stub.py changes and outputs (including a new sample) to support the two-layer flow.

## Inputs/References
- Desktop prompt: `/Users/m/Downloads/C06_EXTENDED_prompt-3 (3).md`
- Two-layer note: `/Users/m/Desktop/rr.markdown`
- Current preprocessor: `phase1_analysis/structured_json_handoff/converter_stub.py`
- Current minimal sample: `phase1_analysis/structured_json_handoff/output/call_05_structured_input_min.json`
- Tasks: `phase1_analysis/tasks/JSON_INPUT_SIMPLIFICATION_TASK.md`, `ECHO_INSTANCES_TASK.md`, `STRIP_JUDGMENT_FIELDS_TASK.md`

## Planned Work (next steps)
1) **Prompt & Note Ingestion**
   - Copy the external prompt and rr note into `phase1_analysis/prompts/` for versioned reference.
2) **Schema Extension (design)**
   - Add `preprocessor_signals` block with:
     - `call_context` flags (e.g., `is_tire_call`, `is_wheel_call`, `has_repeat_customer`).
     - `extracted_data` (lists/strings: `car_models`, `tire_sizes`, `quantities`, etc.).
     - `checkpoint_signals` per script checkpoint: greeting, city, needs (quantity/season/parameters), three_options, advantages_used, objection_handled, reservation_offered, closing; each as booleans plus optional `matched_text`/`utterance_ids`.
   - Keep existing `pre_calculated` (searches, echo_method_instances, greeting/closing delays).
3) **Converter Updates (implementation)**
   - Implement regex/heuristics in `converter_stub.py` to populate the new `preprocessor_signals` without adding LLM judgment.
   - Emit a new sample `call_05_structured_input_signals.json` showing the enriched schema.
   - Update tests to assert presence/shape of `preprocessor_signals`.
4) **Prompt Hook**
   - Add a short README snippet explaining how Layer 2 (C06_EXTENDED prompt) should treat signals as hints/overridable facts.

## Open Questions
- Final destination for the merged results JSON (Layer 2 output) — reuse existing output path or new folder?
- Minimal vs full: keep both `_input_min` (facts-only) and `_input_signals` (enriched)?
- Confidence scoring for signals: needed or keep simple bool + matched_text?

## Definition of Done
- Prompt and rr note stored in-repo under `phase1_analysis/prompts/`.
- Converter schema/design agreed; implementation ready to start.
- Sample enriched JSON generated (call_05) once code is updated.
- Tests updated to cover the new `preprocessor_signals` structure.
