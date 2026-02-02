# Forecasting & Analytics — UAT Run Guide (2025-10-30)

## Purpose
Provide the external UAT agent with a single reference outlining environments, parity packs, and the real-system screenshots used for comparison.

## Targets
- **Production demo**: https://forecasting-analytics-oyldslume-granins-projects.vercel.app
- **Real system (Naumen WFM)**: OIDC macro in `UAT_PROMPT_2025-10-30.txt` (paste via Ctrl+0 → Ctrl+L).

## Packs to execute
1. `docs/Tasks/uat-packs/parity_static.md` (Forecasting & Analytics section).
2. `docs/Tasks/uat-packs/chart_visual_spec.md` (Forecasting charts subset).

## Focus checks & evidence
| Check | Expected behaviour | Evidence alias |
| --- | --- | --- |
| Trends — confidence band + legend | Queue + period selected loads “Прогноз vs факт” with shaded band and secondary-axis label “Отклонение, %”. | `forecasting-real-trend-queue` (prod reference), `playwright-forecasting-trend.png` (demo baseline). |
| Manual adjustments bulk flow | Select multiple rows → **+10** applies badges, **Отменить/Повторить** cycle values without console errors. | `playwright-forecasting-adjustments.png` |
| Accuracy dashboard RU formatting | KPI cards render with comma decimals and non-breaking space before `%`; error-analysis toggles switch charts. | `playwright-forecasting-accuracy.png` |
| Build forecast workflow parity | Prod offers queue tree, dual horizon pickers, absenteeism profile/value toggle, and import actions. | `forecasting-real-build-form`, `forecasting-real-build-header` |
| Exceptions editor parity | Prod exposes day/interval toggle, dual horizons, custom ranges. | `forecasting-real-exceptions-overview`, `forecasting-real-exceptions-detail` |
| Absenteeism calculator parity | Prod calculator supports horizon + interval selection and outputs summary banner. | `forecasting-real-absenteeism-controls` |

## Reporting template
Use the table embedded in `UAT_PROMPT_2025-10-30.txt`. Add extra rows for any additional findings and cite the screenshot alias above.

## Attachments to upload
- Screenshots only when documenting failures. Baseline references reside in `/Users/m/Desktop/tmp-forecasting-uat/` under the alias names listed in `docs/SCREENSHOT_INDEX.md`.

## Notes
- Trend charts in both systems stay blank until a queue and period are applied; document when data is absent.
- CSV exports remain simulated (no file download). Mention any console errors if they appear during export attempts.
