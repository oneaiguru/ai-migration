# Task: Design Week 0 Dual-Provider Baseline Protocol

## Context
You just completed the Mathematical Framework v1.0. Now design the operational protocol for Week 0 baseline measurement.

**Key constraint:** User has limited time (Fri 11:00 → Sun 21:00) and limited weekly headroom:
- **Codex:** ~18% weekly bar remaining
- **Claude:** ~10% All-models bar remaining

## Your Task

### 1. Week 0 Objectives (Prioritize)
Define what Week 0 MUST accomplish vs NICE-TO-HAVE:

**Must accomplish:**
- Establish empirical ΔW per 5h window for Codex
- Establish empirical ΔW per 5h window for Claude (Sonnet-only)
- Measure variance in ΔW (for confidence intervals)
- Validate measurement protocol (bar reading, unit counting)

**Nice-to-have:**
- Daypart stratification (8 bins)
- Multiple methodology variants
- Bar update latency measurement

**Trade-off:** More windows = better statistics BUT risk hitting caps and blocking rest of week

### 2. Aligned Window Schedule

**Requirements:**
- Start times at :00 (e.g., 11:00, 14:00, not 11:37)
- BOTH providers start within same 5-minute window (test independence)
- Respect user's sleep preference (avoid 22:30-05:30 if possible)
- Fit within Fri 11:00 → Sun 21:00 (58 hours)

**Design choices to make:**
- How many windows total? (considering limited headroom)
- Which time slots? (daypart coverage vs concentrated learning)
- What happens if one provider hits cap mid-protocol?

**Output format:**
```
Window Schedule (all times local)

Window 1: Fri 11:00-16:00
  - Codex: START (before: 82%)
  - Claude: START (before: 90%)
  - Estimated ΔW: Codex ~4%, Claude ~3%
  - After: Codex ~86%, Claude ~93%

Window 2: [continue...]

Contingency rules:
- If Codex hits >95%, STOP Codex, continue Claude
- If Claude hits >95%, STOP Claude, continue Codex
- If BOTH hit caps, END Week 0 early
```

### 3. Fixed Week 0 Methodology

To minimize variance, use ONE consistent methodology for Week 0:

**Define:**
- What task/feature type? (e.g., "Implement one BDD spec from a standard set")
- What's the unit U? (e.g., "1 feature = spec → passing tests")
- What tools/context? (attachments? tools? continuation vs fresh?)
- How to ensure Codex and Claude do IDENTICAL work?

**Example template:**
```
Week 0 Methodology: "Simple Feature Baseline"

Task: Implement features from a pre-selected set of 10 similar BDD specs
- Each spec: ~50 lines Given/When/Then
- Codebase: Fixed snapshot (no external changes during Week 0)
- Prompting: Standardized template (same for both providers)

Steps per feature:
1. [Planning]: Read spec, propose implementation approach
2. [Building]: Write code to pass all scenarios
3. [Review]: Run tests, fix until all pass

Success criteria: U=1 when all tests pass

Tools/context:
- Codex: Use via CLI with --model gpt-5-codex
- Claude: Use via CLI with Sonnet 4.5
- No attachments >1MB (to reduce variance)
- No /continue across windows (fresh session each window)

Exclusions:
- No Opus (save for later)
- No GLM (Week 1)
- No Deep Research calls (wait until Week 1)
```

### 4. Measurement Protocol (Step-by-Step)

**Per window, per provider:**

```
BEFORE window:
1. Open terminal for provider
2. Run status command:
   - Codex: `codex /status`
   - Claude: `claude` then `/usage`
3. Record EXACT text output (copy-paste to log file)
4. Parse weekly % (Codex: "Weekly limit: X%", Claude: "All models: Y%")
5. Timestamp: [YYYY-MM-DD HH:MM:SS local]

DURING window (5 hours):
1. Start timer
2. Run methodology on N features (until 4h 50min or features exhausted)
3. Count completed units U (features passing all tests)
4. Log any anomalies (errors, rate limits, restarts)

AFTER window (before moving to next):
1. WAIT 5 minutes (buffer for UI update lag)
2. Run status command again
3. Record output
4. Parse weekly %
5. Timestamp
6. Compute ΔW = after% - before%

SAFETY CHECK:
- If after% > 95%, STOP this provider for Week 0
- If ΔW > expected by 2×, INVESTIGATE (possible bug/spike)
```

### 5. Data Collection Format

**Design a simple JSON schema:**

```json
{
  "week0_windows": [
    {
      "window_id": "W0-001",
      "start_time": "2025-10-17T11:00:00+08:00",
      "end_time": "2025-10-17T16:00:00+08:00",
      "providers": {
        "codex": {
          "before": {
            "weekly_pct": 82,
            "raw_output": "[full /status text]",
            "timestamp": "2025-10-17T11:00:15+08:00"
          },
          "after": {
            "weekly_pct": 86,
            "raw_output": "[full /status text]",
            "timestamp": "2025-10-17T16:05:42+08:00"
          },
          "delta_pct": 4,
          "units_completed": 3,
          "anomalies": []
        },
        "claude": {
          "before": {...},
          "after": {...},
          "delta_pct": 3,
          "units_completed": 3,
          "anomalies": []
        }
      },
      "notes": "First window, both providers baseline"
    }
  ]
}
```

**Storage:** Simple file `week0_data.json` in project root.

### 6. Quick Analysis After Each Window

After recording each window's data:

**Compute running estimates:**
```
# For each provider
E_running = (Σ U) / (Σ ΔW)

# Example after Window 1:
Codex: E = 3 units / 4% = 0.75 units/pp
Claude: E = 3 units / 3% = 1.0 units/pp

# After Window 2, update:
Codex: E = (3+2) / (4+5) = 5/9 = 0.56 units/pp
Claude: E = (3+3) / (3+2) = 6/5 = 1.2 units/pp
```

**Stopping rule:**
```
If after N windows:
  - Confidence interval width for E < 20% of point estimate
  AND
  - At least 3 windows completed
  AND
  - One provider approaching 95% cap

THEN: Can stop early (optional)
```

### 7. Risks & Mitigations

**Risk:** One provider hits cap after 1-2 windows
- **Mitigation:** Accept that; even 2 windows gives ballpark ΔW; continue other provider

**Risk:** ΔW varies wildly (e.g., 2% then 10%)
- **Mitigation:** Log everything; investigate context differences; use max observed ΔW for safety buffer

**Risk:** Bar reading gives inconsistent values (lag)
- **Mitigation:** Re-read 2-3 times until stable; log all readings

**Risk:** Features take longer than expected, can't complete enough U per window
- **Mitigation:** Have a backlog of simple features; prioritize speed over complexity in Week 0

### 8. Week 0 Success Criteria

**Minimum viable outcome:**
- ✅ 2+ windows per provider with ΔW and U recorded
- ✅ Mean and stddev of ΔW computed for each
- ✅ No catastrophic failures (data loss, account bans)
- ✅ Protocol documented for Week 1 replication

**Ideal outcome:**
- ✅ 4-6 windows per provider
- ✅ CV(ΔW) < 30% (coefficient of variation)
- ✅ Clear ranking: which provider is more efficient per %
- ✅ Validation that providers are independent (no cross-interference)

---

## Output Format

Provide:

```markdown
# Week 0 Dual-Provider Baseline Protocol

## Section 1: Objectives & Success Criteria
[Must-have vs nice-to-have, with justification]

## Section 2: Window Schedule
[Specific times, with contingency rules]

## Section 3: Methodology Specification
[Exact task definition, tools, prompting template]

## Section 4: Measurement Protocol
[Step-by-step commands and timing]

## Section 5: Data Schema
[Complete JSON structure with example]

## Section 6: Analysis & Stopping Rules
[How to compute running E, when to stop]

## Section 7: Risk Mitigations
[What could go wrong and how to handle]

## Section 8: Deliverables for Week 1
[What files/data Week 1 will consume]
```

---

## Constraints to Respect

1. **No invented data**: Only use facts from Framework v1.0
2. **Be specific**: Give exact commands, not "run status"
3. **Account for human time**: User needs to sleep/eat; don't schedule 24/7
4. **Trade-offs explicit**: If choosing 3 windows vs 6, explain why
5. **Fail-safe**: Protocol should handle early stops gracefully

---

## Success Criteria for This Task

Your protocol should be **executable immediately** - the user can copy-paste commands and run Week 0 without asking clarifying questions.
