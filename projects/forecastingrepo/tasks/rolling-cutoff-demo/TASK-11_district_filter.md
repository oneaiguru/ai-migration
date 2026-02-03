# TASK-11: Add District Filter to Rolling Forecast

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
Add `district` filter parameter to `/api/mytko/rolling_forecast` for filtering results by district.

## Depends On
- TASK-10 (pagination) must be complete

## Current Behavior
All-sites mode returns all 24k sites, no filtering possible.

## New Behavior
Add optional `district` parameter to filter results by district name.

## API Changes

```
GET /api/mytko/rolling_forecast

Query Parameters (NEW):
  district  (optional) Filter by district name (case-insensitive, startswith match)

Example:
  ?cutoff_date=2025-03-15&horizon_days=7&district=Иркутский
```

## Data Source
District info is in `sites_registry.csv` column `district`.

## Code Changes

```python
# Modify generate_rolling_forecast in src/sites/rolling_forecast.py
# Add district_filter parameter

def generate_rolling_forecast(
    request: ForecastRequest,
    use_cache: bool = True,
    district_filter: str | None = None,  # NEW
) -> ForecastResult:
    # ... existing code ...

    # After loading bundle, filter by district if specified
    if district_filter:
        # Join with registry to get district
        registry = bundle.registry_df
        district_filter_lower = district_filter.lower()
        matching_sites = registry[
            registry['district'].str.lower().str.startswith(district_filter_lower, na=False)
        ]['site_id'].tolist()
        # Filter forecast_df
        forecast_df = forecast_df[forecast_df['site_id'].isin(matching_sites)]
```

```python
# Modify rolling_forecast() in scripts/api_app.py

@app.get("/api/mytko/rolling_forecast")
def rolling_forecast(
    cutoff_date: str = Query(...),
    horizon_days: int = Query(..., ge=1, le=365),
    site_id: str | None = None,
    format: str = Query("json"),
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    district: str | None = None,  # NEW
):
    # ... existing validation ...

    result = generate_rolling_forecast(
        request,
        district_filter=district,  # Pass filter
    )
    # ... rest unchanged ...
```

## Tests

```python
# tests/api/test_rolling_forecast_endpoint.py

class TestRollingForecastDistrictFilter:
    """Tests for district filtering."""

    def test_district_filter_exact_match(self, client):
        """Filter by exact district name."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": "Иркутский район",
        })
        assert resp.status_code == 200
        data = resp.json()
        # Verify all rows are from matching district
        assert data["site_count"] > 0
        assert data["site_count"] < 24000  # Filtered

    def test_district_filter_prefix_match(self, client):
        """Filter by district prefix (startswith)."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": "Иркут",  # Matches "Иркутский район"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["site_count"] > 0

    def test_district_filter_case_insensitive(self, client):
        """Filter is case-insensitive."""
        resp1 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": "Ангарский",
        })
        resp2 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": "АНГАРСКИЙ",
        })
        assert resp1.json()["site_count"] == resp2.json()["site_count"]

    def test_district_filter_no_match(self, client):
        """Filter with no matches returns empty."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": "Несуществующий район",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["site_count"] == 0
        assert len(data["rows"]) == 0

    def test_district_filter_with_pagination(self, client):
        """District filter works with pagination."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": "Ангарский",
            "limit": 10,
            "offset": 0,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["rows"]) <= 10
```

## Acceptance Criteria
- [ ] `district` parameter filters results
- [ ] Case-insensitive matching
- [ ] Prefix matching (startswith)
- [ ] Works with pagination
- [ ] Empty result for no matches (not error)
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
