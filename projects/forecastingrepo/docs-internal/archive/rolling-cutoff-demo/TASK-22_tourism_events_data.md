# TASK-22: Tourism & Events Data Integration

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min | **Status**: 🟢 DONE

## Goal
Add tourism and events data loaders to enrich forecast features.

## Code Changes

### 1. File: src/sites/events_data.py (reference implementation)

Loads event calendar data from CSV for forecast feature engineering.

Functions:
- `load_events_data(region, start_date, end_date, events_path=None)`: Load events by date range
- `add_event_features(service_df, events_df)`: Join events to service data on date

Columns:
`date`, `event_name`, `category`, `impact_score`

### 2. Integration Status

`rolling_forecast.py` does not currently call `events_data.py`. These utilities are available
for manual feature enrichment.

## Files Involved

- `/Users/m/ai/projects/forecastingrepo/src/sites/events_data.py` (DONE)
- `/Users/m/ai/projects/forecastingrepo/src/sites/rolling_forecast.py` (integration)

## Acceptance Criteria
- [ ] Events data loader exists and returns DataFrame
- [ ] Filters by date range
- [ ] Merges with service data on date without errors
- [ ] Tests cover normal and edge cases

---

## On Completion

1. Verify: `from src.sites.events_data import load_events_data`
2. Update `/Users/m/ai/progress.md`: Change TASK-22 from 🔴 TODO to 🟢 DONE
3. Commit: "Document TASK-22: Tourism events data"
