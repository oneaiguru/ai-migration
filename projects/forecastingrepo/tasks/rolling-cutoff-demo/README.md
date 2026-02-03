# Rolling-Cutoff Demo Tasks

This folder contains atomic task specifications for implementing the rolling-cutoff forecast demo.

## Task Execution Order

### Phase 0: Groundwork (Done by human/Claude)
- [x] Task folder structure
- [x] Type definitions
- [x] Cache directory setup
- [x] Test scaffolding

### Phase 1: Backend Core (Codex-ready)
1. `TASK-01_data_loader.md` - Data loading functions
2. `TASK-02_forecast_cache.md` - Parquet caching layer
3. `TASK-03_rolling_forecast.md` - Forecast generation wrapper

### Phase 2: API (Codex-ready, depends on Phase 1)
4. `TASK-04_api_endpoint.md` - New API endpoint

### Phase 3: UI (Codex-ready, depends on Phase 2)
5. `TASK-05_store_updates.md` - MobX store changes
6. `TASK-06_ui_controls.md` - UI horizon selector and cutoff wiring
7. `TASK-07_chart_split.md` - Chart visual split at cutoff

### Phase 4: Integration (After all above)
8. `TASK-08_benchmarks.md` - Performance testing
9. `TASK-09_docs_update.md` - Documentation updates

## Data Paths

```
Service history: /Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv (5.6M rows)
Registry:        /Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv
Cache output:    data/cache/forecasts/ (git-ignored)
```

## Running Tests

```bash
cd projects/forecastingrepo
pytest tests/sites/ -v
```

## PR Strategy

All tasks go into one feature branch: `feature/rolling-cutoff-demo`
Then reviewed via GH review bot before merge.
