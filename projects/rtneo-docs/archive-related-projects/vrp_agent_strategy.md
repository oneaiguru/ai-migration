# Decision: Deep Research vs. Reasoning Agents vs. Direct Conversation

## TL;DR
**Skip Deep Research. Use Reasoning + Coding agents for 30–45 min to clarify the hidden constraint (route compactness/clustering), then have a 30–45 min conversation with Jury to lock in the exact penalty model.**

---

## Why NOT Deep Research First

**Deep Research is designed for:**
- Broad literature surveys (e.g., "what are current VRP solution approaches?")
- Market research (e.g., "what CVRP solvers exist in 2025?")
- Policy/regulatory analysis (multi-source validation)

**Deep Research is NOT ideal for:**
- Domain-specific technical problem clarification
- Reverse-engineering a failed algorithm's root cause
- Defining custom penalty functions that match your unique "compactness" criterion

**Cost/time trade-off:**
- Deep Research: 5–30 min per query, uses 1–2 of your monthly quota
- Better spent when you genuinely don't know the answer and no domain expert is available

**Your situation:** Jury already knows the root cause ("clustering compactness"). Deep Research won't beat that knowledge.

---

## Why Reasoning + Coding Agents FIRST (30–45 min)

### What to Ask the Reasoning Agent (with your 7 data points):

```
You are a vehicle routing optimization specialist. 
A waste collection company (RT-Neo) has a CVRPTW problem:
- 400 KPs, 3–5 vehicles
- All data complete (lat/lon, volumes, fuel consumption)
- Fuel cost is primary objective
- ~10% of KPs have time windows (soft constraint)
- **CRITICAL FAILURE MODE FROM PAST:** Previous algorithm scattered KPs 
  across the map in ways humans would reject (poor route compactness).

Given this, answer:
1. What does "route compactness" typically mean in VRP contexts?
   (e.g., minimizing detours, clustering nearby KPs, geographic continuity?)
2. What penalty models are used to enforce spatial coherence?
   (e.g., auxiliary variables for geographic clustering, 
    distance-based penalties, zone-based assignment?)
3. What hidden constraint might the previous algorithm have missed?
   (e.g., no penalty for fragmented routes, only fuel-distance optimized?)
4. For 400 KPs and ~5 vehicles, which exact algorithmic approach 
   would you recommend? (MILP, hybrid, metaheuristic?)
5. What is the **minimal set of questions** needed to define a 
   compactness penalty that Jury would accept?
```

**Reasoning agent will likely return:**
- Clear definitions of "compactness" in academic VRP literature
- References to specific penalty formulations (e.g., route diameter, convex hull area, clustering distance, geographic zone assignment)
- Hypothesis: *"Previous algorithm optimized fuel only; no spatial penalty was applied. Adding a lexicographic constraint (fuel first, then compactness) or a weighted penalty (fuel + 0.1×compactness_violation) would fix it."*

### Then: Code Exploration (10 min)

Ask a coding agent to sketch pseudo-code for:
- **Compactness metric**: How to compute "goodness" of a route's geographic footprint?
  - Option A: Route diameter (max distance between any two stops)
  - Option B: Convex hull area of stops
  - Option C: Average inter-stop distance variance
  - Option D: Cluster radius from centroid
- **Penalty integration**: How to combine fuel_cost + compactness_penalty in the objective?

This gives you **concrete metrics to show Jury** and ask: *"Which of these matches your 'visual quality' criterion?"*

---

## Then: 30–45 Min Conversation with Jury

### Focused Questions (5–7, not 50)

1. **Compactness metric:**
   - "When you look at a 'good' route, what makes it visually coherent? Is it:
     - Stops form a tight geographic cluster?
     - No long jumps between distant KPs?
     - A specific sequence pattern (e.g., circular, linear)?"
   - Show the pseudo-code options. Which resonates?

2. **Penalty model:**
   - "If fuel cost is primary, should we:
     - Enforce compactness as a hard constraint (infeasible if violated)?
     - Penalize poor compactness (e.g., +1000 RUB per hour of extra drive time from scattered routing)?
     - Trade-off explicitly (e.g., accept +5% fuel to gain 20% better compactness)?"

3. **Soft constraints ranking:**
   - "What's more important: meeting a KP's time window, or keeping a route compact?
     - If a KP is in a time window but adding it breaks compactness, do we skip it or add it with a penalty?"

4. **Previous algorithm's exact failure:**
   - Ask Jury to show 2–3 examples of "bad" routes from the old system.
   - Reverse-engineer: Were they optimizing fuel but ignoring travel continuity? Missing a geographic constraint?

5. **Acceptable heuristics:**
   - "For 400 KPs and 5 vehicles, would you accept a solution that is:
     - 2% higher fuel cost but guarantees compact, human-like routes?
     - 5% higher fuel cost for 10× faster computation?"

6. **Data precision:**
   - "For the road network / distance model:
     - Do you have actual road distances, or should we use haversine + speed factor?
     - If haversine, should we weight by congestion (time of day) or assume uniform 30 km/h urban, 50 km/h rural?"

7. **Operational feedback:**
   - "What does a driver do if a route seems illogical even if fuel is minimized?
     - Do they manually reorder stops, or follow the algorithm blindly?
     - Should we optimize for 'minimal driver reordering'?"

---

## Expected Outcomes

### After Reasoning Agent (30 min)
- **Artifact:** Compactness metrics comparison table
- **Artifact:** Pseudo-code for 3–4 penalty models
- **Clarity:** What the academic literature says the old algorithm likely missed

### After Conversation with Jury (30–45 min)
- **Decision:** Exact compactness metric to use
- **Decision:** Penalty weights (fuel vs. compactness trade-off)
- **Decision:** Hard vs. soft on time windows and shift constraints
- **Potential insight:** "It's not that we need ML; we need a hybrid heuristic (e.g., cluster first, then optimize within cluster)."

### Then: Budget for Math
With these answers, you can provide your external team:
- **Problem:** CVRPTW with lexicographic objective (fuel + compactness) + soft time windows
- **Scale:** 400 KPs, 5 vehicles, complete data
- **Approach:** Hybrid (geographic clustering + MILP polish) or metaheuristic + repair
- **Budget:** Should be straightforward (classical OR, not ML-heavy)

---

## Why This Sequencing Works

| Phase | Tool | Time | Output | Why |
|-------|------|------|--------|-----|
| **1. Clarify hidden constraint** | Reasoning agent | 30 min | Compactness metrics + hypothesis | Fast, no domain expert needed immediately |
| **2. Sketch solutions** | Coding agent | 10 min | Pseudo-code + comparison | Makes abstract concepts concrete |
| **3. Align with domain expert** | Human + agent | 30–45 min | Locked-in penalty model & trade-offs | Jury validates; avoids wasted optimization effort |
| **4. Hand to mathematician** | (Later) | — | Unambiguous, optimizable problem | They can solve it without 10 follow-ups |

---

## Checkpoints Before Committing Budget

Before asking for budget from the math team, confirm with Jury:

- [ ] **Compactness definition:** "This metric = X" (shared understanding)
- [ ] **Penalty weight:** Fuel cost always primary; compactness = secondary with Y penalty per violation
- [ ] **Hard vs. soft:** All constraints classified
- [ ] **Distance model:** Road network or haversine + speed?
- [ ] **Feasibility:** Is 100% collection per day mandatory, or can we defer KPs to next day?
- [ ] **Data format:** Can they provide a 10 KP + 3 vehicle POC in JSON by date X?

Once these are locked, hand to external team with confidence. They'll likely ask 0–2 clarifications instead of 20.

---

## If Reasoning Agent Suggests ML Approach

**Be skeptical.** At 400 KPs + 5 vehicles with complete data, this is a **classical OR problem** (CVRPTW + clustering). ML (RL, GNN) adds complexity without clear benefit unless:
- You have thousands of KPs and need real-time re-optimization
- Historical routing data exists and you want pattern learning
- The problem changes weekly (e.g., new region, new vehicle types)

**Most likely outcome:** Hybrid heuristic (zone-based clustering + local optimization) beats RL here.

---

## Next Step

**Option A:** Spend 30 min now with reasoning agent + coder (no human needed yet)  
**Option B:** Skip straight to 30–45 min conversation with Jury (he has the answers)

**Recommendation:** **Do A first** (it's fast, free, and Jury will appreciate seeing concrete options). Then do B with more focused questions.