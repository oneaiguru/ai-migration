# TASK-51: Prometheus Metrics

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
Expose Prometheus metrics for monitoring API performance.

## Code Changes

### 1. File: projects/forecastingrepo/requirements-dev.txt

Add:
```
prometheus-client>=0.19.0
```

### 2. File: scripts/api_app.py

Add at top:
```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time

# Define metrics
request_count = Counter(
    'forecast_requests_total',
    'Total forecast requests',
    ['method', 'endpoint', 'status'],
)

request_duration = Histogram(
    'forecast_request_duration_seconds',
    'Request duration in seconds',
    ['endpoint'],
)

forecast_generation_time = Histogram(
    'forecast_generation_seconds',
    'Time to generate forecast',
)

active_forecasts = Gauge(
    'forecast_active',
    'Currently generating forecasts',
)
```

### 3. Middleware for metrics:

```python
@app.middleware("http")
async def metrics_middleware(request, call_next):
    """Track request metrics."""
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code,
    ).inc()

    if 'rolling_forecast' in request.url.path:
        request_duration.labels(endpoint='rolling_forecast').observe(duration)

    return response
```

### 4. Metrics endpoint:

```python
@app.get("/metrics")
def prometheus_metrics():
    """Prometheus metrics endpoint."""
    return generate_latest()
```

### 5. Instrumented forecast function:

```python
@app.get("/api/mytko/rolling_forecast")
def rolling_forecast_with_metrics(request: Request, ...):
    """Forecast endpoint with metrics."""
    active_forecasts.inc()

    try:
        start = time.time()
        result = generate_rolling_forecast(request, use_cache=True)
        duration = time.time() - start

        forecast_generation_time.observe(duration)

        return result
    finally:
        active_forecasts.dec()
```

## Tests

```python
# tests/test_prometheus_metrics.py

def test_metrics_endpoint():
    from scripts.api_app import app
    from fastapi.testclient import TestClient

    client = TestClient(app)
    response = client.get('/metrics')

    assert response.status_code == 200
    assert b'forecast_requests_total' in response.content
```

## Acceptance Criteria
- [ ] /metrics endpoint returns Prometheus text format
- [ ] Metrics include request count, duration, active forecasts
- [ ] Metrics labeled by endpoint and status
- [ ] Can scrape by Prometheus server

---

## On Completion

1. Run: `pip install prometheus-client`
2. Test: `curl http://localhost:8000/metrics`
3. Verify metrics output
4. Update `/Users/m/ai/progress.md`: Change TASK-51 from 🔴 TODO to 🟢 DONE
5. Commit: "Implement TASK-51: Prometheus metrics"
