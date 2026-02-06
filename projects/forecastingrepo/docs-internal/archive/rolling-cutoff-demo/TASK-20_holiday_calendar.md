# TASK-20: Holiday Calendar Integration

**Complexity**: Medium | **Model**: TBD | **Est**: TBD
**Status**: 🟢 DONE - Implemented and documented

## Goal
Document the existing holiday calendar utilities and their optional usage.

## Context from Transcript (27:42–28:36)
> "Local holidays or festivals. That's the most important thing. Yes, city Day, scarlet sails in envelope districts, envelope days."

> "All organizations should also use it... the labor calendar. Some other types of calendars, where someone usually transfers them."

> "The day of the city, the same scarlet sails will make us all dirty..."

## Implementation Notes

**File**: `src/sites/holiday_calendar.py`

### Functions

```python
FEDERAL_HOLIDAYS_2025: set[date]

def is_holiday(dt: date, region: str | None = None) -> bool:
    """Return True for dates in FEDERAL_HOLIDAYS_2025."""

def adjust_baseline_for_holidays(
    baseline_rates: pd.DataFrame,
    forecast_dates: Iterable[date],
    multiplier: float = 1.15,
    region: str | None = None,
) -> pd.DataFrame:
    """Multiply weekday rates for holiday dates."""
```

### Integration Point

`generate_rolling_forecast(...)` in `src/sites/rolling_forecast.py` exposes:
- `apply_holiday_adjustments: bool = False`
- `holiday_multiplier: float = 1.15`
- `holiday_region: str | None = None`

When enabled, it calls `adjust_baseline_for_holidays(...)` before simulation.

## Current Behavior
- Uses a static holiday list for 2025.
- Region parameter is accepted but not used (placeholder for future regional calendars).

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Document TASK-20: Holiday calendar utilities"
