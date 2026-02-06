# Demo Data Pipeline (MyTKO)

This document explains how to regenerate the lightweight CSVs consumed by `ui/mytko-forecast-demo` without checking multi‑GB data into git.

## Source Inputs
| File | Purpose | Notes |
|------|---------|-------|
| `data/containers_long.csv` | Actual service history (4.6 M rows) | **Local only**; produced from Jury XLS exports. |
| `reports/sites_demo/daily_fill_YYYY-MM-DD_to_YYYY-MM-DD.csv` | Forecast slice created by `scripts/make_site_forecast_from_actuals.py` | Keep under `reports/sites_demo/` (ignored by git). |
| `artifacts/viz/site_<id>_forecast_*.csv` (optional) | Curated per-site plots | Copied into the demo bundle for reference. |

## Regeneration Command
```bash
python scripts/create_demo_subset.py \
  --sites 38105070 38100003 38104949 38117820 38120158 \
  --history data/containers_long.csv \
  --forecast reports/sites_demo/daily_fill_2024-07-01_to_2024-08-31.csv \
  --start 2024-06-01 --end 2024-08-31 \
  --out-dir ../ui/mytko-forecast-demo/public/demo_data \
  --site-forecast-dir artifacts/viz
```

### Outputs
- `public/demo_data/containers_summary.csv` — daily rows with `actual_m3`, `fill_pct`, `overflow_prob`, `last_service_dt`.
- `public/demo_data/site_<id>_forecast_*.csv` — optional per-site slices copied from `artifacts/viz/`.

These files **are committed** so the UI runs out-of-the-box; regenerate them whenever we ingest new windows or sites, then re-run `npm run build` inside `ui/mytko-forecast-demo`.

## Workflow Tips
1. Run `python scripts/make_site_forecast_from_actuals.py ... --out reports/sites_demo/daily_fill_*.csv` whenever the upstream forecasts change.
2. Immediately regenerate the demo subset (command above) so curated CSVs stay in sync.
3. After updating `public/demo_data/`, rebuild/start the stack:
   ```bash
   cd ../ui/mytko-forecast-demo && npm run build
   cd /Users/m/git/clients/rtneo/forecastingrepo && bash scripts/dev/start_stack.sh
   ```
4. Verify site `38117820` over `2024-07-01…2024-07-07` to ensure partial fills still display.

## Why the Big Files Stay Local
`data/containers_long.csv`, `data/sites_service.csv`, and `reports/sites_demo/*.csv` are too large for git and violate the “no raw data” SOP. They’re now ignored (see `.gitignore`)—keep local snapshots under `_incoming/` and regenerate subsets as needed.

## Curated Demo Sites (Port 5174)
The preset list that powers the MyTKO demo is sourced from `docs/Notes/demo_site_catalog.md` and mirrored in `ui/mytko-forecast-demo/src/constants/demoSites.ts`. Each entry below includes the showcase window (usually 2024‑07‑01 → 2024‑07‑07), the district/address snippet, and the observed WAPE so demo reviewers can pick the right story (steady, medium risk, overflow, etc.).

| Site ID | Локация | Окно | WAPE | Диапазон заполнения |
| --- | --- | --- | --- | --- |
| 38100003 | Иркутский район — 10 км тракта Мельничная падь, СНТ “Академсад”, на въезде | 2024-07-05 → 2024-07-15 | 4.7% | 100.0%→100.0% |
| 38102887 | Правый берег — Пискунова, 113 | 2024-07-01 → 2024-07-07 | 6.7% | 3.2%→22.6% |
| 38104803 | Левый берег — Иркутная, 2 | 2024-07-08 → 2024-07-15 | 27.2% | 100.0%→100.0% |
| 38104949 | Левый берег — Лермонтова, 297В подъезд 1 | 2024-07-10 → 2024-07-20 | 48.1% | 100.0%→100.0% |
| 38105070 | Левый берег — Маршала Конева, 38/1 | 2024-08-01 → 2024-08-07 | 13.4% | 100.0%→100.0% |
| 38106891 | Ангарский ГО — Ангарск, мкр. Юго-Восточный, 8 квл, 13 | 2024-07-01 → 2024-07-07 | 15.2% | 3.2%→22.6% |
| 38108295 | Тулунский район — 3-я Нагорная, 7,9,11,12 | 2024-07-01 → 2024-07-07 | 53.3% | 3.2%→22.6% |
| 38111698 | Черемховский район — ул. Плеханова, 1 | 2024-07-01 → 2024-07-07 | 5.5% | 1.3%→9.4% |
| 38114972 | Балаганский район — п. Балаганск, ул. Кирова, 6 | 2024-07-01 → 2024-07-07 | 80.6% | 2.7%→18.9% |
| 38116709 | Иркутский район — д. Карлук, ул. Трактовая, 20 | 2024-07-01 → 2024-07-07 | 3.4% | 3.2%→22.6% |
| 38117601 | Иркутский район — д. Карлук, ул. Трактовая, 20/1 | 2024-07-01 → 2024-07-07 | 3.4% | 3.2%→22.6% |
| 38117630 | Осинский район — д. Мороза, ул. Российская, 1 | 2024-07-05 → 2024-07-12 | 22.1% | 100.0%→100.0% |
| 38117820 | Аларский район — п. Забитуй, Трактовая, 6 | 2024-07-01 → 2024-07-07 | 4.8% | 24.5%→100.0% |
| 38120158 | Заларинский район — с. Хор-Тагна, Школьная, 1А | 2024-07-01 → 2024-07-10 | 14.1% | 31.4%→100.0% |
| 38120913 | Шелеховский район — Шелехов, 1 мкр, 26а | 2024-07-01 → 2024-07-07 | 12.5% | 3.2%→22.6% |
| 38121360 | Черемховский район — Первомайская, 87 | 2024-07-12 → 2024-07-19 | 21.3% | 100.0%→100.0% |
| 38121851 | Куйтунский район — рп. Куйтун, ул. Коммунальная, 38 | 2024-07-01 → 2024-07-07 | 6.7% | 3.2%→22.6% |
| 38122054 | Тулунский район — Гастелло, 11 | 2024-07-01 → 2024-07-07 | 6.7% | 3.2%→22.6% |
| 38122820 | Ангарский ГО — Ангарск, 120 квл, 6А | 2024-07-01 → 2024-07-07 | 6.7% | 3.2%→22.6% |
| 38122954 | Свирск — ул. Ленина, 2В | 2024-07-01 → 2024-07-07 | 33.7% | 2.7%→18.8% |
| 38123189 | Правый берег — ул. Култукская, 109 | 2024-07-01 → 2024-07-07 | 15.2% | 3.2%→22.6% |
| 38127141 | Иркутский район — 2 км автодороги Иркутск-Новогрудинино | 2024-07-01 → 2024-07-07 | 27.8% | 1.9%→13.3% |
| 38127171 | Левый берег — Сергеева 3/4 (“Вкусно и точка”) | 2024-07-01 → 2024-07-07 | 46.1% | 1.9%→13.3% |

Select “Custom site…” in the form when you need to enter a different ID/date range while still keeping these demo-approved presets available for quick comparisons.

### Site Gallery in the UI
> _Screenshot placeholder: add `docs/images/mytko_site_gallery.png` after the next demo run._

`ui/mytko-forecast-demo/src/components/SiteGallery.tsx` renders the table above as an Ant Design card grid (4 cards per row on desktop, 2 on tablets, 1 on mobile). Each card shows the fill range and WAPE for the recommended week and calls `forecastStore.selectPreset(siteId)` so the Select + RangePicker stay in sync. Keep `src/constants/demoSites.ts` aligned with this document whenever the curated list changes.
