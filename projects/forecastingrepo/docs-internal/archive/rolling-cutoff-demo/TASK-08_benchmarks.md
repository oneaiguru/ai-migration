# TASK-08: Performance Benchmarks

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 15min

## Goal
Create `scripts/benchmark_rolling_forecast.py` to measure timing.

## Script

```python
#!/usr/bin/env python3
"""Benchmark rolling forecast generation times."""
import time
from datetime import date
from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest

HORIZONS = [7, 30, 90, 180, 365]
CUTOFF = date(2025, 3, 15)

def benchmark():
    print("Horizon | Sites | Time (s) | Rows")
    print("--------|-------|----------|------")

    for h in HORIZONS:
        req = ForecastRequest(cutoff_date=CUTOFF, horizon_days=h)
        t0 = time.time()
        result = generate_rolling_forecast(req, use_cache=False)
        elapsed = time.time() - t0
        rows = len(result.forecast_df)
        print(f"{h:7} | {result.site_count:5} | {elapsed:8.2f} | {rows}")

if __name__ == "__main__":
    benchmark()
```

## Run
```bash
cd projects/forecastingrepo
python scripts/benchmark_rolling_forecast.py
```

## Acceptance Criteria
- [ ] Script runs without error
- [ ] Outputs timing table
- [ ] Identifies if any horizon > 20 min

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
