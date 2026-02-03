# Task: Build Mathematical Framework from Current Evidence

## Context
You are helping design a cost optimization system for AI-assisted software development. We have deep research results (attached) about Claude, OpenAI, and GLM usage mechanics. We need to convert this into a rigorous mathematical framework that will guide Week 0 baseline measurements.

## Your Task
Using ONLY the evidence in the attached research document, build:

### 1. Validated Assumptions
For each assumption in our original mathematical model, state whether it's:
- ✅ **CONFIRMED** by Tier A/B evidence (cite specific findings)
- ⚠️ **PARTIALLY CONFIRMED** (state what's known and what's uncertain)
- ❌ **NOT VALIDATED** (no evidence found, must measure empirically)

**Assumptions to validate:**
- **Additivity**: ΔW from window 1 + ΔW from window 2 = total ΔW
- **Independence**: Provider A's usage doesn't affect Provider B's bars
- **Consistency**: The ratio (units completed / ΔW) is estimable with bounded variance
- **Monotonicity**: More usage → more % burned (no negative burns)

### 2. Updated Estimators
Given what we learned about token-based accounting, caching, and coupling:

**Revise the core estimators:**
```
E_{p,m} = (ΣU) / (ΣΔW)  [efficiency in units per pp of weekly bar]
```

**Account for:**
- Token-based windows (not pure wall-clock)
- Caching benefits in continued sessions
- Separate quota pools (All-models vs Opus)
- Context size effects on ΔW

**Output format:**
```
# Provider: Claude Pro/Max
E_{claude,m} = (ΣU_i) / (ΣΔW_all,i)
  where: ΔW_all accounts for all model usage
  
Constraint: If m uses Opus, also check:
  ΣΔW_opus,i ≤ 100%
  
Adjustment factors:
- Context size multiplier: [from evidence]
- Caching discount: [from evidence]
- Session continuation discount: [from evidence]
```

### 3. Safe Capacity Bounds
Given the findings about:
- Max 20× potential bugs (16% spike reported)
- Parallel session throttling
- Bar update lag

**Revise the safety margin R:**
- Original: R = 2%
- Recommended: R = [your analysis] because [reasoning]

**Revise the weekly cap formula:**
```
x_p^max = floor((B_p - R) / a^max_{p,m})
```

Where `a^max` now accounts for:
- Token budget per window (not just avg ΔW)
- Potential coupling between quotas
- Worst-case context size

### 4. Quality-Adjusted Cost Model
Given the Opus vs GPT-5 quality comparison:

**Define quality factor Q:**
```
ECOST_{p,m} = (C_p^week / Cap_{p,m}) × (1 + rework_rate_m)
```

**Estimate rework_rate from evidence:**
- If methodology m uses stronger model for planning: rework_rate = [lower bound]
- If methodology m uses weaker model throughout: rework_rate = [upper bound]

### 5. Week 0 Startup Decision
Based on current evidence, answer:

**Q: Can we start Week 0 Codex baseline with confidence?**
- If YES: What's the minimum protocol to measure ΔW reliably?
- If NO: What specific evidence do we need first?

**Q: Should we include Claude in Week 0 or Week 1?**
- Given: We have strong Claude evidence, weak Codex evidence
- Trade-off: Learning multiple providers faster vs cleaner single-provider baseline

**Q: What's the minimum n (windows) for Week 0?**
- Given: Current confidence intervals are theoretical
- Trade-off: Speed to first decision vs statistical power

### 6. Critical Gaps for Targeted Research
List the top 3-5 missing pieces of evidence that would:
- Change a mathematical assumption
- Materially affect Week 0 measurement protocol
- Block Week 1 multi-provider comparison

**Format:**
```
Gap 1: [specific unknown]
  Impact: [how it affects the model]
  Priority: [CRITICAL / HIGH / MEDIUM]
  Research query: [exact question for Deep Research]
```

---

## Output Format
Provide your analysis in this structure:

```markdown
# Mathematical Framework v1.0 (Evidence-Based)

## Section 1: Validated Assumptions
[For each assumption: ✅/⚠️/❌ + citations + implications]

## Section 2: Updated Estimators
[Revised formulas with adjustments]

## Section 3: Safe Capacity Bounds  
[New R value, new x_p^max formula]

## Section 4: Quality-Adjusted Cost Model
[Rework rate estimates, ECOST formula]

## Section 5: Week 0 Startup Decision
[YES/NO on Codex baseline, minimum protocol]

## Section 6: Critical Gaps (for Step 2 Research)
[Top 3-5 gaps with research queries]
```

---

## Success Criteria
Your output should:
1. Reference specific findings by number (e.g., "Finding: Claude's 5-Hour Usage Window...")
2. Never invent data not in the research
3. Clearly distinguish "proven" from "reasonable inference"
4. Provide actionable next steps for measurement or research

---

## Attached Documents
[The user should paste the full research document here]
