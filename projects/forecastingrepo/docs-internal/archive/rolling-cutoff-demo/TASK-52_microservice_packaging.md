# TASK-52: Microservice Packaging

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
Package FastAPI app as production-ready microservice for Jury's infrastructure.

## Code Changes

### 1. File: Dockerfile (NEW)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy application
COPY src/ src/
COPY scripts/ scripts/
COPY data/ data/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "scripts.api_app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. File: scripts/api_app.py

Add health endpoint:
```python
@app.get("/health")
def health_check():
    """Health check endpoint for container orchestration."""
    return {
        "status": "healthy",
        "service": "forecast-api",
        "version": "1.0.0",
    }
```

### 3. File: src/sites/data_loader.py

Update defaults to be container-friendly and configurable:
```python
import os

DEFAULT_SERVICE_PATH = Path(
    os.getenv("SITES_SERVICE_PATH", "data/sites_service.csv")
)
DEFAULT_REGISTRY_PATH = Path(
    os.getenv("SITES_REGISTRY_PATH", "data/sites_registry.csv")
)
```

### 4. File: docker-compose.yml (NEW)

```yaml
version: '3.8'

services:
  forecast-api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./data/cache:/app/data/cache
    environment:
      - SITES_SERVICE_PATH=/app/data/sites_service.csv
      - SITES_REGISTRY_PATH=/app/data/sites_registry.csv
    restart: unless-stopped
```

### 5. File: requirements-dev.txt

Ensure has:
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pandas>=2.0.0
openpyxl>=3.1.0
python-multipart>=0.0.6
structlog>=24.1.0
prometheus-client>=0.19.0
```

## Tests

```python
# tests/test_microservice.py

from fastapi.testclient import TestClient

def test_health_endpoint():
    from scripts.api_app import app
    client = TestClient(app)

    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'healthy'
```

## Acceptance Criteria
- [ ] Dockerfile builds without errors
- [ ] Image runs: `docker run -p 8000:8000 forecast-api`
- [ ] Health endpoint responds to GET /health
- [ ] docker-compose.yml starts service successfully
- [ ] All endpoints accessible from container

---

## On Completion

1. Build: `docker build -t forecast-api .`
2. Test: `docker run -p 8000:8000 forecast-api`
3. Health: `curl http://localhost:8000/health`
4. Compose: `docker-compose up` (verify runs)
5. Update `/Users/m/ai/progress.md`: Change TASK-52 from 🔴 TODO to 🟢 DONE
6. Commit: "Implement TASK-52: Microservice packaging"
