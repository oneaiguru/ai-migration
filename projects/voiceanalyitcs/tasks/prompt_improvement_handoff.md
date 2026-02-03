# Handoff: Prompt Improvement + Outputs

Scope for next agent (branch: `import-voiceanalyitcs-02-heuristics`, PR #89):
- Work on prompt improvements (see prompt files below).
- Keep preprocessor context in mind; tests currently green.

Current status:
- Branch: `import-voiceanalyitcs-02-heuristics` (ahead of origin by 1; latest commit not pushed because the push helper pointed at the wrong repo). I can push to origin/import-voiceanalyitcs-02-heuristics if needed.
- Untracked: `prompts/script-checkpoints-complete--3.md`, this handoff file.
- Recent code context: company matcher expanded to “*4 Колеса” variants; quantity guard keeps stemmed “шин…” + spelled counts; search detection allows short returns without strong end tokens. Outputs regenerated; tests green.

Where to work:
- Prompts: `prompts/C06_EXTENDED_prompt-4.md`, `prompts/script-checkpoints-complete--3.md`.
- Reference skills (context only): `.claude/skills/call-center-qa-prompt-editor/SKILL.md`, `.claude/skills/c06-script-compliance-prompt-editor/SKILL.md`.
- Preprocessor/tests (only if needed): `structured_json_handoff/`.

How to run:
- From repo root (`/Users/m/ai/projects/voiceanalyitcs`):  
  - `python -m pytest structured_json_handoff/test_converter.py structured_json_handoff/test_heuristics.py`  
  - `behave structured_json_handoff/features/greeting.feature`  
  - `python structured_json_handoff/run_all_calls.py` (writes outputs under `structured_json_handoff/output/` and copies signals to `~/Desktop/preprocessor_all_calls_signals/`)

Saving agent outputs:
- The agent using the prompt should save outputs/JSONs under `structured_json_handoff/output/` or a dedicated folder you create (name clearly). Keep generated JSONs tracked if they are part of the deliverable.

Notes:
- Follow BDD: add/update tests first if you change code; prompt edits can be direct.  
- Keep `converter_stub_standard.py` untouched.  
- Branch PR #89 already open; continue there (no new PR needed unless instructed). If push helper fails, push directly to origin/import-voiceanalyitcs-02-heuristics.
