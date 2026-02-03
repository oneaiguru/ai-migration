# Task: Forecasting Parity Follow-up (2025-10-30)

## Summary
Initial Step 6 UAT (2025-10-30) surfaced blocking gaps across trend data seeding and build/exceptions/absenteeism workflows. Goal was to close parity gaps and achieve a clean UAT pass — completed 2025-10-31 (see Execution notes below).

## Inputs
- UAT report: `docs/Tasks/uat/2025-10-26_forecasting-uat.md`
- Screenshot aliases: `docs/SCREENSHOT_INDEX.md`
- Guides:
  - UAT run book — `docs/System/forecasting-uat-guide.md`
  - Internal remediation — `docs/System/forecasting-remediation-guide.md`
- Plan baseline: `plans/2025-10-30_forecasting-analytics-parity-remediation.plan.md`

## Role expectations
### Scout
- Validate detailed requirements using the real-system screenshots (`forecasting-real-*`).
- Audit current React components:
  - `src/components/forecasting/build/BuildForecastWorkspace.tsx`
  - `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx`
  - `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`
  - `src/components/forecasting/trends/TrendAnalysisDashboard.tsx`
  - Fixtures/services in `src/data/forecastingFixtures.ts`, `src/services/forecastingApi.ts`
- Document gaps + open questions in this task file under **Findings** with code references.

### Planner
- Produce updated execution plan (`plans/YYYY-MM-DD_forecasting-analytics-parity-remediation-v2.plan.md`).
- Cover remediation items listed in `docs/System/forecasting-remediation-guide.md`.
- Enumerate validation stack (Vitest, smoke routes, UAT rerun) and documentation touchpoints.
- ✅ Plan delivered: `plans/2025-10-31_forecasting-analytics-parity-remediation-v2.plan.md`.
- ✅ Updated 2025-11-04: follow-on plan `plans/2025-11-04_forecasting-analytics-parity-remediation-v3.plan.md` covers timezone selector, trend configuration flow, absenteeism history, and accuracy/manual tab decision.

### Executor
- ✅ Completed 2025-10-31 — fixtures/services extended, build/exceptions/absenteeism rebuilt, trend defaults seeded, tests + validation stack run, prod deploy `https://forecasting-analytics-7jje4rjcj-granins-projects.vercel.app`, Step 6 UAT pass logged.

## Findings (2025-10-30 — resolved 2025-10-31)
- **Build forecast workflow** – Current UI only tracks a single history horizon and build period via `horizonId`/`granularity` (`src/components/forecasting/build/BuildForecastWorkspace.tsx:43-156`) and lacks the dual history + forecast selectors shown in the reference (`forecasting-real-build-form`). Queue selection renders as flat buttons with a static chevron (`src/components/forecasting/build/BuildForecastWorkspace.tsx:205-226`), so there is no expand/collapse state or child counts like the Naumen tree.
- **Exceptions editor** – The form forces the template into a single mode (`src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:43-48` and `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:177-179`), preventing operators from mixing one-off dates with repeating intervals the way `forecasting-real-exceptions-detail` illustrates. We also surface only one history horizon (`src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:45-46`) and never expose smoothing controls (`src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:33-37`).
- **Absenteeism workspace** – Component is limited to template CRUD (`src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:43-186`), so there is no calculator flow for horizon/interval selection or summary banner as seen in `forecasting-real-absenteeism-controls`. The CSV export helper even passes the template id as the queue id (`src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:129-145`), producing incorrect payloads.
- **Trend analysis defaults** – Dashboard falls back to hard-coded queue names (`src/components/forecasting/trends/TrendAnalysisDashboard.tsx:28-59`) and a moving 30-day window from “now” (`src/components/forecasting/trends/TrendAnalysisDashboard.tsx:95-107`), so the fixture timestamps drift and Step 6 captured blank charts until a queue/period was picked manually (`forecasting-real-trend-queue`). Trend data also ignores queue context by mapping one shared series everywhere (`src/components/forecasting/trends/TrendAnalysisDashboard.tsx:69-111`, `src/data/forecastingFixtures.ts:34-73`), which prevents the secondary-axis legend from reflecting per-queue metrics.
- **Fixtures & services** – Fixtures expose only a shallow queue tree (`src/data/forecastingFixtures.ts:14-55`) and no default trend metadata, while services still simulate exports (`src/services/forecastingApi.ts:104-207`) with no documented contract for build/import/export or absenteeism calculation hand-offs.

## Follow-up remediation (2025-10-31 review)
Quick wins we can deliver next pass to align closer with the real Naumen UI (see `/Users/m/Desktop/x/*.png` for prod references snapshot on 2025‑10‑31):

1. **Add manual horizon & build date pickers to “Построить прогноз”.** ✅ Delivered 2025‑10‑31b via `BuildForecastWorkspace.tsx`, types/fixtures/services, and `tests/forecasting/build.test.ts`. Reference: `0436b906-d4f8-426d-aad3-8b27d801c362.png`.

2. **Restore Day/Interval toggle + dual ranges on “Задать исключения”.** ✅ Delivered 2025‑10‑31b via `ExceptionsWorkspace.tsx`, fixtures/services, and `tests/forecasting/exceptions.test.ts`. Reference: `0dad8052-57ba-4c90-b076-d38d82cc572b.png`, `887f56bb-5ab7-423d-925a-4bb89b4405c2.png`.

3. **Add timezone selector + localized time handling (new)** – UI should let planners switch between Moscow (UTC+03) and regional zones such as Chelyabinsk (UTC+05); selections must drive the manual date pickers & payloads in build/exceptions so exported CSV timestamps reflect the chosen zone.

Deferred for a later sprint (larger scope, documented here so we don’t lose track):
- Trend dashboard should start blank until a queue/period is selected, with UI for defining period blocks (`3c11d236-1a8a-4ab0-930b-b27e1e7ebe43.png`).
- Absenteeism needs the summary banner + run-history table from prod (`bb02ae80-6abd-4f28-9575-af710a008f33.png`).
- Decide whether to hide Forecasting-specific accuracy/adjustments tabs (not present in Naumen portal) or keep them documented as demo-only enhancements.

## Open questions
- Confirm backend timeline and payload contracts for forecast build/import/export, absenteeism calculator, and trend data feeds so the current stubs in `src/services/forecastingApi.ts` can be swapped for live endpoints.
- When backend delivers real series, revisit seeded fixtures to ensure queue defaults match production volumes (current deterministic series documented in `src/data/forecastingFixtures.ts`).
