# PRO Strategy (Raw Ingest)

Source: /Users/m/Desktop/PRO.markdown
Ingested: (local time at copy)
Note: Kept verbatim for provenance; see `docs/System/value_system.md` for the cleaned, canonical version.

Love where you’re taking this. Let’s lock in a **value system** that’s (a) hard to game, (b) recoverable later from raw artifacts, and (c) flexible across work types (replica builds, startup validation, established-product ROI).

Below is **what to measure**, **how to compute value**, and **the exact data you must capture now** so any future metric is reconstructible.

------

## 0) Anti‑gaming principles (guardrails)

1. **Evidence > counts.** Prefer pass/fail evidence (tests, diffs, logs, artifact hashes) over self‑reported “feature count”.
2. **Fix the target ex‑ante.** Define the target set (capabilities, endpoints, KPIs) *before* a session starts; measure distance to that target.
3. **Normalize by difficulty.** Weight units by priority/complexity to avoid “easy feature inflation”.
4. **Persistence matters.** Reward work that **sticks** (survives for N days) to penalize churn/rework.
5. **Store raw + links.** Keep raw test results, commit SHAs, artifact paths—so future you can recompute any metric.

------

## 1) Value lenses by work type

### A) **Product replica / reverse‑engineering APIs**

**Value = Distance‑to‑Target (DTT) delta**

- **Define the target once:** a capability map (the “100% blueprint”).
  - *Unit types:* API endpoints, UI flows, CLI commands, import/export formats.
  - Each unit has **id, weight, acceptance test(s), evidence path.**
- **Per session metric:**
  - `DTT%_t = (Σ_i w_i * state_i(t)) / Σ_i w_i`, with `state∈{0,0.5,1}` for {missing, partially verified, fully verified}.
  - **Progress delivered** = `ΔDTT% = DTT%_after − DTT%_before`.
  - **Efficiency** = `ΔDTT% / cost` (tokens + time cost).
- **API coverage flavor:** maintain an *endpoint inventory* with weights; acceptance = reproducible contract tests (e.g., request/response fixtures).
- **Why this works:** You can’t inflate DTT without adding or passing pre‑declared acceptance tests.

### B) **Startup validation / experiments**

**Value = Decision quality + cash signal**

- Each experiment has: **Hypothesis, Primary metric, Minimum effect, Power, Decision rule, Stop rule.**
- **Outcome value:**
  - **Decision resolved?** (Go / No‑go / Pivot) → that’s value even when the answer is “No”.
  - **Business impact proxy:** `(uplift * volume * margin)` with **CI**; log `p, CI, n`.
  - **Information gain proxy:** expected value delta * posterior confidence (optional, but powerful).
- **Why this works:** You store the raw counts/CI and the “decision taken”, not vanity metrics.

### C) **Established product / delivery**

**Value = Impact − Cost**

- **Impact flavors:** revenue lift, cost savings (hours saved * loaded rate), reliability risk reduced (incidents avoided * cost per incident).
- **Cost flavors:** human time (hours * rate), token/compute $, maintenance drag (future negative).
- **Delivery quality modifiers:** rework rate, defect leakage.
- **Why this works:** classic ROI with quality/risk correction, grounded in observed deltas.

------

## 2) Minimal **atomic data** you must capture now (so metrics are recoverable later)

### A) Window‑level (one line per finalized window)

- `window_id, started_at, ended_at`
- `providers: {codex, claude, glm}` usage (already have tokens/prompts)
- **Outcome fields (Ready‑Next scope):** `quality_score, outcome_label` (e.g., “api-reverse:auth-flow”)
- **Churn hooks:** `commit_start_sha, commit_end_sha` (+ line adds/dels computed later)
- **Target hooks:** `spec_id, spec_version` (which capability blueprint is in force)
- **Experiment hooks (if applicable):** `experiment_id, hypothesis_id`
- **Cost hooks:** `time_spent_hours (optional now), token_cost_usd (can compute offline), other_costs_usd`

### B) Capability/Endpoint‑level (append‑only inventory, versioned)

```
docs/System/capability_map/<product>/capabilities.csv
```

- `capability_id, name, type(api/ui/cli), weight(1..5), acceptance_path, criticality, owner(optional)`

### C) Acceptance evidence ledger (per session when tests run)

```
docs/Ledgers/Acceptance_Evidence.csv
```

- `window_id, capability_id, test_run_id, runner(behave/pytest/custom), result(pass/fail/partial), artifacts_path, artifact_hash, notes`

*(Store raw reports too—JUnit XMLs, json summaries—under `artifacts/test_runs/<test_run_id>/`.)*

### D) Experiment ledger (only when doing validation work)

```
docs/Ledgers/Experiment_Ledger.csv
```

- `experiment_id, hypothesis_id, window_id, metric_name, n, baseline, observed, delta, ci_lo, ci_hi, p_value, decision(go/no-go/pivot), notes`

### E) Churn ledger (after your churn command lands)

```
docs/Ledgers/Churn_Ledger.csv
```

- `window_id, methodology, commit_start, commit_end, files_changed, insertions, deletions, net, persisted_after_7d(yes/no), normalized_churn_per_feature`

> **Why these ledgers?** They’re tiny, human‑readable, and point to raw artifacts. You can recompute DTT, ROI, CI, anything—years later.

------

## 3) Composite metrics you can compute later (from the atoms)

- **DTT% (Replica)** = weighted acceptance pass rate at t.
- **ΔDTT% per $** and **per hour** (progress efficiency).
- **API Coverage** = (verified endpoints weight) / (total weight).
- **Effective Feature Points (EFP)** = Σ `(weight * passed * quality_multiplier)`; with `quality_multiplier = 1 − rework_rate − defect_penalty`.
- **Cost per EFP** = total cost / EFP.
- **Rework rate** = lines re‑touched within 7/14 days ÷ lines added.
- **Stability half‑life** = days until 50% of touched lines change again.
- **Experiment Value Index** = `(uplift * volume * margin) * adoption_prob * confidence − cost`.
- **Delivery ROI** = `(impact_usd − cost_usd) / cost_usd`.
- **Token→Progress Efficiency (TEP)** = `ΔDTT% / (tokens / 1e6)`.

You don’t need to *store* these; you store atoms and compute them in preview or reports.

------

## 4) Concrete **how‑to** for your examples

### Reverse‑engineering a product (replica)

1. Create the **capability map** (10–50 units) with weights + acceptance paths.

2. Freeze `spec_version` for the next week.

3. In each session: run acceptance (or the subset touched), ingest results → evidence ledger.

4. **Preview** shows:

   ```
   Replica: spec=v1.3  DTT before=37.5%  after=45.0%  Δ=+7.5%
   Efficiency: +7.5% / $42 = 0.18 %/$
   ```

5. Commit range stamped at finalize → run `tracker churn` → preview adds “Churn: +120/-40 (net +80), per‑feature 26.7”.

### Startup validation (cashflow is key)

1. Register `experiment_id`, hypothesis, target metric, effect size, stop rule in the ledger.
2. Store raw counts (signups, conversions, revenue) + CI.
3. Decision captured (`go/no-go/pivot`)—**that decision is value** even when results are negative.
4. Later you can compute expected monthly impact, payback, and “decisions per $”.

### Established business

1. Capture **impact deltas** (hours saved, tickets reduced, revenue change) against a baseline period.
2. Store human time (approx) + tokens; compute ROI and **Cost‑to‑serve deltas** over time.

------

## 5) Small changes to make **right now** (low effort, high leverage)

1. **Window finalize fields:** add `spec_id, spec_version, commit_start_sha, commit_end_sha, methodology`.
2. **Capability map stub:** create `docs/System/capability_map/<project>/capabilities.csv` with 10 core units and weights.
3. **Evidence ledger stub:** add `docs/Ledgers/Acceptance_Evidence.csv` (headers only).
4. **Preview placeholders:** after Ready‑Next, add a preview block that *reads* the capability CSV + latest evidence to show `DTT%` and `Δ`. (Even if initial values are “n/a”, the wiring is done.)
5. **Churn step next:** proceed with the 3‑commit churn plan we outlined; it complements DTT and guards against inflated counts.

> You don’t need new subscriptions to gain signal. **Automation** (ccusage daily, /status before/after, claude‑monitor at end) + these ledgers will give you clean, reproducible value data.

------

## 6) What *not* to track (yet)

- Raw “feature counts” without ties to capabilities/tests.
- Story points or timeboxes not mapped to acceptance.
- “Weekly goals achieved” without evidence.

------

## 7) Quick checklist (copy/paste)

-  Add finalize fields: `spec_id, spec_version, commit_start_sha, commit_end_sha, methodology`.
-  Create capability map CSV (10–50 units, weights, acceptance paths).
-  Add `Acceptance_Evidence.csv` (append‑only) + folder `artifacts/test_runs/`.
-  Keep Ready‑Next: Stats/CI + outcome in preview + UPS cross‑links.
-  Next: wire preview “Replica DTT%” using the map + last evidence.
-  Then: ship churn command + ledger + preview line.
-  Only after that, consider subscriptions for throughput (you’ll know where they help).

If you want, I can draft the **exact CSV headers**, the **preview snippet format**, and the **minimal acceptance JSON/JUnit parser contract** so the next session can implement with zero ambiguity.
