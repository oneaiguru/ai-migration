# PR-24 — MyTKO Demo: Fix Fill Bars & Presets

## Goal
Make the MyTKO demo (port 5174) reliably show partial fills and matching date ranges by (a) fixing `fill_pct` gaps and (b) curating presets to weeks with real data.

## Symptoms
- Many presets still show 100% fill or blank bars after day 3–7.
- Date range (e.g., 05–15 July) extends past the days where `fill_pct` exists; rows render “—” after day 7.
- Some presets (38105070, 38100003) are flat 100%.

## Requirements
1) Curate presets to real partial-fill weeks
   - Replace the preset list with sites/windows that have non-100% fills across the full week. Use the vetted examples (update as needed):
     - 38111698 — 2024-07-01→2024-07-07 (fill ~1–83%)
     - 38116709 — 2024-07-01→2024-07-07 (fill ~3–23%)
     - 38117601 — 2024-07-01→2024-07-07 (fill ~3–23%)
     - 38106891 — 2024-07-01→2024-07-07 (fill ~3–23%)
     - 38123189 — 2024-07-01→2024-07-07 (fill ~3–23%)
     - 38122820 — 2024-07-01→2024-07-07 (fill ~3–23%)
     - 38122054 — 2024-07-01→2024-07-07 (fill ~3–23%)
     - 38121851 — 2024-07-01→2024-07-07 (fill ~3–23%)
   - Drop/disable flat 100% presets (38105070, 38100003, 38104949, etc.) unless you regenerate data.

2) Fill_pct fallback
   - In `ui/mytko-forecast-demo/src/hooks/useContainerHistory.ts`, when `fill_pct` is missing but `forecast_m3` and `vehicleVolume` are present, compute `fill_pct = forecast_m3 / vehicleVolume` (clamp to [0,1]) so bars never render “—” for days with forecast volume.

3) Align RangePicker to actual data
   - For each preset selection, set the RangePicker to the curated window (do not default to longer spans). Keep manual override intact.
   - If >3 days in the range have missing fill, show a small inline hint (e.g., “Нет данных заполнения после 07.07 — выберите более короткий диапазон”).

4) Optional (if data can be refreshed)
   - Regenerate `reports/sites_demo/daily_fill_2024-07-01_to_2024-08-31.csv` with volume-first fill_pct and rerun `scripts/create_demo_subset.py` to populate `ui/mytko-forecast-demo/public/demo_data/containers_summary.csv`. If not allowed, rely on curated presets above.

## Files to read/edit (absolute paths)
- Presets / gallery data:
  - `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/constants/demoSites.ts`
  - `/Users/m/git/clients/rtneo/docs/Notes/demo_site_catalog.md` (for additional candidates)
- Fill hook:
  - `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/hooks/useContainerHistory.ts`
- Page wiring:
  - `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/pages/ForecastPage.tsx`
- Data regeneration (optional):
  - `/Users/m/git/clients/rtneo/forecastingrepo/scripts/create_demo_subset.py`
  - `/Users/m/git/clients/rtneo/forecastingrepo/reports/sites_demo/daily_fill_2024-07-01_to_2024-08-31.csv`

## Steps (single agent)
1) Update `demoSites.ts` to the curated list above; set default preset to a partial-fill site (e.g., 38111698 2024-07-01→07).
2) Add the `fill_pct` fallback in `useContainerHistory` (derive from forecast_m3/vehicleVolume if missing).
3) Ensure `ForecastPage.tsx` sets RangePicker to the preset window and shows a hint when fill data is missing.
4) (Optional) Regenerate demo subset if allowed; otherwise skip.
5) Rebuild UI: `cd /Users/m/git/clients/rtneo/ui/mytko-forecast-demo && npm run build`.
6) Start stack: `cd /Users/m/git/clients/rtneo/forecastingrepo && API_PORT=8000 FORECAST_UI_PORT=4173 MYTKO_UI_PORT=5174 bash scripts/dev/start_stack.sh`; verify 4173/5174 load and a curated site shows partial fills across the entire range. Stop with `bash scripts/dev/stop_stack.sh`.
7) Update `docs/SESSION_HANDOFF.md` with what changed and commands run.

## Acceptance
✔️ Each preset shows fill bars <100% across the whole week; no “—” in rows when forecast volume exists.  
✔️ RangePicker matches the preset window; hint appears if a range has missing fill data.  
✔️ Stack start/stop works; UI builds cleanly.  
✔️ No regression to WAPE card or history dialog.
