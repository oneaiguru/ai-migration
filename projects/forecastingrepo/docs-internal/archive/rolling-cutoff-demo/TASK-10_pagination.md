# TASK-10: Add Pagination to All-Sites Mode

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
Add `limit`/`offset` pagination to `/api/mytko/rolling_forecast` all-sites mode.

## Depends On
- TASK-09 (download endpoint) recommended first

## Current Behavior
All-sites mode returns summary only (count + total_m3), no actual forecast rows.

## New Behavior
All-sites mode returns paginated forecast rows with pagination metadata.

## API Changes

```
GET /api/mytko/rolling_forecast

Query Parameters (existing):
  cutoff_date   (required) YYYY-MM-DD
  horizon_days  (required) 1-365
  site_id       (optional) if omitted = all-sites mode
  format        (optional) json|csv

Query Parameters (NEW):
  limit         (optional) 1-1000, default 50
  offset        (optional) ≥0, default 0

Response Headers (NEW):
  X-Total-Count: total rows available
  X-Site-Count: unique sites in result
```

## Response Schema Changes

### All-sites mode (no site_id, format=json):
```json
{
  "cutoff_date": "2025-03-15",
  "horizon_days": 7,
  "site_count": 23456,
  "total_forecast_m3": 12345.67,
  "total_rows": 164192,
  "limit": 50,
  "offset": 0,
  "rows": [
    {"site_id": "38100001", "date": "2025-03-16", "fill_pct": 0.45, "pred_volume_m3": 450.0, "overflow_prob": 0},
    ...
  ],
  "download_url": "/api/mytko/rolling_forecast/download?key=..."
}
```

## Code Changes

```python
# Modify rolling_forecast() in scripts/api_app.py

@app.get("/api/mytko/rolling_forecast")
def rolling_forecast(
    cutoff_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    horizon_days: int = Query(..., ge=1, le=365),
    site_id: str | None = None,
    format: str = Query("json", pattern="^(json|csv)$"),
    limit: int = Query(50, ge=1, le=1000),  # NEW
    offset: int = Query(0, ge=0),            # NEW
):
    # ... existing validation ...

    if site_id:
        # Single-site mode (unchanged)
        ...
    else:
        # All-sites mode with pagination
        df = result.forecast_df
        total_rows = len(df)
        total_m3 = df['pred_volume_m3'].sum() / 1000.0

        # Paginate
        page = df.iloc[offset:offset + limit]
        rows = page.to_dict('records')

        # Add pagination headers
        response_headers = {
            "X-Total-Count": str(total_rows),
            "X-Site-Count": str(result.site_count),
        }

        if format == "csv":
            # Return paginated CSV (or full if limit=1000)
            ...

        return JSONResponse(
            content={
                "cutoff_date": cutoff_date,
                "horizon_days": horizon_days,
                "site_count": result.site_count,
                "total_forecast_m3": round(total_m3, 2),
                "total_rows": total_rows,
                "limit": limit,
                "offset": offset,
                "rows": rows,
                "download_url": f"/api/mytko/rolling_forecast/download?key=...",
            },
            headers=response_headers,
        )
```

## Tests

```python
# tests/api/test_rolling_forecast_endpoint.py

class TestRollingForecastPagination:
    """Tests for all-sites pagination."""

    def test_pagination_default_limit(self, client):
        """Default returns 50 rows."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["rows"]) <= 50
        assert data["limit"] == 50
        assert data["offset"] == 0
        assert "X-Total-Count" in resp.headers

    def test_pagination_custom_limit(self, client):
        """Custom limit respected."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 10,
        })
        data = resp.json()
        assert len(data["rows"]) <= 10
        assert data["limit"] == 10

    def test_pagination_offset(self, client):
        """Offset skips rows."""
        resp1 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 10,
            "offset": 0,
        })
        resp2 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 10,
            "offset": 10,
        })
        data1 = resp1.json()
        data2 = resp2.json()
        # First row of page 2 != first row of page 1
        assert data1["rows"][0] != data2["rows"][0]

    def test_pagination_headers(self, client):
        """Pagination headers present."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert "X-Total-Count" in resp.headers
        assert "X-Site-Count" in resp.headers
        assert int(resp.headers["X-Total-Count"]) > 0
```

## Acceptance Criteria
- [ ] `limit` parameter works (1-1000)
- [ ] `offset` parameter works
- [ ] X-Total-Count header present
- [ ] X-Site-Count header present
- [ ] `rows` array in response
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
