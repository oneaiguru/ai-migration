

> TODO (executor follow-up): Refresh this comparison for deploy `forecasting-analytics-3pemuiun9` using updated textual notes; sections below still reference the prior `etef3m532` build.

I extracted and reviewed the **forecasting illustrated guide bundle** (the quick sheet, markdown guide and the “real Naumen” screenshots). The images show how each module—Build Forecast, Exceptions, Trends, Absenteeism, Accuracy, Adjustments and Reports—should look and behave in the production Naumen portal. I then compared those screenshots to **both demo deployments** and the **real system**, re‑running tests where necessary and waiting longer for responses.

### Reference images (real Naumen)

The bundle’s images confirm that the real portal is expected to have:

* **A full queue tree** with search and favourites; when queues are selected a **selection summary banner** appears and the **“Postroить прогноз”** button becomes active.
    
* Separate **historical vs forecast date pickers** with Day/Interval toggle; a drop‑down to choose an **absenteeism profile or numeric percentage**; and an **upload area** for importing/exporting forecast, fact and absenteeism CSVs.
    
* After running a forecast, a **summary banner** appears with horizon/dates and status, and accuracy results are displayed in a **detailed table** with RU‑formatted metrics.
    
* The **Exceptions** module provides a **templates grid**, a queue selector, a Day/Interval toggle and import/export buttons.
    
* The **Trends** dashboard shows **Strategic, Tactical and Operational** charts/tables.
    
* The **Absenteeism** page includes an interval toggle, a **history table** and template editor.
    
* **Manual adjustments** provide a table of 15‑minute intervals with plus/minus controls, undo/redo and validation badges.
    
* The **Accuracy** dashboard shows KPI cards (MAPE, MAE, etc.) plus a detailed table, with export functions that should notify the bell.
    
* The **Reports** page lists a catalogue of reports with a format dropdown (CSV/XLSX/PDF) and triggers notifications via the bell.
    
* The shell header has a **timezone selector**, a notification **bell** and download icon.
    

These expectations came from the real‑Naumen screenshots inside the bundle (e.g., queue tree![](https://chatgpt.com/backend-api/estuary/content?id=file_000000003c8861f5bbc918f627fe3d22&ts=489114&p=fs&cid=1&sig=ca300b3feceaeee9c9c3f2f758a531ade36c4ca3eddbef9d67fba2fed1cfd068&v=0)wfm-practice51.dc.oswfm.ru, build summary banners and accuracy tables![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000930861f58e67f7bbcd8a2702&ts=489114&p=fs&cid=1&sig=ab2b27f52c3fc6bb04e112e671598737530b5b5ed38d60165d9b41d7848b2308&v=0)wfm-practice51.dc.oswfm.ru).

### Comparison across both demos and the real portal

| Module/Feature | Real portal (reference) | Demo 1: `forecasting-analytics-p6z0l224h…` (Live UAT) | Demo 2: `forecasting-analytics-etef3m532…` (new test deploy) | Notes |
| --- | --- | --- | --- | --- |
| **Shell header** | Should show organisation selector, timezone dropdown and bell. | **No timezone selector.** Bell present but clicking does nothing; exports don’t raise notifications. | **Timezone dropdown present (Moscow/Chelyabinsk), bell functional.** A purple badge appears when new exports or builds complete![](https://chatgpt.com/backend-api/estuary/content?id=file_000000007f9461f580ae7716e8d6e3e7&ts=489114&p=fs&cid=1&sig=006f7beb0719f9381d6f8a7c3a4ad2994e2b05dca744f78fc3e47569e47a762a&v=0)forecasting-analytics-etef3m532-granins-projects.vercel.app. | Demo 2 matches real expectation for timezone and bell; Demo 1 lacks these. |
| **Build Forecast queue tree & selection summary** | Queue tree with search; selecting queues highlights them and shows a summary banner. | Tree present; selection summary absent or doesn’t show chosen queues. | Tree and selection summary present; queue count updates; success banner after forecast![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000901461f5a442d0da16fd0309&ts=489114&p=fs&cid=1&sig=e88726afe2f23bcba6292a6f164a8c95db2906403d12993f9227dd9808b3d2b3&v=0)forecasting-analytics-etef3m532-granins-projects.vercel.app. | Demo 2 implements the summary banner; Demo 1 misses it. |
| **Historical vs forecast date range & absenteeism options** | Day/Interval toggle; separate date pickers; choose numeric absenteeism or profile; absenteeism profile editing. | Date pickers and absenteeism numeric/profile controls present but performing actions (build forecast, import/export) shows no banners or notifications. | Same controls as Demo 1 but actions show **inline success banners** and update the bell. CSV downloads include `# timezone=…` metadata. | Demo 2 meets parity for banners, bell and metadata; Demo 1 does not. |
| **Import/export buttons (forecast/fact/absenteeism)** | Buttons should download CSV and trigger bell notifications. | Buttons appear as “Upload” rather than exports and do nothing (no downloads). | Buttons trigger success banners and add items to the bell with download links![](https://chatgpt.com/backend-api/estuary/content?id=file_000000007f9461f580ae7716e8d6e3e7&ts=489114&p=fs&cid=1&sig=006f7beb0719f9381d6f8a7c3a4ad2994e2b05dca744f78fc3e47569e47a762a&v=0)forecasting-analytics-etef3m532-granins-projects.vercel.app. | Demo 2 matches expected export behaviour; Demo 1 doesn’t. |
| **Build confirmation & accuracy table** | After build, a summary banner appears and accuracy metrics table loads. | No summary banner; accuracy table never appears. | Success banner appears and notification logged; Demo 2 still lacks a detailed accuracy table but offers a high‑level KPI deck and a CSV export in Accuracy section. | Real portal still missing metrics table; Demo 2 partly implements accuracy with export builder and notifications. |
| **Exceptions** | Day/Interval toggle; queue picker; templates grid with import/export; editing/saving templates. | Page loads with toggles and fields but clicking “Build” or export does nothing; template grid blank. | Templates grid present; saving templates enables export; export triggers a red banner if template isn’t saved; bell updates for exports. | Demo 2 replicates template workflow (with validation messages); Demo 1 is non‑functional; Real portal also appears non‑functional after repeated attempts. |
| **Trends (strategic/tactical/operational)** | Should display charts (forecast vs fact, seasonality, cumulative sums) and a data table per mode. | Tabs appear but remain blank even after selecting queues and waiting; no exports. | Strategic/Tactical/Operational charts and tables render; CSV export button exists but doesn’t raise notifications. | Demo 2 meets parity for charts; Demo 1 and the real portal still show empty views despite multiple tries![](https://chatgpt.com/backend-api/estuary/content?id=file_00000000930861f58e67f7bbcd8a2702&ts=489114&p=fs&cid=1&sig=ab2b27f52c3fc6bb04e112e671598737530b5b5ed38d60165d9b41d7848b2308&v=0)wfm-practice51.dc.oswfm.ru. |
| **Absenteeism** | Interval toggle, history table with statuses; ability to calculate absenteeism and edit templates. | Page skeleton loads but buttons unresponsive; no history table. | Calculator works: selecting a queue and horizon shows recommended vs base normative percentages and success banner![](https://chatgpt.com/backend-api/estuary/content?id=file_000000008ba461f58f962535b2e461ee&ts=489114&p=fs&cid=1&sig=35c8a60e317f849388d43337d23205dedfbc17e31ad7fb9f77a8143c7c76c080&v=0)forecasting-analytics-etef3m532-granins-projects.vercel.app; bell does not update. | Demo 2 matches expected calculation; Demo 1 and real portal remain non‑functional (buttons inert)![](https://chatgpt.com/backend-api/estuary/content?id=file_000000003c8861f5bbc918f627fe3d22&ts=489114&p=fs&cid=1&sig=ca300b3feceaeee9c9c3f2f758a531ade36c4ca3eddbef9d67fba2fed1cfd068&v=0)wfm-practice51.dc.oswfm.ru. |
| **Manual adjustments** | Table of intervals with forecast, correction, total, required agents and trust %; plus/minus buttons; undo/redo counter; status badges. | `/forecast/adjustments` route is blank. | Table with 15‑minute intervals appears; plus/minus buttons and undo/redo counters work; success messages show when saving. | Demo 2 matches manual adjustments; Demo 1 and real portal show nothing. |
| **Accuracy dashboard** | KPI cards for MAPE/MAE/RMSE etc., detailed results table and export button generating a CSV with bell notification. | Route is blank. | KPI cards and tabs (Overview, Comparison, Validation, Error analysis, Export); choosing **CSV data** and clicking **Create report** greys out the button then triggers a bell notification and a download with timezone metadata; however no inline banner appears. | Demo 2 implements an export builder and notifications; Demo 1 and real portal do not display accuracy features. |
| **Reports catalogue** | List of available reports with format dropdown and export confirmation, adding entries to bell. | Not tested; assumed non‑functional due to missing bell. | Reports panel (in the analytics demo, not forecasting) provides CSV/PDF/Excel/JSON downloads and updates bell. | Parity not fully covered; but Demo 2 shows working reports in the analytics part; real portal and Demo 1 lack working exports. |

### Summary

The **real Naumen portal** images in the illustrated guide confirm numerous features—queue selection banners, confirmation banners, data tables, templates grids and interactive charts—that the real portal currently does not exhibit during actual testing. The first demo (**p6z0l224h**) replicates the layouts but most actions (build, export, trend charts, absenteeism, accuracy, adjustments) remain inert, and there is no timezone selector or functional bell. The second demo (**etef3m532**, deployed after 2025‑10‑29) introduces the missing behavioural elements: builds and exports trigger **inline banners** and **bell notifications**; CSVs include timezone metadata; template workflows provide error banners; trends, absenteeism and adjustments modules render correctly; and the shell includes a timezone dropdown. Despite minor gaps (accuracy table detail, bell interactions in some modules), **Demo 2** is much closer to the illustrated reference and therefore achieves much stronger parity with the envisioned real Naumen features than Demo 1.
