# Screenshot Index – Employee Management Parity

Reference captures live outside the repo under `~/Desktop/shots epml mamgnt/` unless otherwise noted. Use the per-demo sections below to locate the right baseline before updating parity documentation.

## Employee Management (Parity Demo)
- `1a43259c-9d43-4ecd-a25b-987334e72fc4.png` – Employees toolbar («Настройка отображения», «Теги», «Импортировать», «Экспортировать», checkbox «Показывать уволенных», counter 51/51, link «Снять все фильтры»); maintain icon order and spacing.
- `638fdb1b-1f4d-4da2-b0c4-167f2550345d.png` – Column picker sheet; field order and copy.
- `6427ca80-ee3c-4783-b79e-64ca40f4276b.png` – Edit drawer obligatory section (Фамилия/Имя/Отчество/Логин WFM/Внешние логины/Пароль/Точка оргструктуры/Офис/Должность/Часовой пояс/Норма часов).
- `85c56853-a71a-4073-8973-4732e848f165.png` – Drawer loading state; spinner placement.
- `90f0786c-862e-4737-ac8c-7afb2567e962.png` – Optional fields block (смены предпочтений, схема работы, навыки, резервные навыки, задачи, теги, номер, адрес, телефон, email, дата рождения, дата найма).
- `b52ecd6a-0028-45fb-a91c-299d97c2eee6.png` – Toolbar crop focusing on column picker icon.
- `bd20ff73-e081-44c5-a4b9-2db4541e9d23.png` – Alternate toolbar capture; confirm font weights/alignment.
- `d1cf682d-ab3d-4417-8223-195716783ad8.png` – Employee module loading overlay copy.
- `d4d86894-87ba-454c-8678-f76c46829fd7.png` – Full list baseline (row height, alternating background).
- `fafa2f56-7047-4055-8b50-f2475f2af74d.png` – Drawer detail close-up (tags pill style and placeholders).
- `TBD_selection-mode-banner.png` – (Capture pending) Selection mode banner + toolbar state after multi-select. Reference: 2025-10-07 validation report.
- `TBD_dismiss-restore-timeline.png` – (Capture pending) Timeline entries showing dismiss/restore system badges. Reference: 2025-10-07 validation report.
- `TBD_tag-manager-alert.png` – (Capture pending) Tag manager alert when exceeding four-tag limit. Reference: 2025-10-07 validation report.

## Scheduling – Schedule Grid System Mock
- `1e958a67-4c07-48f1-8f6c-b797d9be0f60.png` – Coverage/adherence dashboard baseline (kept from Stage 6 validation). Used for chart wrapper parity.
- ADD: capture trimmed employees-only navigation once the Phase 8 production repo ships (placeholder `TBD_schedule-trimmed-nav.png`).

## Manager Portal Demo
- `manager-org-drawer.png` – Capture the «Рабочая структура» drawer open with nested подразделения (new nav parity evidence).
- `manager-approvals-bulk.png` – Approvals bulk selection banner + toolbar state (selection summary + кнопка экспорта).
- `manager-approvals-disposition.png` – Close-up of Approvals review dialog with shift disposition radios and RU copy.
- `manager-dashboard-playwright.png` – Playwright artifact (`e2e/artifacts/manager-dashboard-playwright.png`) covering dashboard KPI grid + coverage bar (route `dashboard`).
- `playwright-manager-approvals.png` – Playwright capture of Approvals dialog (reject note required) from `tests/e2e/manager/approvals.spec.ts`.
- `manager-teams-modal.png` – Manual/Playwright capture of Teams detail modal (coverage breakdown + roster) to validate CH3 references.
- `schedule-graph-tab.png` – Schedule → «График» tab showing required vs published coverage table filtered by queue.
- `reports-download-queue.png` – Reports card and bell dropdown illustrating download queue entry transitioning to ready state.
- `manager-schedule-requests-presets.png` – Demo: Schedule → «Заявки» tab with history preset chips + breadcrumb (post-2025-11-02 deploy).
- `manager-approvals-history-preset.png` – Demo: Approvals history toggle showing preset buttons and breadcrumb copy.
- `manager-download-queue-expiry.png` – Demo: Bell dropdown showing pending → ready entry with RU expiry (“Доступно до …”).
- `manager-real-events-form.png` – Real Naumen: Schedule → «События» creation form with distribution radios (`docs/UAT/real-naumen/2025-11-01_manager-portal/00e86d66-f39d-4f52-916b-8aa7cf9921bc.png`).
- `manager-real-shifts-template.png` – Real Naumen: «Смены» designer showing required field warning (`docs/UAT/real-naumen/2025-11-01_manager-portal/333a9acc-6b2d-438e-9d4c-5ed71c57802f.png`).
- `manager-real-schemes-matrix.png` – Real Naumen: «Схемы» tab with day-type matrix (`docs/UAT/real-naumen/2025-11-01_manager-portal/33141990-adfd-4183-92e1-c49e79f9cf9a.png`).
- `manager-real-requests-queue.png` – Real Naumen: Schedule → «Заявки» queue summary and status chips (`docs/UAT/real-naumen/2025-11-01_manager-portal/401964f0-4296-42b9-a6ac-8813ae4b85dd.png`).
- `manager-real-approvals-history.png` – Real Naumen: Approvals list with history toggle (`docs/UAT/real-naumen/2025-11-01_manager-portal/b4f129d8-9e79-43b5-8f1b-23a732a1713b.png`).
- `manager-real-approvals-dialog.png` – Real Naumen: Approvals review dialog disposition radios (`docs/UAT/real-naumen/2025-11-01_manager-portal/b4c83c1e-d48d-4a5a-849c-5192bc25719e.png`).
- `manager-real-reports-catalogue.png` – Real Naumen: Reports catalogue with Основные/Дашборды tabs (`docs/UAT/real-naumen/2025-11-01_manager-portal/2ebe157c-bc93-4119-9b54-617d2ddaf252.png`).
- `manager-real-report-download.png` – Real Naumen: Button + queue entry after экспорт (`docs/UAT/real-naumen/2025-11-01_manager-portal/29abc770-1cbc-41fb-bf8d-4bcb9956d4d1.png`).
- `manager-real-bell-queue.png` – Real Naumen: Bell dropdown showing pending export with expiry (`docs/UAT/real-naumen/2025-11-01_manager-portal/05079efd-059e-42cf-9746-f38036dd41cf.png`).
- `manager-real-vacations-tab.png` – Real Naumen: Vacations planner actions (`docs/UAT/real-naumen/2025-11-01_manager-portal/5f9a3b0d-63c2-491a-a26c-a7b81f8e245f.png`).
- `manager-real-monitoring.png` – Real Naumen: Monitoring panel SLA summary (`docs/UAT/real-naumen/2025-11-01_manager-portal/660667fc-bf9c-4d2d-ac22-c07c81892dfc.png`).
- `manager-real-tasks.png` – Real Naumen: Tasks panel with checklist (`docs/UAT/real-naumen/2025-11-01_manager-portal/67f0ee0b-12b5-4175-aaee-a49a95d1de52.png`).
- `manager-real-employee-drawer.png` – Real Naumen: Employee edit drawer baseline (`docs/UAT/real-naumen/2025-11-01_manager-portal/28cedaa9-0562-4e27-97b6-7525d8c4f951.png`).

## Analytics Dashboard Demo
- `analytics-trend-playwright.png` – Playwright artifact (`e2e/artifacts/analytics-trend-playwright.png`) showing Advanced Analytics dual-axis trend.
- `playwright-analytics-kpi-trend.png` – Playwright capture validating secondary axis labelling.
- `analytics-forecast-build.png` – Playwright artifact (`${ANALYTICS_REPO}/e2e/artifacts/forecast-build.png`) documenting Forecast Builder result chart + confidence band.
- `analytics-reports-card.png` – Playwright artifact (`${ANALYTICS_REPO}/e2e/artifacts/reports-card.png`) highlighting reports export card with CSV button state.
- `forecasting-timezone-selector.png` – Manual capture of shell header showing timezone dropdown (МСК ↔ Челябинск) post-Phase D deploy `forecasting-analytics-d985qxj4y`. Needed for Step 6 parity logging.
- `forecasting-accuracy-detail.png` – Manual capture of Accuracy dashboard detail table verifying RU format + export button presence (`/accuracy` tab).

## WFM Employee Portal
- `portal-requests-playwright.png` – Playwright artifact (`e2e/artifacts/portal-requests-playwright.png`) capturing status filter tabs + ReportTable on `/vacation-requests`.
- `portal-requests-after-fix.png` – Playwright capture (`test-results/portal-requests-after-fix.png`) showing single pending row + toast after submit (post-dedupe).
- `portal-work-structure.png` – Screenshot of Work Structure drawer open (org path, contacts, emergency contact) aligning with CH2 §§2.1–2.2.
- `portal-work-structure-search.png` – Drawer search results (пример: «Группа QA 1») demonstrating hierarchical lookup.
- `portal-vacation-history.png` – «Заявки за период» dialog with RU date placeholders, status toggles, summary counters, and approver notes.
- `portal-vacation-datefield.png` – New Request form date pickers showing `дд.мм.гггг` placeholder via DateField wrapper.
- `playwright-employee-request.png` – Playwright capture of the new vacation request dialog with validation errors visible.
- `portal-requests-duplicate.png` – Playwright capture (`test-results/portal-requests-duplicate.png`) illustrating duplicate rows after submitting “Новая заявка” (EP-1 failure).

## Forecasting & Analytics Demo
- `playwright-forecasting-accuracy.png` – Playwright artifact covering accuracy KPI deck + error analysis toggles on `/accuracy` (2025-10-29 React 18.3.1 deploy).
- `playwright-forecasting-trend.png` – Playwright capture of the trend dashboard dual-axis chart with confidence bands on `/trends` (2025-10-29 UAT rerun).
- `playwright-forecasting-adjustments.png` – Playwright capture of manual adjustment grid showing bulk tools and undo state on `/adjustments` (2025-10-29).
- `playwright-forecasting-build.png` – Smoke capture of the Build Forecast workspace (queue tree + absenteeism profile chips) on `/build` (2025-10-29).
- `playwright-forecasting-exceptions.png` – Smoke capture of Set Exceptions templates on `/exceptions` (2025-10-29).
- `playwright-forecasting-absenteeism.png` – Smoke capture of Absenteeism profile gallery on `/absenteeism` (2025-10-29).
- `portal-profile-edit.png` – Manual capture documenting Profile edit mode (FormField validation + emergency contact) per `uat-agent-tasks/` crosswalk.
- `portal-profile-appendix.png` – Profile view highlighting Appendix 1 identifiers, calendar/scheme history, and self-service buttons.

Add additional mappings here as screenshots evolve so future agents can jump directly to the right evidence set. Update section headings when new demos are onboarded.

## Naumen Real UI – Scheduling / Employees / Reports
- `docs/Tasks/uat-packs/5e3e0282-bce3-4836-a757-0182f6635065.png` – Reports index (Отчеты → Основные): list includes "График рабочего времени", "График рабочего времени (сутки)", "Пунктуальность за сутки", "Общая пунктуальность", "Рабочий график сотрудников", "Т‑13", "Журнал построения расписания", "Лицензии".
- `docs/Tasks/uat-packs/a8a92086-c6d8-4f72-85a4-704dfcf52f1d.png` – Reports index (Отчеты tabs visible; Основные/Дашборды).
- `docs/Tasks/uat-packs/50368a13-c84a-473e-9385-e7f1dbacadd8.png` – Employees list: toolbar with «Теги», «Импортировать», «Экспортировать», checkbox «Показывать уволенных», row baseline.
- `docs/Tasks/uat-packs/6e65c9c7-f203-45f9-bdba-3eb686dfe125.png` – Employees column picker (Настройка отображения) with extensive field list (логины, навыки, схема работы, теги, адрес, телефон, email, др.).
- `docs/Tasks/uat-packs/7a4f2839-126f-403f-ba9a-1b50c369127f.png` – Scheduling → События: new event form (время проведения, активность, участники, тип распределения – одновременно/последовательно/по нагрузке).
- `docs/Tasks/uat-packs/cb5d3ea9-a55b-4a52-ab64-7cda5158cd95.png` – Scheduling → Отпуска: построенные/непостроенные/опубликованные; годовой просмотр, импорт графика, экспорт, очистить все.
