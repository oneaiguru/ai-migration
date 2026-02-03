# Spot-Check Runbook (Preprocessor Signals vs Raw VTT)

## Goal
Verify that the preprocessor signals match the raw transcripts. Produce a per-call note of false positives and misses. Do **not** read or modify preprocessor code; focus on comparing raw VTT to the preprocessor JSON outputs.

## Calls to check (all 19)
- call_01–call_14, call_16–call_20.

## Inputs to use (always golden set for consistency)
- Preprocessor outputs (LLM-facing): `~/Desktop/preprocessor_all_calls_signals/call_##_structured_input_signals.json`
- Raw transcript (VTT): `/Users/m/Documents/_move_back/desikotmoveafterjuryback/golden_review_package_full/calls/call_##/transcript-2.vtt`
  - call_06 uses `/transcript-3.vtt` in the same golden folder.
- If you need to confirm timing/speaker details for suspected false positives/misses, optionally consult the word-level file in the same folder (`timestamps-2.json` or `timestamps-3.json`).

## What to verify per call
1) **Greeting**: company/name/greeting/ask flags reflect the first agent line; company is “74 колеса” in the opening.
2) **City timing**: `city.within_first_five` is true only if the city question is in the first 5 exchanges.
3) **Needs**: `needs.quantity_asked`, `needs.season_asked`, `needs.parameters_asked` are set only when the **agent asks** those questions (not when customer states them).
4) **Searches**: count, start/end/duration, thanks_given make sense vs pauses and “ищу/минуту/проверю” spans.
5) **Closing**: `closing.thanks_in_last_block` and `closing.goodbye_in_last_block` reflect the final few utterances.
6) **Heuristic flags**: `advantages_used`, `objection_handled`, `three_options`, `reservation_offered` — note any obvious false positives.
7) **Extracted data sanity**: `extracted_data.quantities` and `tire_sizes` — call out wrong extractions (e.g., company name as quantity).

## How to work (bias-free)
1) For each call, **first read the VTT only** and jot down what you expect the signals to be (greeting/city/needs/search/closing, etc.).
2) Then open the corresponding `*_structured_input_signals.json` and compare to your notes.
3) Do not inspect converter code.
4) Note: false positives (signal says true but transcript doesn’t) and misses (agent action present but signal false).
5) Keep notes concise per call.

## Deliverable
- A short report with one section per call (01–14,16–20) listing any false positives/misses for the items above. “No issues” is acceptable if everything aligns.
