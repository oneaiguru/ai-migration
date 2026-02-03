# Preprocessor Review Summary (calls 01–14, 16–20)

Findings against golden VTTs (signals = `*_structured_input_signals.json`). Each bullet lists obvious false positives/misses.

- call_01: city asked/within_first_five and “how to address” missed; needs flags all false positives (quantity/season/parameters); advantages/objection flagged on non-advantage lines; quantities noisy (12/6/5/…); tire size 205/55 R16 missing; quantities should not include code numbers.
- call_02: asked_how_to_address missed; season_asked should be true; parameters_asked flagged on non-asks; tire size 185/60 R14 missing; quantities polluted (5/9/2/1/74).
- call_03: asked_how_to_address and city within_first_five missed; search #2 is not a search; tire size missing; quantities noisy.
- call_04: company_said/first_agent_company wrongly false; huge 197s search false; quantity_asked miss (“комплект нужен?”); tire size missing; quantities only 2/1 (should capture 4); advantages/objection include unrelated lines.
- call_05: city not asked (correct) but quantity_asked falsely true; parameters_asked full of non-asks; tire size 205/55 R16 (and 255 misheard) missing; closing thanks includes mid-call “Спасибо за ожидание”.
- call_06: city asked/within_first_five missed; parameters_asked tied to summary only; advantages/objection full of irrelevant text; quantities wrong (1/8/10/… no “4”); tire size missing.
- call_07: asked_how_to_address missed; parameters_asked over-flagged; three_options false positive; tire size 185/65 R15 missing; quantities empty though order for 4.
- call_08: company flags false; needs.quantity matched wrong lines (actual ask later not captured); tire/wheel specs missing; quantities noisy (2/1/3/4/8 incl. “4 комплекта”); advantages/objection/closing contain unrelated text.
- call_09: city asked missed; quantity_asked miss (agent confirmed 4); tire size 225/45 R18 missing; quantities include 74 etc.; three_options/advantages/objection stuffed with pricing spiels; closing thanks pulled from mid-call.
- call_10: company/first_agent_name flags false; city asked false negative acceptable; tire sizes (215/60 R16, 205/65 R16) missing; advantages/objection polluted with inventory talk; greeting/closing matches include random utterances.
- call_11: asked_how_to_address missed; huge 92s search false positive; tire size/disk R19 missing; advantages matched to greeting/body text.
- call_12: company name “54” but company_said false; quantity_asked miss (customer wants 4); parameters_asked minimal (should capture size check); quantities include “54 колеса”; tire size 14/4x98 missing.
- call_13: search list empty though there was a hold; quantity_asked false positive (customer stated 1); tire size 225/55 R19 missing; advantages/reservation/closing include whole monologue; quantities show 3 (stock), not requested 1.
- call_14: season_asked/parameters_asked missed (agent asked winter/size); tire size 215/65 R17 missing; quantities only 1/2/3; advantages/objection include inventory chatter.
- call_16: city asked missed; season/parameters not captured though winter status/size discussed; tire size missing; quantities noise (3/8/9).
- call_17: city asked missed; needs all false (size/model/year asked); tire/wheel specs missing; seasons mis-set to summer; reservation offered true ok; greeting/closing match wrong lines.
- call_18: tire size 215/65 R16 missing; season set to winter though tire is summer; reservation/three_options marked but only alternatives suggested; no search logged; quantities noise (1/2 ok, but no explicit ask).
- call_19: city asked missed; needs parameters flagged though greeting mis-parsed; tire size for 16\" Jumpy/Expert missing; quantities noise (3/4/5); closing thanks absent; advantages/objection use availability lines.
- call_20: company/asked_how_to_address/city flags false; needs season/quantity not captured (customer needed 2); tire size 175/65 R14 missing; three_options false positive; advantages/objection include working-hours blurb; closing missing though conversation ended.

Next steps (high level):
- Tighten greeting/company/name detection; enforce position checks.
- Make city/needs signals require actual agent questions; reduce false positives from customer statements.
- Extract mentioned tire sizes; suppress numeric noise in quantities; ignore codes/“74”.
- Refine search detection to avoid micro-splits and long false holds; narrow advantage/objection matching to real triggers.
- Keep baseline `converter_stub_standard.py` untouched; apply fixes in `converter_stub.py`, rerun `run_all_calls.py` (golden inputs), and ensure tests/behave stay green.
