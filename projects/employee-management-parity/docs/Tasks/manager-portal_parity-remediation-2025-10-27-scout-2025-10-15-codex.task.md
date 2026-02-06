# Task — Manager Portal Parity Remediation (Scout)

Meta
- Agent: manager-portal-scout-2025-10-15-codex
- Date: 2025-10-15
- Repo: ${MANAGER_PORTAL_REPO}
- Deploy reviewed: https://manager-portal-demo-dpxk5jk50-granins-projects.vercel.app
- Inputs: PROGRESS.md; docs/System/context-engineering.md (Scout); CE prompts (SIMPLE + RESEARCH); docs/SOP/code-change-plan-sop.md; docs/Tasks/manager-portal_parity-remediation-2025-10-27.task.md; docs/Archive/UAT/2025-10-27_manager-portal_parity-sweep.md; docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md}; manuals CH2_Login_System.md, CH3_Employees.md, CH5_Schedule_Advanced.md, CH6_Reports.md (and staged PDFs); desktop parity briefs `/Users/m/Desktop/{e.tex,f.tex,g.tex,h.md}`.
- AI-docs touched: ai-docs/wrappers-draft/data/DataTable.tsx; ai-docs/wrappers-draft/ui/Dialog.tsx; ai-docs/README.md (for wrapper usage guardrails).

## Summary
Production parity gaps persist around four areas: (1) the Schedule module remains a placeholder and lacks CH5 workflows, (2) Approvals do not expose request-type tabs, shift handling, or mandatory note logic from Naumen, (3) the Reports catalogue omits half of the exports and download UX described in CH6, and (4) shell/localisation still diverge (drawer modality, notification badges, English copy and filenames). Dashboard/Teams content is extra functionality that needs a product decision before the next plan. The findings below map each gap to concrete files, manual references, required mock data, and wrapper patterns the planner must fold into the execution plan.

## Findings & Evidence

### 1. Schedule module parity (MP‑SCH)
- Demo evidence: `src/pages/Schedule.tsx:6-24` renders an English "Schedule Management" placeholder with three feature bullets instead of the interactive grid and tabs. No date range, queues, or unpublished-change badge.
- Manual baseline: CH5_Schedule_Advanced.md `:120-205` outlines request processing, shift handling, and required sub-tabs (Graph/Requests/Monitoring/etc.). Report exports for requests live here (`:178-180`).
- Shell context: Unified module tabs already exist (`src/components/Layout.tsx:16-128`), but the schedule view does not respond to active module or org-unit filters.
- Needed scope: create a mock-backed schedule grid with sub-tab navigation, date picker, queue selector, and metadata for unpublished drafts. Planner must specify whether to reuse `ai-docs/wrappers-draft/data/DataTable.tsx:1-112` (virtualised table) or extend existing ReportTable for grid layout. Mock data requires per-shift entries (employee, skill, activity timeline) plus `unpublishedChanges` flag keyed by org unit.

### 2. Approvals workflow alignment (MP‑APR)
- Demo evidence: `src/pages/Approvals.tsx:52-305` filters by priority/category only, tracks `selectedRequests`, and the dialog footer (`:303-337`) toggles between "Одобрить" / "Отклонить" without transfer/delete options. Bulk banner `:265-292` offers only approve/reject.
- Missing parity: manual CH5_Schedule_Advanced.md `:130-175` mandates schedule-change vs shift-exchange separation, request history per tab, and shift disposition controls (transfer, delete, convert to additional shifts). Shift exchange tab details appear in `:186-199`.
- Data gap: `src/data/mockData.ts:80-327` includes `shiftPairId` but lacks companion target employees or queue metadata needed to render transfer dropdowns. Planner should define additional fields (`exchangePartner`, `affectedShifts[]`) and tests to validate note requirements (reject reason mandatory) plus new adapter outputs.
- UI requirement: extend dialog to surface shift list, action buttons, and mandatory reason enforcement per manual. Bulk banner must list available shift actions beyond approval/rejection.

### 3. Reports catalogue & exports (MP‑REP)
- Demo evidence: `src/pages/Reports.tsx:11-32` maps `REPORT_EXPORTS` to only three cards; the export dialog in Approvals `src/pages/Approvals.tsx:412-437` reuses that truncated list. `src/utils/exports.ts:8-27` exposes only T‑13, Work Schedule, Deviations with English filenames (`t13_report.xlsx`, `work_schedule.csv`, `deviation_report.csv`).
- Manual expectations: CH6_Reports.md `:5-90` enumerates eight reports (Work Schedule (monthly + daily), Employee Work Schedule, Deviations, Payroll Calculation, Licenses). Download UX requires notifications and per-user download queue (#68.1, #68.2 figures).
- Planner must expand `REPORT_EXPORTS` to include missing entries with RU file names, add status badges for unavailable reports, and describe a mocked "download center" (e.g., panel in header to mirror Naumen notification bell). Tests should assert label parity and file-name localisation.

### 4. Navigation & shell parity (MP‑NAV/MP‑DASH)
- Current shell: Layout already renders module chips and a "Рабочая структура" control (`Layout.tsx:110-158`), but the drawer is implemented via centred `Dialog` (`OrgStructureDrawer.tsx:25-78`), not the right-slide panel described in CH2_Login_System.md `:20-27`.
- Extras decision: Dashboard (`src/pages/Dashboard.tsx:40-86`) and Teams (`src/pages/Teams.tsx:1-240`) remain enhanced features absent from Naumen. The planner needs to log whether to retain them as "value add" (documented in UAT matrix) or hide behind a toggle to match production navigation (per docs/Archive/UAT/2025-10-27_manager-portal_parity-sweep.md rows 7-17).
- Notification center: manual CH2 highlights an indicator for generated reports (`CH2_Login_System.md:22-27`), but the demo bell `Layout.tsx:130-145` shows a static badge and no dropdown. Planner should capture requirement for clickable notification list tied to export mocks.

### 5. Localisation completeness (MP‑L10n)
- English copy persists: Schedule placeholder (`Schedule.tsx:6-24`), Settings placeholder (`src/pages/Settings.tsx:6-24`), export filenames (`src/utils/exports.ts:18-25`), and request legend values (`buildDistributionSeries` uses raw IDs when no RU label). The donut legend still emits `shift_swap` and `replacement` because `mapRequestType` at `src/adapters/approvals.ts:54-87` lacks RU strings for those enums.
- Planner should queue translation updates in `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts` and rename export files to RU slugs, then record the updates in `Localization_Backlog.md` once complete.

## Mock/Data/Test Implications
- **Data fixtures:** extend `mockTeams` (`src/data/mockData.ts:58-483`) with schedule grid rows (`shifts[]`, `queueId`, `status`), request transfer metadata, and organisation hierarchy to drive tab filtering.
- **Adapters & wrappers:** new schedule/approvals/report flows will require adapters mirroring CH5 categories; tests currently cover only counts (`src/adapters/approvals.test.ts:1-74`). Planner should budget new cases for shift-transfer logic and RU note enforcement. Consider reusing `ai-docs/wrappers-draft/data/DataTable.tsx` for schedule grid virtualization and `ai-docs/wrappers-draft/ui/Dialog.tsx` patterns for nested action lists.
- **UAT packs:** parity_static + trimmed_smoke need additional steps for schedule sub-tabs, shift disposition flows, and the expanded report list. Planner should note these updates in `docs/Tasks/uat-packs/{parity_static.md,trimmed_smoke.md}`.

## AI-Docs References
- `ai-docs/wrappers-draft/data/DataTable.tsx:1-112` — reference implementation for virtualised schedule grids (sorting, scrolling) that can guide the mock schedule view.
- `ai-docs/wrappers-draft/ui/Dialog.tsx` — structured dialog pattern supporting stacked actions applicable to the approvals decision panel.
- `ai-docs/README.md` — reiterates wrapper-first approach and RU locale constraints (ensuring new components keep shared styling/aria hooks).

## Open Questions & Risks
1. **Dashboard/Teams scope** — should these remain visible as value-add or be hidden until parity flows land? Outcome affects navigation copy and documentation in CodeMap + UAT packs.
2. **Download centre UX** — manual shows a downloads icon with queued files; execution will need a simplified mock (toast + dropdown?) that still satisfies CH6 without backend.
3. **Schedule data volume** — without pagination, the schedule tab could render hundreds of rows. Planner should decide between ReportTable extension vs purpose-built grid (performance considerations for mock data).
4. **Notification badge triggers** — linking exports to notification counts requires event wiring between Approvals/Reports and the header; ensure plan outlines how to keep tests deterministic.

