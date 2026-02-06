# Revised Timeline: Preparation Week + Clean Start

## This Week (Oct 17-19): Research & Design Phase

### Friday-Saturday: Deep Research
**Run all 3 DR tasks in parallel** (~45 min total DR time)

1. **DR Task 1:** Codex CLI mechanics
2. **DR Task 2:** z.ai GLM usage tracking
3. **DR Task 3:** Repo research for tracker

**Your action:**
- Paste each DR task into your ChatGPT chat (switch to DR mode)
- Let each run (~15 min each)
- Copy results back to me

### Sunday: Analysis & Protocol Design

**After getting all 3 DR results:**

**Step 1:** Have Pro synthesize all evidence
```
Prompt: "Given the 3 deep research reports [paste them], update the Mathematical Framework v1.0 to include:
1. Codex-specific estimators and safety margins
2. GLM measurement protocol (if feasible) or skip rationale
3. Repo recommendations for tracker implementation
Output: Framework v1.1 with complete provider coverage"
```

**Step 2:** Have Pro design final Week 0 protocol
```
Prompt: "Using Framework v1.1, design Week 0 protocol for:
- Codex Pro-200 (full 100% weekly available)
- Claude Pro (full 100% available) 
- [GLM if DR says feasible]
Start date: Sunday Oct 19, 21:00
Output: Complete protocol with exact commands, schedule, data schema"
```

**Step 3:** Have Pro design tracker PRD
```
Prompt: "Given Framework v1.1 and Week 0 protocol, create PRD for the tracker system:
- Architecture (based on repo research)
- Data schemas (JSON/JSONL)
- Core modules (parsers, estimators, optimizer)
- Implementation plan
Output: PRD ready for coding agents"
```

---

## Next Week (Oct 20-26): Execution Phase

### Sunday Evening (Oct 19, 21:00)
**Subscription alignment:**
- ✅ Codex resets
- ✅ Claude Pro resets
- 🔄 Start GLM subscription (if DR confirmed measurement is feasible)
- All providers now aligned to Sunday evening weekly resets

### Monday-Wednesday (Oct 20-22): Week 0 Baseline
**Run the protocol Pro designed:**
- 6-8 windows per provider (full capacity available)
- Measure ΔW, U, variance
- Feed data back to system

### Thursday (Oct 23): Week 0 Analysis
**Have Pro analyze results:**
```
Prompt: "Given Week 0 data [paste JSON], compute:
1. E_{p,m} with 95% CIs for each provider
2. Ranking by efficiency (units per %)
3. Recommended R (safety margins)
4. Week 1 protocol for methodology comparison
Output: Framework v1.2 + Week 1 protocol"
```

### Friday-Sunday (Oct 24-26): Week 1 Multi-Methodology
**Run methodology comparisons:**
- Test 3-4 variants (different model assignments per step)
- Elimination based on confidence bounds
- Identify winner

---

## Decision Points

### This Weekend (Choose One)

**Option A: Stay on Claude Pro**
- Pro: No additional $180/mo commitment
- Pro: Can always upgrade later if Claude wins
- Con: Limited capacity (8-16 windows/week)
- **Recommendation:** Start here

**Option B: Upgrade to Claude Max x20**
- Pro: 6× capacity (48-96 windows/week)
- Pro: Can test Opus usage patterns
- Con: $180/mo extra before validation
- **Recommendation:** Only if you're confident Claude will be primary provider

### GLM Subscription (Choose One)

**Option A: Subscribe Sunday evening**
- Pro: Aligned reset
- Pro: Full Week 0 participation
- Con: Must confirm measurement is feasible from DR first

**Option B: Skip for now**
- Pro: Simpler Week 0 (just 2 providers)
- Pro: Can add Week 1 after learning from Codex/Claude
- Con: Delays GLM evaluation by 1 week

---

## What You Do RIGHT NOW

### Immediate Actions (Friday)

1. **Run DR Task 1** (Codex)
   - Switch to DR mode in chat
   - Paste the artifact prompt
   - Wait ~15 min
   - Copy results

2. **Run DR Task 2** (GLM)
   - Same process
   - Wait ~15 min
   - Copy results

3. **Run DR Task 3** (Repos)
   - Same process
   - Wait ~15 min
   - Copy results

4. **Paste all 3 results back to me**
   - I'll evaluate
   - Give you next Pro synthesis prompt
   - Make final recommendations

### Timeline
- **Friday (today):** Run 3 DRs (~45 min total)
- **Saturday:** I review, give you Pro synthesis prompt
- **Sunday:** Pro designs everything, you're ready for clean start Sunday evening

---

## Why This is Better

**vs Original Plan:**
- ✅ Full capacity (100% weekly bars vs 10-18%)
- ✅ Clean aligned resets (all providers start together)
- ✅ Statistically valid data (6-8 windows vs 1-2)
- ✅ Time for comprehensive research
- ✅ Proper tracker design before Week 0

**Cost:**
- 1 week delay vs rushing with limited data
- Higher quality decisions worth the wait

