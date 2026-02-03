# RTNEO Data Scripts (Jury Demo)

## 2025 Export Pipeline (CSV/XLSX)

1. Stage raw exports locally (git-ignored):
   - `projects/forecastingrepo/data/raw/exports/jury_volumes_YYYY-MM-DD_to_YYYY-MM-DD_all_sites.csv`
2. Convert to canonical site service CSVs:
   ```bash
   cd /Users/m/ai/projects/forecastingrepo
   python3 scripts/convert_volume_report.py \
     --input data/raw/exports/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv \
     --output-service data/sites/sites_service.csv \
     --output-registry data/sites/sites_registry.csv
   ```
3. Regenerate the demo slice:
   ```bash
   python3 scripts/create_demo_subset.py \
     --sites 38105070 38117820 \
     --history data/containers_long.csv \
     --forecast reports/sites_demo/daily_fill_2024-07-01_to_2024-08-31.csv \
     --start 2024-07-01 --end 2024-07-07 \
     --out-dir ../mytko-forecast-demo/public/demo_data
   ```

## Verification Steps (Quick)

```bash
python3 - <<'PY'
import csv
from datetime import datetime
from pathlib import Path

path = Path('data/sites/sites_service.csv')
min_dt = None
max_dt = None
sites = set()
rows = 0
with path.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows += 1
        sites.add(row.get('site_id'))
        raw = row.get('service_dt')
        if not raw:
            continue
        dt = datetime.strptime(raw, '%Y-%m-%d')
        min_dt = dt if min_dt is None or dt < min_dt else min_dt
        max_dt = dt if max_dt is None or dt > max_dt else max_dt

print('rows:', rows)
print('sites:', len(sites))
print('range:', min_dt.date() if min_dt else None, '->', max_dt.date() if max_dt else None)
PY
```

## Notes
- `data/raw/exports/` is git-ignored; do not commit raw exports.
- Disk space is required for expanded site/day tables.
