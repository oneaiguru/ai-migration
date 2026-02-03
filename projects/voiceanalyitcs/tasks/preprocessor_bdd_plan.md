# Preprocessor BDD Plan (converter_stub.py)

Goal: drive the preprocessor fixes from executable specs. We’ll start with feature files that describe expected signals/positions, make them red, then implement converter updates to turn them green.

## Tooling
- Runner: `behave` (add lightweight steps to parse preprocessor outputs).
- Subject Under Test: `phase1_analysis/structured_json_handoff/converter_stub.py` outputs (use `*_structured_input_signals.json`).
- Test data: reuse `calls/call_05/transcript-2.vtt` + diarized inputs already wired; converter writes outputs under `phase1_analysis/structured_json_handoff/output/`.

## Feature File Outline (examples)

1) `features/greeting.feature`
   - Scenario: GR01 company + greeting in first agent utterance.
   - Scenario: GR02 “меня зовут [Name]” in first agent utterance (no broad “это/с вами”).
   - Scenario: GR03 “как можно к вам обращаться?” exists.
   - Scenario: GR04 city asked within first 5 exchanges.

2) `features/needs_identification.feature`
   - Scenario: NI05 agent-asked season question (must be a question, agent speaker).
   - Scenario: NI07 agent-asked quantity question (not customer-stated).
   - Scenario: NI02 wheel type question (литые/штампованные).
   - Scenario: NI04 tire size request, NI06 studs vs friction, NI08 brand preference.

3) `features/objection_handling.feature`
   - Scenario: customer objection trigger detected, agent responded (two-step detection).
   - Ensure no false positives when only agent “discount” talk without customer trigger.

4) `features/closing.feature`
   - Scenario: CL02/CL03 only count in final N utterances (position-aware).

5) `features/order_process.feature`
   - Scenario: OR01 order number announced; OR03 delivery method confirmed; OR06 transport payment mention.

## Step Definition Plan
- Load JSON from `output/call_XX_structured_input_signals.json`.
- Helpers:
  - `get_first_agent_utterance()`, `get_last_agent_utterances(n)`.
  - `utterance_contains(utt, substrings)`.
  - `signal(path)` to fetch `preprocessor_signals.checkpoint_signals.*`.
- Assertions: presence/boolean, matched_texts includes expected string, position constraints (utterance id/order).

## Red → Green Path
1. Write feature files under `phase1_analysis/structured_json_handoff/features/`.
2. Write minimal step defs under `phase1_analysis/structured_json_handoff/features/steps/steps.py`.
3. Run `behave` → expect failures (red) with current converter.
4. Implement converter fixes per failing scenarios (e.g., stricter patterns, speaker/position checks, objection trigger/response pairing).
5. Re-run `behave` until green; keep existing `pytest` tests alongside.

## Notes / Open Questions
- Scope which checkpoints to cover first? (Suggest GR/NI/CL as v1 set, then OH).
- Do we pin to call_05 only, or add call_02/call_08 coverage?
- Need to add a small requirements note if `behave` isn’t already in the env.
