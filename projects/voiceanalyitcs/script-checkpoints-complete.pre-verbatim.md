# 74колеса Script Checkpoints — Phase 1 (Transcript Only)

**Version:** 2.1.0  
**Source:** Проверка_скрипта_колеса_основной_скрипт_1.pdf (Russian original)  
**Scope:** Requirements checkable from transcript text only (no audio, no CRM/Oktell)  
**Purpose:** Authoritative reference for C06_EXTENDED prompt construction  
**Coverage:** 100% of checkable script requirements

---

## Overview

This document extracts **specific, checkable requirements** from the 74колеса call center script. Each checkpoint includes detection logic that can be implemented against the preprocessed JSON.

### Checkpoint Categories

| Category | Count | Description |
|----------|-------|-------------|
| GR (Greeting) | 4 | Opening sequence requirements |
| NI (Needs Identification) | 12 | Customer qualification questions |
| PP (Product Presentation) | 6 | How products are offered |
| OH (Objection Handling) | 9 | Response to customer pushback |
| OR (Order Process) | 6 | Data collection and confirmation |
| OS (Order Status) | 3 | Status/fulfillment support calls |
| TS (Tire Service) | 4 | Шиномонтаж/service appointment calls |
| CL (Closing) | 3 | Call termination requirements |
| **TOTAL** | **47** | |

### Confidence Levels

- **HIGH (0.90+)**: Clear keyword/phrase match, unambiguous
- **MEDIUM (0.80-0.89)**: Semantic match required, some interpretation
- **LOW (0.70-0.79)**: Context-dependent, may need human review

---

## GR: GREETING CHECKPOINTS

### GR01: Company Identification

**Requirement (Russian):**
> "Здравствуйте, компания 74 Колеса..."

**PDF Source:** Page 1, Opening block, line 1

**Category:** GR | **Applicability:** All calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
FIRST agent utterance (id=1) MUST contain:
  - Greeting: "здравствуй" (any form) OR "добрый" + time
  - Company: "74" AND ("колес" OR "wheels")
```

**Regex Pattern:**
```regex
(?i)(здравствуй|добр[ыо][йе]\s*(день|утро|вечер)).*74\s*(колес|wheels|колёс)
```

**Pass Examples:**
- "Здравствуйте, компания 74 колеса..."
- "Добрый день, 74 колёсами..."
- "Здравствуйте. Компания 74 Колеса."

**Fail Examples:**
- "Алло?" (no greeting, no company)
- "Здравствуйте, чем могу помочь?" (no company name)
- "74 колеса, слушаю" (no greeting word)

**Confidence:** HIGH (0.95)

---

### GR02: Operator Name Introduction

**Requirement (Russian):**
> "...меня зовут <имя оператора>"

**PDF Source:** Page 1, Opening block, line 1

**Category:** GR | **Applicability:** All calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
FIRST agent utterance MUST contain:
  - Name intro phrase: "меня зовут" OR "моё имя" OR "я –"
  - Followed by: capitalized word (name)
```

**Regex Pattern:**
```regex
(?i)(меня\s+зовут|моё?\s+имя|я\s*[–\-])\s*([А-ЯЁ][а-яё]+)
```

**Pass Examples:**
- "...меня зовут Анна..."
- "...меня зовут Ирина, чем могу помочь?"
- "...моё имя Александра..."

**Fail Examples:**
- "Здравствуйте, 74 колеса, слушаю" (no name)
- "Здравствуйте, это Анна" (missing "меня зовут")

**Confidence:** HIGH (0.95)

**Extract:** Capture operator name for metadata validation

---

### GR03: Customer Name Request

**Requirement (Russian):**
> "Как можно к Вам обращаться?"

**PDF Source:** Page 1, Opening block, line 2

**Category:** GR | **Applicability:** All calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
FIRST or SECOND agent utterance SHOULD contain:
  - Address question: "как" + ("обращаться" OR "к вам" OR "вас зовут" OR "ваше имя")
```

**Regex Pattern:**
```regex
(?i)как\s+(можно\s+)?(к\s+вам\s+)?обращаться|как\s+вас\s+зов[уё]т|ваше\s+имя
```

**Pass Examples:**
- "Как можно к Вам обращаться?"
- "Как к Вам обращаться?"
- "Как Вас зовут?"

**Fail Examples:**
- Skipping directly to "Чем могу помочь?" without asking name
- Customer volunteers name before operator asks (not a fail, but note)

**Confidence:** MEDIUM (0.85) — customer may volunteer name first

**Special Case:** If customer provides name in first utterance before operator asks, mark as PASS_IMPLICIT

---

### GR04: City Capture

**Requirement (Russian):**
> "Из какого города Вы звоните? (записать) ***"

**PDF Source:** Page 1, Opening block, line 3 — marked with *** (CRITICAL)

**Category:** GR | **Applicability:** All calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent MUST ask about city within first 5 exchanges:
  - City question: "город" OR "откуда" + "звоните"
  - OR: Agent states city name with confirmation ("Пермь?", "Челябинск, верно?")
```

**Regex Pattern:**
```regex
(?i)(как[ой|ого]?\s+)?город|из\s+какого\s+город|откуда\s+(вы\s+)?звоните|ваш\s+город
```

**Pass Examples:**
- "Из какого города Вы звоните?"
- "Какой у Вас город?"
- "Пермь, верно?" (agent confirms known city)

**Fail Examples:**
- Proceeding to product search without establishing city
- City never mentioned in call

**Confidence:** HIGH (0.90)

**Note:** City is critical for inventory lookup — script marks this with ***

---

## NI: NEEDS IDENTIFICATION CHECKPOINTS

### NI01: Product Type Clarification (Tires vs Wheels)

**Requirement (Russian):**
> "Шины или диски Вас интересуют?"

**PDF Source:** Page 1, Implicit in branching structure

**Category:** NI | **Applicability:** Ambiguous product requests only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer request is ambiguous, agent SHOULD clarify:
  - Product type: "шин" OR "диск" OR "колёс" + question marker
```

**Regex Pattern:**
```regex
(?i)(шин[ыа]?|дисках?|колёс)\s*(вас\s+)?интересу[ею]т|что\s+(именно\s+)?ищете
```

**Pass Examples:**
- "Шины или диски Вас интересуют?"
- "Вас интересуют литые или штампованные?"

**Fail Examples:**
- Customer clearly states "нужны шины" and operator asks again (unnecessary)

**Confidence:** MEDIUM (0.80) — depends on customer clarity

**Applicability:** Only check if customer's first request is ambiguous

---

### NI02: Wheel Type Clarification (Cast vs Stamped)

**Requirement (Russian):**
> "Литые, штампованные Вас интересуют?"

**PDF Source:** Page 15, Wheel ordering section

**Category:** NI | **Applicability:** Wheel calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF call involves wheels (диски), agent SHOULD ask:
  - Wheel type: "литые" OR "штампованные" OR "литьё" OR "штамповка"
```

**Regex Pattern:**
```regex
(?i)(лит[ыоь][еёх]?|штампов[ао]нн[ыоь][еёх]?)\s*(или|,)\s*(лит[ыоь][еёх]?|штампов[ао]нн[ыоь][еёх]?)
```

**Pass Examples:**
- "Литые или штампованные Вас интересуют?"
- "Штампованные или литьё?"

**Fail Examples:**
- Assuming wheel type without asking

**Confidence:** HIGH (0.90)

**Applicability:** Only for wheel-related calls

---

### NI03: Vehicle Information Request (Enhanced)

**Requirement (Russian):**
> "Уточните, пожалуйста, марку и модель Вашего автомобиля?"
> "Уточните, какой год выпуска автомобиля?"
> "Подскажите, пожалуйста, какой объем двигателя у Вашего автомобиля?"

**PDF Source:** Page 12-13, "Никакие шины не найдены" and "Не знает размеры" sections

**Category:** NI | **Applicability:** Tire/wheel by vehicle OR customer doesn't know sizes

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD collect (any order):
  - Make/Model: "марк" OR "модель" OR name of car brand
  - Year: "год" + ("выпуск" OR number 20XX/19XX)
  - Engine: "двигатель" OR "объём" OR "мотор" (OPTIONAL per script)
```

**Regex Patterns:**
```regex
# Make/Model
(?i)как[ая|ой]?\s+(марка|модель)|марк[аи]\s+(и\s+)?модел|на\s+как[ой|ую]\s+(машин|авто)|уточните.*марк

# Year  
(?i)год[а]?\s+(выпуск|производств)|как[ого|ой]?\s+год[а]?|(19|20)\d{2}\s*(год|г\.?)

# Engine (optional)
(?i)(объ[её]м|размер)\s*(двигател|мотор)|двигатель\s+как[ой]?|литраж
```

**Pass Examples:**
- "Уточните, пожалуйста, марку и модель Вашего автомобиля?"
- "Renault Sandero 2016 года, верно?"
- "Год выпуска какой?"
- "Подскажите объем двигателя Вашего автомобиля?"

**Fail Examples:**
- Searching without confirming vehicle (high risk of wrong fitment)

**Confidence:** HIGH (0.90)

**Scoring:** Check for at least 2 of 3 elements (make/model + year minimum)

---

### NI04: Tire Size Request

**Requirement (Russian):**
> "Подскажите, пожалуйста, размеры шин?"

**PDF Source:** Page 1-2, "Знает размеры" section

**Category:** NI | **Applicability:** Tire calls where customer knows sizes

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF tire call AND customer knows sizes:
  - Size request: "размер" OR specific dimensions (e.g., "205/55")
  - Pattern: 3-digit/2-digit format OR R+2-digit
```

**Regex Pattern:**
```regex
(?i)размер[ы]?\s*(шин|колёс)?|\d{3}[/\\]\d{2}|R\s*\d{2}|радиус\s*\d{2}
```

**Pass Examples:**
- "Подскажите, пожалуйста, размеры шин?"
- "У Вас 205/55 R16?"
- "Какой радиус нужен?"

**Confidence:** HIGH (0.90)

---

### NI05: Seasonality Clarification

**Requirement (Russian):**
> "Вас интересуют зимние или летние шины?"

**PDF Source:** Page 2, Step 4: "Спросить сезонность"

**Category:** NI | **Applicability:** Tire calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF tire call, agent MUST ask:
  - Season: "зимн" OR "летн" OR "всесезон"
```

**Regex Pattern:**
```regex
(?i)(зимн[иеяю][еёх]?|летн[иеяю][еёх]?)\s*(или|,)\s*(зимн|летн)|сезон|интересуют.*зимн|интересуют.*летн
```

**Pass Examples:**
- "Зимние или летние шины?"
- "Вас интересуют зимние или летние?"
- "Какой сезон нужен?"

**Fail Examples:**
- Proceeding to search without asking seasonality

**Confidence:** HIGH (0.95)

**Applicability:** Tire calls only

---

### NI06: Winter Stud Type Clarification

**Requirement (Russian):**
> "Интересуют шипованные или нешипованные (липучка)?"

**PDF Source:** Page 2, under "Для зимних:"

**Category:** NI | **Applicability:** Winter tire calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF winter tires selected, agent MUST ask:
  - Stud type: "шипован" OR "липучк" OR "нешипован" OR "фрикцион"
```

**Regex Pattern:**
```regex
(?i)(шипован|липучк|нешипован|фрикцион|шип[ыа]?)
```

**Pass Examples:**
- "Шипованные или нешипованные (липучка)?"
- "Интересуют шипованные или липучка?"
- "С шипами или без?"

**Fail Examples:**
- Selecting winter tires without asking about studs

**Confidence:** HIGH (0.95)

**Applicability:** Winter tire calls only; only check if winter season was selected

---

### NI07: Quantity Request

**Requirement (Russian):**
> "Подскажите, пожалуйста, какое количество Вам нужно?"

**PDF Source:** Page 2, Step 5: "Уточнить количество"

**Category:** NI | **Applicability:** All product calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD ask about quantity:
  - Quantity words: "количество" OR "сколько" OR "штук" OR "комплект"
```

**Regex Pattern:**
```regex
(?i)как[ое]{2}\s+количество|сколько\s+(штук|шин|дисков|нужно)|количество.*нужно
```

**Pass Examples:**
- "Подскажите, пожалуйста, какое количество Вам нужно?"
- "Сколько штук нужно?"
- "Количество какое?"

**Confidence:** HIGH (0.90)

---

### NI08: Brand Preference Request

**Requirement (Russian):**
> "Вас интересует конкретный бренд/производитель?"

**PDF Source:** Page 2, after quantity step

**Category:** NI | **Applicability:** Tire/wheel calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD ask about brand preference:
  - Brand words: "бренд" OR "производитель" OR "марка" (in product context)
```

**Regex Pattern:**
```regex
(?i)(бренд|производител|конкретн[ыа][йя]\s+(бренд|марк))|интересует.*производител
```

**Pass Examples:**
- "Вас интересует конкретный бренд/производитель?"
- "Какой производитель предпочтительнее?"
- "Есть предпочтения по бренду?"

**Confidence:** MEDIUM (0.85)

---

### NI09: Truck Tire Type Clarification

**Requirement (Russian):**
> "Рулевые - управляющие - буква F или S, Ведущие - буква D, Для прицепов или полуприцепов - буква Т, Универсальные - буква U"

**PDF Source:** Page 2, "Клиент просит рулевые, управляющие, ведущие, универсальные шины"

**Category:** NI | **Applicability:** Truck/commercial tire calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF truck tires mentioned, agent may clarify:
  - Tire position: "рулев" OR "ведущ" OR "универсальн" OR "прицеп"
```

**Regex Pattern:**
```regex
(?i)(рулев[ыие]|ведущ[ие]|универсальн[ыие]|прицеп|полуприцеп|управля[юе]щ)
```

**Pass Examples:**
- "Вам нужны рулевые или ведущие?"
- "Для прицепа или на тягач?"

**Confidence:** MEDIUM (0.80)

**Applicability:** Truck/commercial tire calls only

---

### NI10: Search Method Branch Detection

**Requirement (Russian):**
> "Нажать 'Подбор шин' и выставить 'По параметрам'" (если клиент знает размеры)  
> "Нажать 'Подбор шин' и выставить 'По автомобилю'" (если клиент не знает размеры)

**PDF Source:** Page 1-2, "Знает размеры" / "Не знает размеры" branches

**Category:** NI | **Applicability:** Tire/wheel calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD align search path with customer's knowledge:
  - Branch A (knows sizes): asks for size parameters (размер, 205/55 R16, радиус)
  - Branch B (doesn't know sizes): asks for make/model/year to search by car
PASS if either branch is explicitly followed; FAIL if neither path is established.
```

**Regex Patterns:**
```regex
# Branch A — by size
(?i)размер[ы]?\s*(шин|кол[её]с)?|\d{3}[/\\]\d{2}\s*R?\s*\d{2}|R\s*\d{2}|радиус\s*\d{2}

# Branch B — by car
(?i)(марк|модель|год\s+выпуск|на\s+каком\s+(авто|машин)|по\s+автомобилю)
```

**Pass Examples:**
- "Если знаете размер, подскажите его — например 205/55 R16"
- "Не знаете размер? Тогда подскажите марку, модель и год выпуска автомобиля"

**Confidence:** MEDIUM (0.85)

---

### NI11: RunFlat Compatibility Warning

**Requirement (Russian):**
> "Шины RunFlat можно использовать только в комплекте, сочетать с простыми шинами нельзя"

**PDF Source:** RunFlat warning note (tire selection guidance)

**Category:** NI | **Applicability:** When customer mentions RunFlat

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer mentions RunFlat:
  Agent MUST warn:
    - RunFlat ставится только комплектом
    - Нельзя сочетать с обычными шинами
```

**Trigger Regex (customer):**
```regex
(?i)(run\s*flat|ран[\s-]?флет|рун\s*фл[еэ]т|рунфлат)
```

**Agent Response Regex:**
```regex
(?i)(run\s*flat|ран[\s-]?флет|рунфлат).*только\s+в\s+комплекте|только\s+в\s+комплекте|нельзя\s+сочетать|не\s+совмещать
```

**Pass Examples:**
- "RunFlat ставится только комплектом, с обычными шинами смешивать нельзя"
- "Эти RunFlat нужно ставить все четыре, нельзя сочетать с простыми"

**Confidence:** MEDIUM (0.80)

---

### NI12: All-Season Tires Warning

**Requirement (Russian):**
> "Все всесезонные шины на сайте помещены в лето, они подходят только для легкой зимы - не ниже '-5' градусов"

**PDF Source:** All-season guidance note (tire selection)

**Category:** NI | **Applicability:** When customer asks for всесезонные/all-season tires

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF all-season tires discussed:
  Agent SHOULD warn:
    - They are listed as summer
    - They are only for mild winters, not below -5°C
```

**Trigger/Response Regex:**
```regex
(?i)(всесезон|all[-\\s]?season).*(не\s+ниже|легк[ао][йе]\s+зим|минус\s*5)|всесезон.*лето
```

**Pass Examples:**
- "Всесезонные у нас идут как лето, они только для легкой зимы до минус 5"
- "Это всесезонка, но ниже -5 не рекомендуем"

**Confidence:** MEDIUM (0.80)

---

## PP: PRODUCT PRESENTATION CHECKPOINTS

### PP01: Three Options Offered

**Requirement (Russian):**
> "Предоставить 3 варианта: цену, сроки, оплату, бонусы (если есть)"

**PDF Source:** Page 1, ПАМЯТКА item 3; Page 3 example

**Category:** PP | **Applicability:** All product calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD present at least 3 distinct products:
  - Count unique product mentions with prices
  - Products identified by: brand name + price OR article number
```

**Detection Method:**
```
1. Find all agent utterances with price patterns (X руб, X₽, X рублей)
2. Extract associated product names/brands
3. Count unique products (deduplicate by name similarity)
4. PASS if count >= 3
```

**Price Regex:**
```regex
(?i)(\d[\d\s]*)\s*(руб|₽|рублей|р\.)
```

**Pass Examples (from PDF Page 3):**
- "Yokohama BluEarth.. цена 2330 рублей, доставка либо самовывоз доступны на завтра"
- "Continental ContiEcoContact 5, цена 2910 рублей..."
- "BF Goodrich…, цена 3440 рублей..."

**Fail Examples:**
- Only one option presented
- Prices mentioned without product differentiation

**Confidence:** MEDIUM (0.85) — requires semantic grouping

**Scoring:** 
- 3+ options = PASS
- 2 options = PARTIAL (note in coaching)
- 1 option = FAIL

---

### PP02: Advantages Highlighted (Enhanced with Vocabulary)

**Requirement (Russian):**
> "Используем при консультации блок 'Преимущества' и выделяем среднюю шину"
> "Могу выделить Continental... так как по отзывам... отличная управляемость... тихая... износостойкая"

**PDF Source:** Page 3 example, Pages 5 (full vocabulary lists)

**Category:** PP | **Applicability:** Product calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD use advantage vocabulary AND recommend one option:
  - Recommendation phrase: "рекомендую", "советую", "выделил бы", "могу выделить"
  - At least 2-3 advantage words from the vocabulary list
```

**SUMMER TIRE ADVANTAGES (PDF Page 5):**
```
1. Отличная управляемость на сухом асфальте
2. Отличная управляемость на мокрых дорогах
3. Эффективно предотвращает аквапланирование
4. Достаточно тихая шина
5. Тихая и комфортная шина
6. Самое маленькое потребление топлива у этой шины
7. Очень безопасная шина - отличное сцепление на любом покрытии
8. Износостойкая шина
9. Хорошо сбалансированные ездовые характеристики
10. Короткий тормозной путь на любом покрытии
11. Повышенная прочность боковины шины
12. Сниженная вибрация, повышенный уровень комфорта при вождении
13. Надежная и долговечная шина
```

**WINTER TIRE ADVANTAGES (PDF Page 5):**
```
1. Отличная управляемость на сухом и мокром асфальте
2. Превосходное сцепление на льду
3. Отличное сцепление шин на снегу
4. Достаточно тихая шина
5. Тихая и комфортная шина
6. Самое маленькое потребление топлива у этой шины
7. Очень безопасная шина - отличное сцепление на любом покрытии
8. Износостойкая шина
9. Хорошо сбалансированные зимние характеристики
10. Короткий тормозной путь на любом покрытии
11. Повышенная прочность боковины шины
12. Улучшенная фиксация шипов
13. Надежная и долговечная шина
```

**Advantage Keywords Regex:**
```regex
(?i)(управляем|аквапланиров|тих[аяое]|комфорт|износостойк|сцеплен|безопасн|тормозн|прочност|надёжн|долговечн|сбалансирован|фиксаци[яе]\s+шипов|на\s+льду|на\s+снегу)
```

**Recommendation Regex:**
```regex
(?i)(рекоменду[юе]|совету[юе]|выделил?\s*бы|могу\s+выделить|лучш[еий]|предпочт)
```

**Pass Examples:**
- "Могу выделить Continental – по отзывам отличная управляемость"
- "Эти шины износостойкие и тихие"
- "Рекомендую эту модель — отличное сцепление на льду"

**Fail Examples:**
- Only stating prices without any quality commentary
- No recommendation given

**Confidence:** MEDIUM (0.80)

**Scoring:**
- Recommendation + 2+ advantages = PASS
- Recommendation OR 2+ advantages = PARTIAL
- Neither = FAIL

---

### PP03: Price Announced Clearly

**Requirement (Russian):**
> "Стоимость X рублей"

**PDF Source:** Page 3, Product presentation examples

**Category:** PP | **Applicability:** All product calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Each product option SHOULD have explicit price:
  - Pattern: "стоимость" OR "цена" OR "по цене" + number + "руб"
  - OR: number + "руб" in product context
```

**Regex Pattern:**
```regex
(?i)(стоимость[ью]?|цен[аы]|по\s+цене)\s*:?\s*(\d[\d\s]*)\s*(руб|₽)
```

**Pass Examples:**
- "Стоимость 2990 рублей"
- "По цене 5470 рублей за штуку"
- "Они будут 3300, но здесь 100% предоплата"

**Confidence:** HIGH (0.95)

---

### PP04: Delivery/Pickup Terms Stated

**Requirement (Russian):**
> "Отгрузка со склада будет (озвучить дату с сайта)"
> "Для других городов к этому сроку добавится еще 2-3 дня"

**PDF Source:** Page 2-3, Product presentation

**Category:** PP | **Applicability:** All product calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD mention delivery timing:
  - Delivery words: "доставк", "отгрузк", "привез", "приед", "будут", "самовывоз"
  - Time reference: "завтра", "послезавтра", date, "дней", "числа"
```

**Regex Pattern:**
```regex
(?i)(доставк|отгрузк|привез|приед|самовывоз|получ[ие]ть).{0,30}(завтра|послезавтра|\d+\s*(дн|числ)|сегодня)
```

**Pass Examples:**
- "Доставка завтра"
- "Отгрузка со склада будет 6-го числа"
- "Привезут послезавтра с Челябинска"
- "доставка либо самовывоз доступны на завтра"

**Fail Examples:**
- No mention of when customer can receive goods

**Confidence:** HIGH (0.90)

---

### PP05: Upsell Offer (Security Bolts/Sensors)

**Requirement (Russian):**
> "Также хочу предложить комплект секретных болтов. Стоимость 1690 рублей на комплект колес"
> "К Вашим новым дискам могу предложить комплект датчиков давления в шинах"

**PDF Source:** Page 3, 17-18 (order process sections)

**Category:** PP | **Applicability:** ORDER calls (tires/wheels)

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
During order, agent SHOULD offer additional products:
  - Upsell items: "секрет" (секретки/секретные болты) OR "датчик" (датчики давления) OR "крепёж" OR "болт"
  - Offer phrase: "предложить" OR "могу также" OR "хочу предложить"
If offering секретки/крепёж, agent SHOULD briefly explain:
  - Non-standard head prevents wheel theft; special adapter included (Savecar wording acceptable)
```

**Offer Regex:**
```regex
(?i)(секрет[ноыкие]{0,5}\s*(болт|креп)|датчик[иов]{0,2}\s*давлен|крепёж|крепеж).*(предлож|могу\s+также)|(предлож|хочу).*(секрет|датчик|крепёж)
```

**Explanation Regex (security bolts):**
```regex
(?i)(нестандартн[ао][йя]\s+форм|защит.*снятия\s+кол[её]с|специальн[ыоа][йего]\s+переходник|savecar)
```

**Pass Examples:**
- "Также хочу предложить комплект секретных болтов"
- "К Вашим новым дискам могу предложить комплект датчиков давления"
- "Хотите добавить секретки к заказу?"

**Fail Examples:**
- Order completed without any upsell offer

**Confidence:** MEDIUM (0.85)

**Applicability:** ORDER calls only; wheels calls especially for датчики

**Pricing Reference:**
- Секретки (обычные): 1690 руб/комплект
- Секретки (Mercedes M15): 4590 руб/комплект
- Крепежные болты: 100 руб/шт (обычные), 280 руб/шт (Mercedes)
- Датчики давления: 3190 руб/датчик + 1200 руб установка

---

## OH: OBJECTION HANDLING CHECKPOINTS

### OH01: Price Objection - Alternative Offered

**Requirement (Russian):**
> "При необходимости предложить аналоги"
> "У нас есть шины с такими же характеристиками, можем оформить заказ или пока отложить товар по этой цене"

**PDF Source:** Page 1 ПАМЯТКА item 5, Page 6

**Category:** OH | **Applicability:** When customer expresses price concern

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF (customer says one of: "дорого", "дорогой", "высокая цена"):
  AND next agent utterance contains one of: "могу предложить аналог", "есть вариант подешевле", "альтернатива"
  THEN PASS
ELSE FAIL
```

**Customer Price Objection Regex:**
```regex
(?i)(дорог[ой]|цена\s+высок|дороговат|слишком.*дорог)
```

**Agent Alternative Response Regex:**
```regex
(?i)(могу\s+предложить\s+(аналог|альтернатив|вариант)|есть\s+вариант|ещё\s+есть|аналог[аи]?|подешевле|дешевле)
```

**Pass Examples:**
- Customer: "Дороговато..." Agent: "Могу предложить аналоги подешевле"
- Customer: "Высокая цена" Agent: "Есть вариант с похожими характеристиками дешевле"

**Fail Examples:**
- Customer: "Это дорого" Agent: "Хорошо, можем оформить заказ?" (no alternative)

**Confidence:** MEDIUM (0.85)

**Notes:**
- Only applicable if customer expresses price concern
- If customer declines alternative, still count as PASS (offer was made)

---

### OH02: Hesitation - Reservation Offered

**Requirement (Russian):**
> "При отказе предложить бронь"
> "Могу поставить в резерв на пару дней, пока Вы принимаете решение"

**PDF Source:** Page 1 ПАМЯТКА item 8, Page 6

**Category:** OH | **Applicability:** INQUIRY calls or hesitation

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer expresses hesitation ("подумаю", "не уверен", "посмотрю ещё"):
  Agent SHOULD offer: reservation/callback
  Reservation words: "бронь", "резерв", "отложить", "придержать"
```

**Customer Hesitation Regex:**
```regex
(?i)(подумаю|не\s+уверен|посмотр[юе]|пока\s+не|перезвон[юи]|надо\s+подумать)
```

**Agent Reservation Response Regex:**
```regex
(?i)(бронь|резерв|брони[руе]|перезвон[июе]|оставь?те?\s+номер|отлож[иу]|придерж|поставить.*резерв|отложить.*товар)
```

**Pass Examples:**
- Customer: "Я подумаю" Agent: "Могу поставить в резерв на пару дней"
- Customer: "Не уверен" Agent: "Давайте забронируем, пока решаете"
- "Давайте я запишу Ваш номер, перезвоним"

**Fail Examples:**
- Customer hesitates, agent just says "Хорошо, до свидания"

**Confidence:** MEDIUM (0.85)

**Applicability:** Only for INQUIRY calls or when hesitation expressed

---

### OH03: Found Cheaper Elsewhere

**Requirement (Russian):**
> "Я нашел дешевле"
> "Уточните, где Вы нашли шины, на сколько дешевле и какие сроки поставки?"
> "Если Вы действительно нашли дешевле, давайте я передам эту информацию менеджеру, возможно, он сможет предоставить какой-то бонус"

**PDF Source:** Page 33, "Я нашел дешевле" section

**Category:** OH | **Applicability:** When customer mentions finding cheaper price

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer says: "нашел дешевле" OR "нашёл дешевле" OR "дешевле у конкурентов":
  Agent SHOULD:
    1. Ask where and how much cheaper
    2. Offer to pass info to manager for potential bonus
```

**Customer Trigger Regex:**
```regex
(?i)(нашёл|нашел)\s+дешевле|дешевле\s+(в|у)|у\s+конкурент[ов].*дешевле
```

**Agent Response Regex:**
```regex
(?i)(где\s+(вы\s+)?нашли|на\s+сколько\s+дешевле|передам.*менеджер|бонус|скид[ку])
```

**Pass Examples:**
- Customer: "Я нашел дешевле" Agent: "Уточните, где нашли и на сколько дешевле?"
- Agent: "Передам информацию менеджеру, возможно, он сможет предоставить бонус"

**Fail Examples:**
- Customer says found cheaper, agent just cancels order without inquiry

**Confidence:** MEDIUM (0.80)

---

### OH04: Already Bought Elsewhere

**Requirement (Russian):**
> "Я уже купил"
> "Подскажите, где и за сколько Вы приобрели шины? Что Вас не устроило в нашем магазине?"

**PDF Source:** Page 33, "Я уже купил" section

**Category:** OH | **Applicability:** When customer says already purchased

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer says: "уже купил" OR "уже приобрёл":
  Agent SHOULD:
    1. Ask where and for how much
    2. Ask what didn't satisfy them
```

**Customer Trigger Regex:**
```regex
(?i)(уже\s+купил|уже\s+приобрёл|уже\s+взял|купил\s+в\s+друг)
```

**Agent Response Regex:**
```regex
(?i)(где.*приобрели|за\s+сколько|что.*не\s+устроило|почему\s+у\s+нас\s+не)
```

**Pass Examples:**
- Customer: "Я уже купил" Agent: "Подскажите, где и за сколько приобрели?"
- Agent: "Что Вас не устроило в нашем магазине?"

**Confidence:** MEDIUM (0.80)

---

### OH05: Credit Denied

**Requirement (Russian):**
> "Мне не одобрили кредит"
> "Если шины актуальны, я отправлю запрос менеджеру, он подскажет, что можно сделать"

**PDF Source:** Page 33, "Мне не одобрили кредит" section

**Category:** OH | **Applicability:** When customer's credit was denied

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer says: "не одобрили кредит" OR "отказали в кредите":
  Agent SHOULD:
    1. Ask if product is still relevant
    2. Offer to escalate to manager
```

**Customer Trigger Regex:**
```regex
(?i)(не\s+одобрили\s+кредит|отказали.*кредит|кредит.*не\s+одобри)
```

**Agent Response Regex:**
```regex
(?i)(шины\s+актуальн|товар\s+актуален|отправлю\s+запрос\s+менеджер|менеджер\s+подскажет)
```

**Pass Examples:**
- Customer: "Мне не одобрили кредит" Agent: "Если шины актуальны, отправлю запрос менеджеру"

**Confidence:** MEDIUM (0.80)

---

### OH06: Changed Mind

**Requirement (Russian):**
> "Я передумал брать"
> "Уточните, пожалуйста, причину?"
> "Предлагаю Вам отложить заказ"

**PDF Source:** Page 33, "Я передумал брать" section

**Category:** OH | **Applicability:** When customer changes mind

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer says: "передумал" OR "не буду брать":
  Agent SHOULD:
    1. Ask for reason
    2. Offer to postpone/reschedule
```

**Customer Trigger Regex:**
```regex
(?i)(передумал|не\s+буду\s+брать|отказываюсь|отмен[ия]|не\s+нужн[оы])
```

**Agent Response Regex:**
```regex
(?i)(причин[ау]|почему|отложить\s+заказ|перенести|позже.*перезвон)
```

**Pass Examples:**
- Customer: "Я передумал" Agent: "Уточните причину? Предлагаю отложить заказ"

**Fail Examples:**
- Customer: "Передумал" Agent: "Хорошо, отменяю" (no inquiry or alternative)

**Confidence:** MEDIUM (0.80)

---

### OH07: Wrong Size

**Requirement (Russian):**
> "Не подошел типоразмер"
> "Какой типоразмер нужен? Скажите марку и модель автомобиля?"

**PDF Source:** Page 33, "Не подошел типоразмер" section

**Category:** OH | **Applicability:** When ordered size doesn't fit

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer says: "не подошёл размер" OR "неправильный размер":
  Agent SHOULD:
    1. Ask for correct size
    2. Verify against customer's vehicle
    3. Offer to create new order
```

**Customer Trigger Regex:**
```regex
(?i)(не\s+подош[ёе]л|неправильн[ыйая]\s+размер|не\s+тот\s+размер|другой\s+размер)
```

**Agent Response Regex:**
```regex
(?i)(какой\s+(типо)?размер|марк[ау]\s+и\s+модель|подобр[аеу]ть.*друг|новый\s+заказ|перезаказ)
```

**Pass Examples:**
- Customer: "Не подошёл размер" Agent: "Какой типоразмер нужен? Скажите марку и модель?"

**Confidence:** MEDIUM (0.80)

---

### OH08: Production Date/Country Concern

**Requirement (Russian):**
> "Меня не устроила дата производства или страна"
> "Я сейчас отправлю запрос менеджеру, и он свяжется с Вами и подскажет, что можно сделать"
> "Также могу посмотреть другие шины?"

**PDF Source:** Page 33, "Меня не устроила дата производства или страна" section

**Category:** OH | **Applicability:** When customer concerned about production date/country

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF customer mentions: "дата производства" OR "страна производства" OR "год выпуска шин":
  Agent SHOULD:
    1. Offer to escalate to manager
    2. Offer to look at alternatives
```

**Customer Trigger Regex:**
```regex
(?i)(дата\s+производ|страна\s+производ|год\s+выпуска\s+шин|не\s+устро[ие]л[ао]?\s+(дат|стран))
```

**Agent Response Regex:**
```regex
(?i)(запрос\s+менеджер|менеджер.*свяжется|посмотреть\s+друг[ие]|другие\s+шины)
```

**Pass Examples:**
- Customer: "Не устроила дата производства" Agent: "Отправлю запрос менеджеру. Также могу посмотреть другие шины?"

**Confidence:** MEDIUM (0.80)

---

## OR: ORDER PROCESS CHECKPOINTS

### OR01: Order Number Announced

**Requirement (Russian):**
> "Ваш заказ оформлен, номер Вашего заказа (озвучить номер заказа)"

**PDF Source:** Page 4, Order confirmation step

**Category:** OR | **Applicability:** ORDER calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
IF order placed, agent MUST announce:
  - Order confirmation: "заказ" + "оформлен" OR "номер заказа"
  - Order number: 5-7 digit number pattern
```

**Regex Pattern:**
```regex
(?i)(заказ\s*(оформлен|принят|создан)|номер\s+заказа)\s*:?\s*(\d{5,7})
```

**Pass Examples:**
- "Ваш заказ оформлен, номер Вашего заказа 968076"
- "Заказ принят. Номер 96-39-18"

**Fail Examples:**
- Order placed but no number announced

**Confidence:** HIGH (0.95)

**Applicability:** Only for ORDER/RESERVATION call types

---

### OR02: Order Summary Provided

**Requirement (Russian):**
> "В заказе у Вас (озвучить товар) в количестве (озвучить кол-во товара) общая сумма (озвучить сумму)"

**PDF Source:** Page 4, Order confirmation

**Category:** OR | **Applicability:** ORDER calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD summarize:
  - Product: товар/шины/диски named
  - Quantity: количество/штук/комплект + number
  - Total: сумма/итого + price
```

**Regex Pattern:**
```regex
(?i)(в\s+заказе|заказ|итого|сумм[аы]).{0,50}(\d[\d\s]*)\s*(руб|₽)
```

**Pass Examples:**
- "В заказе у Вас шины в количестве 4 штуки на сумму 22280 рублей"
- "Итого получается 34240 рублей"

**Confidence:** HIGH (0.90)

---

### OR03: Delivery Method Confirmed

**Requirement (Russian):**
> "Доставка/самовывоз будет на (озвучить адрес), Ваш контактный номер телефона (озвучить номер клиента)"

**PDF Source:** Page 4, Order confirmation

**Category:** OR | **Applicability:** ORDER calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD confirm:
  - Method: "доставка" OR "самовывоз" OR "ТК" (transport company)
  - Location: address OR city OR pickup point
```

**Regex Pattern:**
```regex
(?i)(доставк|самовывоз|транспортн[ао][йя]?\s+компани|ТК\s+\w+).{0,30}(по\s+адресу|на\s+\w+|в\s+\w+|будет)
```

**Pass Examples:**
- "Самовывоз будет на Рылеева 16"
- "Доставка транспортной компанией КИТ в Красноуфимск"

**Confidence:** HIGH (0.90)

**Applicability:** ORDER calls only

---

### OR04: SMS Notification Mentioned

**Requirement (Russian):**
> "Вам придёт СМС с номером заказа"

**PDF Source:** Page 4, Order confirmation closing

**Category:** OR | **Applicability:** ORDER calls only

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD mention:
  - SMS: "смс" OR "sms" OR "сообщение"
  - Context: notification about order
```

**Regex Pattern:**
```regex
(?i)(смс|sms|сообщени[ея]).{0,20}(придёт|получите|отправ)
```

**Pass Examples:**
- "Вам придёт СМС с номером заказа"
- "Получите СМС-уведомление"

**Confidence:** HIGH (0.95)

**Applicability:** ORDER calls only

---

### OR05: Call Time Preference Asked

**Requirement (Russian):**
> "В какой половине дня Вам удобнее принять звонок? (прописать в комментарии)"

**PDF Source:** Page 4, Order confirmation

**Category:** OR | **Applicability:** ORDER calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Agent SHOULD ask about callback time preference:
  - Time preference: "половине дня" OR "удобнее" + "звонок/перезвонить"
```

**Regex Pattern:**
```regex
(?i)(половин[еау]\s+дня|удобн[ео]е.*звон|когда.*перезвон|время.*звон)
```

**Pass Examples:**
- "В какой половине дня Вам удобнее принять звонок?"
- "Когда удобнее перезвонить?"

**Confidence:** MEDIUM (0.85)

**Applicability:** ORDER calls only

---

## CL: CLOSING CHECKPOINTS

### CL01: Additional Help Offered

**Requirement (Russian):**
> "Чем-то ещё могу Вам помочь?"

**PDF Source:** Page 39, End of dialogue section

**Category:** CL | **Applicability:** All calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Before final goodbye, agent SHOULD ask:
  - Help offer: "ещё" + "помочь" OR "вопрос" OR "что-то ещё"
```

**Regex Pattern:**
```regex
(?i)(чем[–\-]?то\s+)?ещё.{0,10}(помочь|вопрос)|что[–\-]?то\s+ещё|могу\s+ещё
```

**Pass Examples:**
- "Чем-то ещё могу Вам помочь?"
- "Есть ещё вопросы?"
- "Могу ещё чем-то помочь?"

**Fail Examples:**
- Ending call without offering additional assistance

**Confidence:** HIGH (0.90)

---

### CL02: Gratitude Expression

**Requirement (Russian):**
> "Спасибо за звонок!"

**PDF Source:** Page 39, End of dialogue

**Category:** CL | **Applicability:** All calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Final agent utterances SHOULD contain:
  - Thanks: "спасибо" + ("звонок" OR "обращение" OR general)
```

**Regex Pattern:**
```regex
(?i)спасибо\s*(за\s+)?(звонок|обращени|вам|вас)|благодар[июя]м?\s*(за)?
```

**Pass Examples:**
- "Спасибо за звонок!"
- "Спасибо Вам!"
- "Благодарим за обращение"

**Confidence:** HIGH (0.95)

---

### CL03: Farewell Phrase

**Requirement (Russian):**
> "Всего доброго! До свидания!"

**PDF Source:** Page 39, End of dialogue

**Category:** CL | **Applicability:** All calls

**Checkable From:** Transcript only ✅

**Detection Logic:**
```
Final agent utterance MUST contain farewell:
  - Farewell: "до свидания" OR "всего доброго" OR "хорошего дня" OR "до встречи"
```

**Regex Pattern:**
```regex
(?i)(до\s+свидания|всего\s+доброго|хорошего\s+дня|до\s+встречи|удачи)
```

**Pass Examples:**
- "Всего доброго. До свидания!"
- "Хорошего дня! До свидания!"

**Fail Examples:**
- Call ends abruptly without farewell
- Only customer says goodbye

**Confidence:** HIGH (0.95)

---

## Summary: Checkpoint Weights and Applicability

| ID | Checkpoint | Weight | Applicability |
|----|-----------|--------|---------------|
| **GREETING** ||||
| GR01 | Company ID | REQUIRED | All calls |
| GR02 | Operator Name | REQUIRED | All calls |
| GR03 | Customer Name Request | RECOMMENDED | All calls |
| GR04 | City Capture | REQUIRED*** | All calls |
| **NEEDS IDENTIFICATION** ||||
| NI01 | Product Type | CONDITIONAL | Ambiguous requests |
| NI02 | Wheel Type | CONDITIONAL | Wheel calls |
| NI03 | Vehicle Info | REQUIRED | Product selection by car |
| NI04 | Tire Size | CONDITIONAL | Tire by params |
| NI05 | Seasonality | REQUIRED | Tire calls |
| NI06 | Winter Stud Type | REQUIRED | Winter tire calls |
| NI07 | Quantity | REQUIRED | All product calls |
| NI08 | Brand Preference | RECOMMENDED | Tire/wheel calls |
| NI09 | Truck Tire Type | CONDITIONAL | Truck tire calls |
| **PRODUCT PRESENTATION** ||||
| PP01 | Three Options | REQUIRED | Product calls |
| PP02 | Advantages Highlighted | REQUIRED | Product calls |
| PP03 | Price Clear | REQUIRED | Product calls |
| PP04 | Delivery Terms | REQUIRED | Product calls |
| PP05 | Upsell Offer | RECOMMENDED | ORDER calls |
| **OBJECTION HANDLING** ||||
| OH01 | Price → Alternative | CONDITIONAL | On price concern |
| OH02 | Hesitation → Reservation | CONDITIONAL | On hesitation |
| OH03 | Found Cheaper | CONDITIONAL | On competitor mention |
| OH04 | Already Bought | CONDITIONAL | On "already bought" |
| OH05 | Credit Denied | CONDITIONAL | On credit denial |
| OH06 | Changed Mind | CONDITIONAL | On "changed mind" |
| OH07 | Wrong Size | CONDITIONAL | On size issue |
| OH08 | Production Date/Country | CONDITIONAL | On date/country concern |
| **ORDER PROCESS** ||||
| OR01 | Order Number | REQUIRED | ORDER calls |
| OR02 | Order Summary | REQUIRED | ORDER calls |
| OR03 | Delivery Confirmed | REQUIRED | ORDER calls |
| OR04 | SMS Mentioned | RECOMMENDED | ORDER calls |
| OR05 | Call Time Preference | RECOMMENDED | ORDER calls |
| **CLOSING** ||||
| CL01 | Additional Help | RECOMMENDED | All calls |
| CL02 | Gratitude | REQUIRED | All calls |
| CL03 | Farewell | REQUIRED | All calls |

---

## Integration Notes

### Input Schema Expected

The C06_EXTENDED prompt will receive the same JSON as V1.4.1:
```json
{
  "call_metadata": { "call_id", "operator", "call_type", ... },
  "utterances": [ { "id", "speaker", "text", "start_ms", ... } ],
  "pre_calculated": { "searches", "greeting_delay_ms", ... }
}
```

### Output Schema Addition

C06_EXTENDED should append to the V1.4.1 output:
```json
{
  "script_compliance": {
    "checkpoints_evaluated": 25,
    "checkpoints_passed": 20,
    "checkpoints_failed": 3,
    "checkpoints_na": 2,
    "details": [
      {
        "id": "GR01",
        "name": "Company Identification",
        "status": "PASS",
        "evidence": "utterance #1: 'Здравствуйте, компания 74 колеса...'",
        "confidence": 0.95
      },
      ...
    ],
    "script_score": 0.80,
    "coaching_notes": ["GR03: Customer name not requested before proceeding"]
  }
}
```

### Relationship to V1.4.1 C06

V1.4.1 C06 checks GENERIC greeting/closing only:
- Company + Name + Farewell present

C06_EXTENDED provides DETAILED script compliance:
- All 34 checkpoints
- Conditional logic based on call_type
- Specific phrase matching

**Recommendation:** V1.4.1 C06 becomes a summary; C06_EXTENDED provides details.

---

## Validation Test Cases

### Test Case 1: call_05 (Anna, INQUIRY → ORDER)

Expected results:
- GR01: PASS ("компания 74 колеса" in utterance 1)
- GR02: PASS ("меня зовут Анна" in utterance 1)
- GR03: PASS ("как можно к вам обращаться" in utterance 1)
- GR04: PASS (Красноуфимск confirmed)
- NI02: PASS ("Литые, штампованные вас интересуют?")
- PP01: PASS (multiple products with prices)
- PP05: CHECK for upsell offer (секретки/датчики)
- OR01: PASS ("номер заказа 968076")
- CL02: PASS ("Спасибо за звонок")
- CL03: PASS ("Всего доброго. До свидания")

---

## ПАМЯТКА (Reminder) Cross-Reference

The PDF Page 1 contains a critical ПАМЯТКА with 9 required steps. Here's how each maps to checkpoints:

| ПАМЯТКА Item | Text | Checkpoint |
|--------------|------|------------|
| 1 | Уточнить, что интересует | NI01, NI02 |
| 2 | Уточнить параметры товара | NI03-NI09 |
| 3 | Выдать 3 варианта: цену, сроки, оплату, бонусы | PP01, PP03, PP04 |
| 4 | Выдать преимущества | PP02 |
| 5 | При необходимости предложить аналоги | OH01 |
| 6 | Отработать возражения | OH01-OH08 |
| 7 | Предложить сделать заказ | (Implicit in flow) |
| 8 | При отказе предложить бронь | OH02 |
| 9 | При согласии оформить заказ | OR01-OR05 |

---

## Special Product Scripts

### Gripmax Winter Tires (PDF Page 5)

When Gripmax available, operator should mention:
```
- Это самый качественный китайский бренд из тех, кто производит шины в больших типоразмерах
- Шины уже завоевали европейский и азиатский рынки, в Европе они достойно конкурируют с Kumho и Hankook
- Шипы у шипованных моделей финские, протектор аналогичен рисунку Мишлен
- У нешипованных многочисленные дренажные канавки значительно снижают риск аквапланирования
- Обе модели износостойкие, прослужат долго, обеспечивают уверенную курсовую устойчивость
- Эти модели по доступной цене однозначно выиграют у конкурентов
```

**Detection Regex:**
```regex
(?i)gripmax|грипмакс
```

### Contyre Transporter for Gazelle (PDF Page 15)

When customer needs tires for Gazelle, offer Contyre Transporter:
```
- Это отличный выбор для рабочей машины
- Шины для рабочей грузовой машины - всегда расходник
- Нет смысла переплачивать за шины популярных брендов
- Шина отлично держит нагрузки благодаря усиленному корду и крепкой боковине
```

---

## Non-Checkable Items (Excluded)

The following are NOT included because they cannot be verified from transcript alone:

| Item | Reason |
|------|--------|
| "Smile in voice" | Audio analysis required |
| Correct database info | CRM/Oktell access required |
| Order correctly filled | CRM verification required |
| Screenshots/UI actions | Operational, not verbal |
| Payment processing | Backend verification |
| Pricing accuracy | Requires current database |

---

## Changelog

- v1.0.0 (2025-12-11): Initial extraction from translated script
- v2.0.0 (2025-12-11): Complete rewrite from Russian PDF source
  - Added NI06 (Winter stud type)
  - Added NI07 (Quantity)
  - Added NI08 (Brand preference)
  - Added NI09 (Truck tire type)
  - Enhanced PP02 with full advantage vocabulary
  - Added PP05 (Upsell offer)
  - Added OH03-OH08 (6 new objection scenarios)
  - Added OR05 (Call time preference)
  - Fixed all regex patterns for Cyrillic
  - Total checkpoints: 34 (was 22)
