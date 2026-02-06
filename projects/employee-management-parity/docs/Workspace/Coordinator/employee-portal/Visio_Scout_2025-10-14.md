# Scout Notes — Employee Portal Parity Vision

## Scope
Inventory existing implementation to identify concrete files/sections that must change to achieve the parity vision (shell, requests, profile, data, documentation). No edits performed yet.

## Shell & Navigation
- `src/components/Layout.tsx:1-124` — Current header uses dark-mode toggle, English branding, and simple nav array. Needs replacement with RU tab set, Work Structure trigger, notifications/help, avatar dropdown, and footer copy alignment.
- `src/App.tsx:1-27` — Layout props enforce darkMode/toggle; routing limited to three paths. Will require removal of dark-mode state and potential addition of routes/shell context for Work Structure drawer.

## Dashboard Surface
- `src/pages/Dashboard.tsx:1-240` — Pulls stats/balance/requests but lacks counters, period badges, or quick links described in manuals. Requires layout overhaul and additional sections for manual-aligned widgets.
- `src/data/mockData.ts:1-199` (`mockDashboardStats`, `mockVacationBalance`, `mockVacationRequests`) — Sample data does not include manager comments summary, status counts by year, or structural metadata needed for dashboard cards.

- `src/pages/VacationRequests.tsx:1-432` — FilterGroup limited to status tabs; no year selector, counters, export controls, or manager comment column. Dialog and CTA set missing manual actions. Sorting/rows map to minimal fields. Compare against real UI captures:
  - `docs/UAT/real-naumen/2025-10-13_xds/89a78d9a-6519-4fef-82ff-3501cabc4e06.png` (Отпуска toolbar with counters/import/export row).
  - `docs/UAT/real-naumen/2025-10-13_xds/e3b73344-8e0d-422f-99e1-ca055424ab8e.png` (Заявки landing state).
  - `docs/UAT/real-naumen/2025-10-13_xds/83c716f3-ce29-495b-a45c-be2a96fbffec.png` (Loading state baseline).
- `src/data/mockData.ts:200-297` (`getVacationRequests`, `submitVacationRequest`) — Fallback logic lacks review history, status timestamps, and comment trails. Need richer payload (manager actions, pending counters, cancellation, etc.).
- `src/utils/format.ts:1-34` — Provides basic RU formatting; may need helpers for pluralized counters and date range labels.
- `src/__tests__/VacationRequests.test.tsx` (lines TBD) — Existing regression ensures dedupe only; will need new expectations for counters/filters once features added.

- `src/pages/Profile.tsx:1-436` — Only covers limited personal/contact fields. No middle name, address, logins, time zone, org hierarchy, password reset, or avatar upload controls. Tabs need expansion to host Appendix 1-required data. Manual reference: `docs/UAT/real-naumen/2025-10-13_xds/d1c27de2-8974-44c3-b695-d267bdd96528.png` (Monitoring shell showing header layout) and CH3 figures (рис.23-23.4).
- `src/types/index.ts:1-57` — `Employee` interface lacks fields for patronymic, address, logins, personnel number, office, time zone, structural node, etc.
- `src/data/mockData.ts:1-199` (`mockEmployee`) — Must include new profile attributes, address blocks, login metadata, structural info, and RU strings for new sections.
- `src/__tests__/Profile.test.tsx` (lines TBD) — Validation currently checks only core required fields; will need coverage for new required fields/saves.

## Shared Infrastructure & Docs
- `src/wrappers/FormField` & `Dialog` (line references TBD) — Confirm they support additional helper text/error messages required for new validations (scout follow-up when implementing).
- `uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md` — Will need updates once filters/shell expand; note for planner.
- `docs/SCREENSHOT_INDEX.md` — New captures required after UI changes; record for documentation step.
- `docs/System/APPENDIX1_SCOPE_CROSSWALK.md:68-88` — Status rows must transition to “Implemented” post-change; keep on change list.

## Open Questions
1. Work Structure drawer: reuse existing component pattern from other demos or craft lightweight placeholder? Need decision before planning to avoid scope creep.
2. Password/Avatar UX: confirm acceptable mock behaviour (frontend-only vs. stub). Manual expects availability but not necessarily persistence.
3. Export controls: keep as disabled placeholders or wire to mock CSV generator? Planner should align with parity acceptance.

## Next Steps
- Validate this inventory & address open questions.
- Once approved, proceed to Planner role to draft step-by-step implementation using identified files.
