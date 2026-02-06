## Metadata
- Task: `PR-DEMO_dual_ui_complete` — dual UI delivery with accuracy + MyTKO demo (docs/Tasks/PR-DEMO_dual_ui_complete.md:3-133).
- Discovery: Reviewed accuracy briefs + raw CSVs (reports/site_backtest_Q*_2024), FastAPI surface (scripts/api_app.py:1-420), UI consumers (ui/forecast-ui/src/components/{Overview,Districts,Sites}.tsx), SOP (docs/SOP/policies.md:1-30), Agent guardrails (docs/System/AgentMode.md:1-32). `forecastingrepo/docs/SESSION_Hests/e2e/*.spec.ts` path does not exist — noted as a gap.
- Related docs: reviews/NOTES/eval.md:10-25 (quarterly targets), `_incoming/.../types.ts`:1-17 (ForecastDataFormat), CE Magic Prompts (tools/agentos/docs/System/CE_MAGIC_PROMPTS/*.md).

## Desired End State
- `/api/accuracy/region|districts|sites` serve quarter-filtered stats backed by `reports/site_backtest_Q*_2024` with graceful fallback constants.
- `/api/mytko/forecast` returns `ForecastDataFormat` rows derived from existing site forecasts (no contract changes elsewhere).
- UI 5173 surfaces accuracy data (quarter selector, district rankings, per-site WAPE table) using new endpoints; Playwright smokes cover the selector/table rendering.
- New Vite TS app at `ui/mytko-forecast-demo` (port 5174) renders the provided MyTKO widget using live adapter data.
- Tests: targeted pytest modules (`tests/api/accuracy/*`, adapter tests), UI unit hooks if needed, existing Playwright specs updated to assert accuracy content.

### Key Discoveries
- Accuracy scope + evidence sources defined in docs/Tasks/PR-DEMO_dual_ui_complete.md:58-132 and reviews/NOTES/eval.md:10-25.
- CSV artifacts already exist per quarter (reports/site_backtest_Q1_2024/*.csv etc.); structure matches loader needs (district_accuracy_summary.csv sample @ reports/site_backtest_Q1_2024/district_accuracy_summary.csv).
- Existing FastAPI app (scripts/api_app.py:1-420) already aggregates CSV data + uses env overrides; new endpoints can follow same pattern + share caching.
- UI Accuracy screens currently hard-code metrics + `/api/districts` (ui/forecast-ui/src/components/Overview.tsx:1-90, Districts.tsx:1-139, SiteAccuracy.tsx:1-29) — need rewiring to API.
- Adapter type is fixed (/_incoming/.../types.ts:1-17); MyTKO widget libs repeated under `_incoming/telegram_.../src/_widgets/route/forecast`.

## What We're NOT Doing
- No schema/shape changes for existing `/api/metrics`, `/api/districts`, `/api/sites`, or forecast routers.
- No database/storage writes; accuracy endpoints remain filesystem-backed.
- No permanent enablement of `SITE_FILL_FROM_VOLUME` (gate stays opt-in).
- No redesign of non-accuracy UI tabs (Routes, Registry, Plan assignments remain untouched).
- No production deployment or Cloudflare tunnel updates; focus on repo + local demos only.

## Implementation Approach
Reuse existing filesystem-read patterns:
1. Create `src/accuracy/loader.py` with utilities to locate quarter dirs, read CSVs (UTF-8/CP1251) and normalize decimals. Expose functions returning dicts used by FastAPI routes. Cache results via lru_cache for stability.
2. Extend `scripts/api_app.py` with new Pydantic models + GET handlers leveraging the loader; emit CSV when `format=csv` is requested. Attach tests using tmp_path fixtures replicating summary CSVs.
3. Update OpenAPI export + docs accordingly after endpoints + models change.
4. UI: introduce hooks/utilities (`useAccuracyQuarter`, `useAccuracySites`) pulling from `/api/accuracy/*`. Components gain quarter selector state + share data via context to avoid duplicate fetches. Update `SiteAccuracy` to render API-driven totals. Adjust TS types + validators.
5. Adapter: add dataclass/Pydantic model for MyTKO format, reuse `_find_sites_csv_for_date` to pull forecast rows filtered by site + date range; convert to `ForecastDataFormat`. Provide coverage verifying optional query params + fallback behaviors.
6. MyTKO demo: scaffold minimal Vite TS app under `ui/mytko-forecast-demo` with provided widget code + MobX store. Configure `package.json`, `tsconfig`, `vite.config.ts`, alias for `@/_widgets`. Provide fetch helper hitting `/api/mytko/forecast`. Keep dependencies minimal (react, mobx, antd, dayjs). Add README + npm scripts.

## Phase 2: Backend Accuracy Endpoints
### Overview
Implement `/api/accuracy/{region,districts,sites}` in FastAPI, backed by quarter CSVs. Provide unit tests + CSV fallback.

### Changes Required
1. **Accuracy loader module**
   - **File**: `src/accuracy/loader.py` (new)
   - **Changes**: Implement `QuarterAccuracy` dataclasses + helpers:
     - `_quarter_dir(quarter: str) -> Path`
     - `_read_csv(path, encoding_candidates=("utf-8","cp1251"))`
     - `load_region_accuracy(quarter)`, `load_district_accuracy(...)`, `load_site_accuracy(...)`
     - Fallback constant (dict from reviews/NOTES/eval.md lines 10-24) when files missing.
   - **Snippet**:
     ```commands
     apply_patch <<'PATCH'
     *** Add File: src/accuracy/loader.py
     +from __future__ import annotations
     +import csv, os
     +from functools import lru_cache
     +from pathlib import Path
     +from typing import Any, Iterable
     +
     +ACCURACY_BASE = Path(os.getenv("ACCURACY_REPORTS_DIR", "reports"))
     +QUARTER_FALLBACK = {...}  # parsed constants per eval.md
     +...
     PATCH
     ```
   - Include helper to normalize decimal commas:
     ```python
     def _to_float(value: str | None) -> float:
         if value is None:
             return 0.0
         return float(value.replace(",", "."))
     ```

2. **Tests fixtures**
   - **Files**: `tests/data/fixtures/accuracy/Q1_2024/{site_accuracy_summary.csv,...}` (tiny 5-row CSVs)
   - Create directories mirroring production file names with just a handful of rows covering distribution + district ranking.
   - Ensure values align with eval constants for assertions.

3. **Accuracy API handlers**
   - **File**: `scripts/api_app.py`
   - **Changes**:
     - Import loader functions + add new Pydantic models: `AccuracyDistributionBin`, `RegionAccuracyResponse`, `DistrictAccuracyRow`, `SiteAccuracyRow`, `SiteAccuracyEnvelope`.
     - Append GET routes after `/api/districts`.
     - Region endpoint: accepts `quarter: str = Query(None)` defaulting to latest available (helper). Returns JSON + optional CSV.
     - Districts endpoint: returns ranking sorted by `accuracy_pct` desc with pagination optional.
     - Sites endpoint: supports `limit`, `offset`, `quarter`, `search` (optional) with `X-Total-Count` header.
     - For CSV responses, reuse `PlainTextResponse` like existing code.
     - Ensure `SITE_FILL_FROM_VOLUME` logic unaffected.

4. **API tests**
   - **Dir**: `tests/api/accuracy/`
   - Add `conftest.py` fixture overriding env (`REPORTS_DIR`) to temp fixture dir.
   - Tests:
     - `test_region_accuracy_json_and_csv.py`: asserts JSON matches expected numbers + CSV header.
     - `test_district_accuracy_sorting_and_missing_quarter.py`: ensures 404/fallback behavior + ranking order.
     - `test_site_accuracy_paging_and_search.py`: covers limit/offset, header counts, search filter, fallback when quarter missing.
   - Use `monkeypatch.setenv("ACCURACY_REPORTS_DIR", str(tmp_path))`, copy fixture files there.

5. **OpenAPI + docs**
   - Run `python scripts/export_openapi.py --write`.
   - Update `docs/api/openapi.json` automatically by exporter; ensure plan references sedation.

### Tests & Validation (Phase 2)
```
pytest -q tests/api/accuracy
python scripts/export_openapi.py --write && python scripts/export_openapi.py --check
```

### Rollback
```
git rm -r src/accuracy tests/api/accuracy tests/data/fixtures/accuracy
git checkout -- scripts/api_app.py docs/api/openapi.json
```

## Phase 3: Frontend Accuracy (5173)
### Overview
Replace hard-coded demo accuracy with live API consumption, add quarter selector + tables per phase brief.

### Changes Required
1. **Type updates**
   - **File**: `ui/forecast-ui/src/types/api.ts`
   - Add interfaces: `ApiRegionAccuracy`, `ApiAccuracyDistributionBin`, `ApiDistrictAccuracyRow`, `ApiSiteAccuracyRow`, `ApiSiteAccuracyEnvelope`.
   - Ensure optional fields typed (`wape`, `accuracy_pct`, etc.).

2. **Hooks/utilities**
   - **Files**:
     - `ui/forecast-ui/src/hooks/useAccuracyQuarter.ts` (new) — centralizes quarter list + `useState`.
     - `ui/forecast-ui/src/hooks/useRegionAccuracy.ts`, `useDistrictAccuracy.ts`, `useSiteAccuracy.ts` (fetchers using `apiGet` w/ params + abort support).
   - Provide caching via React Query–style simple `useMemo` + `useEffect`.

3. **Overview component**
   - **File**: `ui/forecast-ui/src/components/Overview.tsx`
   - Inject quarter selector UI (dropdown) referencing available quarters (Q1–Q4 2024) with default from API or `DEMO_DEFAULT_DATE`.
   - Replace `useMetrics` usage with new hook or combine both (metrics card may still show monthly numbers). For accuracy chart, use `/api/accuracy/region`.
   - Render distribution bucket chart from response `distribution`.
   - Remove dead doc link from empty state.

4. **Districts component**
   - **File**: `ui/forecast-ui/src/components/Districts.tsx`
   - Replace `/api/districts` fetch with `/api/accuracy/districts`.
   - Use region quarter from shared hook for consistent selection.
   - Update table columns to show both `accuracy_pct` and `median_wape`.
   - Add mini-ranking badges (top/worst) based on actual accuracy.

5. **Sites component + SiteAccuracy**
   - **Files**:
     - `ui/forecast-ui/src/components/Sites.tsx`: add accuracy tab (toggle between forecast and accuracy). For plan scope, embed new section above existing table showing `SiteAccuracy` data retrieved via API (maybe show accuracy table under new card). Keep existing forecast UI intact.
     - `ui/forecast-ui/src/components/SiteAccuracy.tsx`: refactor to accept props or fetch `/api/accuracy/region` site stats + optionally render distribution.
   - Add collapsible panel listing top/bottom WAPE sites using `/api/accuracy/sites`.
   - Expose download CSV button hitting `/api/accuracy/sites?format=csv`.

6. **State sharing**
   - Provide `AccuracyContext` (new file) to share selected quarter between screens if they live in same page.

7. **E2E updates**
   - **Files**:
     - `ui/forecast-ui/tests/e2e/overview.spec.ts`: assert quarter selector exists, selecting Q2 updates stat text.
     - `ui/forecast-ui/tests/e2e/districts_table.spec.ts`: verify ranking rows show accuracy percentages.
     - `ui/forecast-ui/tests/e2e/sites_table.spec.ts` (or new spec) to ensure accuracy card renders WAPE values >0.

### Tests & Validation (Phase 3)
```
cd ui/forecast-ui
npm run lint
npm test -- --runInBand (if unit tests exist)
npx playwright test tests/e2e/overview.spec.ts tests/e2e/districts_table.spec.ts
```
(Enable API via local demo before running.)

### Rollback
```
git checkout -- ui/forecast-ui/src/{types/api.ts,components/Overview.tsx,components/Districts.tsx,components/Sites.tsx,components/SiteAccuracy.tsx}
git rm -r ui/forecast-ui/src/hooks/useAccuracy*
git checkout -- ui/forecast-ui/tests/e2e/{overview.spec.ts,districts_table.spec.ts,sites_table.spec.ts}
```

## Phase 4: Backend Adapter (/api/mytko/forecast)
### Overview
Expose adapter endpoint returning `ForecastDataFormat` from existing site forecast CSVs, with query params for site/date range and optional route_id.

### Changes Required
1. **Data helpers**
   - **File**: `scripts/api_app.py`
   - Add helper `_iter_site_forecast(site_id, start_date, end_date)` reusing `_find_sites_csv_for_date`.
   - Add `MyTKOForecastPoint` Pydantic model aligning with `_incoming` type.

2. **Endpoint**
   - `@app.get("/api/mytko/forecast", response_model=list[MyTKOForecastPoint])`.
    - Params: `site_id: str`, `start_date: str`, `end_date: str`, `vehicle_volume: float = Query(22.0)` etc.
    - Implementation:
      - Load rows for site + date range.
      - Compute `overallVolume` from `pred_volume_m3` (assume 1 m³ ≈ 1000 L; prefer `volume_m3` if available via routes). Document assumption.
      - `overallWeight` = `pred_volume_m3` (volume-first payload; no mass units).
     - `tripMeasurements` can stay `None`.
     - `isEmpty` true when `pred_volume_m3` == 0.
     - `isFact` false (forecast).

3. **Adapter tests**
   - **File**: `tests/api/test_mytko_adapter.py`
   - Use tmp CSV fixtures to simulate site forecasts (copy from `tests/data/fixtures/mytko/site_forecast.csv`).
   - Assert output keys + ordering + gating for `start_date` filters.

4. **OpenAPI update**
   - Rerun exporter to include new schema/path.

### Tests & Validation (Phase 4)
```
pytest -q tests/api/test_mytko_adapter.py
python scripts/export_openapi.py --write && python scripts/export_openapi.py --check
```

### Rollback
```
git rm tests/api/test_mytko_adapter.py tests/data/fixtures/mytko/*
git checkout -- scripts/api_app.py docs/api/openapi.json
```

## Phase 5: MyTKO Demo UI (5174)
### Overview
Create standalone Vite React TS project bundling MyTKO widget + adapter integration.

### Changes Required
1. **Project scaffold**
   - **Dir**: `ui/mytko-forecast-demo`
   - Files to create:
     - `package.json` (vite react-ts, scripts `dev`, `build`, `preview`).
     - `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` (set `server.port=5174`, alias `@` to `src`).
     - `index.html`, `src/main.tsx`, `src/App.tsx`.
     - `.eslintrc.cjs` if needed for lint parity.

2. **Widget import**
   - Copy `_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast` into `ui/mytko-forecast-demo/src/_widgets/route/forecast`.
   - Copy any supporting libs (`_features`, `_shared`) referenced by widget (see `_incoming/.../package.json` for deps). Keep tree minimal by importing only used modules.
   - Document provenance in `ui/mytko-forecast-demo/README.md`.

3. **MobX store + API glue**
   - **Files**:
     - `src/api/client.ts`: fetch wrapper hitting `/api/mytko/forecast`.
     - `src/stores/forecastStore.ts`: MobX store with `loadForecast`.
     - `src/pages/ForecastPage.tsx`: UI with selectors + widget provider.
   - Use environment variable `VITE_API_BASE` fallback to `http://127.0.0.1:8000`.

4. **Styling + assets**
   - Import Ant Design CSS in `src/main.tsx`.
   - Provide simple layout with site selector + date range.

5. **Scripts & docs**
   - Add `README.md` describing how to run (`npm install && npm run dev -- --port 5174`).
   - Add `.gitignore` (node_modules, dist).

### Tests & Validation (Phase 5)
```
cd ui/mytko-forecast-demo
npm install
npm run build
npm run dev -- --port 5174 # manual smoke & screenshot
```

### Rollback
```
rm -rf ui/mytko-forecast-demo
git checkout -- ui/.gitignore (if modified)
```

## Tests & Validation (Full Stack)
1. `python scripts/export_openapi.py --write && python scripts/export_openapi.py --check`
2. `pytest -q`
3. `pytest --maxfail=1 --disable-warnings -q --cov=scripts --cov=src --cov-report=term-missing:skip-covered`
4. `behave --tags @smoke --no-capture --format progress`
5. `scripts/dev/local_demo_up.sh` (start API/UI), then:
   - `curl -fsS http://127.0.0.1:8000/api/accuracy/region?quarter=Q3_2024 | jq '.'`
   - `curl -fsS 'http://127.0.0.1:8000/api/accuracy/sites?quarter=Q3_2024&limit=5' | jq '.'`
   - `curl -fsS 'http://127.0.0.1:8000/api/mytko/forecast?site_id=S1&start_date=2024-08-01&end_date=2024-08-07' | jq '.[0]'`
6. `cd ui/forecast-ui && npm run dev` (manual) + `npx playwright test tests/e2e/{overview,districts_table,sites_table}.spec.ts`
7. `cd ui/mytko-forecast-demo && npm run dev -- --port 5174` (manual verification + screenshots).

## Rollback (Global)
- `git reset --hard` (if allowed) or manually remove plan-related files per phase rollback then rerun tests to ensure cleanliness.

## Handoff
- After execution, update `forecastingrepo/docs/SESSION_HANDOFF.md` with entry referencing this plan (`plans/2025-11-08_pr-demo-dual-ui.plan.md`).
- Append validation logs + screenshots to `~/downloads/mytko-forecast-essential/` per task brief.
- Note non-existent `forecastingrepo/docs/SESSION_Hests/e2e` path if still unresolved for next agent.
