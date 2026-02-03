# TASK-13: Add Accuracy Metrics to Forecast Response

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Include accuracy metrics (WAPE, actual vs forecast) in rolling forecast responses when actuals are available.

## Depends On
- TASK-12 (search) recommended first

## Context
When `cutoff_date + horizon_days ≤ 2025-05-31`, we have actual data to compare against.

## API Changes

```
GET /api/mytko/rolling_forecast

Response (when actuals available):
  - Per row: adds "actual_m3", "error_pct"
  - Summary: adds "accuracy_wape", "accuracy_coverage_pct"
```

## Response Schema Changes

### Row-level (when actuals exist):
```json
{
  "site_id": "38105070",
  "date": "2025-03-16",
  "fill_pct": 0.45,
  "pred_volume_m3": 450.0,
  "overflow_prob": 0,
  "actual_m3": 0.42,
  "error_pct": 7.1
}
```

### Summary-level:
```json
{
  "cutoff_date": "2025-03-15",
  "horizon_days": 7,
  "site_count": 1000,
  "total_forecast_m3": 12345.67,
  "total_actual_m3": 11890.45,
  "accuracy_wape": 0.08,
  "accuracy_coverage_pct": 95.2,
  ...
}
```

## Code Changes

```python
# Add to src/sites/rolling_forecast.py

def compute_accuracy_metrics(
    forecast_df: pd.DataFrame,
    service_df: pd.DataFrame,
    cutoff_date: date,
    horizon_days: int,
) -> tuple[pd.DataFrame, dict]:
    """
    Add actual values and compute accuracy metrics.

    Returns:
        (forecast_df with actuals, accuracy_summary dict)
    """
    # Get actuals for the forecast period
    start = cutoff_date + timedelta(days=1)
    end = cutoff_date + timedelta(days=horizon_days)

    # Aggregate service data to daily totals per site
    actuals = service_df[
        (service_df['service_dt'] >= start) &
        (service_df['service_dt'] <= end)
    ].groupby(['site_id', 'service_dt'])['collect_volume_m3'].sum().reset_index()
    actuals['actual_m3'] = actuals['collect_volume_m3'] / 1000.0
    actuals = actuals.rename(columns={'service_dt': 'date'})

    # Merge with forecast
    merged = forecast_df.merge(
        actuals[['site_id', 'date', 'actual_m3']],
        on=['site_id', 'date'],
        how='left',
    )

    # Compute error
    merged['error_pct'] = np.where(
        merged['actual_m3'].notna() & (merged['actual_m3'] > 0),
        abs(merged['pred_volume_m3']/1000.0 - merged['actual_m3']) / merged['actual_m3'] * 100,
        None
    )

    # Summary metrics
    valid = merged[merged['actual_m3'].notna()]
    if len(valid) > 0:
        forecast_sum = valid['pred_volume_m3'].sum() / 1000.0
        actual_sum = valid['actual_m3'].sum()
        wape = abs(forecast_sum - actual_sum) / actual_sum if actual_sum > 0 else 0
        coverage = len(valid) / len(merged) * 100
    else:
        wape = None
        actual_sum = None
        coverage = 0

    summary = {
        "total_actual_m3": round(actual_sum, 2) if actual_sum else None,
        "accuracy_wape": round(wape, 4) if wape is not None else None,
        "accuracy_coverage_pct": round(coverage, 1),
    }

    return merged, summary
```

```python
# Modify rolling_forecast() in scripts/api_app.py

# After getting result, check if we can compute accuracy
if cutoff + timedelta(days=horizon_days) <= MAX_CUTOFF_DATE:
    from src.sites.rolling_forecast import compute_accuracy_metrics
    from src.sites.data_loader import load_service_data

    service_df = load_service_data(
        start_date=cutoff + timedelta(days=1),
        end_date=cutoff + timedelta(days=horizon_days),
    )
    df_with_actuals, accuracy_summary = compute_accuracy_metrics(
        result.forecast_df, service_df, cutoff, horizon_days
    )
    # Add accuracy fields to response
```

## Tests

```python
# tests/api/test_rolling_forecast_endpoint.py

class TestRollingForecastAccuracy:
    """Tests for accuracy metrics."""

    def test_accuracy_metrics_when_actuals_available(self, client):
        """Include accuracy when horizon within actual data."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",  # Horizon ends 2025-03-22, within data
            "horizon_days": 7,
        })
        data = resp.json()
        assert "accuracy_wape" in data
        assert "total_actual_m3" in data
        assert "accuracy_coverage_pct" in data

    def test_accuracy_per_row(self, client):
        """Each row has actual_m3 and error_pct."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "site_id": "38105070",
        })
        data = resp.json()
        for point in data["points"]:
            assert "actual_m3" in point
            assert "error_pct" in point

    def test_no_accuracy_when_future(self, client):
        """No accuracy metrics when horizon exceeds data."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-05-25",  # +7 days = 2025-06-01 > 2025-05-31
            "horizon_days": 7,
        })
        data = resp.json()
        assert data.get("accuracy_wape") is None or "accuracy_wape" not in data

    def test_wape_calculation(self, client):
        """WAPE is correctly calculated."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        data = resp.json()
        # WAPE should be between 0 and 1 (or None)
        if data.get("accuracy_wape") is not None:
            assert 0 <= data["accuracy_wape"] <= 1
```

## Acceptance Criteria
- [ ] `actual_m3` added to rows when available
- [ ] `error_pct` computed per row
- [ ] `accuracy_wape` in summary
- [ ] `accuracy_coverage_pct` in summary
- [ ] No accuracy fields when horizon exceeds actual data
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
