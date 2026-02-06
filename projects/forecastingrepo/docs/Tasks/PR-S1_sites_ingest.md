# PR‑S1 — Sites ingest (data model, Excel/CSV loader, tidy outputs) — no behavior change

## Goal
Load per‑site service history + site registry from 2024 Excel exports (and future CSVs) into tidy tables for modeling:
- `sites_registry.csv`: site_id,district,lat,lon,bin_count,bin_size_liters,bin_type,land_use (as available)
- `sites_service.csv`: site_id,service_dt,service_time(optional),emptied_flag,collect_volume_m3(optional),route_id(optional)

## Inputs (expected columns; header aliasing allowed)
- site id: ["ID площадки","Площадка","КП ID","Контейнерная площадка","Код КП"]
- date: ["Дата","Дата операции","Дата обслуживания"]
- district: ["Район","Участок"]
- volume (m3/liters): ["Объем, м3","Объем","Объем, л"]
- emptied flag: ["Опорожнение","Вывоз","Пусто после"]
- coords (if present): ["Широта","Долгота","lat","lon"]
- capacity hints: ["Тип контейнера","Объем, л","Количество контейнеров"]

## Deliverables
- Script: `scripts/ingest_sites.py` (reads XLSX/CSV, writes tidy CSV/Parquet under `data/sites/`)
- Module: `src/sites/schema.py` (dataclasses + validators)
- Aliasing/fuzzy map: `src/sites/aliases_ru.py` (regex + canonical names)
- Tests:
  - `tests/sites/test_ingest_sites_csv.py` — CSV fixtures, header alias resolution, date parsing, dup keys=0
  - `tests/sites/test_ingest_sites_xlsx.py` — tiny XLSX fixture, sheet auto‑detect, same schema result
- BDD spec: `specs/bdd/features/sites_ingest.feature` (SITE-ING-001..003)
- QA: no NaN, nonnegative volume, full key uniqueness (site_id+date)

## Notes
- Do **not** commit real XLSX. Use tiny synthetic fixtures under `tests/data/fixtures/sites/`.
- Keep **default forecasts unchanged** (this PR has no pipeline wiring).

---
