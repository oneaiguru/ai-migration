# TASK-04: API Endpoint for Rolling Forecast

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Add `/api/mytko/rolling_forecast` endpoint to `scripts/api_app.py`.

## Depends On
- TASK-03 (rolling_forecast.py) must be complete

## Endpoint Specification

```
GET /api/mytko/rolling_forecast

Query Parameters:
  cutoff_date   (required) YYYY-MM-DD, max 2025-05-31
  horizon_days  (required) integer 1-365
  site_id       (optional) string, if omitted returns all-sites summary
  format        (optional) "json" or "csv", default "json"

Responses:
  200 OK - Forecast data (JSON or CSV)
  400 Bad Request - Invalid parameters
  404 Not Found - Site not found (single-site mode)
```

## Response Schemas

### Single-site mode (site_id provided, format=json):
```json
{
  "site_id": "38105070",
  "cutoff_date": "2025-03-15",
  "horizon_days": 7,
  "points": [
    {"date": "2025-03-16", "fill_pct": 0.45, "pred_volume_m3": 450.0, "overflow_prob": 0},
    {"date": "2025-03-17", "fill_pct": 0.52, "pred_volume_m3": 520.0, "overflow_prob": 0}
  ]
}
```

### All-sites mode (no site_id, format=json):
```json
{
  "cutoff_date": "2025-03-15",
  "horizon_days": 7,
  "site_count": 23456,
  "total_forecast_m3": 12345.67,
  "generated_at": "2025-12-28T12:00:00Z",
  "download_url": "/api/mytko/rolling_forecast/download?key=forecast_2025-03-15_..."
}
```

### CSV mode (format=csv):
Returns CSV with headers: `site_id,date,fill_pct,pred_volume_m3,overflow_prob`

## Code to Add

```python
# Add to scripts/api_app.py, inside create_app()

from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest, MAX_CUTOFF_DATE

@app.get("/api/mytko/rolling_forecast")
def rolling_forecast(
    cutoff_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    horizon_days: int = Query(..., ge=1, le=365),
    site_id: str | None = None,
    format: str = Query("json", pattern="^(json|csv)$"),
):
    # Parse and validate cutoff
    try:
        cutoff = date_cls.fromisoformat(cutoff_date)
    except ValueError:
        raise HTTPException(400, "Invalid cutoff_date format")

    if cutoff > MAX_CUTOFF_DATE:
        raise HTTPException(400, f"cutoff_date cannot exceed {MAX_CUTOFF_DATE}")

    # Build request
    request = ForecastRequest(
        cutoff_date=cutoff,
        horizon_days=horizon_days,
        site_ids=[site_id] if site_id else None,
    )

    # Generate forecast
    result = generate_rolling_forecast(request)

    # Format response based on mode
    if site_id:
        # Single-site mode
        points = result.forecast_df.to_dict('records')
        if not points:
            raise HTTPException(404, f"No forecast data for site {site_id}")
        if format == "csv":
            # Return CSV
            ...
        return {
            "site_id": site_id,
            "cutoff_date": cutoff_date,
            "horizon_days": horizon_days,
            "points": points,
        }
    else:
        # All-sites mode
        total_m3 = result.forecast_df['pred_volume_m3'].sum() / 1000.0
        if format == "csv":
            # Stream full CSV
            ...
        return {
            "cutoff_date": cutoff_date,
            "horizon_days": horizon_days,
            "site_count": result.site_count,
            "total_forecast_m3": round(total_m3, 2),
            "generated_at": result.generated_at,
            "download_url": f"/api/mytko/rolling_forecast/download?key={...}",
        }
```

## Tests

```python
# tests/api/test_rolling_forecast_endpoint.py

def test_rolling_forecast_single_site(client):
    resp = client.get("/api/mytko/rolling_forecast", params={
        "cutoff_date": "2025-03-15",
        "horizon_days": 7,
        "site_id": "38105070",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["site_id"] == "38105070"
    assert len(data["points"]) == 7


def test_rolling_forecast_invalid_cutoff(client):
    resp = client.get("/api/mytko/rolling_forecast", params={
        "cutoff_date": "2099-01-01",
        "horizon_days": 7,
    })
    assert resp.status_code == 400


def test_rolling_forecast_csv_format(client):
    resp = client.get("/api/mytko/rolling_forecast", params={
        "cutoff_date": "2025-03-15",
        "horizon_days": 7,
        "site_id": "38105070",
        "format": "csv",
    })
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
```

## Acceptance Criteria
- [ ] Endpoint handles single-site mode
- [ ] Endpoint handles all-sites mode with summary
- [ ] CSV export works
- [ ] Validation rejects bad inputs
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
