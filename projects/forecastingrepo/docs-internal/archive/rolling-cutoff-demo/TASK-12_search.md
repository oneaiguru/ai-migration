# TASK-12: Add Site Search to Rolling Forecast

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 20min

## Goal
Add `search` parameter to `/api/mytko/rolling_forecast` for searching by site_id or address.

## Depends On
- TASK-11 (district filter) recommended first

## API Changes

```
GET /api/mytko/rolling_forecast

Query Parameters (NEW):
  search  (optional) Search term - matches site_id or address (case-insensitive, contains)

Example:
  ?cutoff_date=2025-03-15&horizon_days=7&search=38105
  ?cutoff_date=2025-03-15&horizon_days=7&search=Плеханова
```

## Code Changes

```python
# Modify generate_rolling_forecast in src/sites/rolling_forecast.py

def generate_rolling_forecast(
    request: ForecastRequest,
    use_cache: bool = True,
    district_filter: str | None = None,
    search_term: str | None = None,  # NEW
) -> ForecastResult:
    # ... existing code ...

    # After loading bundle, filter by search if specified
    if search_term:
        registry = bundle.registry_df
        search_lower = search_term.lower()
        # Match site_id or address (if address column exists)
        mask = registry['site_id'].str.lower().str.contains(search_lower, na=False)
        if 'address' in registry.columns:
            mask |= registry['address'].str.lower().str.contains(search_lower, na=False)
        matching_sites = registry[mask]['site_id'].tolist()
        forecast_df = forecast_df[forecast_df['site_id'].isin(matching_sites)]
```

```python
# Modify rolling_forecast() in scripts/api_app.py

@app.get("/api/mytko/rolling_forecast")
def rolling_forecast(
    # ... existing params ...
    search: str | None = None,  # NEW
):
    result = generate_rolling_forecast(
        request,
        district_filter=district,
        search_term=search,  # Pass search
    )
```

## Tests

```python
# tests/api/test_rolling_forecast_endpoint.py

class TestRollingForecastSearch:
    """Tests for site search."""

    def test_search_by_site_id(self, client):
        """Search by partial site_id."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": "38105",
        })
        assert resp.status_code == 200
        data = resp.json()
        # All returned site_ids should contain "38105"
        for row in data["rows"]:
            assert "38105" in row["site_id"]

    def test_search_by_address(self, client):
        """Search by address substring."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": "Плеханова",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["site_count"] > 0

    def test_search_case_insensitive(self, client):
        """Search is case-insensitive."""
        resp1 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": "плеханова",
        })
        resp2 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": "ПЛЕХАНОВА",
        })
        assert resp1.json()["site_count"] == resp2.json()["site_count"]

    def test_search_no_match(self, client):
        """Search with no matches returns empty."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": "zzzznonexistent",
        })
        assert resp.status_code == 200
        assert resp.json()["site_count"] == 0

    def test_search_with_district(self, client):
        """Search combines with district filter."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": "381",
            "district": "Ангарский",
        })
        assert resp.status_code == 200
```

## Acceptance Criteria
- [ ] `search` parameter works
- [ ] Matches site_id (contains)
- [ ] Matches address (contains) if available
- [ ] Case-insensitive
- [ ] Combines with district filter
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
