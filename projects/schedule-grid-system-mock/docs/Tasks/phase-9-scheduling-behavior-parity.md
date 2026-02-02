# Phase 9 — Scheduling Behavior Parity (Discovery)

> Role: Scout (analysis only; no code). Visuals are frozen — focus strictly on behavior.

## Context
- Keep planning/notes in employee-management-parity. This scheduling repo remains code-first; this single task file is added for Scout execution only.
- Code target (read-only for Scout): `../schedule-grid-system-mock` (this repo)
- Library API reference (read-only): `../employee-management-parity/src/components/charts/*`, `../employee-management-parity/src/utils/charts/*`
- Absolute paths (fallback if relative paths fail):
  - `/Users/m/git/client/employee-management-parity/src/components/charts/`
  - `/Users/m/git/client/employee-management-parity/src/utils/charts/`
- Live URL (if accessible): https://schedule-grid-system-mock-7hx5y0g9x-granins-projects.vercel.app

## Required Reading
- `docs/CH5_chart_mapping.md` (this repo)
- This task: `docs/Tasks/phase-9-scheduling-behavior-parity.md`
- Reference API (read-only): paths above
- UAT style (reference only): employee-management-parity `docs/Tasks/uat-packs/PromptUATparity.md`, `docs/Tasks/uat-packs/trimmed_smoke.md`

## What To Inspect (read-only)
- Chart overlay code: `src/components/ChartOverlay.tsx`, `src/components/ForecastChart.tsx`
- Wrappers: `src/components/charts/{LineChart,BarChart,KpiCardGrid,ReportTable}.tsx`
- Utilities: `src/utils/charts/{register.ts,format.ts,adapters.ts}`
- Stories/tests as behavior truth: `src/components/charts/__stories__/*.stories.tsx`, `tests/unit/charts/*.spec.ts`

## What To Figure Out (behavior only)
- Day/Period toggle: current state; simplest adapter to group day→period; where toggle lives in `ChartOverlay`/`ForecastChart`.
- Coverage/Adherence toggle: confirm status; propose wrappers’ `viewToggle`/`activeViewId` with stable series IDs.
- KPI tiles: where to place `KpiCardGrid` and which values derive from active datasets (coverage, adherence, SL).
- Σ / 123 overlay: how to overlay headcount/FTE series without changing visuals.
- A11y: confirm wrappers expose `ariaTitle`/`ariaDesc`; outline keyboardable toggle approach.
- Empty/Error: confirm wrapper states and how overlay surfaces them.
- RU: confirm registrar/formatters cover RU dates/numbers across stories.

## Acceptance Criteria for Discovery
- [ ] Current state documented with file:line refs for all 8 behaviors:
  - Day/Period toggle
  - Coverage/Adherence toggle
  - KPI tiles
  - Σ / 123 overlay
  - Tooltips
  - Legend
  - Accessibility (ariaTitle/ariaDesc; keyboardable toggles)
  - Empty/Error states
- [ ] Proposed mapping includes adapter shape or series ID strategy for Day/Period and Coverage/Adherence toggles (design only; no code)
- [ ] KPI computation notes specify which dataset fields feed coverage/adherence/SL values
- [ ] Open questions listed (e.g., “Where should Day/Period toggle live in the UI?”)
- [ ] No code written; Discovery is analysis only

## Scope Boundary
- Do not propose or change colors, fonts, dash patterns, legend placement, or axis styling.
- Behavior only: datasets shown, toggle logic, a11y wiring, RU formatting, empty/error handling.

## Deliverables (in this file; no code changes)
- Fill the Discovery section below with:
  - Current state summary (exists vs. missing) with `file:line` refs in this repo
  - Proposed mapping for Day/Period and Coverage/Adherence toggles (adapter shape or series ID strategy)
  - KPI computation notes (which dataset fields; when to refresh)
  - Σ/123 overlay sketch (series names/units; how to switch)
  - A11y/empty/error considerations
  - Open questions blocking Planner
- Optional: add a short “Proposed Implementation Map” here (behavior only).

## Discovery (to be completed by Scout)
- Current State:
  - Day/Period toggle →
  - Coverage/Adherence toggle →
  - KPI tiles →
  - Σ / 123 overlay →
  - Tooltips →
  - Legend →
  - A11y (titles/descriptions, keyboard toggles) →
  - Empty/Error →
- Proposed Mapping:
  - Day/Period adapter shape →
  - Coverage/Adherence series ID strategy →
  - KPI values source fields →
  - Σ / 123 overlay approach →
  - A11y wiring + RU formatters →
  - Empty/Error surfacing →
- Open Questions:
  - →

## Handoff
- When Discovery is complete, ping Planner to author `plans/YYYY-MM-DD_scheduling-behavior-parity.plan.md` (in employee-management-parity) with exact edits/tests/deploy/rollback for this repo. Visuals remain frozen until UAT returns.
