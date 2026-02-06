# TASK-23: Real Estate & Zoning Data Integration

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min | **Status**: 🟢 DONE

## Goal
Add real estate and zoning data loaders for location-based forecast features.

## Code Changes

### 1. File: src/sites/real_estate_data.py (reference implementation)

Loads real estate and zoning data for forecast feature engineering.

Functions:
- `load_real_estate_data(region, start_date, end_date, data_path=None)`: Load data by date range
- `add_real_estate_features(service_df, real_estate_df)`: Join data to service data on date

Columns:
`date`, `price_index`, `volume_index`

### 2. Integration Status

`rolling_forecast.py` does not currently call `real_estate_data.py`. These utilities are available
for manual feature enrichment.

## Files Involved

- `/Users/m/ai/projects/forecastingrepo/src/sites/real_estate_data.py` (DONE)
- `/Users/m/ai/projects/forecastingrepo/src/sites/rolling_forecast.py` (integration)

## Acceptance Criteria
- [ ] Real estate data loader exists and returns DataFrame
- [ ] Filters by date range
- [ ] Merges with service data on date without errors
- [ ] Tests cover normal and edge cases

---

## On Completion

1. Verify: `from src.sites.real_estate_data import load_real_estate_data`
2. Update `/Users/m/ai/progress.md`: Change TASK-23 from 🔴 TODO to 🟢 DONE
3. Commit: "Document TASK-23: Real estate and zoning data"
