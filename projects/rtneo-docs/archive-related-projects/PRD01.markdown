# PRD v0.1 for **Coding-agent POC** (1 day)

- **Goal:** Show fuel-optimal **and** compact routes on a 10-KP/3-TS slice.
- **Method:**
  1. Project lat/lon → meters.
  2. **Territory design**: k-medoids (k=3) with capacity and **graph-cut** penalty; hard cap on **Max Diameter**.
  3. **Intra-territory VRPTW**: ALNS (Shaw, Worst-cost, Random; 2-opt/Or-opt), soft TW penalty if present.
  4. **Metrics:** Fuel, Vehicles, **Neighbor Purity (k=8)**, **Max Diameter**, **Area/KP**.
- **Accept if:** Fuel within baseline ±2% and NP≥0.80, Diameter ≤ 1.7× expected radius, Area/KP ≤ 1.6× global.
- **Output:** JSON (routes, KPIs, violations, diagnostics) + simple map image.