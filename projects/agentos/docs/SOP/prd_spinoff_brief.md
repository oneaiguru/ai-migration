# Multi-Provider AI Subscription Optimizer
## Strategic Design Brief for External Review

---

## 🎯 Core Problem

**Context:** Building software with AI coding assistants (Claude Code, OpenAI Codex, z.ai GLM) under subscription plans with usage caps.

**Challenge:** Each provider has:
- Different pricing models ($20-200/mo subscriptions vs $0.003-0.075/1k tokens API)
- Different capacity limits (5h rolling windows, weekly caps, prompt quotas)
- Different quality characteristics (Opus: fewer bugs, slower; GPT-5: faster, more bugs)
- Different cost-effectiveness for different tasks

**Question:** How do we systematically find the most cost-effective way to ship features across this heterogeneous provider landscape?

---

## 💡 Strategic Insight: Why Subscriptions > API Billing

**API Economics (OpenAI/Anthropic):**
- Claude Sonnet: $3 input / $15 output per 1M tokens
- GPT-5: $1.25 input / $10 output per 1M tokens
- **Linear scaling:** 10M tokens = ~$150-200
- **No capacity guarantees:** Rate limits, throttling, availability issues

**Subscription Economics:**
- Claude Pro: $20/mo for ~40-80h coding (~1-2M tokens equiv)
- Claude Max x20: $200/mo for ~240-480h (~12-24M tokens equiv)
- Codex Pro: $200/mo for ~300-1500 messages/5h (~similar magnitude)
- GLM Max: $60/mo for 2400 prompts/5h (~10-20M tokens equiv)

**Break-even analysis:**
- Heavy coding workload: ~10-20M tokens/month
- API cost: $150-300/month (linear)
- Subscription cost: $20-200/month (fixed, with caps)
- **Subscription wins at scale** if you can use the capacity efficiently

**The optimization problem:**
Given fixed subscription budgets with heterogeneous caps, how do we **maximize features shipped per dollar**?

---

## 🔧 Why Multi-Agent Short Cycles (The Token Economics)

**Naive approach:** "Load entire codebase into Claude, ask it to implement feature"
- **Problem:** Context window limits (200k tokens = ~150k chars = medium codebase)
- **Problem:** Context rot (LLMs lose focus beyond ~50k active tokens)
- **Problem:** Inefficient token usage (re-sending unchanged files every interaction)
- **Result:** Slow, expensive, unreliable

**Our approach:** Multi-agent pipeline with focused context
```
Scout Agent (cheap model):
  Input: Feature spec (1k tokens)
  Output: List of files + line ranges to modify (2k tokens)
  Cost: ~3k tokens

Planner Agent (strong model):
  Input: Spec + targeted file contents (10k tokens)
  Output: Detailed implementation plan (5k tokens)
  Cost: ~15k tokens

Executor Agent (coding model):
  Input: Plan + specific files (8k tokens)
  Output: Code changes (12k tokens)
  Cost: ~20k tokens

Reviewer Agent (strong model):
  Input: Changes + tests (15k tokens)
  Output: Approval or fix requests (3k tokens)
  Cost: ~18k tokens

Total: ~56k tokens per feature (focused, efficient)
```

**Compare to naive:**
- Naive: Load 100k tokens context × 5 interactions = 500k tokens
- Focused: 56k tokens total (9× more efficient)

**Why short cycles matter:**
- Fresh context each step (no drift)
- Can switch models per step (cheap scout, strong planner)
- Can switch providers mid-pipeline (use available capacity)
- Quality checkpoints (catch errors early)

**The multiplication effect:**
- Each agent uses fewer tokens per call
- BUT we make more calls (4 per feature vs 1-2)
- Net result: ~3× total tokens consumed
- BUT: Higher success rate (fewer rework cycles)
- AND: Flexibility to optimize provider per step

---

## 📊 The Measurement Challenge

**Providers don't expose cost in common units:**

| Provider | What They Show | What We Need |
|----------|----------------|--------------|
| Codex | "5h: 14% used, Weekly: 82% used" | Features per % of weekly bar |
| Claude | "All models: 90% used" | Features per % of weekly bar |
| GLM | "2400 prompts per 5h" | Features per prompt quota |

**The normalization:**
We convert everything to **"features shipped per unit of capacity"** where capacity is:
- Codex/Claude: % of weekly bar
- GLM: prompts consumed

Then compute **effective cost per feature** = (monthly subscription / weekly capacity) / (features per week)

**Example:**
- Claude Pro: $20/mo ÷ 4.345 weeks = $4.60/week
- Measured: 0.75 features per 1% of weekly bar
- Weekly capacity: 100% × 0.75 = 75 features/week
- Effective cost: $4.60 / 75 = **$0.061 per feature**

**Commit tagging examples (new `xfeat::` / `xproto::` format):**
- `xfeat::AUTH-01::W0-003::SPEC implement login validation`
- `xfeat::AUTH-01::W0-003::BUILD add JWT middleware`
- `xfeat::FEED-02::W0-005::REVIEW fix edge cases`
- `xproto::UI-PROTOS::W-P1::MOCK create dashboard wireframe`
- `xproto::DATA-MIG::W-M2::TEMP add migration script`

---

## 🎲 The Portfolio Optimization Problem

**Given:**
- N provider subscriptions with different:
  - Monthly costs (C₁, C₂, ...)
  - Weekly capacities (W₁, W₂, ...)
  - Quality profiles (Q₁, Q₂, ...)
- M methodologies (multi-model pipelines) with different:
  - Cost per feature on each provider
  - Success rates (affects rework)
  - Speed (affects throughput)

**Objective:**
Minimize **total cost per successful feature** while maximizing **throughput within caps**.

**Constraints:**
- 5-hour rolling windows (can't burst beyond)
- Weekly caps (hard limits)
- Quality requirements (features must pass tests)

**Solution approach:**
1. **Empirical measurement:** Run methodologies on providers, measure ΔW and success rate
2. **Statistical comparison:** Use confidence intervals to eliminate dominated options
3. **Bandit optimization:** Continuously learn which combinations work best
4. **Capacity-aware scheduling:** Never exceed caps, route work to available providers
5. **Periodic rebalancing:** Monthly decisions on which subscriptions to keep/add/cancel

---

## 🏗️ System Architecture (High-Level)

```
┌─────────────────────────────────────────────────┐
│ Week 0-1: Baseline Measurement                  │
│ • Run fixed methodology on each provider        │
│ • Measure ΔW per 5h window                      │
│ • Compute efficiency (features per %)           │
│ • Establish confidence intervals                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Week 2-4: Methodology Racing                    │
│ • Test variations (different model assignments) │
│ • Eliminate dominated options (statistical)     │
│ • Find optimal model → step mappings            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Month 2+: Production Optimization               │
│ • Route features to best provider/methodology   │
│ • Track quality & rework rates                  │
│ • Monthly subscription decisions                │
│ • Continuous learning & adaptation              │
└─────────────────────────────────────────────────┘
```

**Key innovation:** We don't need tokens-level data. Just:
- Provider usage meters (%, prompts)
- Features shipped (pass/fail)
- Time (window IDs)

This is MUCH simpler than API-level telemetry while giving same optimization power.

---

## 🔬 Why This Week's Experiment Matters

**Week 0 Goal:** Establish empirical efficiency for Codex Pro + Claude Pro

**What we'll learn:**
1. **Baseline ΔW variance:** How stable is consumption per feature?
2. **Provider independence:** Do they truly not interfere?
3. **Quality differences:** Does Claude produce fewer bugs?
4. **Capacity limits:** When do we hit weekly caps?

**What this unlocks for Week 1+:**
- Confident decisions on which providers to use
- Data-driven subscription changes (upgrade/downgrade/add)
- Methodology improvements (informed by success rates)
- Portfolio rebalancing (optimal account mix)

**Long-term vision:**
- **Self-regulating system:** Automatically adjusts subscriptions monthly
- **Cost ceiling:** Never spend more than $X/feature (provable)
- **Quality floor:** Never accept below Y% success rate
- **Adaptive learning:** Continuously improves as we ship more features

---

## ❓ Questions for External Reviewer

**Architecture:**
1. Is the multi-agent short-cycle rationale sound?
2. Are we missing any provider interaction effects?
3. Should we measure quality differently?

**Statistics:**
4. Is ratio-of-totals the right estimator for efficiency?
5. What confidence level for elimination decisions?
6. How many windows needed for stable estimates?

**Optimization:**
7. Is greedy scheduling sufficient or need full ILP?
8. How to handle Opus coupling (shares weekly bar with Sonnet)?
9. Should we prioritize cost or throughput?

**Scaling:**
10. How to add new providers without restarting measurement?
11. When to declare a methodology "winner"?
12. How to handle provider pricing changes mid-month?

---

## 📈 Success Metrics (3-month horizon)

**Week 4:**
- ✅ Identified 1-2 winning methodologies with 95% confidence
- ✅ Measured $/feature for each provider ± 10%
- ✅ Established quality baselines (bugs per feature)

**Month 2:**
- ✅ Shipping features in production with optimal routing
- ✅ <10% deviation from predicted costs
- ✅ Subscription mix optimized (added/removed accounts)

**Month 3:**
- ✅ System is self-regulating (weekly decisions automated)
- ✅ Cost per feature stable within 5% week-over-week
- ✅ Quality metrics tracked and improving

---

## 🎓 Why This Approach is Novel

**Existing tools:**
- LiteLLM/Helicone: API routing, not subscription optimization
- Promptlayer/Langsmith: Logging, not cost optimization
- OpenRouter: API aggregation, doesn't handle subscriptions

**Our innovation:**
- Subscription-first (captures fixed-cost economics)
- Provider-agnostic (works with heterogeneous caps)
- Quality-aware (not just $/token, but $/successful-feature)
- Statistically rigorous (confidence intervals, bandit learning)
- No API keys needed (works with CLI-only tools)

**The economic leverage:**
For a team shipping 100 features/month:
- Naive approach: ~$500-1000 in API costs
- Random subscriptions: ~$300-600 (underutilized)
- Optimized portfolio: ~$150-300 (our target)
- **Potential savings: $200-700/month = $2400-8400/year**

At scale (1000 features/month):
- Savings could be $20k-80k/year
- Plus: better quality from optimal model routing
- Plus: faster shipping from capacity awareness

---

## 🚀 Implementation Phases

**Phase 0 (This Week):** Research & Design
- ✅ Deep research on provider mechanics
- ✅ PRD with statistical framework
- ✅ Parser specifications
- ⏳ External validation (this doc)

**Phase 1 (Week 0):** Baseline Measurement
- Build tracker with parsers + estimators
- Run 6-8 windows on Codex + Claude
- Compute E_codex, E_claude with CIs

**Phase 2 (Week 1):** Add Third Provider
- Subscribe to GLM Max ($30 promo)
- Measure E_glm (prompt-based)
- Compare all three providers

**Phase 3 (Week 2-3):** Methodology Racing
- Test 3-4 model assignment variants
- Statistical elimination
- Identify winners

**Phase 4 (Month 2):** Production Deployment
- Route features to optimal providers
- Track quality & costs
- Monthly subscription decisions

**Phase 5 (Month 3+):** Continuous Optimization
- Automated routing
- Self-regulating portfolio
- Adaptation to pricing changes

---

## 💼 Business Case

**Investment:** ~40 hours design + build + measure
**Payback period:** 1-2 months (for moderate volume)
**ROI at 100 features/month:** ~$3k-8k/year savings
**ROI at 1000 features/month:** ~$30k-80k/year savings

**Intangible benefits:**
- Higher code quality (optimal model selection)
- Faster iteration (capacity awareness)
- Predictable costs (no surprise API bills)
- Portable framework (works for any team)
- Continuous improvement (learning system)

---

**Note for reviewer:** This is a REAL system being built, not a thought experiment. Week 0 baseline starts Sunday Oct 19, 21:00. Your feedback will directly influence implementation.
