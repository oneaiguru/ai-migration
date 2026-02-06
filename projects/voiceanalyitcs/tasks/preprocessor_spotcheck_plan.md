# Preprocessor Spot-Check Plan (calls 1–14, 16–20)

Goal: Ask a reviewing agent to verify that the preprocessor signals are accurate (no misleading regex hits) across the remaining calls. Focus on correctness of signals, not on filling missing ones.

Scope
- Calls to review: 01–14, 16–20 (`~/Desktop/preprocessor_all_calls_signals/call_##_structured_input_signals.json`)
- Inputs to reference: matching VTTs in repo `calls/call_##/transcript-2.vtt` (or golden folder where needed).

What to inspect per call
- Greeting signals: `greeting.*` (company/name/greeting/ask_how_to_address, first_agent_* flags).
- City timing: `city.within_first_five`.
- Needs: `needs.quantity_asked`, `needs.season_asked`, `needs.parameters_asked` (ensure agent asked, not customer-stated).
- Searches: count, durations, thanks_given (spot-check long/short).
- Closing position: `closing.thanks_in_last_block`, `closing.goodbye_in_last_block`.
- Heuristic signals to sanity-check: `advantages_used`, `objection_handled`, `three_options`, `reservation_offered`.
- Extracted data sanity: `extracted_data.quantities` (look for false positives) and `tire_sizes`.

How to work (instructions for reviewer)
1. For each call ID in the list:
   - Open `~/Desktop/preprocessor_all_calls_signals/call_##_structured_input_signals.json`.
   - Open the matching VTT: `calls/call_##/transcript-2.vtt` (or the golden folder for call_06 `transcript-3.vtt`).
2. Verify signals vs raw transcript:
   - Note any false positives (e.g., quantity from company name, objection without customer trigger, greeting company not in first line).
   - Note any obvious misses the preprocessor should have caught.
3. Record findings in a short summary (per call) with: call_id, false positives, misses, any severity.

Deliverable
- A concise report (per call) listing misfires/misses, so we can adjust regex/logic where needed.

Where to find files
- Signals JSON: `~/Desktop/preprocessor_all_calls_signals/call_##_structured_input_signals.json`.
- VTT: `calls/call_##/transcript-2.vtt` (except call_06: use `transcript-3.vtt` from the golden folder). 
