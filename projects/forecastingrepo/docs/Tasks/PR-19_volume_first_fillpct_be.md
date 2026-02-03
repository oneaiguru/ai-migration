# PR-19 — Volume-first fill_pct (BE microfix)

Scope
- Compute `fill_pct` from volume when mass is missing/placeholder. No API shape changes.
- Read-only endpoints remain; this is a calculation microfix in the data path used by `/api/sites` and `/api/routes` joins.

Why
- Inbound data reliably includes container volume, while mass may be absent or placeholder.
- The current mass-to-volume assumption leads to ~0–1% fills in some demo cases. Using known volume provides more realistic non-trivial fill%.

Acceptance (gated)
- API cURL sanity (date in demo slice, e.g., 2024-08-03):
  - `curl -fsS "http://127.0.0.1:8000/api/sites?date=2024-08-03&limit=25" | jq '[.[].fill_pct] | min, max'`
  - Expect non-trivial range (e.g., max ≥ 0.10) once BE microfix lands.
- Gated UI E2E spec (enabled only when asserting volume-fill semantics):
  - `cd ui/forecast-ui`
  - `E2E_ASSERT_VOLUME_FILL=1 E2E_BASE_URL=http://127.0.0.1:4173 npx playwright test tests/e2e/sites_volume_fill.spec.ts --workers=1 --reporter=line`

Commands (BE)
- `pytest -q`
- `pytest --maxfail=1 --disable-warnings -q --cov=scripts --cov=src --cov-report=term-missing:skip-covered`
- `behave --tags @smoke --no-capture --format progress`
- `python scripts/export_openapi.py --write && python scripts/export_openapi.py --check`

Refinements (gated, contract-neutral)
- Gate ON behavior uses the safer of two options for rows with `volume_m3` present:
  - Prefer max(existing_fill_pct, volume_fill_pct) where volume_fill_pct = (volume_m3×1000)/capacity_liters, clamped to [0..1].
  - This avoids lowering any existing values while making the gate effective even when `pred_volume_m3 > 0`.

Notes
- No API contract changes; only internal computation when `pred_volume_m3` is missing/placeholder.
- UI gating variable: `E2E_ASSERT_VOLUME_FILL=1` to enable stricter UI E2E assertions.

Next Steps
- BE microfix implementation behind tests; keep endpoints stable.
- Confirm demo date/window coverage; update triage doc if needed.
