
I followed your instructions by exploring all forecasting sub-routes on the **real Naumen** portal (using the pre‑opened tabs) and running through the Stage‑6 parity checklist. The session remained logged in throughout, so I skipped the login macro. Here’s what I found:

### Observations on the Real Naumen Portal

1. **Shell / Timezone selector** – The header shows user profile, notification bell and export icon, but **no timezone dropdown** is present. This differs from the demo, which includes a “МСК / Челябинск” selector.
    
2. **Build Forecast (`/forecast/build`)** – I was able to select a queue, set the historical and forecast ranges, and click **“Построить прогноз.”** A green toast “Успешная операция, Прогноз рассчитан” appeared, confirming the forecast ran successfully![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000b64c622f883f1f3e1e91cb83&ts=489113&p=fs&cid=1&sig=15556b6c64d2d527afa1302104347f31d7d27702b2844bdebae089acfb84309e&v=0)wfm-practice51.dc.oswfm.ru. There is no summary banner and the right‑side buttons say **“Загрузить прогноз,”** which appear to be upload buttons rather than the expected CSV export. Without the timezone selector, date pickers always show Moscow time.
    
3. **Exceptions (`/forecast/set-untypical`)** – The page shows the queue tree, Day/Interval toggle and period/horizon fields. Selecting a queue enables the “Построить” button, but clicking it produces no editor; the central panel remains blank. There are no smoothing sliders or visible saved templates.
    
4. **Absenteeism (`/forecast/absenteeism-calc`)** – The page displays collapsible sections for forecast settings and exceptions, plus a summary card describing the horizon. However, clicking **“Построить прогноз”** does nothing; the run‑history table never populates and there is no calculator output. This module appears non‑functional.
    
5. **Trend Analysis (`/forecast/analysis-trends`)** – Tabs for Strategic/Tactical/Operational are present along with a queue selector. After selecting “Очередь 1,” the page remains empty—no charts or tables render.
    
6. **Accuracy (`/forecast/accuracy`)** – Navigating to this route loads a **blank page** with no content![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000c88861f58fed073960b9c850&ts=489113&p=fs&cid=1&sig=c3aba7c30445bf8b081657cfbe565bd29c75e015efddf8011c333da59ae9062a&v=0)wfm-practice51.dc.oswfm.ru. There are no KPIs, detail tables or export functions.
    
7. **Manual Adjustments (`/forecast/adjustments`)** – This route is also blank![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000bf4c622fb4f4bef8e9ea27d4&ts=489113&p=fs&cid=1&sig=4d142b1a7e0d5d11c4d03f7273fbd9973f806d04023af17faed800ea08aa6ddd&v=0)wfm-practice51.dc.oswfm.ru; there are no adjustment grids, counters or action buttons.
    
8. **Reports / Bell** – Using the main Reports tab, I opened a report (“Журнал построения расписания”), set the date range and clicked **“Сформировать.”** A success toast appeared, but the table remained empty. Clicking **“Выгрузить в Excel”** produced no file or bell notification. Opening the bell showed an empty notifications panel.
    

### Pass/Fail Table (Real Naumen)

| Area | Pass/Fail | Notes | Screenshot |
| --- | --- | --- | --- |
| **Shell / timezone selector** | **Fail** | Header lacks a timezone dropdown; cannot switch between Moscow and Chelyabinsk as the demo allows. | `forecasting-timezone-selector.png` (from earlier evidence) |
| **Build forecast workflow** | **Partial** | Selecting a queue and entering historical & forecast dates runs successfully and shows a success toast![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000b64c622f883f1f3e1e91cb83&ts=489113&p=fs&cid=1&sig=15556b6c64d2d527afa1302104347f31d7d27702b2844bdebae089acfb84309e&v=0)wfm-practice51.dc.oswfm.ru. There is no summary banner, and export buttons are labelled “Upload” rather than exporting CSV. |  |
| **Exceptions wizard** | **Fail** | Day/Interval toggle and period fields display, but clicking **“Построить”** does not open an editor or show smoothing sliders; central panel stays blank. |  |
| **Absenteeism history** | **Fail** | Absenteeism settings and summary appear but the “Построить прогноз” button does nothing; no run history or calculator output. |  |
| **Trend analysis tables** | **Fail** | Strategic/Tactical/Operational tabs and queue selector exist; selecting a queue still results in a blank page with no charts. |  |
| **Accuracy detail table + export** | **Fail** | Visiting `/forecast/accuracy` shows a completely blank page with no KPIs or export options![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000c88861f58fed073960b9c850&ts=489113&p=fs&cid=1&sig=c3aba7c30445bf8b081657cfbe565bd29c75e015efddf8011c333da59ae9062a&v=0)wfm-practice51.dc.oswfm.ru. | `forecasting-accuracy-detail.png` (captured earlier) |
| **Manual adjustments** | **Fail** | The `/forecast/adjustments` route displays nothing—no grid or controls![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000bf4c622fb4f4bef8e9ea27d4&ts=489113&p=fs&cid=1&sig=4d142b1a7e0d5d11c4d03f7273fbd9973f806d04023af17faed800ea08aa6ddd&v=0)wfm-practice51.dc.oswfm.ru. |  |
| **Reports bell / downloads** | **Fail** | Running and exporting a report does not add an entry to the bell queue; clicking the bell shows no notifications. |  |

Overall, the real Naumen portal’s forecasting module lacks key features present in the demo. Only the build forecast page allows running a forecast; other modules (exceptions, absenteeism, trends, accuracy, adjustments) are incomplete or non‑functional.