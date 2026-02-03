# PR-DEMO — Dual UI Demo (Complete E2E)

## Mission
Create two working UIs for Opus review:
1) Port 5173 — Accuracy dashboard (backtesting validation)
2) Port 5174 — MyTKO‑stack demo (integration proof)

Critical: ONE agent executes all 7 phases. No mid‑stream handoff.

---

## Scout Checklist & Index (read first)
- SOP + Agent guides
  - docs/SOP/policies.md
  - docs/System/AgentMode.md
  - CE magic prompts: CE_MAGIC_PROMPTS/{EXECUTE-WITH-MAGIC-PROMPT.md,PLAN-USING-MAGIC-PROMPT.md,RESEARCH-FOLLOWING-MAGIC-PROMPT.md,SIMPLE-INSTRUCTIONS.md}
- Backend (forecastingrepo)
  - App + endpoints: scripts/api_app.py
  - Algorithms: src/sites/{baseline.py,simulator.py,reconcile.py,schema.py}
  - Backtesting: scripts/{backtest_sites.py,backtest_eval.py}
  - Validation evidence: reviews/NOTES/eval.md, reports/site_backtest_Q*_2024/
  - OpenAPI: scripts/export_openapi.py, docs/api/openapi.json
  - Dev scripts: scripts/dev/local_demo_{up,down}.sh, scripts/dev/start_api.sh
  - BDD smokes: specs/bdd/features/*.feature, specs/bdd/features/steps/common_steps.py
- Frontend (Accuracy UI @5173)
  - /Users/m/git/clients/rtneo/ui/forecast-ui/src/components/{Overview,Districts,Sites}.tsx
  - /Users/m/git/clients/rtneo/ui/forecast-ui/src/types/api.ts
  - /Users/m/git/clients/rtneo/ui/forecast-ui/tests/e2e/*.spec.ts
- MyTKO expected type
  - /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/types.ts (ForecastDataFormat)
- Environment knobs
  - API_CORS_ORIGIN=http://127.0.0.1:4173
  - DEMO_DEFAULT_DATE=2024-08-03
  - Optional gate (BE demo only): SITE_FILL_FROM_VOLUME=1

Artifacts & evidence to produce
- Screenshots: ~/downloads/mytko-forecast-essential/screenshots/ (create if absent)
- Results: ~/downloads/mytko-forecast-essential/DEMO_RESULTS.md (see Phase 7)
- Repo notes: reviews/README_STATUS.md (BASE + curls)

---

## Phases (10–13 hours total)

### Phase 1 — Understand (30 min)
- Read: scripts/api_app.py, src/sites/{baseline.py,simulator.py,reconcile.py}, scripts/backtest_sites.py
- Read validation: reviews/NOTES/eval.md, reports/site_backtest_Q*_2024/
- Run locally
```
# API
uvicorn scripts.api_app:app --reload --port 8000
curl -fsS http://127.0.0.1:8000/api/metrics | jq '.'
# UI 5173
cd /Users/m/git/clients/rtneo/ui/forecast-ui && npm i && npm run dev
```
Checkpoint 1: API+UI reachable; no console errors.

### Phase 2 — Backend Accuracy (2–3 h)
Goal: Add /api/accuracy/* endpoints matching eval.md.
- Files to touch: scripts/api_app.py (+ unit tests under tests/api/accuracy/*)
- Endpoints
  - GET /api/accuracy/region?quarter=Q1_2024 → {region_wape, median_site_wape, sites_evaluated, distribution}
  - GET /api/accuracy/districts?quarter=Q1_2024 → ranking list
  - GET /api/accuracy/sites?quarter=Q3_2024&limit=50&offset=0 → {quarter,total_sites,sites:[…]}
- Source: reviews/NOTES/eval.md and CSVs under reports/site_backtest_Q*_2024/
- Validate
```
pytest -q tests/api/accuracy
curl -fsS 'http://127.0.0.1:8000/api/accuracy/region?quarter=Q1_2024' | jq '.'
```
Checkpoint 2: Values match eval.md (quoted in unit tests).

### Phase 3 — Frontend Accuracy (2–3 h) @5173
Goal: Overview/Districts/Sites tabs consume new endpoints.
- Files: /Users/m/git/clients/rtneo/ui/forecast-ui/src/components/{Overview,Districts,Sites}.tsx
- Changes
  - Overview: quarter selector; fetch /api/accuracy/region; render WAPE and distribution
  - Districts: fetch /api/accuracy/districts; ranking table
  - Sites: fetch /api/accuracy/sites; per‑site WAPE table
- Validate
```
cd /Users/m/git/clients/rtneo/ui/forecast-ui && npm run dev
# Visual check and existing Playwright smokes
```
Checkpoint 3: 5173 shows correct Q1–Q4 values per eval.md.

### Phase 4 — Backend Adapter (1 h)
Goal: Transform to MyTKO ForecastDataFormat.
- File: scripts/api_app.py (add /api/mytko/forecast)
- Read type: /Users/m/git/clients/rtneo/_incoming/.../types.ts (ForecastDataFormat)
- Validate: curl GET /api/mytko/forecast?site_id=S1&start_date=...&end_date=... | jq '.[0]'
Checkpoint 4: Adapter returns expected shape.

### Phase 5 — MyTKO Demo (3–4 h) @5174
Goal: Minimal React TS project using their widgets.
- Path: /Users/m/git/clients/rtneo/ui/mytko-forecast-demo
- Steps
```
mkdir -p /Users/m/git/clients/rtneo/ui/mytko-forecast-demo && cd $_
npm create vite@latest . -- --template react-ts
npm i mobx mobx-react-lite antd dayjs
# copy widgets from _incoming into src/_widgets/forecast/
# add a page that fetches /api/mytko/forecast and renders it
npm run dev -- --port 5174
```
Checkpoint 5: 5174 renders their widget with live adapter data.

### Phase 6 — Verify (1 h)
- API
```
python scripts/export_openapi.py --write && python scripts/export_openapi.py --check
pytest -q
behave --tags @smoke --no-capture --format progress
```
- UI 5173: run existing E2E; manually verify quarter selector and tables
- UI 5174: hit page; grab screenshots
Checkpoint 6: Tests green; screenshots captured in ~/downloads/mytko-forecast-essential/screenshots/.

### Phase 7 — Package (30 min)
- DEMO_RESULTS.md (append; create if missing)
```
mkdir -p ~/downloads/mytko-forecast-essential/screenshots
cat >> ~/downloads/mytko-forecast-essential/DEMO_RESULTS.md << 'EOF'
# Demo Results (Dual UI)
- 5173 Accuracy Dashboard: Q1–Q4 values match eval.md
- 5174 MyTKO Demo: widget renders from /api/mytko/forecast
- Screenshots: ./screenshots/
EOF
```
- Update repo notes
  - reviews/README_STATUS.md: add BASE + curls and pointers
Checkpoint 7: Results doc + screenshots present; handoff ready.

---

## Success Criteria
Must‑have
- 5173 shows Q1–Q4 WAPE matching eval.md
- District rankings match eval.md
- 5174 uses MyTKO widgets and renders
- /api/accuracy/* and /api/mytko/forecast work
- Screenshots and DEMO_RESULTS.md created
Nice‑to‑have
- Adapter code comments; small README in mytko demo

---

## Common Issues & Solutions
- CORS: ensure API_CORS_ORIGIN matches UI base
- Ports busy: kill preview processes or change port
- OpenAPI drift: run exporter and re‑check
- Widget import errors: stub MyTKO‑specific imports in demo

---

## Handoff Pattern
After each phase:
- Update reviews/README_STATUS.md with current BASE and curls
- Append screenshots to ~/downloads/mytko-forecast-essential/screenshots/
- Record results in DEMO_RESULTS.md
