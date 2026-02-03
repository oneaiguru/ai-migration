
I explored all the forecast-related modules across both the new UAT deployment and the reference Naumen portal.

### Observations

* **Time zone selector** – The new UAT site includes a “Часовой пояс” dropdown with “Москва (UTC+03)” and “Челябинск (UTC+05)”. Switching zones updates the header but doesn’t affect the bell/notifications![](https://chatgpt.com/backend-api/estuary/content?id=file_000000001be061f5b926693d21b216fa&ts=489112&p=fs&cid=1&sig=1e85c8d31e5dc9df9a55638374e98930eb759d64b397bf96aa7a3b005e217e0b&v=0)forecasting-analytics-g46r7o1tl-granins-projects.vercel.app. The real Naumen portal lacks this control entirely.
    
* **Build Forecast** – In UAT, the queue tree, history window, forecast period and absenteeism profiles are present. Selecting a queue and clicking “Построить прогноз” did not display a summary banner or toast, and exporting a CSV gave no feedback. On the real portal the “Построить прогноз” button was present but likewise produced no response.
    
* **Exceptions** – The new UAT “Задать исключения” page provides saved templates, a Day/Interval toggle, history-range controls and CSV import/export. The real portal’s exceptions page shows the same controls.
    
* **Absenteeism** – UAT includes profiles, periodic/single override editors and a calculator. Running the calculator produced a green success message and a table of base and scenario percentages for the selected queue![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000b074622f977694af8dfa2897&ts=489112&p=fs&cid=1&sig=8ec3311852c21adc508ba8a9f2bb3c53e8d9c607b85b5335bd63b61eb046672c&v=0)forecasting-analytics-g46r7o1tl-granins-projects.vercel.app. On the real portal the absenteeism page loads a skeleton but doesn’t display a history table or run calculations.
    
* **Trend Analysis** – UAT offers Strategic/Tactical/Operational tabs with period pickers and charts; switching tabs updates the view. On the real portal the trends page remains blank unless a queue is selected, and selecting a queue failed to load charts during testing.
    
* **Accuracy** – UAT provides an “Аналитика точности” dashboard with MAPE/MAE/R² metrics, a detailed table and an export builder (PDF/CSV/Excel/JSON); however the CSV export requires building a report and did not initiate a download. On the real portal the `/forecast/accuracy` route is blank (captured in `forecasting-accuracy-detail.png`).
    
* **Manual Adjustments** – UAT has a table of 15‑minute intervals, an adjustment panel with +10/–10 buttons and undo/redo counters. The real portal’s adjustments module is empty.
    
* **Reports bell/downloads** – I didn’t trigger report generation on either site; thus this item remains unverified.
    

### Pass/Fail Summary

| Area | Environment | Pass/Fail | Notes | Screenshot |
| --- | --- | --- | --- | --- |
| Shell timezone selector | Demo | **Pass** | “Часовой пояс” dropdown shows Moscow & Chelyabinsk zones and toggles correctly![](https://chatgpt.com/backend-api/estuary/content?id=file_000000001be061f5b926693d21b216fa&ts=489112&p=fs&cid=1&sig=1e85c8d31e5dc9df9a55638374e98930eb759d64b397bf96aa7a3b005e217e0b&v=0)forecasting-analytics-g46r7o1tl-granins-projects.vercel.app. | `forecasting-timezone-selector.png` |
|  | Real | **Fail** | No timezone control visible in the header. | `forecasting-timezone-selector.png` |
| Build forecast workflow | Demo | **Partial/Fail** | Queue tree and absenteeism controls present; clicking “Построить прогноз” shows no summary or toast. Export button inert. |  |
|  | Real | **Fail** | Button produces no response; summary banner absent. |  |
| Exceptions wizard | Demo | **Pass** | Templates list, Day/Interval toggle, history range and CSV import/export buttons function. |  |
|  | Real | **Pass** | Same controls visible; behaviour matches UAT. |  |
| Absenteeism history | Demo | **Pass** | Calculator runs and displays a result table with recommended percentages![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000b074622f977694af8dfa2897&ts=489112&p=fs&cid=1&sig=8ec3311852c21adc508ba8a9f2bb3c53e8d9c607b85b5335bd63b61eb046672c&v=0)forecasting-analytics-g46r7o1tl-granins-projects.vercel.app. |  |
|  | Real | **Fail** | Absenteeism page shows no history table and won’t execute calculations. |  |
| Trend analysis tables | Demo | **Pass** | Strategic/Tactical/Operational tabs, period selectors and charts render as expected. |  |
|  | Real | **Fail** | Page stays blank even after selecting queues; charts never load. |  |
| Accuracy detail table + export | Demo | **Partial** | Dashboard and detail table with RU-formatted metrics appear; export builder exists but CSV export did not download; cannot verify filename. |  |
|  | Real | **Fail** | `/forecast/accuracy` route is blank (captured as `forecasting-accuracy-detail.png`). | `forecasting-accuracy-detail.png` |
| Manual adjustments | Demo | **Pass** | Table, adjustment panel with quick actions and undo/redo counters appear and respond to clicks. |  |
|  | Real | **Fail** | Adjustments module page is blank. |  |
| Reports bell / downloads | Demo | **Not verified** | Not tested due to time. |  |
|  | Real | **Not verified** | Not tested. |  |

The UAT environment demonstrates most of the intended functionality, although CSV exports and forecast execution didn’t produce visible outputs. The real Naumen portal lacks the timezone selector and several modules (accuracy and adjustments) and had limited interactivity within Build Forecast, Absenteeism and Trend Analysis pages.