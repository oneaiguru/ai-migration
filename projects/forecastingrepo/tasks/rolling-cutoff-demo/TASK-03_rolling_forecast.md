# TASK-03: Rolling Forecast Generator

**Complexity**: Medium-High | **Model**: Sonnet recommended | **Est**: 45min

## Goal
Create `src/sites/rolling_forecast.py` that wraps existing `baseline.py` + `simulator.py` to generate forecasts with a rolling cutoff.

## Dependencies
- TASK-01 (data_loader) must be complete
- TASK-02 (forecast_cache) must be complete
- Existing: `src/sites/baseline.py` (estimate_weekday_rates)
- Existing: `src/sites/simulator.py` (simulate_fill)

## Required Functions

```python
# src/sites/rolling_forecast.py

from datetime import date, timedelta
from typing import Optional
import pandas as pd

from .data_loader import load_data_bundle
from .baseline import estimate_weekday_rates
from .simulator import simulate_fill
from .forecast_cache import cache_exists, load_from_cache, save_to_cache
from .rolling_types import ForecastRequest, ForecastResult, MAX_CUTOFF_DATE


def generate_rolling_forecast(
    request: ForecastRequest,
    use_cache: bool = True,
    window_days: int = 56,
    district_filter: str | None = None,
    search_term: str | None = None,
    apply_holiday_adjustments: bool = False,
    holiday_multiplier: float = 1.15,
    holiday_region: str | None = None,
) -> ForecastResult:
    """
    Generate forecast for all sites (or subset) using rolling cutoff.

    Steps:
    1. Validate request (cutoff <= MAX_CUTOFF_DATE, horizon in range)
    2. Build cache suffix (site_ids + district + search)
    3. Check cache; return cached if exists and use_cache=True
    3. Load service data up to cutoff
    4. Compute weekday rates via baseline.estimate_weekday_rates(cutoff=cutoff)
    5. Optionally adjust weekday rates for holidays
    5. Simulate fill via simulator.simulate_fill(start, end)
    6. Cache result (suffix-aware)
    7. Return ForecastResult

    Args:
        request: ForecastRequest with cutoff_date, horizon_days, optional site_ids
        use_cache: If True, check/use cache
        window_days: Training window for rate estimation (default 56)
        district_filter: Optional district name (case-insensitive prefix)
        search_term: Optional site ID/address search term
        apply_holiday_adjustments: When True, adjust weekday rates on holidays
        holiday_multiplier: Multiplier for holiday weekdays
        holiday_region: Optional region for holiday lookup

    Returns:
        ForecastResult with forecast DataFrame and metadata
    """
    # TODO: Implement


def validate_request(request: ForecastRequest) -> None:
    """Raise ValueError if request is invalid."""
    if request.cutoff_date > MAX_CUTOFF_DATE:
        raise ValueError(f"cutoff_date cannot exceed {MAX_CUTOFF_DATE}")
    if not (1 <= request.horizon_days <= 365):
        raise ValueError("horizon_days must be 1-365")
    # TODO: Add more validation as needed
```

## How Existing Modules Work

### baseline.estimate_weekday_rates
```python
from src.sites.baseline import estimate_weekday_rates

# Input: DataFrame with site_id, service_dt, collect_volume_m3
# Returns: DataFrame with site_id, weekday (0-6), rate_m3_per_day
rates = estimate_weekday_rates(
    service_df,        # DataFrame
    cutoff=date(...),  # Last date to use for training
    window_days=56,    # Use last 56 days before cutoff
    min_obs=4          # Minimum observations per weekday
)
```

### simulator.simulate_fill
```python
from src.sites.simulator import simulate_fill

# Input: registry + weekday rates
# Returns: DataFrame with site_id, date, fill_pct, pred_volume_m3, overflow_prob
forecast = simulate_fill(
    site_registry=registry_df,   # site_id, bin_count, bin_size_liters
    weekday_rates=rates,         # from estimate_weekday_rates
    start_dt=date(...),          # First forecast date
    end_dt=date(...),            # Last forecast date
    capacity_liters=1100,        # Default if missing in registry
    overflow_threshold=0.8       # fill_pct above this -> overflow_prob=1
)
```

## Implementation Flow

```
1. Parse request → cutoff, start=cutoff+1, end=start+horizon-1
2. cache_suffix = build_cache_suffix(site_ids, district_filter, search_term)
3. If use_cache and cache_exists(cutoff, start, end, cache_suffix=cache_suffix):
     return load_from_cache(..., cache_suffix=cache_suffix)
3. bundle = load_data_bundle(end_date=cutoff)  # Only data up to cutoff
4. rates = estimate_weekday_rates(bundle.service_df, cutoff, window_days)
5. If apply_holiday_adjustments: adjust_baseline_for_holidays(...)
5. forecast_df = simulate_fill(bundle.registry_df, rates, start, end)
6. If site_ids filter: forecast_df = forecast_df[forecast_df.site_id.isin(site_ids)]
7. save_to_cache(forecast_df, cutoff, start, end, site_count, cache_suffix=cache_suffix)
8. Return ForecastResult(...)
```

## Tests to Write

```python
# tests/sites/test_rolling_forecast.py

from datetime import date
import pytest
from src.sites.rolling_forecast import generate_rolling_forecast, validate_request
from src.sites.rolling_types import ForecastRequest, MAX_CUTOFF_DATE


def test_validate_request_future_cutoff():
    """Reject cutoff beyond MAX_CUTOFF_DATE."""
    with pytest.raises(ValueError, match="cannot exceed"):
        validate_request(ForecastRequest(
            cutoff_date=date(2099, 1, 1),
            horizon_days=7
        ))


def test_validate_request_invalid_horizon():
    """Reject horizon outside 1-365."""
    with pytest.raises(ValueError, match="1-365"):
        validate_request(ForecastRequest(
            cutoff_date=date(2025, 3, 15),
            horizon_days=0
        ))


def test_generate_forecast_basic():
    """Generate a 7-day forecast and verify structure."""
    result = generate_rolling_forecast(ForecastRequest(
        cutoff_date=date(2025, 3, 15),
        horizon_days=7,
        site_ids=['38105070']  # Single site for speed
    ), use_cache=False)

    assert result.cutoff_date == date(2025, 3, 15)
    assert result.start_date == date(2025, 3, 16)
    assert len(result.forecast_df) == 7  # 7 days × 1 site
    assert 'fill_pct' in result.forecast_df.columns


def test_caching_works():
    """Second call should be faster (cached)."""
    import time
    req = ForecastRequest(cutoff_date=date(2025, 1, 15), horizon_days=7)

    t1 = time.time()
    r1 = generate_rolling_forecast(req, use_cache=True)
    first_time = time.time() - t1

    t2 = time.time()
    r2 = generate_rolling_forecast(req, use_cache=True)
    second_time = time.time() - t2

    assert r2.cached is True
    assert second_time < first_time / 2  # At least 2x faster
```

## Acceptance Criteria
- [ ] generate_rolling_forecast works for single site
- [ ] generate_rolling_forecast works for all sites
- [ ] Caching works (second call faster)
- [ ] Validation rejects bad inputs
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
