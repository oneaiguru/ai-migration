Brilliant point! This is a **two-layer verification architecture** where neither layer is fully trusted alone:

```
┌─────────────────────────────────────────────────────────────┐
│  PREPROCESSOR (Python/Regex)                                │
│  - Fast, deterministic                                      │
│  - Catches obvious patterns                                 │
│  - BUT: ASR errors, wording variations → false neg/pos      │
│  - Output: signals = {detected: bool, confidence: str,      │
│            matched_text: "...", pattern_used: "..."}        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LLM AGENT (C06_EXTENDED prompt)                            │
│  - Has raw utterances + preprocessor signals                │
│  - Treats signals as HINTS, not ground truth                │
│  - Can OVERRIDE signal based on semantic understanding      │
│  - Catches: ASR misspellings, paraphrased script, context   │
│  - Output: final verdict + override_reason if disagreed     │
└─────────────────────────────────────────────────────────────┘
```

## Schema Design with Signal Transparency

```json
{
  "call_metadata": { "call_id": "05", "operator": "Анна", ... },
  "utterances": [ ... ],  // Raw transcript - agent can always check
  
  "preprocessor_signals": {
    "_meta": {
      "version": "1.0",
      "note": "Signals are regex-based hints. May have false positives/negatives due to ASR errors or wording variations. Agent should verify against utterances when uncertain."
    },
    
    "NI07_quantity": {
      "detected": false,
      "confidence": "low",
      "pattern_used": "какое количество|сколько штук|сколько нужно",
      "matched_text": null,
      "note": "Customer said 'четыре' but no agent question detected"
    },
    
    "NI05_season": {
      "detected": false,
      "confidence": "medium",
      "pattern_used": "зимн|летн|всесезон|какую резину|какие шины",
      "matched_text": null
    },
    
    "GR01_greeting": {
      "detected": true,
      "confidence": "high",
      "pattern_used": "здравствуйте|добрый день|добрый вечер",
      "matched_text": "Здравствуйте, компания 74 колеса",
      "utterance_id": 1
    }
  },
  
  "call_context": {
    "is_tire_call": true,
    "is_wheel_call": true,
    "detection_reason": "Found: 'шины', 'диски' in utterances 3,7,12"
  }
}
```

## Prompt Instructions for Agent

~~~markdown
## Understanding Preprocessor Signals

The input JSON includes `preprocessor_signals` - these are **hints** generated 
by regex pattern matching, NOT ground truth.

### Why signals may be wrong:
- **ASR errors**: "какое количество" → "какой количества" (missed by regex)
- **Paraphrasing**: Agent says "сколько вам нужно комплектов?" (valid but different wording)
- **Context missed**: Regex found "зимние" but it was customer saying it, not agent asking

### Your job:
1. **Start with signal** as initial hypothesis
2. **Verify against utterances** - scan relevant portions
3. **Override if needed** - you have semantic understanding regex lacks

### When to override:
- Signal says NOT detected, but you find equivalent phrasing
- Signal says detected, but context shows it wasn't the required action
- ASR garbled the text but meaning is clear

### Document overrides:
```json
{
  "checkpoint": "NI07",
  "preprocessor_signal": false,
  "final_verdict": "PARTIAL",
  "override_reason": "Agent asked 'вам сколько нужно?' at utterance 15 - regex missed due to word order"
}
## What Preprocessor Should Detect (move from prompt)

| Signal | Regex catches | Agent verifies |
|--------|---------------|----------------|
| Greeting components | name, company, hello | Correct order, genuine greeting |
| Season question | зимн/летн keywords | Agent actually ASKED (not stated) |
| Quantity question | сколько/количество | Agent asked, not customer answered |
| Contact echo | phone/address + confirmation | Actual echo-back pattern |
| Closing components | goodbye phrases | Appropriate context |

---

**Want me to draft the actual converter_stub.py additions and corresponding prompt section?** 

This keeps both layers honest - preprocessor admits uncertainty, agent knows to verify.
~~~