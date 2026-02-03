Absolutely—**ask Jury for per‑site actuals now.** Don’t ask for “all 2 years” yet. Make it a **phased request**: a small, fast slice for the demo; then a larger pilot; then full history after approval.

Below is everything you need: a copy‑paste client message, the exact data spec, and concrete size/Excel limits so expectations are clear.

------

## 1) Copy‑paste request to Jury (EN → RU)

**English (short):**

> Hi! To show credible **site‑level accuracy** (WAPE) this week, please share a **small slice of per‑site actuals**:
>
> - **What:** CSV with columns `site_id, service_dt, collect_volume_m3`
> - **Window:** **7–14 consecutive days**
> - **Coverage:** **≥50–100 sites**
> - **Dates:** Must **overlap our forecast window** (e.g., **2024‑08‑01…2024‑08‑07**)
> - **Units:** kilograms; **UTF‑8 CSV** is ideal (decimal dot or comma is OK)
>
> If convenient, also include a **site registry** CSV (`site_id, district, address, bin_count, bin_volume_l`) so we can cross‑check mapping.
>
> For full evaluation later, we’ll request a larger window (e.g., 3 months) and eventually full history, but **for the demo this small slice is enough**.

**Russian (клиентская версия):**

> Коллеги, чтобы показать **точную метрику по объектам (WAPE)** уже на этой неделе, пришлите, пожалуйста, **небольшую выборку фактических данных по объектам**:
>
> - **Что:** CSV с колонками `site_id, service_dt, collect_volume_m3`
> - **Окно:** **7–14 подряд идущих дней**
> - **Покрытие:** **не менее 50–100 объектов**
> - **Даты:** должны **пересекаться** с нашим окном прогноза (например, **2024‑08‑01…2024‑08‑07**)
> - **Единицы измерения:** килограммы; формат **UTF‑8 CSV** (десятичная точка или запятая — допускается)
>
> Если удобно, добавьте также **реестр объектов** в CSV (`site_id, district, address, bin_count, bin_volume_l`) — для проверки соответствий.
>
> Для более полной оценки позже запросим увеличенное окно (например, 3 месяца) и затем всю историю, но **для демо достаточно этой небольшой выборки**.

------

## 2) Exact data spec (what we can ingest today)

**Required CSV (per‑site actuals):**

```
site_id,service_dt,collect_volume_m3
S123,2024-08-01,145.3
S123,2024-08-03,152.7
S456,2024-08-01,98.0
...
```

- `site_id` — **string**; must match IDs used in the forecast file.
- `service_dt` — **YYYY‑MM‑DD** (UTC is fine).
- `collect_volume_m3` — **float** in kilograms (decimal **.** or **,** both OK; we normalize).

**Optional registry CSV:**

```
site_id,district,address,bin_count,bin_volume_l
S123,ЦАО,ул. Примерная 1,2,1100
S456,ЮАО,пр-т Тестовый 5,1,770
```

**Acceptance for the “demo slice”:**

- **≥50** sites, **7–14 days**, overlaps the chosen forecast week.
- Scoreboards non‑empty; SUMMARY shows **Overall** and **Median per‑site WAPE** we’re comfortable presenting.

------

## 3) How much data & can it fit in Excel?

**Row counts (daily aggregation):** `#rows = #sites × #days`.

We’ll estimate file size with a conservative **~40–60 bytes per row** (CSV text for `site_id, date, number` + commas/newline).

| Scope          | Example (sites × days) | Rows      | Size @40 B/row | Size @60 B/row | Excel fit?*         |
| -------------- | ---------------------- | --------- | -------------- | -------------- | ------------------- |
| **Demo slice** | 100 × 14               | 1,400     | ~0.05 MB       | ~0.08 MB       | ✅ Fits easily       |
| **Pilot**      | 1,000 × 90             | 90,000    | ~3.4 MB        | ~5.2 MB        | ✅ Fits easily       |
| **Full 2 yrs** | 5,000 × 730            | 3,650,000 | ~**139 MB**    | ~**209 MB**    | ❌ **Too many rows** |

*Excel sheet limit is **1,048,576 rows**. The **2‑year full** case far exceeds that. For large drops, send **monthly CSVs (zipped)** or **Parquet**. For demo/pilot, a single CSV is fine.

**Why we’re confident in district‑level readiness today:** we already ship a consolidated backtest and histogram gallery for **region** and **district** WAPE; reviewers can open the “Backtest Consolidated — Histograms” page and CSV/summary directly. 

------

## 4) What we’ll do the moment we get the demo slice

1. Ingest (CSV/XLSX accepted; we normalize decimal comma and map Russian headers if needed).
2. Re‑run `backtest_sites.py` on the **same forecast week** (e.g., 2024‑08‑01…07).
3. Regenerate **SUMMARY_site.md**, **site scoreboards**, and **site WAPE images**.
4. Update the **coordinator bundle** and the reviewer note with a clear **show Sites vs district‑only** decision.

------

## 5) Quick FAQ you can forward

- **Do you need “all per‑site data for 2 years” now?** No. For the demo, **7–14 days × 50–100 sites** is enough. We’ll request larger spans **after** approval.
- **Can we send Excel?** For the small slice: **yes** (.xlsx is fine). For big exports: prefer **CSV per month (zipped)** or **Parquet**; avoid hitting Excel’s row limit.
- **Different decimal separators or locales?** OK—**we handle both** `,` and `.` and normalize in ingest.
- **Timezone?** Use **YYYY‑MM‑DD** (no time). UTC is fine.

------

### Bottom line

- **Yes, ask Jury now** using the message above.
- **Start small** (7–14 days, ≥50–100 sites overlapping the forecast week).
- We’ll compute site‑level WAPE immediately and decide whether to **feature Sites** in the demo or **lead with Districts** (which are already packaged and reviewer‑friendly). 

If you want, I can also draft a one‑liner subject line and attach a CSV template stub you can forward.