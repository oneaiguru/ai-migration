
Use the credentials in the UAT prompt to log into the production portal (`/schedule/graph`). Keep the manual (`${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md`) open alongside its images from `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/images/`.

1. **Header & Рабочая структура**
   - Manual refs: CH2_Login_System.md §§2.1–2.3 (рис.2)
   - Check the dark header modules (_Прогнозы_, _Расписание_, _Сотрудники_, _Отчёты_) and open the "Рабочая структура" drawer.

2. **Прогнозы → Построить прогноз**
   - Manual §4.1 — `image4.png`, `image36.png`
   - Select a queue in the tree (left column) and review period/history controls plus absenteeism profile selectors.

3. **Прогнозы → Задать исключения**
   - Manual §4.1 — `image3.png`, `image11.png`
   - Toggle between "День" and "Интервал", inspect periodic and one-time exception editors, review import/export actions.

4. **Прогнозы → Анализ трендов**
   - Manual §4.2 — `image27.png`, `image28.png`
   - Cycle Strategic/ Tactical/ Operational tabs, note seasonality tables, anomaly controls, and dual-axis charts.

5. **Прогнозы → Расчёт абсентеизма**
   - Manual §4.3 — reference absenteeism templates in the real portal (images are not included in the pick list).

6. **Прогнозы → Просмотр и анализ прогноза**
   - Manual §4.4 — `image60.png`, `image80.png`
   - Inspect chart + tabular breakdown, export icons, and aggregation tools.

## Usage Checklist for UAT Agents
1. Login via OIDC → confirm header/navigation per **CH2**.
2. `/accuracy`: walk through KPI deck, trend chart, and error analysis toggles referencing **CH4 §4.1/4.4** (note terminology for MAPE/MAPE, absenteeism adjustments).
3. `/build`, `/exceptions`, `/absenteeism`: confirm queue tree, exception templates, and absenteeism profiles align with **CH4 §4.1–4.3** (compare to manual images listed above).
4. `/trends`: cycle Strategic/Tactical/Operational tabs, confirm seasonality + anomaly notes using **CH4 §4.2**. Capture evidence for FA‑1.
5. `/adjustments`: perform bulk +10 / undo, ensure status badges clear – cite **CH4 §4.4** tables where manual describes manual edits. Capture FA‑2 evidence.
6. Record findings in `uat-agent-tasks/2025-10-26_forecasting-uat.md` with manual sections in the Notes column. Use screenshot aliases from `docs/SCREENSHOT_INDEX.md` (e.g., `playwright-forecasting-trend.png`, `playwright-forecasting-build.png`).
7. Keep manual images (рис.26–31 etc.) open while testing to compare graph layouts and RU copy.

## Gaps / Follow-ups to Flag
- **Live API integration**: Manual assumes real data + absenteeism template application; demo currently simulates via `forecastingApi.ts`. Note this delta when reporting.
- **Exception management UI**: Demo now mirrors CH4 §4.1 templates; API-backed import/export still pending.
- **Export placements**: If UAT requires Excel exports, note manual block (7) vs. demo roadmap.

Citing the manual chapters in your UAT notes keeps parity discussions anchored to the production “foundation” described in Chapter 4.