# Structured JSON Handoff (Call 05 primary, Call 02 secondary)

## Objective
Build a converter that turns our call artifacts into a structured JSON format suitable for the new grading prompt. Use BDD-style development: define acceptance criteria, implement, and validate on call_05; keep call_02 handy for cross-checks.

## Target schema (illustrative)
```json
{
  "call_metadata": {
    "call_id": "05",
    "operator": "Анна",
    "total_duration_ms": 568000,
    "date": "2025-11-19"
  },
  "utterances": [
    {
      "id": 1,
      "speaker": "agent",
      "start_ms": 3637,
      "end_ms": 7937,
      "duration_ms": 4300,
      "gap_from_previous_ms": null,
      "text": "Здравствуйте, ...",
      "confidence": 0.92
    }
  ],
  "pre_calculated": {
    "searches": [
      {
        "announced_at_ms": 183160,
        "ended_at_ms": 244980,
        "duration_sec": 61.82,
        "thanks_given": false,
        "customer_interactive": true,
        "is_micro": false,
        "is_flag_window_9_1": false,
        "is_violation_9_1": true,
        "gap_from_previous_search_ms": null
      }
    ],
    "greeting_delay_ms": 3637,
    "closing_delay_ms": 2179
  }
}
```
- `speaker` values: `agent` / `customer` (lowercase).
- `duration_ms = end_ms - start_ms`; `gap_from_previous_ms` null for the first utterance.
- Include all utterances with text and confidence if available; leave confidence null/1.0 if unknown.

## Inputs (Call 05, primary)
Repository:
- `calls/call_05/transcript-2.vtt`
- `calls/call_05/paragraphs-2.json`
- `calls/call_05/sentences-2.json`
- `calls/call_05/timestamps-2.json` (word-level; diarization is weak)

Desktop bundle (better speaker info):
- `~/Desktop/call_step_pairs_all/call_05/transcript-2.vtt`
- `~/Desktop/call_step_pairs_all/call_05/07/07_timestamps_call_05.json` (Assembly-style, mostly “Agent”)
- `~/Desktop/call_step_pairs_all/call_05/07/07_contact_utterances_call_05_groq.json` (use this for speaker separation)
- Optional helper: `~/Desktop/search_recalc_kit/search_duration.py`
- Audio (if re-running diarization): `~/phase1_sorted/diarization_media/звонки и чек лист/14-11-2025_11-40-12/call_05.mp3`

## Inputs (Call 02, secondary check)
- Repo VTT: `calls/call_02/transcript-2.vtt`
- Repo word-level: `calls/call_02/timestamps-2.json`
- Desktop diarized snippet: `~/Desktop/call_step_pairs_all/call_02/07/07_contact_utterances_call_02_assembly.json`
- Feedback reference: `phase1_analysis/structured_json_handoff/call_02_feedback.json` (copied from user-supplied file)

## Prompt for the grader (external path)
- `~/Downloads/all work prior v 1.4 by haiku f1539841-78f7-47ce-81de-b535a5a764ab/V1_4_CallCenter_Grading_Prompt_EN.md`

## Expected outputs
- Place generated files under `phase1_analysis/structured_json_handoff/output/`:
  - `call_05_structured.json` (must match target schema and data)
  - `call_02_structured.json` (optional secondary validation)

## Acceptance criteria (BDD-style)
- Given the call_05 inputs, when the converter runs, then it writes `call_05_structured.json` with:
  - All utterances, each with start_ms/end_ms/duration_ms/gap_from_previous_ms/speaker/text/confidence.
  - `pre_calculated.searches` covering the long ~61.82s search (and any others) with accurate boundaries and `thanks_given` flags (facts only, no violation/micro/gap flags).
  - `greeting_delay_ms` and `closing_delay_ms` derived from the transcript.
  - `echo_method_instances` populated with contact-data echoes (data_type, timestamp_ms, pattern, operator_text, customer_response).
  - `total_duration_ms` consistent with the call (~568000 ms).
- The process is repeatable for other calls (use call_02 as a check).

## Notes
- Speaker labels: prefer the groq diarized snippet; use VTT cues to sanity-check.
- Search detection: look for “сейчас посмотрю/минуту/проверю” (start) and the subsequent answer (end). Do not drop short spans; keep searches factual with `announced_at_ms`, `ended_at_ms`, `duration_sec`, `thanks_given`, `customer_interactive`, and optional `announcement_text`. Mark `thanks_given` when “спасибо/благодарю … ожидание/ждали” follows within the expected window.
- Echo method (C07 support): add `echo_method_instances` whenever contact data is echoed or confirmed. Patterns include `new_entry`, `echo_with_confirmation`, and `reuse_existing` (e.g., “Номер телефона такой же, да?” → “Да” counts as PASS). Use operator_text and the follow-up customer_response to capture the exchange.
- Keep code in-repo (e.g., `phase1_analysis/structured_json_handoff/`) and avoid touching existing Sonnet/BLIND/Opus outputs.

## How to run
- Convert calls (writes to `output/`): `python converter_stub.py`
- Run tests (basic schema/search/greeting checks for call_05; call_02 if present): `python -m pytest`
- Current search logic: keeps all detected searches (including micro <15s), merges adjacent cues, flags 9.1 window/violations, records gaps between searches, and checks gratitude on every detected search.
- Reference sample: `reference/call_05_structured.ref.json` pins the expected search windows for call_05; tests allow small timing tolerance.
