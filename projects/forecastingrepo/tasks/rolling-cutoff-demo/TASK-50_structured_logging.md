# TASK-50: Structured Logging

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Add structured logging with request ID correlation.

## Code Changes

### 1. File: projects/forecastingrepo/requirements-dev.txt

Add:
```
structlog>=24.1.0
python-json-logger>=2.0.7
```

### 2. File: src/logging_config.py (NEW)

```python
"""Structured logging configuration."""
import structlog
import logging
from pythonjsonlogger import jsonlogger


def setup_logging():
    """Configure structured logging with JSON output."""
    # JSON formatter
    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter()
    logHandler.setFormatter(formatter)

    # Standard library logging
    root_logger = logging.getLogger()
    root_logger.addHandler(logHandler)
    root_logger.setLevel(logging.INFO)

    # structlog configuration
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
```

### 3. File: scripts/api_app.py

Add at top (after FastAPI app creation):
```python
from src.logging_config import setup_logging
import uuid
import structlog
from fastapi import Request

setup_logging()
log = structlog.get_logger()

# Middleware for request ID (place after app = FastAPI(...))
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id

    return response
```

### 4. Usage in endpoints:

```python
@app.get("/api/mytko/rolling_forecast")
def rolling_forecast_with_logging(request: Request, ...):
    """Example endpoint with structured logging."""
    request_id = request.state.request_id

    log.info(
        "forecast_started",
        request_id=request_id,
        cutoff_date=str(cutoff_date),
        horizon_days=horizon_days,
    )

    try:
        result = generate_rolling_forecast(request, use_cache=True)

        log.info(
            "forecast_completed",
            request_id=request_id,
            site_count=result.site_count,
            duration_seconds=0,
        )

        return result
    except Exception as e:
        log.error(
            "forecast_failed",
            request_id=request_id,
            error=str(e),
        )
        raise
```

## Tests

```python
# tests/test_structured_logging.py

def test_logging_setup():
    from src.logging_config import setup_logging
    import structlog

    setup_logging()
    log = structlog.get_logger()

    # Should not raise
    log.info("test_event", key="value")
```

## Acceptance Criteria
- [ ] structlog installed and configured
- [ ] Request ID middleware added
- [ ] JSON log output
- [ ] All endpoints log key events
- [ ] Error logging captures exceptions

---

## On Completion

1. Run: `pip install structlog python-json-logger`
2. Test logging output
3. Update `/Users/m/ai/progress.md`: Change TASK-50 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-50: Structured logging"
