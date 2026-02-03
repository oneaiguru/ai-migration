# PR‑S4 — Route‑day recommendations (policy → visit/no‑visit)

## Goal
Convert site forecasts into actionable routing CSV for D‑day planning.

## Policy
- Visit if any day in look‑ahead window (e.g., 3–5 days) has `overflow_prob >= P*` OR `fill_pct >= θ*`
- Cap per‑day visits per cluster if needed (simple heuristic)

## Deliverable
- Script: `scripts/routes_recommend.py`
- Input: forecasts/sites CSV + `--policy 'risk>=0.8 or fill>=0.8' --lookahead 3 --cluster-file optional'`
- Output: `routes/recommendations_YYYY-MM-DD.csv`
- Tests: `tests/routes/test_recommend.py` — tiny synthetic cases
- Spec: `specs/bdd/features/routes_recommend.feature` (RT-REC-001)

---