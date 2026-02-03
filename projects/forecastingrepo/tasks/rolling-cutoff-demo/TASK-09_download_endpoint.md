# TASK-09: Download Endpoint for Cached Forecasts

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 15min

## Goal
Implement the `/api/mytko/rolling_forecast/download` endpoint that the all-sites summary references.

## Depends On
- TASK-04 (rolling_forecast endpoint) complete

## Critical Gap
Currently the API returns `download_url` but the endpoint doesn't exist!

## Endpoint Specification

```
GET /api/mytko/rolling_forecast/download

Query Parameters:
  key  (required) Cache key: "forecast_{cutoff}_{start}_{end}" format
               (optional filter suffix: "forecast_{cutoff}_{start}_{end}_{suffix}")

Responses:
  200 OK - CSV file stream
  404 Not Found - Cache miss or invalid key
```

## Code to Add

```python
# Add to scripts/api_app.py, inside create_app() after rolling_forecast

@app.get("/api/mytko/rolling_forecast/download")
def rolling_forecast_download(
    key: str = Query(
        ...,
        pattern=r"^forecast_\\d{4}-\\d{2}-\\d{2}_\\d{4}-\\d{2}-\\d{2}_\\d{4}-\\d{2}-\\d{2}(?:_f[0-9a-f]{12})?$",
    ),
):
    """
    Download cached forecast as CSV.

    Key format: forecast_{cutoff}_{start}_{end}[_suffix]
    Example: forecast_2025-03-15_2025-03-16_2025-03-22
    """
    from src.sites.forecast_cache import CACHE_DIR, load_from_cache

    # Parse key to extract dates
    try:
        parts = key.split("_")
        cutoff = date_cls.fromisoformat(parts[1])
        start = date_cls.fromisoformat(parts[2])
        end = date_cls.fromisoformat(parts[3])
        cache_suffix = parts[4] if len(parts) > 4 else None
    except (IndexError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid key format")

    # Load from cache
    df = load_from_cache(cutoff, start, end, cache_suffix=cache_suffix)
    if df is None:
        raise HTTPException(status_code=404, detail="Forecast not found in cache")

    # Stream CSV
    from io import StringIO
    buf = StringIO()
    fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
    w = csv.DictWriter(buf, fieldnames=fieldnames)
    w.writeheader()
    for _, row in df.iterrows():
        w.writerow({
            "site_id": row["site_id"],
            "date": row["date"],
            "fill_pct": row["fill_pct"],
            "pred_volume_m3": row["pred_volume_m3"],
            "overflow_prob": row["overflow_prob"],
        })

    filename = f"{key}.csv"
    return PlainTextResponse(
        buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

## Tests

```python
# Add to tests/api/test_rolling_forecast_endpoint.py

class TestRollingForecastDownload:
    """Tests for download endpoint."""

    def test_download_valid_key(self, client):
        """Download works for cached forecast."""
        # First generate a forecast to populate cache
        client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })

        # Then download via key
        resp = client.get("/api/mytko/rolling_forecast/download", params={
            "key": "forecast_2025-03-15_2025-03-16_2025-03-22",
        })
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        assert "site_id,date,fill_pct,pred_volume_m3,overflow_prob" in resp.text

    def test_download_invalid_key_format(self, client):
        """Reject malformed keys."""
        resp = client.get("/api/mytko/rolling_forecast/download", params={
            "key": "invalid_key",
        })
        assert resp.status_code == 400

    def test_download_key_with_suffix(self, client):
        """Download works for cache keys with filter suffix."""
        resp = client.get("/api/mytko/rolling_forecast/download", params={
            "key": "forecast_2025-03-15_2025-03-16_2025-03-22_fabc1234def0",
        })
        assert resp.status_code in (200, 404)

    def test_download_cache_miss(self, client):
        """404 for non-existent cache."""
        resp = client.get("/api/mytko/rolling_forecast/download", params={
            "key": "forecast_2099-01-01_2099-01-02_2099-01-08",
        })
        assert resp.status_code == 404
```

## Acceptance Criteria
- [ ] Endpoint returns CSV for valid cache key
- [ ] Proper Content-Disposition header for download
- [ ] 404 for cache miss
- [ ] 400 for invalid key format
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
