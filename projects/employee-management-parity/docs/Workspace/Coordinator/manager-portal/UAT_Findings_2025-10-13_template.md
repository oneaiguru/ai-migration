## UAT Findings → Execution Task (Manager Portal)

Meta
- Demo: Manager Portal
- Source URL: https://manager-portal-demo-doeresnrv-granins-projects.vercel.app
- Pack(s): parity_static.md, trimmed_smoke.md
- Evidence: screenshot aliases (see docs/SCREENSHOT_INDEX.md)

Findings Table
| ID | Check | Pass/Fail | Notes | Screenshot |
| -- | ----- | --------- | ----- | ---------- |
| MP‑SCH | Schedule module parity (Graph + sub-tabs) | **Pass** | Queue + date filters and CH5 tabs wired via `src/pages/Schedule.tsx:1-82` and `src/components/schedule/ScheduleTabs.tsx:1-238`; coverage/shift/vacation tables driven by `scheduleDays` mock data (`src/data/mockData.ts:46-101`). | schedule-graph-tab.png |
| MP‑REP | Reports catalogue & exports | **Pass** | Expanded export roster with RU filenames and download states (`src/utils/exports.ts:1-82`); Reports page integrates queue + “Скачать” CTA (`src/pages/Reports.tsx:10-66`) and feeds bell dropdown through `useDownloadQueue`. | reports-download-queue.png |
| MP‑APR | Approvals workflow parity | **Pass** | View/status/date filters (`src/pages/Approvals.tsx:225-312`), shift disposition radios (`src/pages/Approvals.tsx:320-370`), and note enforcement validated by vitest (`src/pages/__tests__/Approvals.test.tsx:1-86`). Mock data carries `transferOptions` + `affectedShifts` (`src/data/mockData.ts:170-360`). | manager-approvals-disposition.png |
| MP‑DASH | Dashboard/Teams value-add review | **Extra (flagged off)** | Dashboard/Teams remain value-add but default hidden via feature flags (`src/config/features.ts:1-4`, consumed in `src/App.tsx:13-108`, `src/components/Layout.tsx:18-101`). Toggle on with `VITE_MANAGER_PORTAL_DASHBOARD/TEAMS=on` when showcasing extras. | manager-dashboard-playwright.png |
| MP‑NAV | Shell parity (Work Structure, notifications) | **Pass** | Header bell now surfaces download queue (`src/components/Layout.tsx:140-177`), Work Structure opens as right-hand sheet (`src/components/OrgStructureDrawer.tsx:25-80`); layout consumes queue provider (`src/App.tsx:63-118`). | manager-org-drawer.png |
| MP‑L10n | RU localisation completeness | **Pass** | Approvals adapters produce RU labels (`src/adapters/approvals.ts:36-88`); exports use RU filenames (`src/utils/exports.ts:19-76`); schedule copy translated (`src/pages/Schedule.tsx:15-77`). Localization backlog updated 2025-10-31. | — |

Remediation Summary
- Follow-up pass wired schedule requests presets, approvals history filters, and download queue lifecycle per CH5/CH6.
- Remaining open item: Settings localisation (MP‑L10n‑SETTINGS) pending RU content confirmation.

Acceptance (next cycle)
- Close MP‑L10n‑SETTINGS once RU helper text lands and deploy is verified; rerun parity_static + trimmed_smoke for confirmation.

Outcome
- Status: **Closed – 2025-11-02 UAT Pass (Schedule requests/Approvals presets/Download queue)**
| MP‑SCH‑REQ | Schedule → «Заявки» tab | **Pass** | Requests table renders with queue-aware filtering + presets (`src/components/schedule/ScheduleTabs.tsx:80-190`), adapter helpers drive history ranges (`src/adapters/scheduleRequests.ts:4-165`), and summaries prefix queue name. | — |
| MP‑APR‑FILTERS | Approvals filters parity | **Pass** | History toggle seeds presets + breadcrumb copy (`src/pages/Approvals.tsx:52-164`), vitest covers preset flow (`src/pages/__tests__/Approvals.test.tsx:94-118`), and mocks include historic rows (`src/data/mockData.ts:161-210`). | — |
| MP‑REP‑QUEUE | Download queue UX | **Pass** | Confirm modal before enqueue (`src/pages/Reports.tsx:14-116`), lifecycle stored in context (`src/state/downloadQueue.tsx:1-84`), bell dropdown shows expiry + manual acknowledge (`src/components/Layout.tsx:132-206`), tests at `src/state/downloadQueue.test.tsx:1-60`. | — |
| MP‑L10n‑SETTINGS | Settings localisation | **Fail** | Settings placeholders still surface English helper text on deployed build; align copy with RU strings used locally and confirm deploy picks up translations. Evidence: `${MANAGER_PORTAL_REPO}/src/pages/Settings.tsx:6-24`, `/Users/m/Desktop/k/k.md:97-120`, docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md:36. | — |
| MP‑L10n‑SHIFTS | Schedule shift badges | **Pass** | Shift status chips use RU mapping via `statusMap` (`src/components/schedule/ScheduleTabs.tsx:32-112`); mock slots remain lower-case (`src/data/mockData.ts:62-115`). | — |
| MP‑EXTRA | Extras gating (Dashboard/Settings) | **Extra** | Dashboard/Teams remain behind feature flags; decide whether Settings should hide entirely until parity backlog closes. Evidence: `${MANAGER_PORTAL_REPO}/src/config/features.ts:1-4`, `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:18-40`, `/Users/m/Desktop/k/k.md:9-18`. | — |
