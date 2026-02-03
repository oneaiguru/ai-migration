Got it — I opened and read the docs inside your **disp.zip** and mapped where *per‑site* facts live in that system, what each report can export, and exactly what to ask Jury for so we can compute site‑level accuracy (WAPE) credibly.

Below is a tight brief you can paste to the team (and a RU “ask” for Jury at the end).

------

## What the “disp” docs say (and why it matters)

**1) Отчет по объемам (Volume report, per day, per site)**

- Daily volumes per КП (site) with filters by carrier/district/period; supports export to Excel/Google/Yandex. This is the closest to **per‑site daily fact** we need. 
- The PDF confirms the same and shows “Проблема” column if a driver flags an issue (optional). 

**2) Отчет по весу (Weight report, loads/unloads)**

- Vehicle‑level loads/unloads at disposal/storage sites (time, weight, polygon). Two variants: short and detailed; export to Excel/Google/Yandex. Useful for **mass sanity checks**, but not per‑site.  

**3) Отчет по месяцам (By month)**

- Monthly aggregates by sector or by vehicle (volume, total unload weight, distance). Not granular enough for per‑site WAPE, but good for cross‑checks.  

**4) Сводный отчет (Summary by day)**

- Daily, whole‑fleet dashboard (volumes, weights, efficiency, etc.); exportable. Not per site.  

**5) Баланс масс (Mass balance)**

- Daily stock balance for disposal facilities (in/out by weight). Not per site, but helps reconcile mass totals.  

**6) Прогноз загрузки ТС (Vehicle load forecast)**

- Forecast chart in the routes editor; shows **actual vs forecast** series for vehicles; not a data export for per‑site facts.   

**7) “История и прогноз объемов” for a \*single\* КП**

- The “Прогноз объемов на КП” spec explicitly mentions a per‑KP dialog with **history of volumes and forecast**; this proves the system stores per‑site daily **volume** facts. (We need this in bulk via the Volume report export.)  

**Implication:**
 For site‑level accuracy **the canonical source is “Отчеты → По объемам”** (daily, per‑site volumes with export). We can convert volume→mass using their **коэффициент перевода** (they apply it in reports: “вес = объем × коэффициент перевода”, per sector/month). 

------

## Minimal data we need for credible per‑site WAPE

**Required CSV (facts):** `sites_service.csv`

```
site_id,service_dt,volume_m3,collect_volume_m3
38116432,2024-08-01,3.3,410
38103376,2024-08-01,3.7,450
```

- If **mass** isn’t readily exported per site, send **volume_m3** and we’ll compute mass with coefficients (below).

**Optional CSV (conversion coefficients):** `volume_to_mass_coeff.csv`

```
district,year_month,coef_mass_per_m3
Ленинский,2024-07,0.12
```

- Mirrors their method: weight = volume × coef, where coef is taken for the sector from the previous month. 

**Optional CSV (registry mapping):** `sites_registry.csv`

```
site_id,district,address,bin_count,bin_size_m3
38116432,Ленинский,Декабристов,45,3,1.1
```

- Helps with fill%/capacity sanity checks, but not strictly required for WAPE.

------

## Where to export it in their system (click‑path)

- **Per‑site daily facts:**
   *Отчеты → По объемам* → set filters (перевозчик/район/период), choose **daily granularity** and **per‑site view**, then **export to Excel** (we’ll convert to CSV).  
- **Mass sanity series (optional):**
   *Отчеты → По весу* → export short or detailed to Excel for the same window.  
- **Monthly cross‑check (optional):**
   *Отчеты → По месяцам* → export per‑sector or per‑vehicle to compare totals. 

------

## What to ask Jury (two tiers)

### A) Quick slice for demo **(what you already messaged; polishing it)**

- **Window:** 7–14 consecutive days (e.g., *2024‑08‑01…2024‑08‑07*)
- **Coverage:** ≥50–100 unique sites (КП)
- **Export:** From *Отчеты → По объемам*, daily per‑site, **Excel or CSV (UTF‑8)**
- **Schema:** `site_id,service_dt,volume_m3` (+ `collect_volume_m3` if available)
- **Optional:** `volume_to_mass_coeff.csv` (per district, per month) to convert volume→mass exactly as in their reports. 

### B) Full history for real scoring (post‑demo / or if they can send now)

- **Time span:** up to **2 years** of daily per‑site facts
- **Format:** **CSV, partitioned** (per month and/or per district). Avoid single Excel due to row limits.
- **Why partition:** Excel max is ~1,048,576 rows; two‑year citywide exports will exceed that.

**Size guidance (rule‑of‑thumb):**

- Rows ≈ *#sites × #days*.
  - 10k sites × 730 days ≈ **7.3M rows** → ~**220–370 MB CSV** (zipped ≈ **40–80 MB**).
- This won’t fit in one XLSX; **send zipped CSVs**, one file per month or per district.

------

## RU message you can paste to Jury (concise)

**Короткий срез для демо (предпочтительно сегодня/завтра):**
 Нужен экспорт из *Отчеты → По объемам* с такими параметрами:

- **Окно:** 7–14 подряд идущих дней (например, 2024‑08‑01…2024‑08‑07)
- **Покрытие:** не менее **50–100 КП**
- **Формат:** Excel или CSV (UTF‑8), **помесячно/по районам — как вам удобно**
- **Поля:** `Код КП (site_id)`, `Дата (service_dt)`, `Объем, м³ (volume_m3)`
- *(Если возможно)* добавить `Вес, кг (collect_volume_m3)`.
- *(Опционально)* прислать таблицу коэффициентов перевода объёма→вес: `район, месяц, коэффициент`, чтобы мы считали массу так же, как в ваших отчётах.

**Полная история (по готовности):**
 Экспорт тех же данных за **до 2 лет** ежедневных фактов **в CSV**, **помесячно/по районам** (Excel не подойдёт из‑за ограничений строк).

------

## What we’ll do the moment data arrives (BE ready)

1. **Ingest** (handles Excel/CSV, decimal comma):

```bash
python scripts/ingest_sites.py --inputs <file_or_folder> --outdir data/sites
```

1. **Backtest (site‑level)** for the overlapping window:

```bash
python scripts/backtest_sites.py \
  --train-until 2024-07-31 \
  --daily-window <YYYY-MM-DD:YYYY-MM-DD> \
  --monthly-window <YYYY-MM:YYYY-MM> \
  --sites-registry data/sites/sites_registry.csv \
  --sites-service  data/sites/sites_service.csv \
  --use-existing-sites-csv reports/sites_demo/daily_fill_2024-08-01_to_2024-08-07.csv \
  --outdir reports/site_backtest_candidate
```

1. **Deliver** refreshed `SUMMARY_site.md`, daily/monthly site scoreboards, images, and the “show Sites vs districts only” decision in the coordinator drop.

------

## Why this request is the right one (ties to their docs)

- They *do* maintain per‑KP daily **volume** facts and already expose them in *Отчеты → По объемам* (exportable). That’s the precise grain we need for WAPE. 
- Their reports convert **volume→mass** using a monthly sector coefficient; we can replicate that if they share the coefficients, or we can use their mass directly if exported. 
- Weight and monthly reports provide **sanity checks** and reconciliation, but don’t replace per‑site daily facts.  

------

## Optional (nice to have if they can export it quickly)

- **Routes schedule / last service**: a simple CSV `{site_id, service_dt_last}` or daily service flags improves our “last service” UI context (but not required for WAPE). (Their UI shows schedules and last service columns in prototypes.)  

------

### Bottom line

- **Ask for “Отчет по объемам” daily per‑site exports** (7–14‑day slice now; full history later).
- **CSV preferred**, partitioned by month/district.
- Include **coef table** if they don’t export mass per site.
- This is exactly what we need to compute credible **per‑site WAPE** and decide whether to show Sites in the demo.

If you want, I can also draft a one‑screen **README_BACKEND.md** for the reviewer bundle that links the live curl checks and these data asks, or tailor the RU message further for Jury’s terminology.