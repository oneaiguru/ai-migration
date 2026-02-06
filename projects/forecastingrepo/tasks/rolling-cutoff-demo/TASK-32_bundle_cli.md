# TASK-32: Pre-Generated Bundles CLI

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 25min

## Goal
CLI script that generates forecast bundles (CSV + Excel + summary JSON) for sharing with Jury.

## Code Changes

### 1. File: scripts/generate_forecast_bundle.py (NEW)

```python
#!/usr/bin/env python3
"""
Generate forecast bundle for sharing.

TASK-32: Create bundle with CSV, Excel, and summary JSON.

Usage:
    python generate_forecast_bundle.py --cutoff 2025-05-31 --horizon 30
"""
import sys
import json
from datetime import date, datetime
from pathlib import Path
import argparse

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest


def generate_bundle(
    cutoff_date: date,
    horizon_days: int,
    output_dir: Path = Path('output/bundles'),
) -> Path:
    """
    Generate complete forecast bundle.

    Creates directory with:
    - forecast.csv (validation format)
    - forecast.xlsx (multi-sheet Excel)
    - summary.json (metadata)

    Returns path to bundle directory.
    """
    print(f"Generating forecast: cutoff={cutoff_date}, horizon={horizon_days}...")

    request = ForecastRequest(
        cutoff_date=cutoff_date,
        horizon_days=horizon_days,
    )

    result = generate_rolling_forecast(request, use_cache=True)

    # Create bundle directory
    bundle_name = f"forecast_{cutoff_date}_{horizon_days}d"
    bundle_dir = output_dir / bundle_name
    bundle_dir.mkdir(parents=True, exist_ok=True)

    df = result.forecast_df.copy()
    df['pred_m3'] = df['pred_volume_m3'] / 1000.0

    # 1. CSV (validation format)
    csv_path = bundle_dir / "forecast.csv"
    df[['site_id', 'date', 'pred_m3']].sort_values(
        by=['site_id', 'date']
    ).to_csv(csv_path, index=False)
    print(f"  ✓ CSV: {csv_path}")

    # 2. Excel (multi-sheet)
    xlsx_path = bundle_dir / "forecast.xlsx"
    import pandas as pd
    with pd.ExcelWriter(xlsx_path, engine='openpyxl') as writer:
        # Summary sheet
        summary_df = pd.DataFrame([{
            'Cutoff Date': str(cutoff_date),
            'Horizon Days': horizon_days,
            'Site Count': result.site_count,
            'Total Forecast (m³)': df['pred_m3'].sum(),
            'Generated At': result.generated_at,
        }])
        summary_df.to_excel(writer, sheet_name='Summary', index=False)

        # Daily data sheet
        df[['site_id', 'date', 'pred_m3', 'fill_pct', 'overflow_prob']].to_excel(
            writer, sheet_name='Daily Data', index=False
        )
    print(f"  ✓ Excel: {xlsx_path}")

    # 3. Summary JSON
    summary = {
        'cutoff_date': str(cutoff_date),
        'horizon_days': horizon_days,
        'site_count': result.site_count,
        'total_forecast_m3': round(df['pred_m3'].sum(), 2),
        'row_count': len(df),
        'generated_at': result.generated_at,
        'files': ['forecast.csv', 'forecast.xlsx', 'summary.json'],
    }
    json_path = bundle_dir / "summary.json"
    json_path.write_text(json.dumps(summary, indent=2))
    print(f"  ✓ JSON: {json_path}")

    print(f"\n✓ Bundle created: {bundle_dir}")
    return bundle_dir


def main():
    parser = argparse.ArgumentParser(description='Generate forecast bundle')
    parser.add_argument('--cutoff', type=lambda s: date.fromisoformat(s), default=date(2025, 5, 31))
    parser.add_argument('--horizon', type=int, default=30)
    parser.add_argument('--output', type=Path, default=Path('output/bundles'))

    args = parser.parse_args()

    generate_bundle(
        cutoff_date=args.cutoff,
        horizon_days=args.horizon,
        output_dir=args.output,
    )


if __name__ == '__main__':
    main()
```

## Tests

```python
# tests/test_bundle_cli.py

from datetime import date
from pathlib import Path
import tempfile
import json

def test_generate_bundle():
    """Test bundle generation creates all files."""
    from scripts.generate_forecast_bundle import generate_bundle

    with tempfile.TemporaryDirectory() as tmpdir:
        bundle_dir = generate_bundle(
            cutoff_date=date(2025, 3, 15),
            horizon_days=7,
            output_dir=Path(tmpdir),
        )

        assert bundle_dir.exists()
        assert (bundle_dir / 'forecast.csv').exists()
        assert (bundle_dir / 'forecast.xlsx').exists()
        assert (bundle_dir / 'summary.json').exists()

        # Verify summary content
        summary = json.loads((bundle_dir / 'summary.json').read_text())
        assert summary['horizon_days'] == 7
        assert summary['site_count'] > 0
```

## Acceptance Criteria
- [ ] Script creates bundle directory
- [ ] Bundle contains forecast.csv, forecast.xlsx, summary.json
- [ ] CSV has columns: site_id, date, pred_m3
- [ ] Excel has Summary and Daily Data sheets
- [ ] JSON has metadata (cutoff, horizon, counts)

## Gitignore Note

Add to `.gitignore`:
```
output/bundles/
```

Or use `deliveries/reports/` instead of `output/bundles/` for organized output delivery.

---

## On Completion

1. Run: `python scripts/generate_forecast_bundle.py --horizon 7`
2. Verify output/bundles/ contains all files
3. Run tests: `pytest tests/test_bundle_cli.py -v`
4. Update `/Users/m/ai/progress.md`: Change TASK-32 from 🔴 TODO to 🟢 DONE
5. Commit: "Implement TASK-32: Pre-generated bundles CLI"
