# Consolidated UAT Sweep — 2025-10-26

| Demo | Check ID | Pack(s) | Pass/Fail | Notes | Evidence |
| --- | --- | --- | --- | --- | --- |
| Manager Portal | MP-1 coverage/adherence toggle | parity_static.md, chart_visual_spec.md | Pass | Toggle exposes coverage/adherence datasets with RU labels after 2025-10-26 redeploy. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:12-25 |
| Manager Portal | MP-2 navigation + bulk exports | parity_static.md, trimmed_smoke.md | Pass | 2025-10-27 deploy confirms module tabs, org drawer filtering, and bulk export dialog. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:12-29 |
| Analytics Dashboard | AD-1 dual-axis legend | parity_static.md, chart_visual_spec.md | Pass | Legend shows primary/secondary axes; metadata registered via `secondaryAxis` prop. | docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md:11-21 |
| WFM Employee Portal | EP-1 vacation requests dedupe | parity_static.md, trimmed_smoke.md | Pass | parity_static + trimmed_smoke (2025-10-26) added exactly one row (All 5→6) on prod; Playwright log `test-results/portal-uat-results-2025-10-26.json`. | docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md:12-17 |
| Forecasting & Analytics | FA-1 confidence band shading | parity_static.md, chart_visual_spec.md | Pending | Awaiting executor run; wrappers deployed but UAT not started. | uat-agent-tasks/2025-10-26_forecasting-uat.md:12-22 |

## Next Steps
- Forecasting & Analytics pending rerun once routing fix verified.

# Consolidated UAT Sweep — 2025-10-27

| Demo | Check ID | Pack(s) | Pass/Fail | Notes | Evidence |
| --- | --- | --- | --- | --- | --- |
| Analytics Dashboard | AD-1 dual-axis legend | parity_static.md, chart_visual_spec.md | Pass | Regression on legend/axis labels retested after forecast parity changes; no console noise. | docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md:12 |
| Analytics Dashboard | AD-2 forecast build flow | parity_static.md, chart_visual_spec.md | Pass | Forecast Builder now consumes shared forecasting services (runForecastBuild/loadAbsenteeismSnapshot from `@wfm/shared/forecasting`); Playwright artifact `e2e/artifacts/forecast-build.png`. | docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md:16 |
| Analytics Dashboard | AD-3 reports CSV stub | parity_static.md | Pass | CSV download triggers blob; Playwright asserts `.csv` filename and captures reports card. | docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md:18 |
| Analytics Dashboard | AD-4 absenteeism snapshot | parity_static.md, chart_visual_spec.md | Pass | Observed vs forecast lines + reason table align with RU copy. | docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md:20 |

## Next Steps (2025-10-27)
- Capture absenteeism screenshot alias next UAT window.
- Forecasting & Analytics FA-1 remains pending until rerun.

## 2025-10-30 – Unified Demo Smoke (Top-nav parity deploy)

| Demo | Check ID | Pack(s) | Pass/Fail | Notes | Evidence |
| --- | --- | --- | --- | --- | --- |
| Unified Demo | Render + RU formatting (Employees) | unified-smoke.md | Pass | `/employees` mounts Employee Management full width under the new top nav; RU table/date formats intact on prod. | https://wfm-unified-demo-rd4u3hbbl-granins-projects.vercel.app/employees |
| Unified Demo | Render + toggles + overlays (Schedule) | unified-smoke.md | Pass | `/schedule/graph` renders Schedule package; secondary tabs present and stubs link; cURL + manual spot-check show no console errors. | https://wfm-unified-demo-rd4u3hbbl-granins-projects.vercel.app/schedule/graph |

## 2025-10-31 – Manager Portal parity remediation

| Demo | Check ID | Pack(s) | Pass/Fail | Notes | Evidence |
| --- | --- | --- | --- | --- | --- |
| Manager Portal | MP-SCH schedule parity | parity_static.md | Pass | Queue/date filters and CH5 tab panes render with mocked coverage/shift data. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:12 |
| Manager Portal | MP-APR approvals remediation | parity_static.md, trimmed_smoke.md | Pass | View/status/date filters, shift disposition radios, and note enforcement verified via vitest + smoke. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:14 |
| Manager Portal | MP-REP reports/download queue | parity_static.md, trimmed_smoke.md | Pass | Expanded CH6 catalogue with RU filenames and bell queue integration. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:13 |
| Manager Portal | MP-NAV shell parity | parity_static.md, trimmed_smoke.md | Pass | Header bell dropdown + right-hand Work Structure sheet match CH2 expectations. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:16 |

## 2025-11-02 – Manager Portal follow-up

| Demo | Check ID | Pack(s) | Pass/Fail | Notes | Evidence |
| --- | --- | --- | --- | --- | --- |
| Manager Portal | MP-SCH-REQ schedule requests presets | parity_static.md | Pass | «Заявки» sub-tab renders queue-aware table with presets/breadcrumb (`ScheduleTabs.tsx:80-190`). | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:33 |
| Manager Portal | MP-APR-FILTERS approvals history presets | parity_static.md, trimmed_smoke.md | Pass | Preset buttons + breadcrumb copy mirror CH5 (Approvals.tsx:52-164); vitest covers preset change. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:34 |
| Manager Portal | MP-REP-QUEUE download queue lifecycle | parity_static.md, trimmed_smoke.md | Pass | Confirm modal + bell expiry copy verified; queue retains entries until acknowledgement. | docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:35 |
