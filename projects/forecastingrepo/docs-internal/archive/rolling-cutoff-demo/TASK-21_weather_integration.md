# TASK-21: Weather Data Integration

**Complexity**: High | **Model**: Opus required | **Est**: TBD
**Status**: 🟢 DONE - Implemented and documented

## Goal
Document the existing weather data loaders and feature joins.

## Context from Transcript (23:27–24:26)
> "you are awesome to influence yes but there I do not know how to focus on what there is all this first of all you are doing all this while working on parks they have a lot of this data..."

> "it also floats there just here we have the same Olkhonsky district and similar places everything will affect there because bad weather summer people don't go good weather people go"

## Context from Data Strategy (16:54)
> "I've been doing some good weather videos, I've been doing some even better weather videos, and I can tell you about that too. This is not the data that we have, this is the data that we can find, I found it, registered on all sorts of foreign databases with tricky VPNs."

## Implementation Notes

**File**: `src/sites/weather.py`

### Functions

```python
def load_weather_data(
    region: str,
    start_date: date,
    end_date: date,
    weather_path: Optional[Path] = None,
) -> pd.DataFrame:
    """Load local weather CSV and filter to date range."""

def add_weather_features(
    service_df: pd.DataFrame,
    weather_df: pd.DataFrame,
) -> pd.DataFrame:
    """Merge weather features into service data on date."""
```

### Expected Columns
`date`, `station_id`, `temp_avg`, `temp_min`, `temp_max`, `precip_mm`, `snow_cm`

### Data Lookup
Tries (in order):
- `data/weather/{region}.csv`
- `data/weather/{region.lower()}.csv`
- `data/weather_{region}.csv`

## Current Behavior
- Weather data utilities exist but are not wired into `rolling_forecast.py`.
- Callers can load and merge features manually as needed.

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Document TASK-21: Weather data utilities"
