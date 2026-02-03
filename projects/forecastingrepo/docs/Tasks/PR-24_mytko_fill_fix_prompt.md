# Prompt for Agent (PR-24 — MyTKO Fill Fix & Presets)

## Role
- UI/FE executor for PR-24. Goal: fix fill_pct gaps and curate presets in the MyTKO demo (port 5174) so demo shows partial fills across the entire week with matching date ranges.

## Required Reads
- SOP: `docs/SOP/standard-operating-procedures.md` (stack bring-up/verification section)
- Onboarding: `docs/System/Onboarding.md` (repo map + stack scripts)
- Demo data SOP: `docs/System/Demo_Data.md`
- Task spec: `docs/Tasks/PR-24_mytko_fill_fix_and_presets.md`
- Site catalog (candidates): `docs/Notes/demo_site_catalog.md`

## Repo/Layout
- Root: `/Users/m/git/clients/rtneo/forecastingrepo`
- MyTKO UI: `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo` (code)
- Stack scripts: `scripts/dev/start_stack.sh`, `scripts/dev/stop_stack.sh` (run from forecastingrepo root)
- Data subset (committed): `ui/mytko-forecast-demo/public/demo_data/containers_summary.csv` (regenerate via `backend/scripts/create_demo_subset.py` if permitted)

## Focus Files
- Presets: `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/constants/demoSites.ts`
- Fill hook: `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/hooks/useContainerHistory.ts`
- Page wiring: `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/pages/ForecastPage.tsx`
- Optional data regen: `/Users/m/git/clients/rtneo/forecastingrepo/scripts/create_demo_subset.py`, `reports/sites_demo/daily_fill_2024-07-01_to_2024-08-31.csv`

## What to Implement (from PR-24)
1) Curate presets to real partial-fill weeks (see PR-24 spec for suggested IDs/windows; drop flat 100% presets).
2) Add fill_pct fallback: if missing but forecast_m3 + vehicleVolume exist, compute fill_pct = forecast_m3 / vehicleVolume (clamp [0,1]).
3) Align RangePicker to preset window; optional hint when range has missing fill data.
4) (Optional) Regenerate demo subset if allowed; otherwise rely on curated presets.

## Commands
- Start stack: `cd /Users/m/git/clients/rtneo/forecastingrepo && API_PORT=8000 FORECAST_UI_PORT=4173 MYTKO_UI_PORT=5174 bash scripts/dev/start_stack.sh`
- Stop stack: `cd /Users/m/git/clients/rtneo/forecastingrepo && bash scripts/dev/stop_stack.sh`
- UI build: `cd /Users/m/git/clients/rtneo/ui/mytko-forecast-demo && npm run build`
- API check: `python scripts/export_openapi.py --check`
- Targeted test: `pytest -q tests/api/test_mytko_adapter.py` (already green; maintain)

## Deliverables
- Updated `demoSites.ts`, `useContainerHistory.ts`, `ForecastPage.tsx` (and data regen if done).
- Handoff entry in `docs/SESSION_HANDOFF.md` (changed paths, commands run, next steps).

## Acceptance
- Presets show non-100% fills across the full week; no “—” when forecast volume exists.
- RangePicker matches preset window; hint appears if fill data is missing.
- Stack start/stop and UI build succeed; no regression to WAPE card or history dialog.
