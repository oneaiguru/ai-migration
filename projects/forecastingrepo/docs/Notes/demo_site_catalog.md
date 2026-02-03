# Demo Site Catalog (July–August 2024)

Curated demo sites for the MyTKO UI (port 5174). Each entry shows a week where the fill trajectory lives between “empty” and “overflow” levels, plus the WAPE returned by `/api/mytko/site_accuracy`.

| Site ID | District / Address | Suggested window | Fill drift | WAPE | Notes |
| --- | --- | --- | --- | --- | --- |
| 38111698 | Черемховский район — Черемхово, ул. Плеханова, 1 | 2024‑07‑01 → 2024‑07‑07 | 1.3%→83.0% `█████████████████░░` | 5.5% | Smooth ramp; great for “medium risk” story |
| 38116709 | Иркутский район — д. Карлук, ул. Трактовая, 20 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 3.5% | Near-perfect forecast; low-risk |
| 38117601 | Иркутский район — д. Карлук, ул. Трактовая, 20/1 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 3.5% | Twin of 38116709 |
| 38121851 | Куйтунский район — рп. Куйтун, ул. Коммунальная, 38 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 6.7% | Typical urban ramp |
| 38102887 | Правый берег — Иркутск, ул. Пискунова, 113 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 6.7% | City center site, moderate risk |
| 38122054 | Тулунский район — Тулун, ул. Гастелло, 11 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 6.7% | WAPE <7%, easy to explain |
| 38122820 | Ангарский ГО — Ангарск, 120 квл, 6А | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 6.7% | Standard residential cadence |
| 38120913 | Шелеховский район — Шелехов, 1 мкр, 26а | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 12.5% | Shows small miss without overflow |
| 38106891 | Ангарский ГО — Ангарск, мкр. Юго‑Восточный, 8 квл, 13 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 15.2% | Good “medium alert” example |
| 38123189 | Правый берег — Иркутск, ул. Култукская, 109 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 15.2% | Fill climbs steadily within a week |
| 38127141 | Иркутский район — 2 км автодороги Иркутск‑Новогрудинино | 2024‑07‑01 → 2024‑07‑07 | 1.9%→100% `████████████████████` | 27.8% | Slight underforecast for high-volume site |
| 38122954 | Свирск — г. Свирск, ул. Ленина, 2В | 2024‑07‑01 → 2024‑07‑07 | 2.7%→100% `████████████████████` | 33.7% | High miss; good “need retrain” story |
| 38127171 | Левый берег — Иркутск, Сергеева 3/4 (“Вкусно и точка”) | 2024‑07‑01 → 2024‑07‑07 | 1.9%→100% `████████████████████` | 46.2% | Demonstrates overflow risk + corrective action |
| 38108295 | Тулунский район — Тулун, 3‑я Нагорная, 7‑12 | 2024‑07‑01 → 2024‑07‑07 | 3.2%→100% `████████████████████` | 53.3% | Worst-case miss (forecast half of actual) |
| 38114972 | Балаганский район — п. Балаганск, ул. Кирова, 6 | 2024‑07‑01 → 2024‑07‑07 | 2.7%→100% `████████████████████` | 80.6% | Extreme miss; use sparingly |

Legend: pseudo bar marks the fill range during the suggested week (left = empty, right = overflow). WAPE values come from `/api/mytko/site_accuracy`.

## Verification commands
```bash
# Stack
uvicorn --factory scripts.api_app:create_app --reload &
cd projects/forecast-ui && npm run dev &
cd projects/mytko-forecast-demo && npm run dev &

# Example API probe
curl -fsS "http://127.0.0.1:8000/api/mytko/site_accuracy?site_id=38111698&start_date=2024-07-01&end_date=2024-07-07" | jq .

# UI
# 1) Visit http://127.0.0.1:5174
# 2) Choose the site from the dropdown (or enter ID manually)
# 3) Set the window above to see the same pattern as the table

# When done
# Stop the uvicorn process (pkill uvicorn) and Ctrl+C the npm dev servers
```

## Next steps
- Update `ui/mytko-forecast-demo/src/constants/demoSites.ts` to mirror this list after the demo freeze lifts.
- Keep `docs/System/Demo_Data.md` synchronized with this catalog when new slices are generated.
