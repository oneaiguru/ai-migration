# PR‑S3 — Reconciliation (site→district) + QA gates

## Goal
Keep planning consistent: sum(site) ≈ district per date; warn >0.5%; (optionally) proportional scaling to district sum.

## Tasks
- Add `src/sites/reconcile.py` (sum → compare with district forecast; optional proportional adjust behind param `reconcile: true`)
- QA:
  - region = sum(district) (already)
  - district = sum(site) within 0.5% tolerance (warn if exceeded)
  - full grid date×site for requested window
- Tests:
  - `tests/sites/test_reconcile.py` — constructive cases, tolerance, scaling branch
- Spec: `specs/bdd/features/site_reconcile.feature` (SITE-REC-001)

---