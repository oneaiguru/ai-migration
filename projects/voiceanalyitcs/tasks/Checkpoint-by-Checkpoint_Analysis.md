## Checkpoint-by-Checkpoint Analysis

### GR (GREETING) - 4 checkpoints

| ID   | Checkpoint                    | Preprocessor Signal     | Issue                                           |
| ---- | ----------------------------- | ----------------------- | ----------------------------------------------- |
| GR01 | Company "74 колеса"           | `greeting.company_said` | ⚠️ Doesn't verify it's in FIRST utterance        |
| GR02 | "меня зовут [Name]"           | `greeting.name_said`    | ❌ Patterns include "это", "с вами" - too broad! |
| GR03 | "Как можно к вам обращаться?" | **NONE**                | ❌ No signal exists                              |
| GR04 | City within first 5 exchanges | `city.asked_city`       | ⚠️ Doesn't enforce "first 5" position            |

### OS (ORDER STATUS) - 3 checkpoints

| ID   | Checkpoint             | Preprocessor Signal | Issue                                 |
| ---- | ---------------------- | ------------------- | ------------------------------------- |
| OS01 | Ask order/phone        | **NONE**            | ❌ No detection of status calls at all |
| OS02 | Confirm order contents | **NONE**            | ❌                                     |
| OS03 | Communicate status     | **NONE**            | ❌                                     |

### TS (TIRE SERVICE) - 4 checkpoints

| ID        | Checkpoint       | Preprocessor Signal | Issue                            |
| --------- | ---------------- | ------------------- | -------------------------------- |
| TS01-TS04 | All tire service | **NONE**            | ❌ No tire service call detection |

### NI (NEEDS IDENTIFICATION) - 12 checkpoints

| ID   | Checkpoint                 | Preprocessor Signal      | Issue                                             |
| ---- | -------------------------- | ------------------------ | ------------------------------------------------- |
| NI01 | Product type clarification | **NONE**                 | ❌                                                 |
| NI02 | "Литые, штампованные?"     | **NONE**                 | ❌ Critical for wheel calls!                       |
| NI03 | Vehicle make/model/year    | `needs.parameters_asked` | ❌ WRONG - this checks size params, not vehicle    |
| NI04 | Tire size request          | **NONE**                 | ❌                                                 |
| NI05 | "Зимние или летние?"       | `needs.season_asked`     | ⚠️ Doesn't verify AGENT asked (vs customer stated) |
| NI06 | "Шипованные или липучка?"  | **NONE**                 | ❌                                                 |
| NI07 | "Какое количество?"        | `needs.quantity_asked`   | ⚠️ Same issue - agent asked vs customer stated     |
| NI08 | Brand preference           | **NONE**                 | ❌                                                 |
| NI09 | Truck tire position        | **NONE**                 | ❌                                                 |
| NI10 | Search method branch       | **NONE**                 | ❌                                                 |
| NI11 | RunFlat warning            | **NONE**                 | ❌                                                 |
| NI12 | All-season warning         | **NONE**                 | ❌                                                 |

### PP (PRODUCT PRESENTATION) - 7 checkpoints

| ID   | Checkpoint                  | Preprocessor Signal | Issue                                     |
| ---- | --------------------------- | ------------------- | ----------------------------------------- |
| PP01 | 3 options with prices       | **NONE**            | ❌ No product/price counting               |
| PP02 | Advantages + recommendation | `advantages_used`   | ⚠️ Doesn't check for recommendation phrase |
| PP03 | Price with "стоимость/цена" | **NONE**            | ❌                                         |
| PP04 | Delivery/pickup terms       | **NONE**            | ❌                                         |
| PP05 | Upsell offer (секретки)     | **NONE**            | ❌                                         |
| PP06 | Prepayment warning          | **NONE**            | ❌                                         |
| PP07 | Upsell explanation          | **NONE**            | ❌                                         |

### OH (OBJECTION HANDLING) - 9 checkpoints

| ID        | Checkpoint             | Preprocessor Signal | Issue                                                        |
| --------- | ---------------------- | ------------------- | ------------------------------------------------------------ |
| OH01-OH09 | All objection handling | `objection_handled` | ❌ ARCHITECTURE WRONG: detects agent response patterns, NOT customer triggers |

**Critical flaw**: OH checkpoints require detecting CUSTOMER objection first, then checking agent response. Preprocessor only looks at agent utterances.

### OR (ORDER PROCESS) - 6 checkpoints

| ID   | Checkpoint                 | Preprocessor Signal | Issue                                        |
| ---- | -------------------------- | ------------------- | -------------------------------------------- |
| OR01 | Order number announced     | **NONE**            | ❌ (extracted_data may have it but no signal) |
| OR02 | Order summary              | **NONE**            | ❌                                            |
| OR03 | Delivery method confirmed  | **NONE**            | ❌                                            |
| OR04 | SMS notification mentioned | **NONE**            | ❌                                            |
| OR05 | Call time preference       | **NONE**            | ❌                                            |
| OR06 | Transport company payment  | **NONE**            | ❌                                            |

### CL (CLOSING) - 3 checkpoints

| ID   | Checkpoint           | Preprocessor Signal | Issue                                     |
| ---- | -------------------- | ------------------- | ----------------------------------------- |
| CL01 | "Чем-то ещё помочь?" | **NONE**            | ❌                                         |
| CL02 | "Спасибо за звонок"  | `closing.thanks`    | ⚠️ Doesn't verify it's in FINAL utterances |
| CL03 | "До свидания"        | `closing.goodbye`   | ⚠️ Same - no position check                |

------

## Summary Statistics

| Status                 | Count | %    |
| ---------------------- | ----- | ---- |
| ✅ Reliable signal      | 0     | 0%   |
| ⚠️ Partial/buggy signal | 8     | 17%  |
| ❌ Missing signal       | 40    | 83%  |

------

## Critical Bugs in Preprocessor

### Bug 1: GR02 patterns too broad

```python
# Current (WRONG):
find_matches(("меня зовут", "это", "с вами", "вас приветств", "говорит"))

# "это" matches "это последняя модель" (utterance 101) - FALSE POSITIVE
# "с вами" matches random phrases - FALSE POSITIVE
```

### Bug 2: NI05/NI07 don't check WHO said it

```python
# Current checks if words appear anywhere
# But requirement is: AGENT ASKED the question
# If customer says "мне нужно четыре зимние" - this triggers signal but agent didn't ask
```

### Bug 3: OH architecture inverted

```python
# Current: looks for agent response patterns
objection_ids, objection_txt = find_matches(("подешевле", "дешевле", ...))

# Should be: 
# 1. Detect CUSTOMER trigger ("дорого", "подумаю")
# 2. Then check if agent responded appropriately
```

### Bug 4: No position constraints

```python
# GR01 should be FIRST utterance only
# CL02/CL03 should be FINAL utterances only
# Currently matches anywhere in call
```

------

## Prompt v2 Issues

1. **No signal→checkpoint mapping**: LLM doesn't know that `greeting.company_said` maps to GR01
2. **Still has regex patterns embedded** (unnecessary since preprocessor ran)
3. **Doesn't tell LLM which checkpoints have NO signals** (must evaluate from scratch)

------

## Production Readiness Verdict

<table> <tr><td style="background: #ffcccc; padding: 20px; font-size: 18px; text-align: center;"> ❌ NOT READY FOR PRODUCTION </td></tr> </table>

**Reasons:**

- 83% of checkpoints have no preprocessor signal
- Existing signals have bugs (false positives, missing constraints)
- OH architecture is fundamentally wrong
- Prompt doesn't map signals to checkpoints

------

## Recommendation: Minimum Viable Fix

### Phase 1: Fix Preprocessor (converter_stub.py)

```python
def detect_checkpoint_signals_v2(entries: List[Dict]) -> Dict[str, Any]:
    agent_entries = [e for e in entries if e.get("speaker") == "agent"]
    customer_entries = [e for e in entries if e.get("speaker") == "customer"]
    
    # GR01: Must be FIRST agent utterance
    first_agent = agent_entries[0] if agent_entries else None
    gr01_pass = False
    if first_agent:
        txt = first_agent["text"].lower()
        has_greeting = any(g in txt for g in ["здравствуй", "добрый день", "добрый вечер"])
        has_company = "74 колес" in txt or "74колес" in txt
        gr01_pass = has_greeting and has_company
    
    # GR02: Must be FIRST agent utterance with "меня зовут"
    gr02_pass = False
    gr02_name = None
    if first_agent:
        import re
        m = re.search(r'меня\s+зовут\s+([А-ЯЁ][а-яё]+)', first_agent["text"])
        if m:
            gr02_pass = True
            gr02_name = m.group(1)
    
    # NI05: AGENT asked about season (not customer stated)
    ni05_agent_asked = False
    for e in agent_entries:
        txt = e["text"].lower()
        if "?" in e["text"]:  # Must be a question
            if any(w in txt for w in ["зимн", "летн", "сезон"]):
                ni05_agent_asked = True
                break
    
    # Check if CUSTOMER already stated season
    ni05_customer_stated = False
    for e in customer_entries:
        txt = e["text"].lower()
        if any(w in txt for w in ["зимн", "летн", "всесезон"]):
            ni05_customer_stated = True
            break
    
    # OH: Detect CUSTOMER triggers
    oh_triggers = {
        "OH01_price": False,      # "дорого"
        "OH02_hesitation": False, # "подумаю"
        # ... etc
    }
    for e in customer_entries:
        txt = e["text"].lower()
        if any(w in txt for w in ["дорого", "дороговат", "высокая цена"]):
            oh_triggers["OH01_price"] = True
        if any(w in txt for w in ["подумаю", "не уверен"]):
            oh_triggers["OH02_hesitation"] = True
    
    return {
        "GR01": {"detected": gr01_pass, "utterance_id": first_agent["id"] if first_agent else None},
        "GR02": {"detected": gr02_pass, "name": gr02_name},
        "NI05": {
            "agent_asked": ni05_agent_asked,
            "customer_stated_first": ni05_customer_stated,
            "status": "NA" if ni05_customer_stated else ("PASS" if ni05_agent_asked else "CHECK")
        },
        "OH_triggers": oh_triggers,
        # ... etc
    }
```

