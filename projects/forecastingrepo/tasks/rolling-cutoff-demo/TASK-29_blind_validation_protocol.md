# TASK-29: Blind Validation Protocol

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min

## Goal
Establish a protocol for Jury to validate our forecasts against June-Dec 2025 data WITHOUT sharing the actual data values (blind validation).

## Problem Statement
- We have Jan-May 2025 data
- Jury has June-Dec 2025 data (secret, can't share)
- We need feedback on forecast accuracy
- Solution: Jury computes metrics locally, sends back only aggregates

## Design

```
┌─────────────────────────┐
│  Our System (Jan-May)   │
│  Generate 365 forecasts │
│  for June-Dec dates     │
└────────────┬────────────┘
             │ exports
             ▼
      forecast.csv
      (site_id, date, pred_m3)
             │
             ├──────────────▶ Jury's Local Script
             │               ├─ Reads our forecast CSV
             │               ├─ Reads his June-Dec actuals CSV
             │               ├─ Computes WAPE, errors, percentiles
             │               └─ Outputs metrics.csv (no actuals!)
             │                        │
             │                        ▼
             └────────────── metrics.csv (safe to share)
                            (wape, within_10%, worst_sites)
```

## Deliverables

### 1. Script for Jury

**File**: `scripts/validate_forecast.py`

```python
#!/usr/bin/env python3
"""
Blind Forecast Validation Script

Usage:
    python validate_forecast.py <forecast.csv> <actuals.csv> <output.csv>

This script:
1. Reads our predicted forecasts
2. Merges with Jury's actual data
3. Computes accuracy metrics
4. Returns ONLY metrics (no actual values disclosed)

Result can be shared safely.
"""
import pandas as pd
import sys
from pathlib import Path
from typing import Dict


def validate_forecast(
    forecast_path: Path,
    actuals_path: Path,
    output_path: Path,
) -> None:
    """
    Validate forecast against actual data. Output only metrics.
    """
    print(f"Loading forecast from {forecast_path}...")
    forecast = pd.read_csv(forecast_path, parse_dates=['date'])
    forecast = forecast.rename(columns={'pred_m3': 'forecast_m3'})

    print(f"Loading actuals from {actuals_path}...")
    actuals = pd.read_csv(actuals_path, parse_dates=['date'])
    actuals = actuals.rename(columns={'actual_m3': 'actual_m3'})

    # Merge on site_id + date
    print("Merging data...")
    merged = forecast.merge(
        actuals[['site_id', 'date', 'actual_m3']],
        on=['site_id', 'date'],
        how='inner',
    )

    if len(merged) == 0:
        print("ERROR: No matching records between forecast and actuals!")
        sys.exit(1)

    # Compute metrics
    print("Computing metrics...")

    # Overall WAPE
    total_forecast = merged['forecast_m3'].sum()
    total_actual = merged['actual_m3'].sum()
    overall_wape = abs(total_forecast - total_actual) / total_actual

    # Per-row errors
    merged['error_pct'] = (
        abs(merged['forecast_m3'] - merged['actual_m3'])
        / merged['actual_m3'].clip(lower=0.01)
        * 100
    )

    # Distribution
    within_10 = (merged['error_pct'] <= 10).mean() * 100
    within_20 = (merged['error_pct'] <= 20).mean() * 100
    within_50 = (merged['error_pct'] <= 50).mean() * 100

    # Per-site WAPE
    site_metrics = merged.groupby('site_id').agg({
        'forecast_m3': 'sum',
        'actual_m3': 'sum',
    }).reset_index()
    site_metrics['site_wape'] = (
        abs(site_metrics['forecast_m3'] - site_metrics['actual_m3'])
        / site_metrics['actual_m3']
    )

    worst_sites = site_metrics.nlargest(10, 'site_wape')['site_id'].tolist()
    best_sites = site_metrics.nsmallest(10, 'site_wape')['site_id'].tolist()

    # Summary (safe to share!)
    summary = {
        'date_generated': pd.Timestamp.now().isoformat(),
        'overall_wape': round(overall_wape, 4),
        'total_forecast_m3': round(total_forecast, 2),
        'total_actual_m3': round(total_actual, 2),
        'records_evaluated': len(merged),
        'sites_evaluated': merged['site_id'].nunique(),
        'days_evaluated': merged['date'].nunique(),
        'error_mean_pct': round(merged['error_pct'].mean(), 2),
        'error_median_pct': round(merged['error_pct'].median(), 2),
        'error_std_pct': round(merged['error_pct'].std(), 2),
        'within_10_pct': round(within_10, 1),
        'within_20_pct': round(within_20, 1),
        'within_50_pct': round(within_50, 1),
        'worst_sites': '|'.join(worst_sites),
        'best_sites': '|'.join(best_sites),
    }

    # Write summary (no actual values!)
    print(f"Writing metrics to {output_path}...")
    pd.DataFrame([summary]).to_csv(output_path, index=False)

    # Also write per-site WAPE (IDs + error only)
    per_site_path = output_path.with_name(
        output_path.stem + '_per_site.csv'
    )
    site_metrics[['site_id', 'site_wape']].to_csv(per_site_path, index=False)

    # Print summary
    print("\n=== VALIDATION SUMMARY ===")
    print(f"Overall WAPE: {overall_wape:.2%}")
    print(f"Total Forecast: {total_forecast:,.0f} m³")
    print(f"Total Actual: {total_actual:,.0f} m³")
    print(f"Difference: {abs(total_forecast - total_actual):,.0f} m³")
    print(f"\nError Distribution:")
    print(f"  Within 10%: {within_10:.1f}%")
    print(f"  Within 20%: {within_20:.1f}%")
    print(f"  Within 50%: {within_50:.1f}%")
    print(f"\nRecords: {len(merged)} (from {merged['site_id'].nunique()} sites, {merged['date'].nunique()} days)")
    print(f"\nWorst 5 sites: {worst_sites[:5]}")
    print(f"Best 5 sites: {best_sites[:5]}")
    print(f"\nMetrics saved to {output_path}")
    print(f"Per-site details saved to {per_site_path}")


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python validate_forecast.py <forecast.csv> <actuals.csv> <output.csv>")
        sys.exit(1)

    validate_forecast(
        forecast_path=Path(sys.argv[1]),
        actuals_path=Path(sys.argv[2]),
        output_path=Path(sys.argv[3]),
    )
```

### 2. Instructions for Jury

**File**: `docs/data/BLIND_VALIDATION_PROTOCOL.md`

```markdown
# Blind Validation Protocol

## Purpose
Validate our June-Dec 2025 forecasts against your actual data WITHOUT sharing your actual values.

## How It Works

1. **We send**: `forecast_june_dec_2025.csv`
   - Columns: site_id, date, pred_m3
   - No other information

2. **You run**: `python validate_forecast.py forecast_june_dec_2025.csv your_actuals.csv metrics.csv`
   - Uses YOUR actual data (kept on your machine)
   - Computes accuracy metrics
   - Outputs only: WAPE, error distribution, site rankings

3. **You send back**: `metrics.csv`
   - Contains only numbers and site IDs
   - NO actual values disclosed
   - Safe to share publicly or log

## Forecast CSV Format (From Us)

```csv
site_id,date,pred_m3
38105070,2025-06-01,123.45
38105070,2025-06-02,128.92
38105071,2025-06-01,456.78
...
```

- `site_id`: Container site identifier
- `date`: Date in YYYY-MM-DD format
- `pred_m3`: Predicted volume in cubic meters

## Actuals CSV Format (Your Data)

```csv
site_id,date,actual_m3
38105070,2025-06-01,125.30
38105070,2025-06-02,130.15
38105071,2025-06-01,450.20
...
```

- Same structure as our forecasts
- Your actual collected data

## Metrics CSV Output (Safe to Share)

```csv
date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,within_10_pct,within_20_pct,worst_sites
2025-12-28T10:30:45,0.0823,123456.78,125000.00,5400,45.2,72.8,38105070|38105071
```

Fields:
- `overall_wape`: Weighted Absolute Percentage Error (lower is better)
- `total_forecast_m3`: Sum of all predictions
- `total_actual_m3`: Sum of all actuals
- `records_evaluated`: Number of (site, date) pairs matched
- `within_10_pct`: % of forecasts within 10% of actual
- `within_20_pct`: % of forecasts within 20% of actual
- `within_50_pct`: % of forecasts within 50% of actual
- `worst_sites`: Pipe-separated list of 10 worst-performing site IDs
- `best_sites`: Pipe-separated list of 10 best-performing site IDs

## How We Use This Feedback

1. Parse metrics from your CSV
2. Identify worst-performing sites
3. Investigate characteristics (district, size, turnover, etc.)
4. Refine algorithm hypotheses
5. Generate new forecasts with adjustments
6. Iterate (repeat validation)

## Important Notes

✅ **Safe**: We never see your actual June-Dec data
✅ **Reproducible**: You can re-run validation anytime
✅ **Shareable**: Metrics CSV contains no sensitive data
❌ **Not**: We can't cherry-pick results or bias the evaluation

## Questions?

Contact: [your contact info]
```

## Code Changes

### 1. Add script to repo

```bash
cp scripts/validate_forecast.py scripts/validate_forecast_template.py
# (documented above)
```

### 2. Add documentation

```bash
mkdir -p docs/data
# Write BLIND_VALIDATION_PROTOCOL.md (documented above)
```

### 3. Add to README

```markdown
## Validation Protocol

For validating forecasts against held-out test data, see:
[docs/data/BLIND_VALIDATION_PROTOCOL.md](docs/data/BLIND_VALIDATION_PROTOCOL.md)

The protocol enables feedback without data leakage.
```

## Tests

```python
# tests/test_validation_script.py

def test_validate_forecast_script():
    """Test that validation script runs without error."""
    # Create mock forecast CSV
    forecast_csv = Path('/tmp/test_forecast.csv')
    forecast_csv.write_text(
        'site_id,date,pred_m3\n'
        '38105070,2025-06-01,123.45\n'
        '38105070,2025-06-02,128.92\n'
    )

    # Create mock actuals CSV
    actuals_csv = Path('/tmp/test_actuals.csv')
    actuals_csv.write_text(
        'site_id,date,actual_m3\n'
        '38105070,2025-06-01,125.30\n'
        '38105070,2025-06-02,130.15\n'
    )

    output_csv = Path('/tmp/test_metrics.csv')

    # Run validation script
    subprocess.run([
        'python', 'scripts/validate_forecast.py',
        str(forecast_csv), str(actuals_csv), str(output_csv)
    ], check=True)

    # Verify output
    assert output_csv.exists()
    metrics = pd.read_csv(output_csv)
    assert 'overall_wape' in metrics.columns
    assert 0 <= metrics['overall_wape'].iloc[0] <= 1
```

## Acceptance Criteria
- [ ] Validation script runs without error
- [ ] Script outputs metrics CSV with all required fields
- [ ] No actual values in metrics output
- [ ] Documentation clear and complete
- [ ] Instructions for Jury written and tested
- [ ] Example CSVs provided

---

## On Completion

1. Run all tests for validation script
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-29: Blind validation protocol"
