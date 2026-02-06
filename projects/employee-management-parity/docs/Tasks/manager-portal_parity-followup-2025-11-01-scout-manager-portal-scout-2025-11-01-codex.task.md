# Task — Manager Portal Parity Follow-up (Scout)

Meta
- Agent: manager-portal-scout-2025-11-01-codex
- Date: 2025-11-01
- Repo: ${MANAGER_PORTAL_REPO}
- Deploy reviewed: https://manager-portal-demo-doeresnrv-granins-projects.vercel.app
- Inputs: PROGRESS.md; docs/System/context-engineering.md (Scout); CE prompts (SIMPLE-INSTRUCTIONS.md, RESEARCH-FOLLOWING-MAGIC-PROMPT.md);
  docs/SOP/code-change-plan-sop.md; docs/Tasks/manager-portal_parity-followup-2025-11-01.task.md;
  docs/System/manager-portal_illustrated-guide.md; uat-agent-tasks/manager-portal_illustrated-walkthrough.md;
  docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md; /Users/m/Desktop/k/k.md;
  docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md};
  `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH5_Schedule_Advanced.md`; `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md`
- AI-docs touched: none (parity research only)

## Summary
The 2025-11-01 UAT sweep (k/k.md) reconfirmed that schedule/approvals/reports extras still ship, but three core behaviours remain below parity:
(1) the Schedule → «Заявки» tab continues to display the integration placeholder instead of the queue table + history filters documented in CH5;
(2) the Approvals module lacks production-style status/preset filters, so UAT cannot repeat trimmed_smoke steps; and (3) the download queue auto-clears
before managers can acknowledge exports, leaving MP‑REP‑QUEUE partial. RU localisation regressions also surfaced (shift status tags still in English,
export filenames transliterated, Settings copy reverting to EN on deployed build). These items are now reflected in the coordinator docs and should
shape the follow-up plan.

## Findings & Evidence

### 1. Schedule → «Заявки» tab (MP‑SCH‑REQ)
- Demo gap: Deployed build renders the “Интеграция появится позже” banner; the ReportTable + history toggle present in source never reaches production.
  Evidence: ${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:14-95; ${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:169-278;
  /Users/m/Desktop/k/k.md:7-38; screenshot alias `manager-real-requests-queue.png`.
- Manual baseline: CH5_Schedule_Advanced.md:157-176 details status checkboxes, “Заявки за период” presets, affected shift list, and bulk summary.
- Work required: Ensure the build ships the adapter-driven table (`buildScheduleRequestRows`), align summary order, and expose shift chips/history dialog.
  Planner should document queue/date filter wiring and tests for current/history buckets.

### 2. Approvals filters & history (MP‑APR‑FILTERS)
- Demo behaviour: ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:214-333 shows chips for view/priority/category plus free-form date pickers; history toggle only
  flips between current/history without presets or breadcrumbs. /Users/m/Desktop/k/k.md:39-70 records the gap.
- Manual expectation: CH5_Schedule_Advanced.md:153-171 describes checkbox filters, quick date presets (“Последние 7 дней”, “Текущий месяц”), and history breadcrumb.
- Action: Planner must outline new preset buttons + breadcrumb, hooking into mock request history (`mockData.ts:176-360`), and extend tests in
  `${MANAGER_PORTAL_REPO}/src/pages/__tests__/Approvals.test.tsx` to cover preset toggles.

### 3. Download queue lifecycle (MP‑REP‑QUEUE)
- Current state: `handleDownload` in ${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:14-25 enqueues, marks ready, acknowledges, and clears within one promise chain.
  Layout dropdown (${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:148-215) never displays pending/ready states or expiry copy.
- Manual baseline: CH6_Reports.md:15-27 emphasises notification → confirm → download, with availability until midnight; screenshot `manager-real-bell-queue.png`.
- Planner scope: Extend `DownloadQueueProvider` (${MANAGER_PORTAL_REPO}/src/state/downloadQueue.tsx:25-45) to retain entries, add confirm modal + expiry string,
  and write unit tests for queue state transitions.

### 4. Localisation regressions (MP‑L10n)
- Shifts tab shows “Published/Draft/Requires check” (UAT screenshot). Source mapping exists (`statusMap` in ScheduleTabs.tsx:41-47) but deploy still surfaces EN,
  so planner/executor must confirm mapping is applied and update mocks if necessary.
- Reports modal displays transliterated filenames (`t13_report.xlsx`); ensure `${MANAGER_PORTAL_REPO}/src/utils/exports.ts:19-74` ships RU strings and add tests.
- Settings helper text reverted to English on Vercel; double-check `${MANAGER_PORTAL_REPO}/src/pages/Settings.tsx:6-24` and feature-flag visibility if kept hidden.

### 5. Extras & feature flags (MP‑EXTRA)
- Dashboard/Teams remain gated by env flags; Settings is always rendered. Decide whether to hide Settings until localisation is final or include RU copy + parity actions.
  Evidence: ${MANAGER_PORTAL_REPO}/src/config/features.ts:1-4; ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:18-40; /Users/m/Desktop/k/k.md:9-18.

## Mock/Data/Test Implications
- Schedule requests table should reuse `mockTeams` requests, adding queue/date filtering and status summaries; adapter tests may be needed under
  `${MANAGER_PORTAL_REPO}/src/adapters/scheduleRequests.test.ts` to lock bucket behaviour.
- Approvals presets need additional mock history entries and new vitest coverage for preset clicks/history mode.
- Download queue lifecycle changes require tests for pending → ready → acknowledged plus expiry timer and manual clear.
- Localisation fixes must be mirrored in `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md` and validated with new RU screenshots in UAT packs.

## Open Questions / Risks for Planner
1. Do we surface the schedule queue table inside the existing tab component or reuse the approvals table with shared adapter logic? (Impacts test scope.)
2. How should we simulate queue expiry (midnight) without backend—local timer vs. mocked expiry value stored in queue entry?
3. Should Settings be hidden for parity builds to avoid new localisation regressions, or do we commit to RU copy + behaviour parity now?
4. What level of Playwright/UAT evidence is expected after these fixes—new screenshots for requests tab, approvals presets, and bell dropdown?
