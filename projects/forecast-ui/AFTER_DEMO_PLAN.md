# After-Demo Plan (UI)

This document captures focused, high-value items to tackle right after the demo. Scope is UI-only, aligned with accepted guardrails. No backend changes here.

## 1) Shared atoms (remove duplication)
- Create `components/shared/RiskBadge.tsx` and `components/shared/FillBar.tsx`.
- Replace in:
  - `src/components/RoutesTable.tsx`
  - `src/components/RoutesPrototype.tsx`
  - `src/components/PlanAssignments.tsx`
  - `src/components/RegistryView.tsx`

Acceptance:
- Visual parity unchanged; atoms used in all four places; no inline duplicates remain.

## 2) Component splits (keep files < 300–400 LoC)
- `Routes.tsx` → `RoutesHeader.tsx`, `RoutesCards.tsx`, (keep `RoutesTable.tsx`).
- `Sites.tsx` → `SitesFilters.tsx`, `SitesTable.tsx`.
- `Overview.tsx` → `OverviewCards.tsx`, `OverviewNotes.tsx`.
- `Districts.tsx` → `DistrictsTable.tsx`, `SmapeLegend.tsx`.

Acceptance:
- Each file ≤ ~350 LoC; if deferring, add header `// @allow-large-file:<ticket>` and create ticket.

## 3) Contracts/validation
- Add lightweight runtime validation with zod for API shapes where useful (optional).
- Keep types in `src/types/api.ts` as the source of truth; export small validators to guard nulls/undefined in critical tables.

Acceptance:
- UI shows zero states instead of crashing on missing fields; log concise console warnings in dev.

## 4) Tests
- E2E (Playwright):
  - Extend `routes_table.spec.ts`: assert risk sort order, verify CSV download (>0 bytes when server provides rows).
  - Add `sites.spec.ts`: badges by thresholds; sticky filters.
- Unit (Vitest):
  - RiskBadge thresholds/labels; FillBar width/color mapping.
  - CSV fallback (toCsv) edge cases.

Acceptance:
- E2E smokes remain fast (<1 min); unit tests cover the atoms; CI job green.

## 5) CI polish
- Add a size/lint gate for large files (>400 LoC) with an allowlist via header tag.
- Add Playwright smoke into CI (Overview + Routes Table); keep full e2e nightly.

Acceptance:
- PRs fail if a TSX file >400 LoC without `// @allow-large-file:<ticket>`.

## 6) Cleanup & hygiene
- Remove `Archive.zip` after confirmation and add to `.gitignore` (post-demo only).
- Drop `*.backup` configs when optimized configs are confirmed.
- Ensure `tests/e2e/shots` and `test-results` remain untracked.

Acceptance:
- Clean repo; no large binary artifacts committed.

## 7) UX smalls (non-breaking)
- Add “loading…”/“error” inline to Districts/Sites tables (Routes CSV already done).
- Tooltips: retain WAPE/SMAPE; add aria-labels for buttons.

Acceptance:
- No behavior change; improved feedback and accessibility affordances.

## Runbook (unchanged)
- E2E: `E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test`
- Env (prod): `VITE_API_URL`, `VITE_DEMO_DEFAULT_DATE=2024-08-03`
