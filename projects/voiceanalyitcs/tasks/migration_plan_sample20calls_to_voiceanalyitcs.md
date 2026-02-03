## Migration Plan: sample20calls → voiceanalyitcs

- **Source root:** `/Users/m/git/clients/sample20calls`

- **Targets to migrate (Phase 1 preprocessor):**
  - `/phase1_analysis/structured_json_handoff/`
    - Code: `converter_stub.py`, `converter_stub_standard.py`, `run_all_calls.py`
    - Tests: `test_converter.py`, `test_heuristics.py`
    - BDD: `features/` (and `features/steps/`)
    - Outputs: `output/` (call_* structured/min/signals JSONs)
    - Docs/specs: `AGENT_TASK.md`, `README_HANDOFF.md`, `reference/`, `data/`, `tools/` as needed
  - Prompts/specs: `/phase1_analysis/prompts/` (if needed) + the v3.2.3 prompt at `/Users/m/Desktop/prompt_versions/c06-extended-v323-PATCHED (1).md`

- **Target repo:** `/Users/m/ai/projects/voiceanalyitcs`
  - Place the preprocessor under `structured_json_handoff/` (same structure: code, features, tests, output, validator).
  - Place prompts/specs under `prompts/` (or designated prompt folder).
  - Update any hardcoded paths (VTT/JSON sources, outputs) to the voiceanalyitcs layout.

- **Verification after migration:**
  - From `voiceanalyitcs/structured_json_handoff/`: run `pytest -q`, `python run_all_calls.py`, `python validate_outputs.py`.
  - Spot-check call types and outputs; ensure `_meta.version` matches prompt v3.2.3.

- **Staging guidance:**
  - Stage only migrated/updated files in `voiceanalyitcs`; ignore unrelated sample20calls files.
