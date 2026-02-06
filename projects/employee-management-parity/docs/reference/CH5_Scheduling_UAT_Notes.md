I've updated the CH5 chart mapping with details captured from the real Naumen scheduling module and prepared a first‑pass parity delta table. The updated markdown file is available here:

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
  

## Real product observations (Наумён – график расписания)

During the live comparison against the Naumen WFM scheduling module, several visual details were captured to refine the chart wrapper mapping:

* **Coverage bars** – In the day/period schedule view each employee’s work segment is rendered as a **solid green bar**. Break periods are shown in **pale yellow**, and non‑working/absence segments use a **pale pink** fill. These colours match the core Naumen palette rather than the mock’s default tokens.
  
* **Forecast vs plan lines** – The “Прогноз + план” tab overlays a line chart above the schedule grid. Two solid lines represent forecast (planned FTE) and actual plan; the line colour switches to **blue** when the ∑/headcount toggles are enabled. Gridlines remain light grey.
  
* **Deviation bars** – The “Отклонения” (deviations) view switches to a bar chart where negative values are coloured **red** and positive values remain **green**. Bars clamp at zero; no overflow beyond the y‑axis.
  
* **Service level target** – In the “Уровень сервиса (SL)” view the service‑level metric appears as a line with a **dashed** style. A small slider to the right sets the target SL (e.g., 90 %); the target label appears above the chart.
  
* **KPI panel** – Above the chart area a KPI panel summarises **Coverage**, **Deviations** and **Service level**. Each card uses a coloured trend arrow (green upward arrow for improving metrics, red downward arrow for deteriorating metrics) and clamps percentage values between 0 and 100 %.
  
* **Toggles and sliders** – A pair of checkboxes labelled `∑` and a numeric value (e.g., `123`) toggle the display of total FTE and headcount lines on the chart. A blue slider bar adjusts the SL threshold. An arrow on the left labelled “Нагрузка” collapses or expands the underlying load chart; this chart uses thin bar segments to visualise staffing load.
  
* **Empty/error states** – When there are no schedule change or shift exchange requests the “Заявки” (requests) screen presents an empty table with filters for date ranges and statuses (на рассмотрении, одобренные, отклонённые). Toast notifications appear in the bottom‑right corner for operations (e.g., “FTE пересчитано.” or error messages such as “Функция отключена”).
  

These observations should be reflected in future updates of the mock so that colours, dash patterns, labels and interactive controls match the real product. The maximum number of screenshots used for the parity check was seven (coverage day/period, deviation trend, KPI panel, toggles/slider, empty/error state).

## Validation

* `npm run build`
  
* `npm run test`
  
* `npm run storybook:build`
  
* Production preview: [https://schedule-grid-system-mock-oc2jc37u9-granins-projects.vercel.app](https://schedule-grid-system-mock-oc2jc37u9-granins-projects.vercel.app)
  

### Parity delta (real product vs our Live Scheduling demo)

| Area                        | Status                    | Evidence                                                     | Fix hint                                                     |
| --------------------------- | ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Build schedule**          | A – Missing modal         | In Naumen a modal titled **“Построить расписание”** appears when clicking “Построить”: it shows an organisation tree on the left and a form on the right with options like **“Привести к норме часов”**, **“Учитывать предпочтения (%)”**, **“Сохранить комментарии на период построения”** and **“Равномерность по началу смен”**![](https://sdmntprwestus.oaiusercontent.com/files/00000000-bc68-6230-b8f4-e68ecd68ed1c/raw?se=2025-10-12T12%3A16%3A21Z&sp=r&sv=2024-08-04&sr=b&scid=90983f93-faa4-570b-85b2-ed6417f3becf&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-12T11%3A24%3A44Z&ske=2025-10-13T11%3A24%3A44Z&sks=b&skv=2024-08-04&sig=JikwK8Qe5bHrafy3ZOQp%2BCLxaw5yKE516Dcit2S36QA%3D)wfm-practice51.dc.oswfm.ru. Our mock doesn’t expose this multi‑step dialog. | Implement a two‑tab modal for building schedules; reproduce the checkboxes and copy exactly; enable build only when a group/date range is chosen. |
| **Publish schedule**        | A – Missing functionality | The second tab of the same modal, **“Опубликовать расписание”**, lets users choose a date range and organisation unit, then publish changes![](https://sdmntprwestus.oaiusercontent.com/files/00000000-0454-6230-9bef-646ecc5060f4/raw?se=2025-10-12T12%3A16%3A30Z&sp=r&sv=2024-08-04&sr=b&scid=36db5fbd-3fc5-549f-a5e4-d61306295531&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-11T23%3A45%3A57Z&ske=2025-10-12T23%3A45%3A57Z&sks=b&skv=2024-08-04&sig=eMYEGTcrMKjN1D4TLmT3Fq6DOUzrK7IhnQ5g6xmyMvY%3D)wfm-practice51.dc.oswfm.ru. This tab and its gating behaviour (button disabled until a group is selected) aren’t available in the demo. | Add a publish tab with identical wording; disable the publish button until prerequisites are met. |
| **Recalc FTE**              | B – Needs parity          | Naumen has a dedicated **FTE recalc** icon; clicking it triggers a toast “FTE пересчитано.” confirming the recalculation![](https://sdmntprwestus.oaiusercontent.com/files/00000000-5bfc-6230-84ef-a0c0f428a10b/raw?se=2025-10-12T12%3A18%3A46Z&sp=r&sv=2024-08-04&sr=b&scid=256c7f01-5513-5dfb-b0cc-848d36b447f9&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-11T23%3A28%3A19Z&ske=2025-10-12T23%3A28%3A19Z&sks=b&skv=2024-08-04&sig=9H3ia5gzmXcXCpcjWkHzwxLw3NA/qao%2Bmj6wYzJligU%3D)wfm-practice51.dc.oswfm.ru. The chart area also includes checkboxes `∑` and a number (e.g., `123`) to toggle FTE/headcount lines, plus a blue slider for service‑level thresholds![](https://sdmntprwestus.oaiusercontent.com/files/00000000-f264-6230-b047-3ecaa0830860/raw?se=2025-10-12T12%3A17%3A21Z&sp=r&sv=2024-08-04&sr=b&scid=7458c554-2607-5d84-8239-8d07260d2137&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-11T23%3A26%3A15Z&ske=2025-10-12T23%3A26%3A15Z&sks=b&skv=2024-08-04&sig=/LstpOTcw11DbelFyE892DB8WazJGtOD4QRd76DvrZs%3D)wfm-practice51.dc.oswfm.ru. Our mock lacks the recalc button, toasts and toggles. | Add an FTE recalculation control with success toast and replicate the ∑/headcount toggles and SL slider. |
| **Day optimise**            | A – Not implemented       | In Naumen, clicking a date with floating activities enables a day‑optimisation icon (not visible in the mock). The system reports success (“Оптимизированы смены сотрудников: n”) or “0” when no optimisation is needed (as per CH5 doc). | Provide a day optimisation icon that scans shifts with floating breaks and shows success/zero messages. |
| **Period optimise**         | A – Not implemented       | Naumen offers a period‑optimisation side panel where users pick variant (“Перерывы” or “Смены”), date range and confirm a warning that shifts may change (CH5 docs). The demo doesn’t have this panel. | Implement a period optimisation dialog with variant selection, date range and confirmation text. |
| **Additional shifts**       | A – Missing flow          | In Naumen, the day view includes a plus icon for **Дополнительные смены**; clicking opens a form with a forecast FTE chart, stop criteria (“FTE 15 мин.” / “Σ FTE”) and reserve skills toggles (CH5 docs). Additional shifts can be generated and manually drawn. Our demo hasn’t exposed this workflow. | Add the additional shifts form with FTE chart, stop‑criteria toggles, and manual drawing capability. |
| **Requests / bulk approve** | B – Needs parity          | The **“Заявки”** section contains two sub‑views: **“Изменение расписания”** and **“Обмен сменами”**. It lists requests with filters for date range and status (на рассмотрении, одобренные, отклонённые), and buttons **“Одобрить выбранные”** / **“Отклонить выбранные”**![](https://sdmntprwestus.oaiusercontent.com/files/00000000-4934-6230-b444-88c30fb51e44/raw?se=2025-10-12T12%3A19%3A26Z&sp=r&sv=2024-08-04&sr=b&scid=347a8484-39be-5933-9c34-52072d47d547&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-11T23%3A28%3A49Z&ske=2025-10-12T23%3A28%3A49Z&sks=b&skv=2024-08-04&sig=ma6eHz4UihTFGTpJtaDwCZf5DZMFzu/ZjcYpLS7I190%3D)wfm-practice51.dc.oswfm.ru. Our mock currently lacks this page and mass‑action buttons. | Add a requests module with the same filters, columns and bulk approve/decline actions. |
| **Shift exchange**          | B – Needs parity          | Under **“Обмен сменами”** users can search by employee and see pending shift‑exchange requests. Currently there’s only an empty state but all labels are in place![](https://sdmntprwestus.oaiusercontent.com/files/00000000-4934-6230-b444-88c30fb51e44/raw?se=2025-10-12T12%3A19%3A26Z&sp=r&sv=2024-08-04&sr=b&scid=347a8484-39be-5933-9c34-52072d47d547&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-11T23%3A28%3A49Z&ske=2025-10-12T23%3A28%3A49Z&sks=b&skv=2024-08-04&sig=ma6eHz4UihTFGTpJtaDwCZf5DZMFzu/ZjcYpLS7I190%3D)wfm-practice51.dc.oswfm.ru. This view is missing in the demo. | Implement the shift‑exchange screen with identical labels and filters. |
| **Reports export**          | B – Needs parity          | The real reports section lists: **“График рабочего времени”**, **“График рабочего времени (сутки)”**, **“Пунктуальность за сутки”**, **“Общая пунктуальность”**, **“Рабочий график сотрудников”**, **“Табель учета рабочего времени (Т‑13)”**, **“Журнал построения расписания”** and **“Лицензии”**![](https://sdmntprwestus.oaiusercontent.com/files/00000000-0b70-6230-8c00-64fb4f798b2e/raw?se=2025-10-12T12%3A20%3A07Z&sp=r&sv=2024-08-04&sr=b&scid=9ff0d2a8-d4f8-5215-829d-6bd8f18d9eaf&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-11T23%3A26%3A11Z&ske=2025-10-12T23%3A26%3A11Z&sks=b&skv=2024-08-04&sig=pNx4VMhkdWYg47F5sUGYM%2BG%2BKR9ZmrY/jLhvScopGIg%3D)wfm-practice51.dc.oswfm.ru. Our demo’s export options don’t match this list. | Align the report names and export actions with the real product; ensure Excel downloads trigger correctly and no extra/custom reports appear. |

### Top gaps to address

1. **Build / Publish modal** – The schedule build flow in Naumen uses a two‑tab modal with specific checkboxes and wording (“Привести к норме часов”, “Учитывать предпочтения (%)”, etc.), absent from our demo.
   
2. **FTE recalculation & SL slider** – Real UI features a recalc‑FTE button, ∑/headcount toggles and a blue SL‑target slider with success toasts. These controls must be replicated.
   
3. **Optimisation flows** – Day and period optimisation icons open confirmation dialogs and return success/zero messages; our demo lacks both flows.
   
4. **Additional shifts** – Naumen’s day view contains a plus icon that opens a generation form with FTE charts and stop‑criteria toggles; this is missing in our demo.
   
5. **Requests & shift exchange** – The real product includes separate pages for schedule‑change requests and shift exchanges with filters and bulk approval buttons. These features aren’t currently represented in the demo.
   

### One‑liner per flow

* **Build schedule** – In the real app, clicking “Построить” opens a multi‑option modal; replicate this structure.
  
* **Publish schedule** – Publishing uses its own tab within the build modal and enforces group selection before enabling the button.
  
* **Recalc FTE** – A dedicated icon recalculates FTE and shows a toast; toggles let users overlay FTE/headcount lines on the chart.
  
* **Day optimise** – Selecting a date with floating breaks activates an optimisation icon; success and zero‑optimised messages appear accordingly.
  
* **Period optimise** – A side panel allows optimisation over multiple days, requiring the user to acknowledge that shifts may change.
  
* **Additional shifts** – A plus icon opens a form to generate additional shifts with FTE chart, stop criteria and reserve‑skill toggles.
  
* **Requests / Bulk** – The requests module lists schedule change and shift exchange requests with filters and mass approve/decline actions; currently empty in test data.
  
* **Shift exchange** – Users can review and act on shift‑exchange requests per employee; the view shares the same filters as requests.
  
* **Reports export** – The reports section includes specific report names (e.g., “График рабочего времени”, “Т-13”); export flows should mirror the real options.