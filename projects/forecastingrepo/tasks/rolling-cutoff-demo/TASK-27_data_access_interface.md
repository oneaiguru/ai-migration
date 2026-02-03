# TASK-27: Data Access Interface (ClickHouse Prep)

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min

## Goal
Abstract data loading layer to prepare for future ClickHouse integration without breaking current CSV/Pandas implementation.

## Current State
- Direct CSV file reads in `data_loader.py`
- Hard-coded paths to CSV files
- Pandas operations scattered throughout

## Future State (Not Yet)
- ClickHouse as data source
- Same API, different backend
- No code changes needed in forecast generation

## Design Pattern: Adapter Pattern

```
┌─────────────────────────────────┐
│ generate_rolling_forecast()     │
│ (unchanged)                     │
└────────────┬────────────────────┘
             │ uses
             ▼
┌─────────────────────────────────┐
│ DataLoader (abstract)           │
│ - load_service_data()           │
│ - load_registry()               │
│ - load_cache()                  │
└────────────┬────────────────────┘
             │ implements
     ┌───────┴───────┐
     ▼               ▼
CSVDataLoader  ClickHouseDataLoader
(current)      (future)
```

## Implementation

### 1. Create abstract interface

```python
# src/sites/data_access.py

from abc import ABC, abstractmethod
from datetime import date
from typing import Optional
import pandas as pd


class DataAccessLayer(ABC):
    """Abstract interface for data access."""

    @abstractmethod
    def load_service_data(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        site_ids: Optional[list[str]] = None,
    ) -> pd.DataFrame:
        """
        Load service data (waste collection records).

        Returns:
            DataFrame with columns: service_dt, site_id, collect_volume_m3
        """
        pass

    @abstractmethod
    def load_registry(
        self,
        site_ids: Optional[list[str]] = None,
    ) -> pd.DataFrame:
        """
        Load site registry.

        Returns:
            DataFrame with columns: site_id, address, district, bin_count, bin_size_liters
        """
        pass

    @abstractmethod
    def load_cache(
        self,
        cutoff: date,
        start: date,
        end: date,
    ) -> Optional[pd.DataFrame]:
        """
        Load cached forecast (if exists).

        Returns:
            DataFrame or None if cache miss
        """
        pass

    @abstractmethod
    def save_cache(
        self,
        df: pd.DataFrame,
        cutoff: date,
        start: date,
        end: date,
        site_count: int,
    ) -> None:
        """Save forecast to cache."""
        pass

    @abstractmethod
    def cache_exists(
        self,
        cutoff: date,
        start: date,
        end: date,
    ) -> bool:
        """Check if cache exists for given parameters."""
        pass

    @abstractmethod
    def clear_cache(self) -> None:
        """Clear all cached forecasts."""
        pass


class CSVDataLoader(DataAccessLayer):
    """Current implementation: CSV files + Pandas."""

    def __init__(
        self,
        service_path: Optional[Path] = None,
        registry_path: Optional[Path] = None,
    ):
        from .data_loader import DEFAULT_SERVICE_PATH, DEFAULT_REGISTRY_PATH
        self.service_path = service_path or DEFAULT_SERVICE_PATH
        self.registry_path = registry_path or DEFAULT_REGISTRY_PATH

    def load_service_data(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        site_ids: Optional[list[str]] = None,
    ) -> pd.DataFrame:
        """Load from CSV."""
        df = pd.read_csv(
            self.service_path,
            usecols=['service_dt', 'site_id', 'collect_volume_m3'],
            parse_dates=['service_dt'],
            dtype={'site_id': str, 'collect_volume_m3': float},
        )

        if start_date:
            df = df[df['service_dt'] >= start_date]
        if end_date:
            df = df[df['service_dt'] <= end_date]
        if site_ids:
            df = df[df['site_id'].isin(site_ids)]

        return df

    def load_registry(
        self,
        site_ids: Optional[list[str]] = None,
    ) -> pd.DataFrame:
        """Load from CSV."""
        df = pd.read_csv(
            self.registry_path,
            dtype={'site_id': str},
        )

        if site_ids:
            df = df[df['site_id'].isin(site_ids)]

        return df

    def load_cache(self, cutoff: date, start: date, end: date) -> Optional[pd.DataFrame]:
        """Load from Parquet."""
        from .forecast_cache import load_from_cache
        return load_from_cache(cutoff, start, end)

    def save_cache(
        self, df: pd.DataFrame, cutoff: date, start: date, end: date, site_count: int
    ) -> None:
        """Save to Parquet."""
        from .forecast_cache import save_to_cache
        save_to_cache(df, cutoff, start, end, site_count)

    def cache_exists(self, cutoff: date, start: date, end: date) -> bool:
        """Check cache."""
        from .forecast_cache import cache_exists
        return cache_exists(cutoff, start, end)

    def clear_cache(self) -> None:
        """Clear cache."""
        from .forecast_cache import clear_cache
        clear_cache()
```

### 2. Rolling forecast integration (future)

`rolling_forecast.py` currently uses `load_data_bundle(...)` directly. The data
access layer is available via `get_default_loader()` / `set_default_loader()`
for future wiring.

### 3. API integration (future)

No API wiring yet. Use `get_default_loader()` in the forecast module when
the integration is required.

## Tests

```python
# tests/test_data_access.py

def test_csv_loader_loads_service_data():
    loader = CSVDataLoader()
    df = loader.load_service_data(start_date=date(2025, 1, 1), end_date=date(2025, 1, 31))
    assert len(df) > 0
    assert set(df.columns) >= {'service_dt', 'site_id', 'collect_volume_m3'}

def test_csv_loader_loads_registry():
    loader = CSVDataLoader()
    df = loader.load_registry()
    assert len(df) > 0
    assert 'district' in df.columns

def test_default_loader_singleton():
    loader = get_default_loader()
    assert isinstance(loader, CSVDataLoader)
```

## Acceptance Criteria
- [ ] DataAccessLayer abstract class defined
- [ ] CSVDataLoader implements all methods
- [ ] Default loader helpers exist (`get_default_loader`, `set_default_loader`)
- [ ] All tests pass
- [ ] Code is prepared for ClickHouse swap (no breaking changes)

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-27: Data access interface"
