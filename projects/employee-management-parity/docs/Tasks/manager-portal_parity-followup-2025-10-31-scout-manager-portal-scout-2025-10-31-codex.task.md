# Task — Manager Portal Parity Follow-up (Scout)

Meta
- Agent: manager-portal-scout-2025-10-31-codex
- Date: 2025-10-31
- Repo: ${MANAGER_PORTAL_REPO}
- Deploy reviewed: https://manager-portal-demo-doeresnrv-granins-projects.vercel.app
- Inputs: PROGRESS.md; docs/System/context-engineering.md (Scout); CE prompts (SIMPLE-INSTRUCTIONS.md, RESEARCH-FOLLOWING-MAGIC-PROMPT.md);
  docs/SOP/code-change-plan-sop.md; docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md;
  docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md};
  CH5_Schedule_Advanced.{md,pdf}; CH6_Reports.{md,pdf}
- AI-docs touched: none (scope limited to parity evidence and manuals this pass)

## Summary
The 2025-10-31 UAT sweep confirmed schedule tabs, approvals disposition, and exports catalogue, but four parity gaps remain: (1) the
Schedule → «Заявки» tab still shows a placeholder instead of live request data, (2) approvals filters do not mirror the production
status/period controls, (3) the download queue lacks the multi-stage bell dropdown described in CH6, and (4) several English strings
persist in the Settings shell. Dashboard/Settings continue as extras; we should keep them feature-gated while the planner decides whether
they stay visible. The findings below map each gap to code/manual evidence plus mock/test implications.

## Findings & Evidence

### 1. Schedule → «Заявки» tab (MP-SCH-REQ)
- Demo gap: `src/components/schedule/ScheduleTabs.tsx:139-146` renders only guidance text and an empty-state component (“Интеграция … будет
  подключена”) instead of a request table.
- Manual baseline: CH5_Schedule_Advanced.md:151-183 outlines request management inside the schedule module, including columns, shift lists,
  required filters, and bulk actions; Shift Exchange flow continues at :186-204.
- UAT evidence: docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md:18 marks the schedule requests tab as **Fail**.
- Mock alignment: `src/data/mockData.ts:144-336` already contains detailed `requests`, `affectedShifts`, and `transferOptions` that can feed
  a schedule-scoped table once filtered by queue/date.
- Needed scope: Planner should describe a ReportTable/adapter that reuses approvals data for schedule requests view (status chips + shift
  list), adds per-period filters, and covers bulk approvals mirroring CH5 §5.4.

### 2. Approvals filters vs production (MP-APR-FILTERS)
- Demo behaviour: `src/pages/Approvals.tsx:221-312` exposes three chip rows (view/priority/category) plus a single status dropdown and
  basic date pickers.
- Manual parity: CH5_Schedule_Advanced.md:151-176 specifies checkbox filters for statuses (На рассмотрении/Одобрено/Отклонено), a “Заявки за
  период” history view, and quick filters for current vs historical requests.
- UAT note: docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md:26 flags the missing status/period filters as **Fail** even after
  the recent execution pass.
- Planner direction: outline how to replace/augment the dropdown with the production checkbox row, add a period shortcut (start/end picker
  + preset chips), and ensure the history view ties into mock history (`Request.history` in mockData). Update tests covering filtering and
  ensure existing priority chips are documented as “extra”.

### 3. Download queue UX (MP-REP-QUEUE)
- Current implementation: `src/pages/Reports.tsx:14-63` enqueues downloads and immediately marks them ready; the header bell in
  `src/components/Layout.tsx:140-175` toggles a simple list with labels only.
- Manual expectation: CH6_Reports.md:15-27 documents notifications with explicit status transitions (“Готовим файл…”, “Готов”) and per-user
  queues accessed via the bell dropdown; the user must confirm before downloading.
- UAT observation: docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md:33 calls the queue incomplete (**Partial**) because only a
  badge appears.
- Mock scope: Planner should extend `DownloadQueueProvider` to track `status` transitions (`pending` → `ready`), surface timestamps/timeouts,
  and add CTA buttons (“Подтвердить”, “Скачать”) alongside status labels. Tests need to validate queue ordering and badge counts.

### 4. Localisation follow-up (MP-L10N-SETTINGS)
- English copy remains on the Settings page: `src/pages/Settings.tsx:8-23` shows “System Settings”, “Configuration and preferences panel”,
  and bullet items in English.
- UAT recap: docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md:36 highlights remaining English strings.
- Planner action: capture RU replacements in `Localization_Backlog.md`, convert copy to approved RU terms (e.g., «Настройки системы»,
  «Профиль пользователя и предпочтения»), and note any additional shell strings discovered during execution.

### 5. Extras / feature flags (MP-EXTRA)
- Dashboard/Teams gating already handled via feature flags (`src/config/features.ts:1-3`, consumed in `src/components/Layout.tsx:25-32` and
  `src/App.tsx:34-58`).
- Settings remains an extra top-level entry (Always rendered in `Layout.tsx:25-32`) and currently shows placeholder copy. Planner should
  confirm we keep Settings disabled for parity builds (e.g., hide behind an env flag alongside Dashboard/Teams) or flesh it out with RU copy
  before UAT.

## Mock/Data/Test Implications
- Schedule requests view should reuse `mockTeams` request records; planner must map queue/date filters to `ScheduleDay` ranges and ensure new
  ReportTable rows cite `affectedShifts` so the dialog can show shift disposition context.
- Approvals filters update will need new unit tests in `${MANAGER_PORTAL_REPO}/src/pages/__tests__/Approvals.test.tsx` to cover status
  checkbox combinations and history presets.
- Download queue enhancements require tests around `DownloadQueueProvider` (e.g., verifying `enqueue` + `markReady`) and integration tests for
  bell dropdown state.
- Localisation updates must be logged in `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md` and validated via UAT screenshots.

## Open Questions / Risks for Planner
1. Should the schedule requests tab reuse the same columns as Approvals or adopt the production layout with side-by-side shift panels per
   CH5 §5.4?
2. How do we simulate the bell queue timeout/reset without backend support? (Manual implies per-day retention.)
3. Do we keep priority chips as an “extra” affordance? If so, we should flag them clearly in docs and tests.
4. Should Settings remain visible in parity builds once RU copy lands, or be hidden via `VITE_MANAGER_PORTAL_SETTINGS=on` to avoid confusing
   users?

