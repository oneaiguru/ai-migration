# Handoff for Next PR (preprocessor follow-ups)

Context
- Current branch: `import-voiceanalyitcs-02-heuristics` (merged? check PR #89).
- Baseline left untouched: `structured_json_handoff/converter_stub_standard.py`.
- Latest improvements shipped; follow-ups captured below. Work in `structured_json_handoff/` and add tests first (BDD: Behave/pytest red → green).

Planned follow-ups (from additional plan `tasks/preprocessor_additional_improvements.md`)
1) Speaker verification heuristics  
   - Add lightweight agent/customer likelihood cues (agent: “могу предложить/у нас есть” and price lines; customer: “мне нужно/хочу/у меня”) to reinforce speaker attribution confidence.
2) Wheel type detection (NI02)  
   - Detect mixed wheel-type asks (литые vs штампованные) using the provided regex snippets.
3) Order number extraction (OR01)  
   - Extract order numbers: `номер\s+(вашего\s+)?заказа\s*:?\s*(\d{5,7})`.
4) Upsell offer detection (PP05)  
   - Upsell patterns: `предлож[уить].*секрет`, `предлож[уить].*датчик`, `секрет[кин].*предлож`.
5) Greeting/company guardrail  
   - Allow “7964 Колеса” variant so `greeting.company_said` doesn’t drop when that wording is used.
6) City/needs guardrails  
   - `asked_how_to_address`: ensure first-agent “как я могу к вам обращаться/обращаться?” flips true.  
   - `asked_city`: treat opening-turn “какая это область?” as location ask.  
   - `needs.quantity_asked`: tighten to real quantity questions (“сколько штук/колес/комплект нужен?”), never greeting lines.
7) Tire size plausibility  
   - Filter sizes by plausible bounds (width 115–355, aspect 25–95, rim 12–24) and ignore phone-like digit blocks (e.g., prevent “666/93 R32”).
8) Wheel type & all-season already noted; keep existing all-season handling.

Tests to add (per plan)
- Positive sizes: “шины 205, 55 на 16” → `["205/55 R16"]`, “диски R16 ЕТ40” → `["R16"]`.
- Needs guard: no trigger on “Стоимость 2990 рублей” or “сколько стоит?”.
- Closing guard: mid-call “Спасибо за ожидание…” must not set closing thanks.
- New signals: add pytest cases (and Behave if helpful) for wheel-type detection, order number extraction, upsell detection, speaker confidence cues, and the greeting/company variant.

How to work
- Add/adjust tests first (`structured_json_handoff/test_*.py`, Behave features if needed), then implement in `structured_json_handoff/converter_stub.py`. Keep `converter_stub_standard.py` untouched.
- Use golden data paths already in `run_all_calls.py`; regenerate with `python structured_json_handoff/run_all_calls.py` (copies signals to `~/Desktop/preprocessor_all_calls_signals/`).
- Run: `python -m pytest structured_json_handoff/test_converter.py structured_json_handoff/test_heuristics.py` and `behave structured_json_handoff/features/greeting.feature`.

Files to watch
- `structured_json_handoff/converter_stub.py` (implementation)
- `structured_json_handoff/test_converter.py` + new tests (pytest)
- `structured_json_handoff/features/*` (Behave, if you extend)
- `tasks/preprocessor_additional_improvements.md` (source list)

Baseline reminder
- Do not modify `converter_stub_standard.py`. Keep PR scoped to `converter_stub.py`, tests, and optional doc/task files.
