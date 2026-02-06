# Tasking for the structured JSON converter (align to Phase 1 spec)

Read these before coding:
- `phase1_analysis/structured_json_handoff/README_HANDOFF.md` — current flow, inputs/outputs, tests
- `/Users/m/Downloads/files (2)/New Folder With Items/СО_2024_ВТМ_фаза1.md` — Phase 1 17 criteria (full text); key for 9.1/9.3 and Phase 1 limits on 7.1, 2.2
- `/Users/m/Downloads/files (2)/New Folder With Items/СО_2024_ВТМ_фаза1_AGENTS.md` — same criteria but C01–C17 mapping to S1–S5
- `/Users/m/Downloads/files (2)/New Folder With Items/СО_2024_ВТМ_полная.md` — full system reference (shows long-search definition)
- `/Users/m/Downloads/files (2)/Вопросы_к_автору.md` — open issues (e.g., missing external docs, flash timing)
- `/Users/m/Downloads/files (2)/Интерпретации_и_примечания.md` — glossary and our assumptions/limits

Key rule excerpts to honor in code (use these instead of ad hoc heuristics):
- **9.1 (долгий поиск):** Start = operator announces need for time to search; End = operator begins delivering the requested information. Duration is the full span (returns to the line do **not** reset). Threshold: >40s is a problem; >45s is a clear violation. Ignore micro “searches” that are just short pauses.
- **9.3 (не благодарит за ожидание):** Triggered when a search occurs; check for gratitude after the search completes. Do **not** require “спасибо” after every tiny lookup; focus on real searches.
- **7.2 (Эхо):** Repeat-back + confirmation for contact data (name/phone/address/email). Phase 1 uses text+timings only.
- **Phase 1 limits:** 7.1 and 2.2 are partial (no external scripts/audio).

What to fix in the converter (aligned to the original format sample and Phase 1 rules):
1) **Search detection & preservation:** Detect searches using the doc rule (start = “need time/minute/сейчас посмотрю/проверю/уточню…”, end = first substantive answer). Do **not** drop short spans; keep all detected searches in the output. Add:
   - `is_micro` (e.g., duration_sec < 15)
   - `gap_from_previous_search_ms` between consecutive searches (coarse ms is fine)
   - `is_violation_9_1` (duration_sec > 45) and `is_flag_window_9_1` (40–45s)
   Merge obviously adjacent cues so you don’t explode into duplicates, but preserve potential short spans so a reviewer can decide if multiple short searches together form a long hold.
2) **Thanks check (9.3):** Still run gratitude detection, but don’t assume micro searches require thanks. Leave `thanks_given` per search; micro vs non-micro is up to the reviewer.
3) **Format fidelity:** Match the original requested JSON structure (call_metadata, utterances with ms, pre_calculated with searches/greeting/closing). Keep ms timestamps; durations in seconds are fine in searches. Ensure speakers, ids, durations, gaps on utterances are populated.
4) **Tests:** Extend `test_converter.py` to assert:
   - call_05 retains the long search (~60–65s) and overall searches are reasonable; tests should allow micro searches but must check `is_micro` is present and the long search matches the reference window (± tolerance).
   - call_02 includes its long search within the agreed window; tests allow additional short searches as long as they’re flagged `is_micro`.
   - Greeting/closing delays within 5s; speakers non-null.
   - If a search is marked micro, its duration_sec < 15; `gap_from_previous_search_ms` exists on all searches after the first.
5) **Data sources:** Keep using repo VTT + preferred diarized JSON:
   - call_05 diarized: `~/Desktop/call_step_pairs_all/call_05/07/07_contact_utterances_call_05_groq.json`
   - call_02 diarized: `~/Desktop/call_step_pairs_all/call_02/07/07_contact_utterances_call_02_assembly.json`
   - Full AssemblyAI copies for call_05 (sentences/paragraphs/timestamps/vtt/srt): `phase1_analysis/structured_json_handoff/data/call_05_assembly_full/` (use as fallback if needed)
   - Assembly scripts (reference only): `phase1_analysis/structured_json_handoff/tools/assembly_sources/`

Completion criteria (BDD-style):
- Running `python converter_stub.py` writes `output/call_05_structured.json` with:
  - Utterances fully populated (speaker/ids/gaps/durations) and speakers not null.
  - `pre_calculated.searches` containing the real long search (~60–65s); includes all detected searches with `is_micro` for short ones and `gap_from_previous_search_ms` where applicable. Thanks flags present.
  - Greeting/closing delays within 5s.
- Tests: `python -m pytest` passes and enforces the above (long search window, micro flagging, gaps between searches, speakers non-null).

After changes, open a PR that summarizes:
- The new search/thanks logic, micro flagging, and gaps between searches.
- Test coverage and how it maps to 9.1/9.3 requirements from the Phase 1 docs and the original JSON format sample.
