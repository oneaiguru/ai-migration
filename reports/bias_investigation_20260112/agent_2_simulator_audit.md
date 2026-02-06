## Agent 2: Simulator Accumulation Audit

**File:** `reports/bias_investigation_20260112/agent_2_simulator_audit.md`

## Findings
- Units/deltas: `simulate_fill` outputs cumulative fill (`pred_volume_m3`); `compute_accuracy_metrics` diffs per site to get daily deltas (same method used in bias calc). No delta/cumulative mismatch found.
- Capacity/reset: With current registry (no bin_count/bin_size), all sites default to 1100 L capacity; `reset_on_near_capacity=False` means fill never resets, but because we take diffs, forecast_m3 equals daily rate regardless. Overflow_prob/fill_pct saturate at 1.0 quickly, but volume deltas stay at the estimated weekday rate.
- Manual traces (cutoff 2024-10-31, horizon 212):
  - Site 38104170 (worst over): forecast ~20.4 m³/day, actual spikes 8–16 m³; bias +2.3k m³ → high estimated rate, not simulator bug.
  - Site 38124256 (worst under): forecast ~4–7 m³/day, actual 70–140 m³ pickups; bias −3.2k m³ → baseline rate too low, simulator delivering constant small deltas.
  - Site 38126189 (median under): forecast ~0.16–0.2 m³/day vs actual 0.75 pickups; bias −32.6 m³.
- Edge handling: Missing weekday rates become 0 (no smoothing); no capping of high rates in simulator. Primary variance comes from baseline rates, not accumulation logic.

## Bug identified? NO (simulator behaving as coded; under-bias stems from input rates/zero weekdays, not from accumulation math)

## Recommended fix
- Leave simulator accumulation as-is; focus on baseline rate estimation (window/min_obs, weekday smoothing). If keeping overflow/alert meaningful, consider enabling `reset_on_near_capacity` and wiring real bin capacities from registry, but that won’t materially change volume deltas.

## Test case
- Repro: generate_rolling_forecast(cutoff=2024-10-31, horizon=212), diff `pred_volume_m3`, and inspect sites 38104170 / 38124256 / 38126189 to confirm deltas vs actual pickups.
