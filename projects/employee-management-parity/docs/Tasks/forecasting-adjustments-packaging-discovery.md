# Forecasting Manual Adjustments — Packaging Discovery (Scout)

Role
- Scout (discovery only; no code changes)

Why
- The Forecasting demo implements a full Manual Adjustments flow (table, badges, undo/redo, validation). We want to package this feature for reuse (e.g., mount inside Analytics) without duplicating logic.

Where To Work (read‑only)
- Forecasting & Analytics repo: ${FORECASTING_ANALYTICS_REPO}
- Analytics Dashboard repo: ${ANALYTICS_REPO}

Required Reading
- docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md
- docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md
- docs/System/WRAPPER_ADOPTION_MATRIX.md
- docs/System/PARITY_MVP_CHECKLISTS.md

Scope Boundary
- Discovery only. Do not refactor or move code; propose packaging boundaries and contracts.
- Visuals frozen; focus on behaviour, data contracts, and mounting API.

What To Inspect (Forecasting repo)
- Components: `src/components/forecasting/ManualAdjustmentSystem.tsx` and any subcomponents.
- Adapters/services: `src/adapters/forecasting/adjustments.ts`, `src/services/forecastingApi.ts`.
- State/UX flows: selection pills, bulk ops, validation badges, undo/redo integration.
- Table wrapper: column config, ReactNode cells, sticky header/exports.

What To Inspect (Analytics repo)
- Mount points where adjustments could live (routes/nav), shared table usage, KPI context.

Quick Grep Map
- `rg -n "ManualAdjustmentSystem|adjustment|undo|redo|badge|validate|save" src`
- `rg -n "ReportTable|columns|export|sticky" src/components src/wrappers`

Deliverable (paste below)
- Packaging proposal with these sections:
  1) Component boundaries: which files/components form the module
  2) Data contract: props for initial dataset, validation/save callbacks, and result events
  3) UX contract: required UI affordances (selection, bulk ops, status badges, undo/redo)
  4) Table API: column schema, cell render contracts, export/sticky options
  5) Mounting contract: import surface (e.g., `{ ManualAdjustmentsRoot }`), minimal boot snippet, and required registrar calls
  6) Analytics integration points: route/menu entry, data sources, KPI updates
  7) Risks: API coupling, bundle size, a11y considerations
  8) Rollout plan: step order, tests/UAT, acceptance

Acceptance Criteria
- All 8 sections completed with file:line references for Forecasting sources.
- Clear, minimal mounting contract defined with example props and callback types.
- One-page rollout plan that an Executor can follow to mount the module in Analytics without duplicating logic.

Output Template

## 1) Component Boundaries
- Files/components:

## 2) Data Contract
- Props:
- Callbacks:
- Events:

## 3) UX Contract
- Selection/bulk ops:
- Status badges:
- Undo/redo:

## 4) Table API
- Columns schema:
- Cell render contracts:
- Export/sticky options:

## 5) Mounting Contract
- Import surface:
- Boot snippet:
- Registrar calls:

## 6) Analytics Integration Points
- Route/menu:
- Data sources:
- KPI updates:

## 7) Risks

## 8) Rollout Plan

