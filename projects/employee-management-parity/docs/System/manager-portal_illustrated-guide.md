# Manager Portal — Illustrated Parity Guide

This guide pairs real Naumen Manager Portal captures with our demo implementation. Use it alongside `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md`, `CH5_Schedule_Advanced.md`, and `CH2_Login_System.md` when closing remaining parity gaps.

Each section lists:
- **Manual reference** – source lines in the Naumen operating manual.
- **Production capture** – screenshot staged under `docs/UAT/real-naumen/2025-11-01_manager-portal/`.
- **Demo implementation** – current code paths in `${MANAGER_PORTAL_REPO}`.
- **Parity actions** – concrete follow-ups for the executor.

---

## Shell & Navigation (CH2 §2.2)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md:18-42` — Module tabs (Прогнозы/Расписание/Сотрудники/Отчёты) with notifications bell + report tray.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/05079efd-059e-42cf-9746-f38036dd41cf.png` — Reports screen with bell dropdown showing export queue.

**Demo implementation**
- Shell layout (`${MANAGER_PORTAL_REPO}/src/components/Layout.tsx`) renders sidebar + top tabs, but Settings nav is feature-flagged and bell queue currently collapses to a simple list.

**Parity actions**
- Match production bell behaviour: badge counts, time stamps, acknowledge/clear buttons, and expiration copy (“Файлы отчётов будут доступны до 00:00”).
- Keep Settings nav gated (`settingsEnabled`) unless production exposes manager settings. Ensure RU tooltip copy mirrors manual.

---

## Schedule – Schemes & Shifts (CH5 §5.2)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH5_Schedule_Advanced.md:32-78` — Day-type matrix, shift templates, and queue selector.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/33141990-adfd-4183-92e1-c49e79f9cf9a.png` — «Схемы» tab with day matrix.
- `docs/UAT/real-naumen/2025-11-01_manager-portal/333a9acc-6b2d-438e-9d4c-5ed71c57802f.png` — «Смены» designer warning about required name.
- `docs/UAT/real-naumen/2025-11-01_manager-portal/3572538c-ad10-452f-9d05-a27b03dc204d.png` — Schemes loading state.

**Demo implementation**
- Grids, templates, and warnings live in `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx` (“schemes” & “shifts” panels) with data from `src/data/mockData.ts` and `src/adapters`.

**Parity actions**
- Ensure shift editor enforces required fields with RU error copy (e.g., «Поле обязательно для заполнения»).
- Mirror scheme filter chips (Рабочий/Выходной/Непланируемый/«Плавающий» рабочий) and matrix palette.
- Add loading skeleton matching production “Загрузка...” strip when queue changes.

---

## Schedule – Events & Vacations (CH5 §5.4, §5.6)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH5_Schedule_Advanced.md:151-204` — Event creation form, participants, and distribution type toggles.
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH5_Schedule_Advanced.md:210-235` — Vacation planner tabs (Непостроенные/Построенные/Опубликованные), calendar year filter, and import/export controls.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/00e86d66-f39d-4f52-916b-8aa7cf9921bc.png` — Event creation form with distribution radio buttons.
- `docs/UAT/real-naumen/2025-11-01_manager-portal/5f9a3b0d-63c2-491a-a26c-a7b81f8e245f.png` — Vacations module with year picker, tabs, and action buttons.

**Demo implementation**
- Events tab (`${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx`, `renderEvents`) uses simplified layout; Vacations tab references `mockTeams` vacation summaries.

**Parity actions**
- Recreate radio set (“Одновременно/Последовательно/По нагрузке”), participant search chips, and «Объединить по» person counter.
- Implement vacation tab actions: import/export buttons, «Очистить все», «Посмотреть распределение на 12 месяцев», and history drawer.

---

## Schedule – Requests Sub-tab (CH5 §5.4)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH5_Schedule_Advanced.md:168-190` — Queue-aware request list, status filters, «Заявки за период» history, affected shifts list, and bulk summary.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/401964f0-4296-42b9-a6ac-8813ae4b85dd.png` — Request list with status chips and history toggle (current vs period).

**Demo implementation**
- `src/adapters/scheduleRequests.ts` + `src/components/schedule/ScheduleTabs.tsx` (Requests pane) render queue-filtered ReportTable with dialogs.

**Parity actions**
- Align summary bullet list (“Одобрено — 2”) with production order and copy.
- Ensure history toggle filters by submission range and surfaces affected shift chips with RU status (e.g., «На рассмотрении»).

---

## Approvals Module (CH5 §5.4)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH5_Schedule_Advanced.md:192-204` — Status checkboxes, history toggle, preset date filters, and disposition radio buttons.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/b4f129d8-9e79-43b5-8f1b-23a732a1713b.png` — Status chips + history toggle in approvals list.
- `docs/UAT/real-naumen/2025-11-01_manager-portal/b4c83c1e-d48d-4a5a-849c-5192bc25719e.png` — Review dialog with shift disposition options and mandatory comment.

**Demo implementation**
- `src/pages/Approvals.tsx` renders list filters, history toggle, disposition radios, and comment enforcement; tests in `src/pages/__tests__/Approvals.test.tsx`.

**Parity actions**
- Add quick date presets (“Последние 7 дней”, “Текущий месяц”) and history breadcrumbs.
- Enforce comment requirement for reject + log history entry (actor, timestamp) like production.
- Mirror export dropdown placement (“Экспортировать отчёты”) and banner chips after multi-select.

---

## Reports Catalogue & Download Queue (CH6 §6.1)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md:12-76` — Reports list with category tabs, download queue behavior, status badges, and expiry time.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/2ebe157c-bc93-4119-9b54-617d2ddaf252.png` — Reports main list (Основные/Дашборды).
- `docs/UAT/real-naumen/2025-11-01_manager-portal/29abc770-1cbc-41fb-bf8d-4bcb9956d4d1.png` — T-13 card with queue entry.
- `docs/UAT/real-naumen/2025-11-01_manager-portal/05079efd-059e-42cf-9746-f38036dd41cf.png` — Bell dropdown showing status “Загружается”.

**Demo implementation**
- `src/pages/Reports.tsx` lists cards referencing `src/utils/exports.ts` and download queue context (`src/state/downloadQueue.tsx`).

**Parity actions**
- Expand report catalogue to include daily schedule, punctuality, employee schedule, and journal exports with RU filenames (герунд). 
- Replicate pending → ready → acknowledged statuses with timestamps and auto-expiry, matching production copy.
- Provide confirm modal (“Будет доступно до 00:00”) before enqueuing downloads.

---

## Employees – Edit Drawer (CH3 §3.2)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH3_Employees.md:40-118` — Required fields, supplementary fields, tags, phone masks.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/28cedaa9-0562-4e27-97b6-7525d8c4f951.png` — Drawer with required + optional fields.

**Demo implementation**
- Employees module is not yet wired into `${MANAGER_PORTAL_REPO}`; use the employee-management parity app as source-of-truth when integrating.

**Parity actions**
- When the slice is scheduled, mirror production field order, RU placeholders, mask patterns (телефон, дата найма), and tag-limit alerts.
- Reuse existing employee drawer patterns (`${EMPLOYEE_MGMT_REPO}/src/components/EmployeeDrawers/...`) to reduce duplication and guarantee localisation parity.

---

## Monitor Tasks & Misc Tabs

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH5_Schedule_Advanced.md:236-260` — Tasks list and monitoring KPI notes.

**Production capture**
- `docs/UAT/real-naumen/2025-11-01_manager-portal/660667fc-bf9c-4d2d-ac22-c07c81892dfc.png` — Monitoring queue summary.
- `docs/UAT/real-naumen/2025-11-01_manager-portal/67f0ee0b-12b5-4175-aaee-a49a95d1de52.png` — Tasks checklist.

**Demo implementation**
- `ScheduleTabs` renders simple lists for Monitoring/Tasks.

**Parity actions**
- Include real-time metrics (SLA, задержки, нарушения), update intervals, and link to “История графиков” like production.
- Tasks list should include due dates and status badges (e.g., «Просрочено»).

---

## Quick Checklist for Executors
1. Update mock data (`src/data/mockData.ts`) to support new reports, request statuses, and vacation schedules.
2. Extend adapters/tests where parity actions call for behaviour changes (e.g., download queue lifecycle, approvals presets).
3. Capture refreshed screenshots post-changes and update `docs/SCREENSHOT_INDEX.md` + UAT packs.

For the UAT-ready walkthrough without code references, use `uat-agent-tasks/manager-portal_illustrated-walkthrough.md`.
