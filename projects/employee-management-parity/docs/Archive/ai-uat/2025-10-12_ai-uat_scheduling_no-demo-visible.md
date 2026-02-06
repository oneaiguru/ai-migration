I've added the UAT behavioural-check table and analysis to your scheduling repository’s chart mapping document. The updated file includes notes about the limited access to the Vercel mock, observations drawn from the real Naumen module, and the major open questions for follow‑up. You can find the updated document here:

# CH5 Schedule Reports → Chart Wrapper Mapping

_Date: 2025-10-20_

| Doc (section)              | Visualization                        | Component     | Props (units / clamps / toggles / targets)                   | Notes                                                    |
| -------------------------- | ------------------------------------ | ------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| CH5 Schedule Build §3.1    | Покрытие смен по дням                | `LineChart`   | `yUnit="people"`, `area`, labels derived from dates          | Forecast vs plan view в `ForecastChart` и `ChartOverlay` |
| CH5 Schedule Build §3.1    | План vs прогноз (столбцы отклонений) | `BarChart`    | `yUnit="people"`, negative values set `metadata.color` red, clamp auto | Uses `BarChart` deviations view with dynamic bar colors  |
| CH5 Schedule Advanced §2.4 | Уровень сервиса                      | `LineChart`   | `yUnit="percent"`, `clamp={{ min: 70, max: 100 }}`, `targets=[{ label: 'Цель 90%', style: 'dashed' }]` | Service view in `ForecastChart` and `ChartOverlay`       |
| CH5 Schedule Build §2.2    | KPI карточки (coverage/adherence/SL) | `KpiCardGrid` | Items with `variant` + `trend` glyphs                        | Pending data hook wiring in future release               |
| CH5 Schedule Build §4.6    | Журнал построения / действия         | `ReportTable` | Columns: дата, смена, план, факт                             | Placeholder rows generated locally                       |

## Unknowns for UAT Capture

* Precise цветовые токены и тени для серий и столбцов (снимки UI нужны).
  
* Окончательный шаблон штриховки целевых линий (длина штриха, прозрачность).
  
* Подписи осей/легенд в продуктивной UI (формулировки и регистр).
  
* Сценарии пустых/ошибочных данных в боевой системе (доп. копирайтинг).
  

## Validation

* `npm run build`
  
* `npm run test`
  
* `npm run storybook:build`
  
* Production preview: [https://schedule-grid-system-mock-oc2jc37u9-granins-projects.vercel.app](https://schedule-grid-system-mock-oc2jc37u9-granins-projects.vercel.app)
  

## UAT Behavioural Checks (Phase 9 Scheduling)

**Context:** The production preview link for the schedule grid system mock was behind a Vercel authentication barrier and could not be accessed directly, so the behavioural smoke tests below are based solely on the real Naumen WFM scheduling module. Many of the chart‑specific toggles and KPI cards referenced in the spec are not exposed in the real module, so results are preliminary. Where a behaviour could not be verified, the status is marked with a question mark.

| Check                           | Pass/Fail | Notes                                                        | Screenshot                   |
| ------------------------------- | --------- | ------------------------------------------------------------ | ---------------------------- |
| **Day / Period toggle**         | ❓         | The schedule graph page in Naumen did not expose a clear switch between day‑level and period‑level datasets. This behaviour could not be verified without access to the mock build. | —                            |
| **Coverage / Adherence toggle** | ❓         | Real module shows tabs such as **«Прогноз + план»**, **«Отклонения»** and **«Уровень сервиса (SL)»** but no explicit coverage/adherence switch; the demo’s intended toggle could not be tested. | —                            |
| **KPI tiles**                   | ❓         | No KPI card panel is present in the real schedule graph. Because the mock could not be loaded, the consistency of KPI values with toggles/filters remains unknown. | —                            |
| **Tooltips / Legend**           | ❓         | The miniature chart overlay above the schedule grid in Naumen did not display series or tooltips (likely because no forecast data was loaded). Without the mock, legend placement and copy could not be assessed. | —                            |
| **Units / Labels**              | ⚠️         | In the real graph, the **«Уровень сервиса (SL)»** view expresses values in percent and the **Σ** toggle overlays headcount/FTE counts. Axis labels are in Russian and appear reasonable, but without the mock the full set of units and labels remains unverified. | [352980293756634†screenshot] |
| **Filters / Toolbar**           | ✅         | The skill/queue filters in the left sidebar work as expected in the real graph: selecting/deselecting options updates the schedule grid without errors or freezes. | —                            |
| **Empty / Error states**        | ✅         | When there is no data selected (e.g., forecast module with no queues chosen), the charts show blank axes and no crashes occur. Error messages are not displayed, but the pages remain usable. | —                            |
| **Accessibility**               | ❓         | Keyboard navigation and ARIA labels could not be assessed. The real module relies on clickable tabs and checkboxes but does not advertise keyboard shortcuts; without the mock, a full accessibility audit is pending. | —                            |
| **Performance / Errors**        | ✅         | Navigation within the real scheduling module and interactions with filters and sub‑pages were responsive; no visible console errors were encountered. | —                            |

### Functional issues and open questions

1. **Access to the demo:** the Vercel hosted schedule grid mock (production preview) requires authentication, so none of the CH5 chart behaviours (day/period toggle, coverage vs adherence, KPI tiles) could be validated. Please provide a publicly accessible build or credentials.
   
2. **Missing toggles in real product:** the real Naumen scheduling module lacks explicit day/period and coverage/adherence toggles. It only offers tabs for **«Прогноз + план»**, **«Отклонения»** and **«Уровень сервиса (SL)»**, and Σ/123 controls for FTE/headcount. If the demo implements additional toggles, the spec should clarify their correspondence to real features.
   
3. **KPI panel absent:** KPI tiles (coverage, adherence, SL) described in CH5 do not appear in the real product. If they are required in the demo, the tile values and labels will need to be defined from first principles.
   
4. **Chart overlay visibility:** In the real graph the miniature chart overlay is very narrow and did not display data with the available dataset. Ensure the demo expands this area or provides sample data so that tooltips and legends can be tested.
   
5. **Accessibility and keyboardability:** Without access to the demo, keyboard navigation, focus management, and ARIA labels could not be confirmed. These remain outstanding items for further testing.
   

Since the Vercel-hosted demo requires authentication, I based the behavioural evaluation on the real product; for several checks (day/period toggle, coverage/adherence toggle, KPI tiles, tooltips/legend, accessibility) the status is marked as “❓” because the mock wasn’t accessible. The only elements I could confirm were general units/labels, filter behaviour, empty/error states, and overall performance![](https://sdmntprwestus.oaiusercontent.com/files/00000000-86f4-6230-8d6e-5c56d9c470b3/raw?se=2025-10-12T12%3A50%3A58Z&sp=r&sv=2024-08-04&sr=b&scid=f3ab636f-4393-58fe-8f08-dd79dd595450&skoid=04233560-0ad7-493e-8bf0-1347c317d021&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-12T10%3A13%3A12Z&ske=2025-10-13T10%3A13%3A12Z&sks=b&skv=2024-08-04&sig=k8WDDMdol0SFegLPGsNlISCjPUiCKKlCnvApwIwk2T0%3D)wfm-practice51.dc.oswfm.ru. The document also lists functional issues and questions, including the absence of explicit day/period or coverage/adherence toggles in the real product and the lack of KPI panels, which will need clarification when the demo becomes available.