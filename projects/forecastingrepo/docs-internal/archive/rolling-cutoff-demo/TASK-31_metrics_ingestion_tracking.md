# TASK-31: Metrics Ingestion & Tracking

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min

## Goal
Ingest Jury's validation metrics (from TASK-29) and track forecast improvements across algorithm iterations.

## Context
- TASK-29: Jury runs validation script, sends back metrics CSV
- TASK-30: We export forecasts for validation
- TASK-31: We collect feedback and iterate
- Goal: See improvement over time

## Data Model

### Input: Jury's Metrics CSV (from TASK-29)

```csv
date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,within_10_pct,within_20_pct,worst_sites
2025-12-28T10:30:45,0.0823,123456.78,125000.00,5400,45.2,72.8,38105070|38105071
```

### Storage: metrics_history.parquet

```
Columns:
- timestamp: When validation was run
- iteration: Version number (1, 2, 3, ...)
- algorithm_params: JSON string with params used (model, window_days, etc.)
- overall_wape: WAPE metric
- total_forecast_m3: Sum of predictions
- total_actual_m3: Sum of actuals
- records_evaluated: Number of (site, date) pairs
- sites_evaluated: Number of unique sites
- within_10_pct: % within 10%
- within_20_pct: % within 20%
- within_50_pct: % within 50%
- worst_sites: Pipe-separated string of worst site IDs
- best_sites: Pipe-separated string of best site IDs
- notes: Free-text notes about this iteration
```

## Code

### 1. Create metrics tracker

```python
# src/sites/metrics_tracker.py

from datetime import datetime, date
from pathlib import Path
from typing import Optional, Dict, Any
import pandas as pd
import json


class MetricsTracker:
    """Track validation metrics across algorithm iterations."""

    def __init__(self, storage_path: Path = Path('data/metrics_history.parquet')):
        self.storage_path = storage_path
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)

        if self.storage_path.exists():
            self.df = pd.read_parquet(self.storage_path)
        else:
            self.df = pd.DataFrame()

    def ingest_validation_csv(
        self,
        metrics_csv: Path,
        iteration: int,
        algorithm_params: Optional[Dict[str, Any]] = None,
        notes: str = '',
    ) -> None:
        """
        Ingest metrics CSV from Jury's validation script.

        Args:
            metrics_csv: Path to metrics.csv from TASK-29
            iteration: Version number (1, 2, 3, ...)
            algorithm_params: Dict of algorithm settings used
            notes: Free-text notes about this iteration
        """
        print(f"Ingesting metrics from {metrics_csv}...")

        # Read Jury's metrics
        jury_metrics = pd.read_csv(metrics_csv)

        if len(jury_metrics) != 1:
            raise ValueError(f"Expected 1 row, got {len(jury_metrics)}")

        row = jury_metrics.iloc[0].to_dict()

        # Build our record
        record = {
            'timestamp': datetime.now().isoformat(),
            'generated_at': row.get('date_generated', ''),
            'iteration': iteration,
            'algorithm_params': json.dumps(algorithm_params or {}),
            'overall_wape': float(row.get('overall_wape', 0)),
            'total_forecast_m3': float(row.get('total_forecast_m3', 0)),
            'total_actual_m3': float(row.get('total_actual_m3', 0)),
            'records_evaluated': int(row.get('records_evaluated', 0)),
            'sites_evaluated': int(row.get('sites_evaluated', 0)),
            'within_10_pct': float(row.get('within_10_pct', 0)),
            'within_20_pct': float(row.get('within_20_pct', 0)),
            'within_50_pct': float(row.get('within_50_pct', 0)),
            'worst_sites': str(row.get('worst_sites', '')),
            'best_sites': str(row.get('best_sites', '')),
            'notes': notes,
        }

        # Append to history
        self.df = pd.concat(
            [self.df, pd.DataFrame([record])],
            ignore_index=True,
        )

        # Save
        self.save()

        print(f"✓ Ingested: WAPE={record['overall_wape']:.4f}, "
              f"sites={record['sites_evaluated']}, "
              f"within_20%={record['within_20_pct']:.1f}%")

    def save(self) -> None:
        """Save metrics to storage."""
        self.df.to_parquet(self.storage_path, index=False)

    def get_improvement(self) -> Dict[str, float]:
        """Compare latest vs initial results."""
        if len(self.df) < 2:
            return {}

        initial = self.df.iloc[0]
        latest = self.df.iloc[-1]

        return {
            'wape_improvement_pct': (
                (initial['overall_wape'] - latest['overall_wape'])
                / initial['overall_wape']
                * 100
            ),
            'within_20_improvement': (
                latest['within_20_pct'] - initial['within_20_pct']
            ),
            'records_evaluated': latest['records_evaluated'],
            'iterations': len(self.df),
        }

    def get_summary(self) -> str:
        """Get readable summary of improvements."""
        improvement = self.get_improvement()

        if not improvement:
            return "Insufficient data for improvement analysis"

        return (
            f"Improvement Summary:\n"
            f"  Iterations: {improvement['iterations']}\n"
            f"  WAPE improvement: {improvement['wape_improvement_pct']:.1f}%\n"
            f"  Within 20% improvement: +{improvement['within_20_improvement']:.1f}%\n"
            f"  Records evaluated: {improvement['records_evaluated']:,}"
        )

    def get_history(self) -> pd.DataFrame:
        """Get full history."""
        return self.df[
            ['timestamp', 'iteration', 'overall_wape', 'within_20_pct', 'notes']
        ].copy()
```

### 2. Create CLI tool

```python
# scripts/ingest_validation_metrics.py

#!/usr/bin/env python3
"""
Ingest validation metrics from Jury.

Usage:
    python ingest_validation_metrics.py metrics.csv --iteration 1 --notes "baseline"
"""
import sys
from pathlib import Path
import argparse
import json

from src.sites.metrics_tracker import MetricsTracker


def main():
    parser = argparse.ArgumentParser(description='Ingest validation metrics')
    parser.add_argument('metrics_csv', type=Path, help='Metrics CSV from Jury')
    parser.add_argument('--iteration', type=int, required=True, help='Iteration number')
    parser.add_argument('--params', type=str, help='Algorithm params as JSON')
    parser.add_argument('--notes', type=str, default='', help='Notes about this iteration')
    parser.add_argument(
        '--storage',
        type=Path,
        default=Path('data/metrics_history.parquet'),
        help='Storage path',
    )

    args = parser.parse_args()

    # Parse params if provided
    params = None
    if args.params:
        params = json.loads(args.params)

    tracker = MetricsTracker(args.storage)
    tracker.ingest_validation_csv(
        metrics_csv=args.metrics_csv,
        iteration=args.iteration,
        algorithm_params=params,
        notes=args.notes,
    )

    print("\n" + tracker.get_summary())
    print("\nHistory:")
    print(tracker.get_history().to_string(index=False))


if __name__ == '__main__':
    main()
```

### 3. Add API endpoint

```python
# scripts/api_app.py

from src.sites.metrics_tracker import MetricsTracker

metrics_tracker = MetricsTracker()

@app.get("/api/mytko/validation_metrics/summary")
def get_metrics_summary():
    """Get improvement summary across iterations."""
    return {
        'summary': metrics_tracker.get_summary(),
        'improvement': metrics_tracker.get_improvement(),
        'iterations': len(metrics_tracker.df),
    }

@app.get("/api/mytko/validation_metrics/history")
def get_metrics_history():
    """Get full metrics history."""
    history = metrics_tracker.get_history()
    return history.to_dict(orient='records')

@app.post("/api/mytko/validation_metrics/ingest")
def ingest_metrics(
    file: UploadFile = File(...),
    iteration: int = Query(..., ge=1),
    notes: str = Query(''),
):
    """Upload validation metrics CSV."""
    import tempfile

    with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as f:
        content = file.file.read()
        f.write(content)
        f.flush()

        metrics_tracker.ingest_validation_csv(
            metrics_csv=Path(f.name),
            iteration=iteration,
            notes=notes,
        )

    return {
        'status': 'ok',
        'summary': metrics_tracker.get_summary(),
    }
```

## Usage

### Command line:
```bash
# Ingest metrics from Jury
python scripts/ingest_validation_metrics.py metrics.csv --iteration 1 --notes "baseline"

# With algorithm params
python scripts/ingest_validation_metrics.py metrics.csv --iteration 2 \
  --params '{"window_days": 84, "holiday_multiplier": 1.2}' \
  --notes "increased holiday effect"
```

### Via API:
```bash
# Upload metrics
curl -X POST http://localhost:8000/api/mytko/validation_metrics/ingest \
  -F "file=@metrics.csv" \
  -F "iteration=1" \
  -F "notes=baseline"

# Get summary
curl http://localhost:8000/api/mytko/validation_metrics/summary

# Get history
curl http://localhost:8000/api/mytko/validation_metrics/history
```

### In Python:
```python
from src.sites.metrics_tracker import MetricsTracker
from pathlib import Path

tracker = MetricsTracker()
tracker.ingest_validation_csv(
    metrics_csv=Path('metrics.csv'),
    iteration=1,
    algorithm_params={'window_days': 56},
    notes='baseline',
)

print(tracker.get_summary())
print(tracker.get_history())
```

## Tests

```python
# tests/test_metrics_tracker.py

def test_metrics_tracker_ingestion():
    """Test metrics ingestion."""
    from src.sites.metrics_tracker import MetricsTracker
    from pathlib import Path
    import tempfile

    # Create test metrics CSV
    metrics_csv = Path(tempfile.gettempdir()) / 'test_metrics.csv'
    metrics_csv.write_text(
        'date_generated,overall_wape,total_forecast_m3,total_actual_m3,'
        'records_evaluated,sites_evaluated,within_10_pct,within_20_pct,worst_sites\n'
        '2025-12-28T10:00:00,0.0823,123456.78,125000.00,5400,1000,45.2,72.8,38105070|38105071\n'
    )

    storage_path = Path(tempfile.gettempdir()) / 'test_metrics.parquet'
    tracker = MetricsTracker(storage_path)

    tracker.ingest_validation_csv(
        metrics_csv=metrics_csv,
        iteration=1,
        notes='baseline',
    )

    assert len(tracker.df) == 1
    assert tracker.df.iloc[0]['overall_wape'] == 0.0823
    assert tracker.df.iloc[0]['iteration'] == 1

def test_metrics_improvement():
    """Test improvement calculation."""
    # Ingest 2 iterations
    # Verify improvement is calculated correctly
    pass
```

## Acceptance Criteria
- [ ] MetricsTracker class implemented
- [ ] Can ingest Jury's metrics CSV
- [ ] Tracks history across iterations
- [ ] Calculates improvement over time
- [ ] CLI tool works
- [ ] API endpoints work
- [ ] Tests pass
- [ ] Storage is persistent (parquet file)

---

## On Completion

1. Run all tests for metrics tracker
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-31: Metrics ingestion & tracking"
