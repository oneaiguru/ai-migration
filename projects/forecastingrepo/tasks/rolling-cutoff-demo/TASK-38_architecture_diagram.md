# TASK-38: Architecture Diagram

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Create architecture diagram showing system components and data flow.

## Output: docs/architecture/ARCHITECTURE.md

Create markdown with:

1. **System Architecture Diagram** (Mermaid)
```
graph TB
    User["👤 User (Jury/Artem)"]
    UI["🖥️ React UI<br/>ForecastPage.tsx"]
    API["🔌 FastAPI<br/>api_app.py"]
    Forecast["📊 Forecast Engine<br/>rolling_forecast.py"]
    Cache["💾 Cache<br/>Parquet files"]
    CSV["📁 CSV Data<br/>sites_service.csv<br/>sites_registry.csv"]
    Metrics["📈 Metrics Tracker<br/>metrics_history.parquet"]

    User -->|"Selects cutoff<br/>+ horizon"| UI
    UI -->|"GET /api/mytko/rolling_forecast"| API
    API --> Forecast
    Forecast -->|"Check cache"| Cache
    Forecast -->|"Load data"| CSV
    Forecast -->|"Save cache"| Cache
    API -->|"POST /api/mytko/ingest_metrics"| Metrics
    API -->|"GET /api/mytko/metrics_history"| Metrics
    API -->|"CSV/XLSX export"| UI
```

2. **Data Flow Diagram**
   - Rolling-cutoff selection → Historical data load
   - Baseline estimation → Simulation → Forecast output
   - Metrics ingestion → History storage → Dashboard display

3. **File Structure**
   - /src/sites/: Core forecast logic
   - /scripts/: CLI tools (bundle, HTML, export)
   - /tests/: Test coverage
   - /docs/: Documentation

4. **Key Components**
   - ForecastRequest: Input parameters (from rolling_types.py)
   - ForecastResult: Output structure (from rolling_types.py)
   - MetricsTracker: Iteration history
   - DataAccessLayer: Future ClickHouse abstraction

5. **Data Storage**
   - CSV: Raw service history (5.6M rows)
   - Parquet: Forecast cache + metrics history
   - JSON: Bundle metadata

---

## Acceptance Criteria
- [ ] File created at docs/architecture/ARCHITECTURE.md
- [ ] Mermaid diagram renders
- [ ] All components labeled
- [ ] Data flow clear
- [ ] File locations documented

---

## On Completion

1. View docs/ARCHITECTURE.md in markdown viewer
2. Update `/Users/m/ai/progress.md`: Change TASK-38 from 🔴 TODO to 🟢 DONE
3. Commit: "Implement TASK-38: Architecture diagram"
