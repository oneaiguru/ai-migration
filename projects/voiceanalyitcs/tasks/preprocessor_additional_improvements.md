# Additional Preprocessor Improvements (draft)

Source suggestions (call_05 validation) to extend the current heuristics:

1) Speaker verification heuristics  
   - Add a lightweight confidence score for speaker attribution.  
   - Agent-likely cues: “могу предложить”, “у нас есть”, price statements.  
   - Customer-likely cues: “мне нужно”, “хочу”, “у меня”.

2) Wheel type detection (NI02)  
   - Detect mixed wheel-type asks:  
     - `лит[ыоь][еёх]?\s*(или|,)\s*штамп`  
     - `штамп[ао]ванн[ыоь][еёх]?\s*(или|,)\s*лит`

3) Order number extraction (OR01)  
   - Extract order numbers for validation: `номер\s+(вашего\s+)?заказа\s*:?\s*(\d{5,7})`

4) Upsell offer detection (PP05)  
   - Upsell patterns:  
     - `предлож[уить].*секрет`  
     - `предлож[уить].*датчик`  
     - `секрет[кин].*предлож`

Tests to add  
   - Positive sizes: `"шины 205, 55 на 16"` → `["205/55 R16"]`, `"диски R16 ЕТ40"` → `["R16"]`.  
   - Needs guard: no trigger on `"Стоимость 2990 рублей"` or `"сколько стоит?"`.  
   - Closing guard: mid-call “Спасибо за ожидание…” must not set closing thanks.

Key findings from golden dataset (additional guardrails):
   - Greeting: allow “*4 Колеса” variants (e.g., “7964 Колеса”) so `greeting.company_said` doesn’t drop when the agent uses that wording (e.g., call_04).
   - Tire sizes: add plausibility filters (width 115–355, aspect 25–95, rim 12–24) and ignore phone-like digit blocks to avoid misparsing numbers like “666/93 R32”.

Additional guardrails from signal review:
   - asked_how_to_address: ensure first-agent greeting with “как я могу к вам обращаться/обращаться?” always sets true.
   - asked_city: treat early location cues like “какая это область?” as city/location asks (only in the opening turn block).
   - needs.quantity_asked: tighten matching to real quantity questions (“сколько штук/колес/комплект нужен?”) and never fire on greeting lines.
   - three_options: allow detection of multi-option pitches even when “вариант” is not said (e.g., distinct product/price contrasts).
