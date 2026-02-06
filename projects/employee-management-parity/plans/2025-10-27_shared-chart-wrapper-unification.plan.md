# Shared Chart/Wrapper Unification Plan — Analytics + Forecasting

Goal
- Converge Analytics Dashboard and Forecasting & Analytics onto a single set of shared wrappers/adapters for LineChart, BarChart (with view toggles), KpiCardGrid, ReportTable, and RU formatting helpers to eliminate duplicate implementations and stabilize behaviour.

Context
- See overlap evidence: `docs/Tasks/analytics-forecasting-overlap-discovery.md` (matrix + extraction candidates).
- Library code in this repo is currently frozen; this plan scopes changes within the demo repos first (consuming one canonical implementation) and prepares a later extraction into the shared library when allowed.

Scope
- Unify behaviour and props across both demos; visuals remain frozen.
- No changes to this repo’s library code in this pass; use the Forecasting implementations as canonical and refactor Analytics to consume them.

Non‑Goals
- No pixel tuning, colour/dash edits, or Storybook theming.
- No API wiring beyond what’s already stubbed in Forecasting (manual adjustments API remains mock).

Phases & Steps
1) Canonicalize forecasting wrappers/adapters (no behaviour change)
   - Stabilize public props for:
     - LineChart (dual axis, optional confidence band, legend metadata)
     - BarChart (viewToggle metadata for coverage/adherence/error buckets)
     - KpiCardGrid (numeric inputs + optional variant/trend flags; formatting done in adapters)
     - ReportTable (sticky header option, ReactNode cells, export badges)
     - RU formatting helpers (superset API across both repos)
   - Add/confirm unit tests for adapter outputs and prop contracts.

2) Refactor Analytics to consume canonical pieces
   - Replace local wrappers with imports from forecasting paths.
   - Map analytics adapters to the canonical adapter shapes (confidenceBand, secondaryAxis, KPI items, error series, table rows).
   - Remove duplicate helpers/wrappers in Analytics.

3) Compatibility layer (if needed)
   - Provide interim shims in Analytics for any props that differ (e.g., toolbar slots). Keep shims small and time‑boxed.

4) RU formatting unification
   - Replace analytics `format.ts` with the superset RU helper used by forecasting; port analytics tests.

5) Verification
   - Run unit tests for both repos.
   - Build + preview both repos; run UAT packs: `parity_static.md`, `chart_visual_spec.md` (behaviour only).
   - Confirm no console errors and identical behaviour vs prior loop.

6) Optional extraction (future, when library unfreezes)
   - Move canonical wrappers/adapters into the shared library (this repo) under `src/lib/{charts,utils}`.
   - Publish a minor version and point both demos at the shared package.

Acceptance Criteria
- Analytics builds and runs using the canonical forecasting wrappers/adapters with no behaviour regressions.
- Duplicate wrapper/format files removed from Analytics.
- RU numbers/dates identical across both demos.
- UAT packs Pass in both repos; no console errors.
- A follow‑up extraction plan documented (if/when library updates are permitted).

Docs To Update
- Analytics: CodeMap (file moves), UAT Findings, learning‑log, wrapper matrix, parity checklist.
- Forecasting: CodeMap (stabilized props/tests), learning‑log.
- Session handoff: brief summary with deploy URLs and outcomes.

Risks & Mitigations
- Prop drift during refactor → lock contracts with adapter/prop unit tests first.
- Routing differences (Forecasting) → finish routing fix plan before UAT comparison.

