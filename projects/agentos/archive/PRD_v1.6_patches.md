# PRD v1.6-final — Patch Notes

Apply these 5 patches to v1.5-final to create v1.6-final.

---

## PATCH 1: Commit Tag Scheme (Section 8)

**REPLACE Section 8 "Source control conventions" with:**

### 8) Source control conventions (greppable tags)

**No feature branches.** Single mainline.

**Commit tag format (unique, greppable):**

```
xfeat::<FeatureID>::<WindowID>::<Stage>
```

**Examples:**
- `xfeat::AUTH-01::W0-003::SPEC` — spec written in window 3
- `xfeat::AUTH-01::W0-003::BUILD` — implementation
- `xfeat::FEED-02::W0-005::REVIEW` — review pass

**Prototype/migration exclusion (churn mask):**

```
xproto::<FeatureID>::<WindowID>::<Stage>
```

**Examples:**
- `xproto::UI-PROTOS::W-P1::MOCK` — UI prototype (exclude from churn)
- `xproto::DATA-MIG::W-M2::TEMP` — temp migration code

**Why:**
- `xfeat::` and `xproto::` are unique prefixes (won't match normal text)
- Deterministic grep: `git log --grep="^xfeat::" --not --grep="^xproto::"`
- Zero reliance on flaky heuristics
- Simple for agents to apply

**Churn calculation excludes xproto::**
```bash
# Count feature churn only (exclude prototypes)
git log --grep="^xfeat::" --not --grep="^xproto::" --numstat
```

---

## PATCH 2: Spec Review Panel (Section 4)

**ADD to Section 4 "Quality: spec‑first gates" after "LLM sign‑off" paragraph:**

### Spec Review Panel (Tier-1 gate)

**Default panel (2-of-3 required for approval):**

1. **GPT-5 (Codex CLI)** — Reasoning Level: High
   - Role: Broad world knowledge, general reasoning
   - Prompt: "Find missing edge cases, ambiguous requirements, unsafe defaults"

2. **Claude Sonnet 4.5 (Claude Code)** — Thinking Level: ultrathink
   - Role: Deep analysis, architectural consistency
   - Prompt: "Validate completeness against rubric, check traceability"

3. **GLM-4.6 (via Claude Code)** — Default thinking
   - Role: Cost-effective third opinion, tie-breaker
   - Prompt: "Identify specification gaps, verify clarity"

**Decision rules:**
- 2+ approve → proceed to BDD/implementation
- 2+ reject → rewrite spec, re-submit
- Split vote (1-1-1) → escalate to Opus 4.1 (ultrathink) as tie-breaker

**Escalation (Tier-2, only if CLS > 1.2σ or Tier-1 disagrees):**
- Add: **Claude Opus 4.1 (ultrathink)** + **GPT-5 (High)** for critical paths

---

## PATCH 3: Codex vs Claude Terminology (Section 7)

**REPLACE Section 7 "Context engineering policy" with:**

### 7) Context engineering policy (explicit)

**Codex CLI (OpenAI):**
- **Models:** gpt-5-codex (coding-optimized), gpt-5 (general reasoning)
- **Reasoning Levels:** Minimal / Low / Medium (default) / High
- **Policy:** 
  - Default: Medium for routine work
  - High: Planning, spec reviews, complex debugging
  - gpt-5 (High): Spec reviews where broad knowledge matters

**Claude Code (Anthropic):**
- **Models:** Sonnet 4.5 (default), Opus 4.1 (rare), Haiku 4.5 (if added)
- **Thinking Levels:** think / think hard / ultrathink
  - Triggers: "think", "think hard", "ultrathink" in prompt
  - Token budgets: ~4k / ~10k / ~32k respectively
- **Policy:**
  - Default: think for routine tasks
  - think hard: Intermediate complexity, API integrations
  - ultrathink: High-CLS features, architecture decisions, Tier-2 reviews

**GLM (Z.AI via Claude Code):**
- **Models:** GLM-4.6 (default), GLM-4.5-Air (lightweight)
- **Policy:**
  - Prefer 4.5-Air for scouting, simple transforms (2× cheaper capacity)
  - Use 4.6 for reviews, complex reasoning
  - Aim for **fewer, larger prompts** (billing is per-prompt, not token)

**Session hygiene (all providers):**
- Short, single-purpose sessions
- Clone sessions for multi-perspective reviews — make a backup copy of the session folder while it is inactive, ask one review question and capture the output, then remove the active folder and restore from the backup so the model “forgets” the prior question before you continue with the next review angle.
- Rely on Claude Code's memory tools for pruning
- Persist external artifacts (contracts/specs/tests) in repo, not in session memory

---

## PATCH 4: 10% Weekly Bar Buffer Rationale (Add to Section 6)

**ADD to Section 6 "Router" after the bullet points:**

### Weekly Bar Buffer (R = 10%)

**Why reserve 10% capacity unused:**

1. **Pane lag hedge:** Despite 5-minute post-window delays, usage bars occasionally lag by 10-15 minutes. Reserving buffer prevents "surprise lockouts" from delayed updates.

2. **Rework spillover:** When features fail and require rework, the repeat attempt consumes additional capacity. The 10% buffer absorbs 1-2 rework cycles per provider without blocking new work.

3. **BwK exploration budget:** The bandit router needs capacity to explore sub-optimal arms occasionally (ε-greedy exploration). Buffer ensures exploration doesn't trigger caps.

4. **Weekly reset uncertainty:** Some providers' weekly resets have ±30min jitter (timezone/DST handling). Buffer prevents edge-case failures near reset boundaries.

**Empirical basis:**
- Microsoft Windows team uses 5-10% capacity reserves in CI/CD systems
- Our Week-0 data will calibrate exact buffer size (start conservative at 10%)

**Implementation:**
- BwK shadow prices increase sharply when remaining capacity < 15%
- Hard stop at 10% remaining (refuse new windows on that provider)

---

## PATCH 5: GLM Subscription Capacity Math (Add to Section 9)

**ADD to Section 9 "Provider profiles" under GLM entry:**

### GLM Capacity Assumptions (subscription mode)

**API pricing as proxy:**
- GLM-4.6: $0.6 input / $2.2 output per 1M tokens
- GLM-4.5-Air: $0.2 input / $1.1 output per 1M tokens
- **Ratio:** 4.6 ≈ 2× the cost of 4.5-Air

**Subscription quota inference:**
- If subscription plan shows "600 prompts/5h" for a base tier
- GLM-4.6 likely consumes ~2 quota units per prompt
- GLM-4.5-Air consumes ~1 quota unit per prompt
- **Effective capacity:** Using 4.5-Air doubles throughput at same plan level

**Measurement strategy:**
- Week-0: Use GLM-4.6 only (establish baseline)
- Week-1: A/B test 4.6 vs 4.5-Air (validate 2× hypothesis)
- Router: Allocate 4.5-Air for Scout/Transform; 4.6 for Review/Complex

**No weekly pool documented:**
- Z.AI docs show only 5-hour cycles (120/600/2400 per 5h)
- Assume rolling 5h windows, no weekly cap overlay
- Monitor for any undocumented weekly limits during Week-0

---

## Summary of Changes

| Patch | Section | Change |
|-------|---------|--------|
| 1 | 8 | Simplified tags: `xfeat::` and `xproto::` |
| 2 | 4 | Explicit review panel: gpt-5 (High), Sonnet 4.5 (ultrathink), GLM-4.6 |
| 3 | 7 | Split Codex "Reasoning" vs Claude "Thinking" terminology |
| 4 | 6 | Added 10% buffer rationale (lag, rework, exploration, reset jitter) |
| 5 | 9 | GLM capacity math (4.6 ≈ 2× Air; no weekly pool) |

**Apply these patches to v1.5-final → produces v1.6-final (production-ready).**

---

## Version Control

- **v1.5-final:** Base document (correct ground truth, parsers, schemas, Week-0)
- **v1.6-final:** v1.5 + these 5 patches (simplified tags, explicit review panel, terminology split, buffer rationale, GLM math)

**Status:** Ready for implementation. No further PRD changes needed before Week-0.
