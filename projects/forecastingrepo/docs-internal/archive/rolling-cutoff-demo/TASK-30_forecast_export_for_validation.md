# TASK-30: Forecast Export for Validation

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Generate forecasts for June-Dec 2025 (using May 31 cutoff) and export as CSV for Jury's blind validation.

## Context
- TASK-29 established blind validation protocol
- Jury needs CSV of our predictions for June-Dec 2025
- We use May 31 cutoff (latest available data)
- Jury will compute accuracy metrics locally

## Spec

### Input
```
cutoff_date: 2025-05-31 (fixed)
horizon_days: 215 (May 31 → Dec 31)
all_sites: true
format: csv
```

### Output CSV Format

```csv
site_id,date,pred_m3
38105070,2025-06-01,123.45
38105070,2025-06-02,128.92
38105070,2025-06-03,120.10
...
```

**Columns**:
- `site_id`: String, container site ID
- `date`: YYYY-MM-DD format
- `pred_m3`: Float, predicted volume in cubic meters

**Sorting**: By site_id, then date (for easy validation matching)

## Code

### 1. Create export function

```python
# src/sites/export_validation.py

from datetime import date
import pandas as pd
from pathlib import Path

from .rolling_forecast import generate_rolling_forecast
from .rolling_types import ForecastRequest


def export_forecast_for_validation(
    cutoff_date: date,
    horizon_days: int,
    output_path: Path = Path('forecast_for_validation.csv'),
) -> Path:
    """
    Generate forecast and export as CSV for validation.

    Used by TASK-29 blind validation protocol.
    """
    print(f"Generating forecast: cutoff={cutoff_date}, horizon={horizon_days}...")

    request = ForecastRequest(
        cutoff_date=cutoff_date,
        horizon_days=horizon_days,
    )

    result = generate_rolling_forecast(request, use_cache=True)

    # Format for validation
    df = result.forecast_df.copy()
    df['pred_m3'] = df['pred_volume_m3'] / 1000.0

    export_df = df[['site_id', 'date', 'pred_m3']].sort_values(
        by=['site_id', 'date']
    )

    print(f"Writing to {output_path}...")
    export_df.to_csv(output_path, index=False)

    print(f"✓ Exported {len(export_df)} records")
    print(f"  Sites: {export_df['site_id'].nunique()}")
    print(f"  Dates: {export_df['date'].nunique()}")
    print(f"  File: {output_path}")

    return output_path
```

### 2. Add CLI command

```python
# scripts/export_validation_forecast.py

#!/usr/bin/env python3
"""
Export forecast for blind validation.

Usage:
    python export_validation_forecast.py [--cutoff 2025-05-31] [--horizon 215] [--output forecast.csv]
"""
import sys
from datetime import date
from pathlib import Path
import argparse

from src.sites.export_validation import export_forecast_for_validation


def main():
    parser = argparse.ArgumentParser(
        description='Export forecast for blind validation'
    )
    parser.add_argument(
        '--cutoff',
        type=lambda s: date.fromisoformat(s),
        default=date(2025, 5, 31),
        help='Cutoff date (default: 2025-05-31)',
    )
    parser.add_argument(
        '--horizon',
        type=int,
        default=215,
        help='Horizon days (default: 215 for May 31 → Dec 31)',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=Path('forecast_for_validation.csv'),
        help='Output file path',
    )

    args = parser.parse_args()

    export_forecast_for_validation(
        cutoff_date=args.cutoff,
        horizon_days=args.horizon,
        output_path=args.output,
    )


if __name__ == '__main__':
    main()
```

### 3. Add API endpoint (optional)

```python
# scripts/api_app.py

@app.get("/api/mytko/rolling_forecast/validation_export")
def validation_export(
    format: str = Query('csv', pattern='^(csv|json)$'),
):
    """
    Export forecast for blind validation.

    Returns forecast for June-Dec 2025 (cutoff: May 31).
    Used with TASK-29 validation protocol.
    """
    from datetime import date
    from src.sites.export_validation import export_forecast_for_validation
    from pathlib import Path
    import tempfile

    cutoff = date(2025, 5, 31)
    horizon = 215

    # Generate and return
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.csv', delete=False) as f:
        temp_path = Path(f.name)

    export_forecast_for_validation(
        cutoff_date=cutoff,
        horizon_days=horizon,
        output_path=temp_path,
    )

    # Read and return as response
    df = pd.read_csv(temp_path)

    if format == 'json':
        return df.to_json(orient='records')
    else:
        # Return as file
        return FileResponse(
            path=temp_path,
            media_type='text/csv',
            filename='forecast_june_dec_2025.csv',
        )
```

## Tests

```python
# tests/test_export_validation.py

def test_export_forecast_for_validation():
    """Test forecast export."""
    output_path = Path('/tmp/test_forecast.csv')

    from src.sites.export_validation import export_forecast_for_validation

    result = export_forecast_for_validation(
        cutoff_date=date(2025, 5, 31),
        horizon_days=7,
        output_path=output_path,
    )

    assert result.exists()
    df = pd.read_csv(result)
    assert len(df) > 0
    assert set(df.columns) == {'site_id', 'date', 'pred_m3'}
    assert df['pred_m3'].dtype == float
    # Verify sorted
    assert df.equals(df.sort_values(by=['site_id', 'date']))

def test_api_validation_export():
    """Test API endpoint."""
    client = TestClient(app)
    resp = client.get('/api/mytko/rolling_forecast/validation_export?format=csv')
    assert resp.status_code == 200
    assert resp.headers['content-type'] == 'text/csv'
    # Verify CSV content
    content = resp.text
    assert 'site_id,date,pred_m3' in content
```

## Usage

### Command line:
```bash
# Export with defaults
python scripts/export_validation_forecast.py

# Custom cutoff and horizon
python scripts/export_validation_forecast.py --cutoff 2025-04-15 --horizon 107

# Custom output file
python scripts/export_validation_forecast.py --output my_forecast.csv
```

### Via API:
```bash
curl http://localhost:8000/api/mytko/rolling_forecast/validation_export?format=csv \
  > forecast_for_jury.csv
```

### In Python:
```python
from src.sites.export_validation import export_forecast_for_validation
from datetime import date

export_forecast_for_validation(
    cutoff_date=date(2025, 5, 31),
    horizon_days=215,
    output_path='forecast.csv'
)
```

## Acceptance Criteria
- [ ] Function exports forecast correctly
- [ ] CSV has 3 columns: site_id, date, pred_m3
- [ ] Data sorted by site_id, then date
- [ ] CLI script works
- [ ] API endpoint works
- [ ] Tests pass
- [ ] CSV can be read by validation script (TASK-29)

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-30: Forecast export for validation"
