# TASK-14: District-Level Aggregation Endpoint

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Create `/api/mytko/rolling_forecast/by_district` endpoint for district-level summaries.

## Depends On
- TASK-13 (accuracy metrics) recommended first

## Endpoint Specification

```
GET /api/mytko/rolling_forecast/by_district

Query Parameters:
  cutoff_date   (required) YYYY-MM-DD
  horizon_days  (required) 1-365
  limit         (optional) 1-100, default 50
  sort_by       (optional) "name"|"site_count"|"total_m3"|"wape", default "name"
  sort_order    (optional) "asc"|"desc", default "asc"

Response:
  200 OK - Array of district summaries
```

## Response Schema

```json
{
  "cutoff_date": "2025-03-15",
  "horizon_days": 7,
  "district_count": 45,
  "districts": [
    {
      "district": "Ангарский ГО",
      "site_count": 1234,
      "total_forecast_m3": 5678.90,
      "total_actual_m3": 5432.10,
      "accuracy_wape": 0.05,
      "top_site": {"site_id": "38106891", "forecast_m3": 123.4},
      "bottom_site": {"site_id": "38122820", "forecast_m3": 1.2}
    },
    ...
  ]
}
```

## Code to Add

```python
# Add to scripts/api_app.py

@app.get("/api/mytko/rolling_forecast/by_district")
def rolling_forecast_by_district(
    cutoff_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    horizon_days: int = Query(..., ge=1, le=365),
    limit: int = Query(50, ge=1, le=100),
    sort_by: str = Query("name", pattern="^(name|site_count|total_m3|wape)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
):
    """
    Get district-level forecast aggregations.
    """
    from datetime import date as date_cls
    from src.sites.rolling_forecast import generate_rolling_forecast
    from src.sites.rolling_types import ForecastRequest
    from src.sites.data_loader import load_registry

    # Validate cutoff
    cutoff = date_cls.fromisoformat(cutoff_date)
    if cutoff > MAX_CUTOFF_DATE:
        raise HTTPException(400, f"cutoff_date cannot exceed {MAX_CUTOFF_DATE}")

    # Generate all-sites forecast
    request = ForecastRequest(cutoff_date=cutoff, horizon_days=horizon_days)
    result = generate_rolling_forecast(request)

    # Load registry for district info
    registry = load_registry()
    site_districts = dict(zip(registry['site_id'], registry['district']))

    # Add district to forecast
    df = result.forecast_df.copy()
    df['district'] = df['site_id'].map(site_districts).fillna('Unknown')

    # Aggregate by district
    agg = df.groupby('district').agg(
        site_count=('site_id', 'nunique'),
        total_forecast_m3=('pred_volume_m3', lambda x: x.sum() / 1000.0),
    ).reset_index()

    # Add top/bottom sites per district
    districts = []
    for _, row in agg.iterrows():
        district_df = df[df['district'] == row['district']]
        site_totals = district_df.groupby('site_id')['pred_volume_m3'].sum().sort_values()
        bottom = site_totals.head(1)
        top = site_totals.tail(1)

        districts.append({
            "district": row['district'],
            "site_count": int(row['site_count']),
            "total_forecast_m3": round(row['total_forecast_m3'], 2),
            "top_site": {"site_id": top.index[0], "forecast_m3": round(top.iloc[0]/1000, 2)} if len(top) > 0 else None,
            "bottom_site": {"site_id": bottom.index[0], "forecast_m3": round(bottom.iloc[0]/1000, 2)} if len(bottom) > 0 else None,
        })

    # Sort
    sort_key = {
        "name": lambda x: x["district"],
        "site_count": lambda x: x["site_count"],
        "total_m3": lambda x: x["total_forecast_m3"],
        "wape": lambda x: x.get("accuracy_wape") or 999,
    }[sort_by]
    districts.sort(key=sort_key, reverse=(sort_order == "desc"))

    # Limit
    districts = districts[:limit]

    return {
        "cutoff_date": cutoff_date,
        "horizon_days": horizon_days,
        "district_count": len(agg),
        "districts": districts,
    }
```

## Tests

```python
# tests/api/test_rolling_forecast_endpoint.py

class TestRollingForecastByDistrict:
    """Tests for district aggregation endpoint."""

    def test_by_district_basic(self, client):
        """Returns district summaries."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "districts" in data
        assert len(data["districts"]) > 0
        # Check structure
        d = data["districts"][0]
        assert "district" in d
        assert "site_count" in d
        assert "total_forecast_m3" in d

    def test_by_district_sorting(self, client):
        """Sort by site_count desc."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "sort_by": "site_count",
            "sort_order": "desc",
        })
        data = resp.json()
        districts = data["districts"]
        for i in range(len(districts) - 1):
            assert districts[i]["site_count"] >= districts[i+1]["site_count"]

    def test_by_district_limit(self, client):
        """Limit results."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 5,
        })
        data = resp.json()
        assert len(data["districts"]) <= 5

    def test_by_district_has_top_bottom(self, client):
        """Each district has top/bottom sites."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        data = resp.json()
        for d in data["districts"]:
            assert "top_site" in d
            assert "bottom_site" in d
```

## Acceptance Criteria
- [ ] Endpoint returns district-level summaries
- [ ] Each district has site_count, total_forecast_m3
- [ ] Top/bottom sites included
- [ ] Sorting works (name, site_count, total_m3)
- [ ] Limit parameter works
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
