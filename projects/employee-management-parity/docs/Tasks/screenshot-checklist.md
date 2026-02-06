# Screenshot Checklist (Common)

## Manager Portal Demo
- Dashboard default (KPI tiles visible) — src/pages/Dashboard.tsx:90
- Dashboard charts (Team Coverage bar + Request Distribution pie) — src/pages/Dashboard.tsx:126, :143
- Dashboard Recent Activity list — src/pages/Dashboard.tsx:167
- Approvals default (view "Все", no filters) — src/pages/Approvals.tsx:225-270
- Approvals with shift disposition radio + reject note — src/pages/Approvals.tsx:320-370
- Teams list (sorted by coverage) — src/pages/Teams.tsx:155
- Team Detail modal open — src/pages/Teams.tsx:236
- Schedule Graph tab (coverage table) — src/components/schedule/ScheduleTabs.tsx:64-89
- Schedule Shifts tab (slot list) — src/components/schedule/ScheduleTabs.tsx:92-111
- Reports card + bell dropdown (download queue) — src/pages/Reports.tsx:10-66; src/components/Layout.tsx:148-177

- Default view (no overlays)
- Selection mode with active toolbar or toggles
- Chart screen with targets/toggles visible
- Quick add / Edit drawer (if applicable)
- Import/Export modals (context headers)
- Timeline/logs view (if applicable)
- Empty state / Error state
## Analytics Dashboard Demo
- KPI Overview default (KPI grid visible) — `${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:15`
- Call Volume Trend (line chart) — `${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:18`
- Department Performance table with utilization bars — `${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:26`
- Live Status widget — `${ANALYTICS_REPO}/src/features/analytics/LiveStatus.tsx:4`
- Advanced: Gauge charts row — `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:16`
- Advanced: Heatmap — `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:29`
- Advanced: Radar — `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:37`
- Advanced: Trend Analysis (dual-axis line) — `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:51`
- Playwright snapshot: `${ANALYTICS_REPO}/e2e/artifacts/trend-analysis.png`
- Forecast Builder run (confidence band visible) — `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:38`
- Playwright snapshot: `${ANALYTICS_REPO}/e2e/artifacts/forecast-build.png`
- Reports card (CSV actions) — `${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:18`
- Playwright snapshot: `${ANALYTICS_REPO}/e2e/artifacts/reports-card.png`
## Forecasting & Analytics Demo
- Shell header + status indicator — docs/System/images/forecasting/real-naumen_shell_header-status.png (production); capture analytics/forecasting shell for parity when bell wiring lands.
- Build Forecast queue tree + absenteeism options + banner — docs/System/images/forecasting/real-naumen_build-forecast_*; demo reference `playwright-forecasting-build.png`.
- Build confirmation toast — docs/System/images/forecasting/real-naumen_build-forecast_confirmation.png (check analytics variant once implemented).
- Set Exceptions form (toggle + templates) — docs/System/images/forecasting/real-naumen_exceptions_*; demo reference `playwright-forecasting-exceptions.png`.
- Trend Analysis tabs (strategic/tactical/operational) — docs/System/images/forecasting/real-naumen_trends_*; demo reference `playwright-forecasting-trend.png`.
- Absenteeism history + template editor — docs/System/images/forecasting/real-naumen_absenteeism_*; demo reference `playwright-forecasting-absenteeism.png`.
- Manual Adjustments grid + summary badges — docs/System/images/forecasting/real-naumen_adjustments_*; demo reference `playwright-forecasting-adjustments.png`.
- Accuracy dashboard tables + KPI deck — docs/System/images/forecasting/real-naumen_accuracy_*; demo reference `playwright-forecasting-accuracy.png`.
- Reports catalogue + export dialog — docs/System/images/forecasting/real-naumen_reports_*; demo reference `analytics-reports-card.png`.
- Shell timezone selector — capture `forecasting-timezone-selector.png` on the new prod deploy.
- Accuracy detail table + export button — capture `forecasting-accuracy-detail.png` (`/accuracy`).
## WFM Employee Portal
- Dashboard default (welcome + stat cards + balance) — ${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:93-334
- Dashboard recent requests list — ${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:200-240
- portal-work-structure.png — Drawer open (орг путь + контакты + экстренный блок) — ${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:16-211
- portal-work-structure-search.png — Поиск по подразделениям (пример: "Группа QA 1") — ${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:59-100
- Vacation Requests with each filter tab active — ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:205-333
- portal-vacation-history.png — Диалог "Заявки за период" с фильтрами по датам/статусам и счётчиком «Найдено записей» — ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:926-1163
- New Request dialog (validation + emergency checkbox, RU placeholder `дд.мм.гггг`) — ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:334-804
- portal-vacation-datefield.png — Крупный план DateField с placeholder `дд.мм.гггг` — ${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx:1-134
- Requests export toast (after CSV download) — ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:631-742
- Profile tabs (personal/contact/work/address/emergency) — ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:214-732
- portal-profile-appendix.png — Appendix 1 поля + история календарей/графиков — ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:214-343
- Profile edit mode + Save/Cancel toast — ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:118-205
