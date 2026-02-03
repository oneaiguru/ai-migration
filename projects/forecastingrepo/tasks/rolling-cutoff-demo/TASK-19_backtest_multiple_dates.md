# TASK-19: Backtest Across Multiple Cutoff Dates

**Complexity**: High | **Model**: Opus required | **Est**: TBD
**Status**: 🟢 DONE - Implemented and documented

## Goal
Document the existing multi-cutoff backtest utility.

## Context from Transcript (02:38–03:49)
> "I wanted to build a January forecast for you first. I just wanted it to be more flexible, so that we can set any date. Conditionally, January was shown, but now it's February. Any date of the 25th year."

> "I want to make you 365 forecasts, and that would be better than 34... forecast for first, on the second of June, then you do it based on the data for the first of June."

## Implementation Notes

**File**: `src/sites/rolling_backtest.py`

**Function**: `run_backtest(...)`

```python
def run_backtest(
    cutoff_dates: Iterable[date],
    horizon_days: int,
    sample_sites: Optional[list[str]] = None,
    use_cache: bool = True,
) -> pd.DataFrame:
```

### What it does
1. Iterates each cutoff date.
2. Calls `generate_rolling_forecast(...)` to produce the forecast.
3. Loads actuals for the forecast window using `load_service_data(...)`.
4. Uses `compute_accuracy_metrics(...)` to compute per-row errors.
5. Returns a single DataFrame with all cutoffs combined.

### Output Columns
`cutoff_date`, `site_id`, `target_date`, `forecast_m3`, `actual_m3`, `error_pct`

### Dependencies
- `src/sites/rolling_forecast.py`: `generate_rolling_forecast`, `compute_accuracy_metrics`
- `src/sites/data_loader.py`: `load_service_data`

## Usage Example

```python
from datetime import date
from src.sites.rolling_backtest import run_backtest

cutoffs = [date(2025, 3, 1), date(2025, 3, 8), date(2025, 3, 15)]
backtest_df = run_backtest(cutoffs, horizon_days=7, sample_sites=["38105070"])
```

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Document TASK-19: Backtest across multiple dates"
