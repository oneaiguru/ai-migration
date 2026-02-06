# TASK-41: Static HTML Report

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Self-contained HTML file Jury can open in browser without servers.

## Key Constraint
Limit to top 500 sites by volume to keep file size reasonable (~2MB).

## Code Changes

### 1. File: scripts/generate_html_report.py (NEW)

```python
#!/usr/bin/env python3
"""
Generate static HTML forecast report.

TASK-41: Self-contained HTML for browser viewing.

Usage:
    python generate_html_report.py --cutoff 2025-05-31 --horizon 30
"""
import sys
import json
from datetime import date
from pathlib import Path
import argparse

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest


HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Прогноз от {cutoff_date}</title>
    <style>
        body {{ font-family: sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }}
        h1 {{ color: #1890ff; }}
        .stats {{ display: flex; gap: 20px; margin: 20px 0; }}
        .stat {{ background: #fafafa; padding: 16px; border-radius: 4px; }}
        .stat-value {{ font-size: 24px; font-weight: bold; color: #1890ff; }}
        input {{ padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 300px; margin-right: 10px; }}
        button {{ padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
        th, td {{ padding: 8px; text-align: left; border-bottom: 1px solid #eee; }}
        th {{ background: #fafafa; cursor: pointer; }}
        .table-wrap {{ max-height: 500px; overflow: auto; }}
    </style>
</head>
<body>
<div class="container">
    <h1>Прогноз накопления</h1>
    <p>Срез: <b>{cutoff_date}</b> | Горизонт: <b>{horizon_days} дней</b> | Топ {site_count} площадок</p>

    <div class="stats">
        <div class="stat"><div class="stat-value">{site_count}</div>Площадок</div>
        <div class="stat"><div class="stat-value">{total_forecast:.0f}</div>м³</div>
        <div class="stat"><div class="stat-value">{row_count}</div>Записей</div>
    </div>

    <input id="search" placeholder="Поиск..." oninput="filter()">
    <button onclick="exportCSV()">CSV</button>

    <div class="table-wrap">
        <table><thead><tr>
            <th onclick="sort(0)">Site ID</th>
            <th onclick="sort(1)">Дата</th>
            <th onclick="sort(2)">м³</th>
            <th onclick="sort(3)">%</th>
        </tr></thead><tbody id="body"></tbody></table>
    </div>
</div>
<script>
const D={data_json};
let col=0,asc=1;
function render(d){{document.getElementById('body').innerHTML=d.map(r=>`<tr><td>${{r.site_id}}</td><td>${{r.date}}</td><td>${{r.pred_m3.toFixed(2)}}</td><td>${{(r.fill_pct*100).toFixed(0)}}%</td></tr>`).join('');}}
function filter(){{const q=document.getElementById('search').value.toLowerCase();render(D.filter(r=>r.site_id.toLowerCase().includes(q)));}}
function sort(c){{if(col===c)asc=1-asc;else{{col=c;asc=1;}}const k=['site_id','date','pred_m3','fill_pct'][c];D.sort((a,b)=>{{let x=a[k],y=b[k];return(typeof x==='string'?x.localeCompare(y):x-y)*(asc?1:-1);}});filter();}}
function exportCSV(){{const q=document.getElementById('search').value.toLowerCase();const f=q?D.filter(r=>r.site_id.toLowerCase().includes(q)):D;const c='site_id,date,pred_m3,fill_pct\\n'+f.map(r=>`${{r.site_id}},${{r.date}},${{r.pred_m3}},${{r.fill_pct}}`).join('\\n');const b=new Blob([c],{{type:'text/csv'}});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='export.csv';a.click();}}
render(D);
</script>
</body>
</html>'''


def generate_html_report(
    cutoff_date: date,
    horizon_days: int,
    output_path: Path = Path('forecast_report.html'),
    top_sites: int = 500,
) -> Path:
    """Generate HTML report limited to top N sites by volume."""
    print(f"Generating: cutoff={cutoff_date}, horizon={horizon_days}, top={top_sites}...")

    request = ForecastRequest(cutoff_date=cutoff_date, horizon_days=horizon_days)
    result = generate_rolling_forecast(request, use_cache=True)

    df = result.forecast_df.copy()
    df['pred_m3'] = df['pred_volume_m3'] / 1000.0

    # Limit to top sites by total forecast
    site_totals = df.groupby('site_id')['pred_m3'].sum()
    top_site_ids = site_totals.nlargest(top_sites).index
    df = df[df['site_id'].isin(top_site_ids)]

    df['date'] = df['date'].astype(str)
    data = df[['site_id', 'date', 'pred_m3', 'fill_pct']].to_dict(orient='records')

    html = HTML_TEMPLATE.format(
        cutoff_date=cutoff_date,
        horizon_days=horizon_days,
        site_count=len(top_site_ids),
        total_forecast=df['pred_m3'].sum(),
        row_count=len(df),
        data_json=json.dumps(data),
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html)
    print(f"✓ {output_path} ({len(df)} rows, {output_path.stat().st_size // 1024}KB)")
    return output_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cutoff', type=lambda s: date.fromisoformat(s), default=date(2025, 5, 31))
    parser.add_argument('--horizon', type=int, default=30)
    parser.add_argument('--output', type=Path, default=Path('forecast_report.html'))
    parser.add_argument('--top-sites', type=int, default=500)
    args = parser.parse_args()

    generate_html_report(args.cutoff, args.horizon, args.output, args.top_sites)


if __name__ == '__main__':
    main()
```

## Tests

```python
# tests/test_html_report.py

from datetime import date
from pathlib import Path
import tempfile

def test_html_report_generation():
    from scripts.generate_html_report import generate_html_report

    with tempfile.TemporaryDirectory() as tmpdir:
        path = generate_html_report(
            cutoff_date=date(2025, 3, 15),
            horizon_days=7,
            output_path=Path(tmpdir) / 'test.html',
            top_sites=50,
        )

        assert path.exists()
        content = path.read_text()
        assert '<!DOCTYPE html>' in content
        assert 'const D=' in content
```

## Acceptance Criteria
- [ ] HTML opens in browser
- [ ] Limited to top 500 sites
- [ ] File size < 3MB
- [ ] Search works
- [ ] CSV export works

## Gitignore Note

Add to `.gitignore`:
```
forecast_report.html
```

Or use `deliveries/reports/` directory for organized output.

---

## On Completion

1. Run: `python scripts/generate_html_report.py --horizon 7 --top-sites 100`
2. Open in browser, test search/export
3. Run tests: `pytest tests/test_html_report.py -v`
4. Update `/Users/m/ai/progress.md`: Change TASK-41 from 🔴 TODO to 🟢 DONE
5. Commit: "Implement TASK-41: Static HTML report"
