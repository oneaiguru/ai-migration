better prompt tht was not used 

Yes—directionally right, but tighten it so the model can’t treat your **guesses** as facts.

Here’s a compact, safe-to-run version that separates **knowns vs. assumptions**, tags confidence, and forces the model to ask *only once* by emitting a missing-data checklist.

------

# Prompt (hardened)

**Role:** You are a VRP specialist optimizing waste collection routes (CVRPTW + compatibility + compactness).

## 1) Problem Snapshot (facts vs. beliefs)

**Facts (high confidence ≥90%):**

- Region: Irkutsk Oblast, operator RT-Neo.
- Scale: ~400 KPs, 3–5 vehicles.
- Data: lat/lon, KP volumes, per-vehicle fuel consumption are available.
- Primary objective: minimize fuel; secondary: minimize vehicles used.
- Historical failure: routes looked geographically non-compact (“human would not do this”).

**Beliefs / Assumptions (include confidence):**

- Time windows apply to a minority of KPs (value **UNKNOWN**, prior guess 10%, confidence 0.7).
- Time windows are **soft** (confidence 0.6).
- Distance model **UNKNOWN** (road network vs. haversine).
- Compactness should meaningfully affect acceptance (confidence 0.95).

**Instruction:** Do **not** treat beliefs as facts. Where “UNKNOWN”, propose options and a minimal verification checklist.

## 2) Deliverables (one pass, fully structured)

1. **Compactness options** (3–4 metrics) with short pros/cons and formulas:
   - route diameter, convex hull area, mean distance-to-centroid, inter-stop variance.
   - Give each a **unit**, **range**, and **normalization** hint for weighting.
2. **Objective formulations** (lexicographic and scalarized) showing exactly how to add compactness:
   - e.g., `min (fuel) → min (vehicles) → min (compactness)` **and** `min fuel + λ·compactness`.
   - Provide recommended λ range and tuning heuristic.
3. **Constraint/penalty models** for time windows & shift limits with defaults and toggles for hard/soft.
4. **Algorithm choice** for this scale (400 KPs, 3–5 TS): cluster-first (k-medoids or sweep with capacity) → intra-cluster VRPTW (LNS/2-opt/Or-opt) → MILP polish; include runtime/quality expectations.
5. **Minimal clarification set** (≤10 items) for the project lead to turn UNKNOWNs into parameters.
6. **Sanity POC plan**: how to validate on 10 KPs / 3 vehicles; include acceptance checks (fuel, vehicles, compactness score, visual map check).
7. **Output contract** (JSON) with fields for objective, routes, compactness_score per route, violations, and diagnostics (including binding constraints and optimality gap).

## 3) Guardrails

- **Never** invent missing numeric values; propose **option sets** plus safe defaults clearly labeled as “temporary default”.
- Every formula must specify **units** (km, m³, min, L, RUB).
- If any hard constraint makes the instance infeasible, return: `status="infeasible"`, list blocking constraints, and suggest the **smallest relaxations**.
- Return a **Missing Data Checklist** (table) before final recommendations.

## 4) Minimal Clarification Set (the ≤10 you must output)

1. Time windows: present? % of KPs? hard/soft? penalties if soft (RUB/min).
2. Driver shifts: per-vehicle start/end? hard/soft? overtime penalty (RUB/min).
3. Capacity model: vehicle capacity vs. tank volume—are they identical? mid-day dumps allowed? where & tip time?
4. Distance model: road graph available? If not, use haversine + speed assumptions (urban/suburban).
5. Service time per KP: fixed or KP-specific? default (min).
6. Compatibility: loading type strict? width/height clearances? any exceptions.
7. Depot rules: single/multi-depot? start=end required? cross-depot allowed?
8. Compactness acceptance: which **visual** property matters most (tight cluster / no long jumps / limited diameter)? pick one.
9. Objective trade-off: accept +X% fuel to save one vehicle? X=?
10. Map artifacts: provide 2–3 past “bad” route screenshots for calibration.

## 5) JSON I/O (abridged)

**Input** (allow UNKNOWN/nulls; include `confidence` for beliefs):

```json
{
  "region": "irkutsk_oblast",
  "scale": {"kps": 400, "vehicles": [3,5]},
  "objectives": {"mode": "lexicographic", "fuel_primary": true},
  "assumptions": {
    "time_windows_share": {"value": null, "prior_guess": 0.10, "confidence": 0.7},
    "time_windows_soft": {"value": null, "prior_guess": true, "confidence": 0.6},
    "distance_model": {"value": null, "options": ["road","haversine"]}
  },
  "data_available": ["kp_coords","kp_volumes","vehicle_fuel_rates"],
  "constraints": ["compatibility","capacity","driver_shift"],
  "depot_policy": {"start_end_same": true}
}
```

**Output**

```json
{
  "status": "analysis",
  "compactness_models": [
    {"name":"route_diameter_km","formula":"max_{i,j} d(i,j)","pros":"limits long jumps","cons":"ignores shape"},
    {"name":"convex_hull_area_km2","formula":"Area(ConvHull(stops))","pros":"captures spread","cons":"outlier sensitive"},
    {"name":"mean_dist_to_centroid_km","formula":"avg_i d(i, centroid)","pros":"stable","cons":"can hide elongated shapes"}
  ],
  "objective_forms": [
    {"type":"lexicographic","order":["fuel","vehicles","compactness"]},
    {"type":"scalarized","expr":"fuel + lambda*compactness","lambda_sane_range":[0.01,0.2]}
  ],
  "algorithm_plan": "cluster-first → VRPTW-LNS → MILP polish",
  "missing_data_checklist": [
    {"item":"time_windows_share","needed_type":"percent"},
    {"item":"distance_model","needed_type":"enum(road|haversine)"}
  ],
  "poc_protocol": {"kps":10,"vehicles":3,"acceptance":["fuel","vehicles","compactness","visual"]}
}
```

------

### Why this fixes your prompt

- **Your 10% time windows becomes a prior, not a fact.**
- The model is forced to emit a **checklist** and **optioned defaults**, not silently assume.
- You get actionable artifacts (metrics, formulas, λ range, algorithm plan) in one pass.

If you want, I can drop this into `/mnt/data/vrp_agent_strategy.md` as a ready-to-send block or generate the exact JSON schema file.