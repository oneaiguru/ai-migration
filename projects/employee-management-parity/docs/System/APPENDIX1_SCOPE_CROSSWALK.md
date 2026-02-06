# Appendix 1 Scope Crosswalk (Initial)

| Feature ID | Description | Pilot Scope | Status | Notes |
| --- | --- | --- | --- | --- |
| 26–29 | Tags (limit 4, catalog, save, filter) | Out (pilot excludes 26–29) | Deferred | Phase 8 deferral logged |
| 31–50 | Bulk Edit (skills/status/tags/schemes + summary) | Out (pilot excludes 31–50) | Deferred | Phase 8 deferral logged |
| 51 | Import employees | In | Implemented | Trimmed build supports import |
| 56 | Import check | In | Implemented | Validation present; headings copy tidy deferred |
| 62–63 | List + Edit UI | In | Implemented | Core flows pass smoke |
| 70 | Save gating | In | Implemented | Required fields gate save |

## Manager Portal Demo – Appendix 1 mapping

> This demo showcases management views (Dashboard, Teams, Approvals) and does not implement the Employees module flows from Appendix 1. Items below are mapped as Out-of-Scope/Absent with code evidence.

| Feature ID | Description | Pilot Scope | Status | Evidence / Notes |
| --- | --- | --- | --- | --- |
| 51 | Import employees | In (Employees module) | Absent in demo | No Employees screen; nav shows Dashboard/Teams/Approvals/Schedule/Reports/Settings only (src/components/Layout.tsx:12) |
| 56 | Import check | In (Employees module) | Absent in demo | No import controls in Manager Portal screens (src/pages/Reports.tsx:9 placeholder only) |
| 62–63 | List + Edit UI (Employees) | In (Employees module) | Absent in demo | Manager Portal lacks Employees list/edit; shows Teams/Approvals instead (src/components/Layout.tsx:13, src/pages/Teams.tsx:151) |
| 26–29 | Tags (limit 4, catalog, save, filter) | Out (pilot excludes 26–29) | N/A here | No tag UI in Manager Portal screens (scan pages/*.tsx; none) |
| 31–50 | Bulk Edit (Employees) | Out (pilot excludes 31–50) | N/A here | No bulk-edit drawer in Manager Portal (Approvals has per-item dialog only, src/pages/Approvals.tsx:31) |
| — | Approvals review dialog (manager flow) | — | Present | Single-request review modal with approve/reject and optional/required note (src/pages/Approvals.tsx:31, src/pages/Approvals.tsx:121) — aligns to CH6 approvals workflow |

Reference: ${MANUALS_ROOT}/wfm/main/deliverables/frame-002/module-employee-management/final_package/ru/wfm_appendix_1.md:1

## Analytics Dashboard Demo – Appendix 1 mapping

> This demo focuses on executive analytics (KPI cards, trends, advanced charts) and does not implement Employees module flows. Items below are marked Absent with evidence.

| Feature ID | Description | Pilot Scope | Status | Evidence / Notes |
| --- | --- | --- | --- | --- |
| 51 | Import employees | In (Employees module) | Absent | React-проект сфокусирован на аналитике; маршрутов Employees нет (${ANALYTICS_REPO}/src/App.tsx:17) |
| 56 | Import check | In (Employees module) | Absent | Нет импорт UI/валидации в компонентах (${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:15) |
| 62–63 | List + Edit UI (Employees) | In (Employees module) | Absent | DepartmentPerformance остаётся read-only (`${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:26`) |
| 26–29 | Tags (Employees) | Out | N/A | No tag UI |
| 31–50 | Bulk Edit (Employees) | Out | N/A | No bulk-edit UI |

Engine evidence: Vite + React 18 + Chart.js wrappers (`${ANALYTICS_REPO}/src/components/charts/*`). Forecast builder + absenteeism analytics now cover Appendix CH6 forecasting highlights (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:38`, `${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:10`); reports export stub logs T‑13 metadata (`${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:18`).

## WFM Employee Portal – Appendix 1 mapping

> This demo focuses on employee self‑service (profile + vacation requests). Map only relevant Appendix 1 items.

| Feature ID | Description | Pilot Scope | Status | Evidence / Notes |
| --- | --- | --- | --- | --- |
| 1 | Create/Edit/View employee | In (edit/view) | Partial (Edit/View) | Профиль доступен в режиме просмотра/редактирования; создания нет (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:94-205`). |
| 3 | Required fields block | In | Present | Блок «Личные данные» (Имя, Фамилия, Отчество, Дата рождения) `Profile.tsx:214-276`. |
| 4 | Emergency contact | In | Present | Секция «Экстренный контакт» (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:657-731`). |
| 6 | Work info (position/team) | In | Present | Отдел/Должность и структура выводятся в шапке (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:139-166`). |
| 70 | Save gating | In | Present (basic) | Кнопки «Сохранить/Отмена» + валидация (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:127-205`). |
| 43 | KPI widgets (employee context) | Optional | Present | Dashboard метрики (Всего, На рассмотрении, Одобрено, Отклонено) `${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:93-280`. |
| 51 | Import employees | Out | N/A | Не реализовано в портале. |
| 56 | Import check | Out | N/A | Не реализовано. |
| 62–63 | List + Edit UI (Employees module) | Out | N/A | Портал только для self-service; списки сотрудников отсутствуют. |
| — | Vacation request submission loop (CH6 §6.7) | In | Present | Подача заявки + предотвращение дублей (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:216-310`, `src/data/mockData.ts:395-454`) и агрегированная история "Заявки за период" (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:926-1163`); подтверждено UAT 2025-10-26 (повторная проверка требуется на 2025-11-02 деплое). |
