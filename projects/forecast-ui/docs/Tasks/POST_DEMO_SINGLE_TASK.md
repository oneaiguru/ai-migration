# Post‑Demo Single Task — UI Consolidated Checklist

Role: UI Executor (post‑demo). Scope: UI only; no backend changes.

Goal
- Address all UI review follow‑ups in one actionable task, with clear acceptance and references.

References (read before execution)
- /Users/m/git/clients/rtneo/forecastingrepo/reviews/20251105/ui_components/1_feedback/UI_Components_Code_Review_Report.md:1
- /Users/m/git/clients/rtneo/forecastingrepo/reviews/20251105/ui_components/2_followup/ui_components.md:1
- /Users/m/git/clients/rtneo/forecastingrepo/reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/README.md:1
- /Users/m/git/clients/rtneo/ui/forecast-ui/reviews/COORDINATOR_DROP_UI.md:1

Done (no action needed)
- Navigation parity (Sidebar ↔ Tabs) fixed: `src/components/Sidebar.tsx:1`, `src/components/Layout.tsx:1`.
- CSV download UX (loading/disabled + inline error) present: `src/components/Routes.tsx:1`, `src/components/RoutesTable.tsx:1`.
- Shared atoms extracted: `src/components/shared/{RiskBadge.tsx,FillBar.tsx}`.
- Routes fallback logic implemented: `src/hooks/useRoutesData.ts:1`.
- Demo SiteAccuracy tiles (PRO Section F) added: `public/accuracy_demo.json`, `src/components/SiteAccuracy.tsx`, mounted in `src/components/Sites.tsx:1`.

Tasks (execute after demo)
1) Accessibility and keyboard navigation [TODO]
   - Tabs/sidebar: add role attributes, aria-selected, and Enter/Space key handlers.
   - Acceptance: keyboard-only navigation works across tabs; axe has no role/selection violations on tabs/sidebar.
   - Reference: ui_components review (a11y) — 1_feedback/UI_Components_Code_Review_Report.md:1

2) Improve CSV feedback semantics [TODO]
   - Add `aria-live="polite"` to CSV status in `RoutesTable` (message span), keep inline status in `Routes`.
   - Acceptance: screen readers announce CSV status changes in both table and cards views.
   - Reference: ui_components review (CSV feedback) — 1_feedback/UI_Components_Code_Review_Report.md:1

3) Data fetch cohesion in RoutesTable [TODO]
   - Pass sites data from parent or adopt React Query for routes+sites to avoid brief staleness on date changes.
   - Acceptance: changing date does not show mismatched routes/sites; no duplicate network calls for the same date.
   - Reference: ui_components review (race condition note) — 1_feedback/UI_Components_Code_Review_Report.md:1

4) Pagination/virtualization for large tables [TODO]
   - Add simple pagination or `react-window` to Sites and Routes table views.
   - Acceptance: rendering remains smooth with 500+ rows; initial render < 100ms on typical demo data.
   - Reference: ui_components review (performance) — 1_feedback/UI_Components_Code_Review_Report.md:1

5) Retry/backoff helper for API [TODO]
   - Add `apiGetWithRetry` wrapper with exponential backoff; use in non-idempotent sensitive flows conservatively.
   - Acceptance: transient failures succeed on retry up to N=3; no infinite loops; errors still surface.
   - Reference: ui_components review (retry suggestion) — 1_feedback/UI_Components_Code_Review_Report.md:1

6) Loading skeletons [TODO]
   - Replace text “Загрузка…” with lightweight skeletons in Overview/Districts/Sites/Routes.
   - Acceptance: no layout shift; skeletons disappear once data loads.
   - Reference: ui_components review (skeletons) — 1_feedback/UI_Components_Code_Review_Report.md:1

7) Tooltip and a11y polish [TODO]
   - Replace native `title` with accessible tooltip (e.g., Radix Tooltip) where helpful.
   - Acceptance: tooltips are keyboard accessible and announced; no focus traps.
   - Reference: ui_components review (InfoTooltip note) — 1_feedback/UI_Components_Code_Review_Report.md:1

8) i18n extraction [TODO]
   - Extract hardcoded Russian strings to a constants/i18n layer (keep RU default); avoid mixing string literals across files.
   - Acceptance: all user-facing strings pulled from a central map; app reads RU by default.
   - Reference: ui_components review (i18n) — 1_feedback/UI_Components_Code_Review_Report.md:1

9) Enforce size-gate in CI [TODO]
   - Promote advisory size gate (`scripts/ci/check_large_files_ui.sh`) to fail builds >500 LoC unless allow header present.
   - Acceptance: CI fails on oversize TS/TSX without `// @allow-large-file:<ticket>`; waiver documented per ADR-0002.
   - Reference: ADR-0002 (size rule) — backend ADR index referenced in docs.

Validation
- Unit: `npm test -s`
- E2E PR smokes (prod alias): `PW_TIMEOUT_MS=30000 E2E_BASE_URL=$URL npx playwright test --workers=1 --reporter=line`
- Nightly full (optional): `npm run test:e2e:nightly`
- Size gate: `bash scripts/ci/check_large_files_ui.sh`

Notes
- Keep current contracts; no breaking API changes.
- Prioritize 1–3, then 4–7 as bandwidth allows; 8–9 can be batched into a small “hygiene” PR.

