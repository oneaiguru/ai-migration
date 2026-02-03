# Sites Data Sanity — Triage (No Code Change)

Scope
- Document and triage the observed issues on the Sites screen without changing code. Produce reproducible evidence and propose BE/UI acceptance checks.

Symptoms (observed)
- Many rows show fill ≈ 0–1% even on demo days.
- Average predicted mass tile ("Средняя прогноз. масса") looks too low and inconsistent with expectations.
- Intermittently, the table shows “Нет данных по площадкам на выбранную дату.”
- A dead “Документация” link was present in the empty state (removed in this commit to avoid confusion).

Hypotheses
1) Date coverage gap: the chosen date is outside the window for which `/api/sites` has demo rows (common when picking dates beyond 2024‑08‑01..07).
2) Filters eliminate rows: district or risk filters drop results to zero; page has fewer than pageSize items.
3) Units/scale mismatch: BE returns `fill_pct` already in 0..1 (correct), but data generation skews to near‑zero for demo rows; or BE produces constant `pred_mass_kg` seed values for placeholder rows.
4) Pagination/window mismatch: UI requests `limit/offset` correctly, but BE windowed join returns very few rows for the picked date.

Verification (copy‑paste, local default)
```bash
API_BASE=http://127.0.0.1:8000
# 1) Metrics + demo date (ground truth date)
curl -fsS "$API_BASE/api/metrics" | jq '{demo_default_date, region_wape, district_wape}'

# 2) Sites for several dates in demo week
for d in 2024-08-01 2024-08-03 2024-08-04 2024-08-07; do
  echo "== $d =="; curl -fsS "$API_BASE/api/sites?date=$d&limit=5" | jq '.[0:5]'; done

# 3) Count rows quickly (expect >0 on some dates)
curl -fsS "$API_BASE/api/sites?date=2024-08-03&limit=1000&offset=0" | jq 'length'

# 4) Spot-check fill/mass ranges for one date
curl -fsS "$API_BASE/api/sites?date=2024-08-03&limit=100&offset=0" \
  | jq '[.[].fill_pct] | min, max, (map(select(.!=null))|length)'
curl -fsS "$API_BASE/api/sites?date=2024-08-03&limit=100&offset=0" \
  | jq '[.[].pred_mass_kg] | min, max'
```

Acceptance (triage outcome)
- Evidence shows which demo dates have non‑empty sites and realistic ranges for `fill_pct` and `pred_mass_kg`.
- Document the chosen “good” demo date(s) in `reviews/README_STATUS.md` and `ui/forecast-ui/docs/SOP/TEST_RUN_SOP.md` as a note for UI reviewers.
- If BE confirms data sparsity or placeholder seeds, record it in `reviews/NOTES/api.md` and keep UI unchanged (demo‑safe).

UI Notes (unchanged behaviour)
- `FillBar` expects `fill_pct` in 0..1 and displays `%` correctly; near‑zero values render as 0–1%.
- "Средняя прогноз. масса" is the simple average of `pred_mass_kg` over returned rows; with few rows or placeholder values it can look low.
- Empty state now shows only the message (dead link removed).

Next Steps (if BE confirms data constraints)
- Option A (Docs only): call out “demo sample” in Sites empty/low state via a tooltip (no data contract change).
- Option B (Post‑demo): provide a minimal per‑site forecast window used by `/api/sites` so that demo dates return fuller data.
- Option C (Optional UI refinement): compute average over all fetched pages (requires a BE count endpoint or paging loop; not in demo scope).

Provenance
- UI files referenced: `src/components/Sites.tsx`, `src/components/shared/FillBar.tsx`, `src/hooks/useSitesData.ts`, `src/types/api.ts`.
- Related BE references: `reviews/README_STATUS.md`, `reviews/DEMO_FREEZE.md`, `docs/api/openapi.json`.

