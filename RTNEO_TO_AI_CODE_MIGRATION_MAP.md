# RTNEO → AI Code Migration Map

Complete mapping showing where all code from `/Users/m/git/clients/rtneo` has been migrated to `/Users/m/ai/projects/`.

---

## 📋 Migration Summary

| Source (rtneo) | Destination (ai/projects) | Type | Status | Notes |
|---|---|---|---|---|
| `forecastingrepo/` | `forecastingrepo/` | Core | ✅ Migrated | Main forecasting engine (Python) |
| `ui/forecast-ui/` | `forecast-ui/` | UI | ✅ Migrated | Main React UI (with bug fixes) |
| `ui/mytko-forecast-demo/` | `mytko-forecast-demo/` | UI | ✅ Migrated | Alternative demo app |
| `docs/` | `rtneo-docs/` | Docs | ✅ Migrated | Public-facing documentation |
| `docs-internal/` | (Part of rtneo-docs) | Docs | ✅ Merged | Internal documentation |
| `ai-docs/` | `forecastingrepo/ai-docs/` | Docs | ✅ Migrated | AI agent documentation |
| `scripts/` | `rtneo-scripts/` | Scripts | ✅ Migrated | Utility scripts |
| `mock/` | `rtneo-mock/` | Testing | ✅ Migrated | Mock data and test fixtures |
| `reports/` | `rtneo-reports/` | Reports | ✅ Migrated | Backtest and evaluation reports |
| `ui/docs/` | `rtneo-ui-docs/` | Docs | ✅ Migrated | UI-specific documentation |

---

## 🗂️ Detailed File Mappings

### 1. Core Forecasting Engine

**Source**: `/Users/m/git/clients/rtneo/forecastingrepo/`
**Destination**: `/Users/m/ai/projects/forecastingrepo/`

```
RTNEO → AI/PROJECTS
forecastingrepo/
├── src/                           → src/
│   ├── sites/                      → sites/
│   │   ├── baseline.py             → baseline.py
│   │   ├── simulator.py            → simulator.py
│   │   ├── reconcile.py            → reconcile.py
│   │   └── schema.py               → schema.py
│   ├── plugins/                    → plugins/
│   └── __init__.py                 → __init__.py
├── scripts/                        → scripts/
│   ├── ingest_and_forecast.py      → ingest_and_forecast.py
│   ├── api_app.py                  → api_app.py (main API)
│   ├── backtest_eval.py            → backtest_eval.py
│   ├── backtest_sites.py           → backtest_sites.py
│   ├── routes_recommend.py         → routes_recommend.py
│   ├── quicklook_report.py         → quicklook_report.py
│   ├── weather_join_local.py       → weather_join_local.py
│   ├── eval/                       → eval/
│   ├── dev/                        → dev/
│   ├── health/                     → health/
│   └── bootstrap*.sh               → bootstrap*.sh
├── tests/                          → tests/
│   ├── api/                        → api/ (endpoint tests)
│   ├── backtest/                   → backtest/ (metrics tests)
│   ├── sites/                      → sites/
│   ├── routes/                     → routes/
│   ├── scripts/                    → scripts/
│   ├── unit/                       → unit/
│   └── viz/                        → viz/
├── scenarios/                      → scenarios/ (feature flags)
├── specs/                          → specs/ (architecture)
├── reports/                        → reports/ (artifacts)
│   └── backtest_consolidated_auto/ → backtest_consolidated_auto/
├── docs/                           → docs/ (full docs suite)
├── ai-docs/                        → ai-docs/ (agent docs)
├── requirements.txt                → requirements.txt
├── requirements-dev.txt            → requirements-dev.txt
├── README.md                       → README.md
├── CONTRIBUTING.md                 → CONTRIBUTING.md
├── .github/workflows/              → .github/workflows/ (CI/CD)
└── [ALL OTHER FILES]               → [EXACT COPY]
```

**Key Files** (no changes during migration):
- `src/sites/*.py` — Site logic (baseline, sim, reconcile)
- `scripts/api_app.py` — FastAPI server (main API endpoint)
- `scripts/backtest_*.py` — Metrics calculation
- `tests/` — Test suite (≥85% coverage)
- `scenarios/*.yml` — Feature flags
- `docs/System/*.md` — System documentation
- `docs/data/*.md` — Data contracts

**Status**: ✅ Complete copy with no logic changes

---

### 2. Main Forecasting UI (forecast-ui)

**Source**: `/Users/m/git/clients/rtneo/ui/forecast-ui/`
**Destination**: `/Users/m/ai/projects/forecast-ui/`

```
RTNEO/ui/forecast-ui/ → AI/projects/forecast-ui/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              → Layout.tsx
│   │   ├── Sidebar.tsx             → Sidebar.tsx
│   │   ├── Overview.tsx            → Overview.tsx
│   │   ├── Districts.tsx           → Districts.tsx
│   │   ├── Sites.tsx               → Sites.tsx
│   │   └── Routes.tsx              → Routes.tsx
│   ├── data/
│   │   └── metrics.ts              → metrics.ts
│   ├── App.tsx                     → App.tsx
│   ├── main.tsx                    → main.tsx
│   └── index.css                   → index.css
├── docs/                           → docs/
├── public/                         → public/
├── package.json                    → package.json
├── vite.config.ts                  → vite.config.ts
├── tsconfig.json                   → tsconfig.json
├── tailwind.config.js              → tailwind.config.js
├── .prettierrc                     → .prettierrc
├── .eslintrc.cjs                   → .eslintrc.cjs
├── .githooks/                      → .githooks/
├── README.md                       → README.md ✨ (with migration notes)
├── NEXT_AGENT_HANDOFF.md           → NEXT_AGENT_HANDOFF.md
├── REVIEW_GUIDE.md                 → REVIEW_GUIDE.md
├── REVIEW_CHECKLIST.md             → REVIEW_CHECKLIST.md
├── CHANGES.md                      → CHANGES.md
├── HOWTO_E2E.md                    → HOWTO_E2E.md
├── AFTER_DEMO_PLAN.md              → AFTER_DEMO_PLAN.md
├── vercel.json                     → vercel.json
├── .env.local.example              → .env.local.example
└── [ALL OTHER FILES]               → [EXACT COPY]
```

**Status**: ✅ Migrated with bug fixes (see CHANGES.md)

**Changes During Migration**:
- Bug fixes for Vite compatibility
- Updated component imports
- Fixed environment variable handling
- Improved type definitions

---

### 3. MyTKO Forecast Demo (mytko-forecast-demo)

**Source**: `/Users/m/git/clients/rtneo/ui/mytko-forecast-demo/`
**Destination**: `/Users/m/ai/projects/mytko-forecast-demo/`

```
RTNEO/ui/mytko-forecast-demo/ → AI/projects/mytko-forecast-demo/
├── src/
│   ├── components/                 → components/
│   ├── stores/                     → stores/ (MobX state)
│   ├── App.tsx                     → App.tsx
│   ├── main.tsx                    → main.tsx
│   └── [OTHER COMPONENTS]          → [EXACT COPY]
├── public/                         → public/
├── package.json                    → package.json
├── vite.config.ts                  → vite.config.ts
├── tsconfig.json                   → tsconfig.json
├── README.md                       → README.md
├── AGENTS.md                       → AGENTS.md
└── [ALL OTHER FILES]               → [EXACT COPY]
```

**Status**: ✅ Migrated (alternative UI using MobX + Ant Design)

---

### 4. Documentation

#### 4a. Public Docs

**Source**: `/Users/m/git/clients/rtneo/docs/`
**Destination**: `/Users/m/ai/projects/rtneo-docs/`

```
RTNEO/docs/ → AI/projects/rtneo-docs/
├── System/                         → System/
│   ├── Overview.md                 → Overview.md
│   ├── Onboarding.md               → Onboarding.md
│   ├── API_Endpoints.md            → API_Endpoints.md
│   ├── Forecasting_UI.md           → Forecasting_UI.md
│   ├── Monorepo_Plan.md            → Monorepo_Plan.md
│   ├── Health_Checks.md            → Health_Checks.md
│   ├── CI_CD.md                    → CI_CD.md
│   ├── Release.md                  → Release.md
│   ├── Testing.md                  → Testing.md
│   ├── Demo_Runbook.md             → Demo_Runbook.md
│   ├── Quicklook.md                → Quicklook.md
│   ├── Repo_Layout.md              → Repo_Layout.md
│   ├── Repo_Map.md                 → Repo_Map.md
│   └── [OTHER SYSTEM DOCS]         → [EXACT COPY]
├── adr/                            → adr/ (Architecture Decisions)
│   ├── DECISIONS_INDEX.md          → DECISIONS_INDEX.md
│   ├── ADR-*.md                    → ADR-*.md
│   └── [ALL ADRs]                  → [EXACT COPY]
├── Tasks/                          → Tasks/
│   ├── NEXT_AGENT_BRIEF.md         → NEXT_AGENT_BRIEF.md
│   ├── PR-*.md                     → PR-*.md
│   ├── HANDOFF_LOG.md              → HANDOFF_LOG.md
│   └── [ALL TASK DOCS]             → [EXACT COPY]
├── data/                           → data/
│   ├── DATA_CONTRACTS.md           → DATA_CONTRACTS.md
│   ├── SITE_DATA_CONTRACT.md       → SITE_DATA_CONTRACT.md
│   ├── WEATHER_DATA_CONTRACT.md    → WEATHER_DATA_CONTRACT.md
│   └── [DATA DOCS]                 → [EXACT COPY]
├── architecture/                   → architecture/
│   └── VDD.md                      → VDD.md
└── [ALL OTHER DOCS]                → [EXACT COPY]
```

**Note**: Also stored in `forecastingrepo/docs/` for monorepo organization

**Status**: ✅ Migrated (no content changes)

#### 4b. Internal Docs

**Source**: `/Users/m/git/clients/rtneo/docs-internal/`
**Destination**: Merged into `rtneo-docs/` and `forecastingrepo/docs/`

**Status**: ✅ Merged

#### 4c. UI Docs

**Source**: `/Users/m/git/clients/rtneo/ui/docs/`
**Destination**: `/Users/m/ai/projects/rtneo-ui-docs/`

```
RTNEO/ui/docs/ → AI/projects/rtneo-ui-docs/
├── [ALL UI DOCUMENTATION]          → [EXACT COPY]
```

**Status**: ✅ Migrated

#### 4d. AI Agent Docs

**Source**: `/Users/m/git/clients/rtneo/ai-docs/`
**Destination**: `/Users/m/ai/projects/forecastingrepo/ai-docs/`

```
RTNEO/ai-docs/ → AI/projects/forecastingrepo/ai-docs/
├── ORIGINALS_INDEX.md              → ORIGINALS_INDEX.md
├── PRODUCT_DOCS_INDEX.md           → PRODUCT_DOCS_INDEX.md
├── TELEGRAM_ZIPS_REPORT.md         → TELEGRAM_ZIPS_REPORT.md
├── pro_messages/                   → pro_messages/
│   ├── PRO1.md                     → PRO1.md
│   ├── PRO2.md                     → PRO2.md
│   └── [AGENT DOCS]                → [EXACT COPY]
└── [ALL AI DOCS]                   → [EXACT COPY]
```

**Status**: ✅ Migrated

---

### 5. Scripts & Utilities

**Source**: `/Users/m/git/clients/rtneo/scripts/`
**Destination**: `/Users/m/ai/projects/rtneo-scripts/`

```
RTNEO/scripts/ → AI/projects/rtneo-scripts/
├── [ALL UTILITY SCRIPTS]           → [EXACT COPY]
```

**Status**: ✅ Migrated

---

### 6. Mock Data & Testing

**Source**: `/Users/m/git/clients/rtneo/mock/`
**Destination**: `/Users/m/ai/projects/rtneo-mock/`

```
RTNEO/mock/ → AI/projects/rtneo-mock/
├── disp/                           → disp/
├── task/                           → task/
└── [ALL MOCK DATA]                 → [EXACT COPY]
```

**Status**: ✅ Migrated

---

### 7. Reports & Artifacts

**Source**: `/Users/m/git/clients/rtneo/reports/`
**Destination**: `/Users/m/ai/projects/rtneo-reports/`

```
RTNEO/reports/ → AI/projects/rtneo-reports/
├── site_backtest_candidate/        → site_backtest_candidate/
└── [ALL REPORTS]                   → [EXACT COPY]
```

**Status**: ✅ Migrated

---

## 🔄 Migration Tracking Files

The following JSON files track the migration state:

```
/Users/m/ai/projects/
├── branch_state_clients_rtneo_docs.json     # Tracks rtneo docs import
├── branch_state_clients_rtneo_ui_docs.json  # Tracks rtneo UI docs import
```

These contain:
- Import branch names
- Commit hashes
- Timestamps
- File lists

---

## ✅ Verification Checklist

- [x] **forecastingrepo/** — Complete Python engine (identical)
- [x] **forecast-ui/** — React UI (with bug fixes)
- [x] **mytko-forecast-demo/** — Alternative demo app (identical)
- [x] **rtneo-docs/** — All public documentation (identical)
- [x] **rtneo-ui-docs/** — UI documentation (identical)
- [x] **rtneo-scripts/** — Utility scripts (identical)
- [x] **rtneo-mock/** — Mock data (identical)
- [x] **rtneo-reports/** — Reports and artifacts (identical)
- [x] **forecastingrepo/ai-docs/** — Agent documentation (identical)
- [x] **forecastingrepo/docs/** — System documentation (identical)

---

## 🔗 Related AI Projects

These projects also use/reference rtneo code:

| Project | Purpose | Uses |
|---------|---------|------|
| `GenAICodeUpdater` | Code update utilities | Scripts logic |
| `tuings` | Testing utilities | Test patterns |
| `qbsf` | Related project | Some shared patterns |

---

## 📊 Statistics

| Category | Source Count | Destination Count | Status |
|----------|---|---|---|
| **Python Files** (src + scripts) | ~50+ | ~50+ | ✅ Complete |
| **Test Files** | ~30+ | ~30+ | ✅ Complete |
| **TypeScript Files** (UI) | ~15+ | ~15+ | ✅ Complete |
| **Documentation Files** | ~100+ | ~100+ | ✅ Complete |
| **Configuration Files** | ~20+ | ~20+ | ✅ Complete |

---

## 🎯 Key Insights

### What Changed During Migration
1. **forecast-ui**: Bug fixes for Vite bundler compatibility
2. **Documentation**: Unified into `/projects/forecastingrepo/docs/`
3. **Organization**: Separated concerns (UI, backend, docs, scripts)

### What Stayed the Same
1. **Core Logic**: All Python forecasting logic unchanged
2. **API Contract**: API endpoints frozen (v0)
3. **Test Coverage**: ≥85% maintained
4. **Data Contracts**: No breaking changes

### Monorepo Plan
- Eventually: `packages/core` (Python) + `apps/api` + `apps/ui`
- Currently: Still in separate directories but coordinated

---

## 📍 Summary Table

```
RTNEO Location                    → AI/PROJECTS Location               → Type
────────────────────────────────────────────────────────────────────────────
forecastingrepo/                  → forecastingrepo/                   Python engine
forecastingrepo/ai-docs/          → forecastingrepo/ai-docs/           Agent docs
ui/forecast-ui/                   → forecast-ui/                       React UI
ui/mytko-forecast-demo/           → mytko-forecast-demo/               Demo UI
ui/docs/                          → rtneo-ui-docs/                     UI docs
docs/                             → rtneo-docs/ + forecastingrepo/docs Docs
docs-internal/                    → rtneo-docs/                        Internal docs
scripts/                          → rtneo-scripts/                     Utilities
mock/                             → rtneo-mock/                        Test data
reports/                          → rtneo-reports/                     Artifacts
```

---

**Status**: ✅ All code from rtneo successfully migrated to ai/projects/
**Last Verified**: 2025-12-27
**Maintainability**: All source locations documented and trackable
