# TASK-01: Data Loader Function

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Create `src/sites/data_loader.py` with functions to load service history and registry data with date filtering.

## Input Files
```
Service: /Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv
  - Columns: site_id, service_dt, collect_volume_m3
  - Rows: ~5.6M
  - Dates: 2023-04-06 → 2025-05-31

Registry: /Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv
  - Columns: site_id, district, bin_count, bin_size_liters (+ others)
  - Rows: ~24k sites
```

## Required Functions

```python
# src/sites/data_loader.py

from datetime import date
from pathlib import Path
import pandas as pd
from .rolling_types import ServiceDataBundle

DEFAULT_SERVICE_PATH = Path("/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv")
DEFAULT_REGISTRY_PATH = Path("/Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv")


def load_service_data(
    start_date: date | None = None,
    end_date: date | None = None,
    site_ids: list[str] | None = None,
    service_path: Path = DEFAULT_SERVICE_PATH,
) -> pd.DataFrame:
    """
    Load service history with optional date and site filtering.

    Returns DataFrame with columns: site_id, service_dt (as date), collect_volume_m3 (as float)
    """
    # TODO: Implement


def load_registry(
    site_ids: list[str] | None = None,
    registry_path: Path = DEFAULT_REGISTRY_PATH,
) -> pd.DataFrame:
    """
    Load site registry with optional site filtering.

    Returns DataFrame with columns: site_id, district, bin_count, bin_size_liters
    """
    # TODO: Implement


def load_data_bundle(
    start_date: date | None = None,
    end_date: date | None = None,
    site_ids: list[str] | None = None,
) -> ServiceDataBundle:
    """
    Load both service and registry data, returning a typed bundle.
    """
    # TODO: Implement
```

## Implementation Notes

1. Use `pd.read_csv()` with `parse_dates=['service_dt']` for service file
2. Filter by date range AFTER loading (or use chunked reading if memory is an issue)
3. Convert `service_dt` to `date` type (not datetime)
4. Handle missing `bin_count`/`bin_size_liters` with defaults (1 and 1100)
5. Return empty DataFrames (not None) when no data matches filters

## Tests to Write

```python
# tests/sites/test_data_loader.py

def test_load_service_data_date_filter():
    """Load only 2025 data, verify row count < 5.6M."""
    from datetime import date
    from src.sites.data_loader import load_service_data

    df = load_service_data(start_date=date(2025, 1, 1), end_date=date(2025, 5, 31))
    assert len(df) > 0
    assert len(df) < 5_000_000  # Less than full dataset
    assert df['service_dt'].min() >= date(2025, 1, 1)


def test_load_service_data_site_filter():
    """Load specific sites only."""
    df = load_service_data(site_ids=['38105070', '38100003'])
    assert set(df['site_id'].unique()) <= {'38105070', '38100003'}


def test_load_registry():
    """Load registry and verify columns."""
    from src.sites.data_loader import load_registry

    df = load_registry()
    assert 'site_id' in df.columns
    assert 'bin_count' in df.columns
    assert len(df) > 20000  # ~24k sites


def test_load_data_bundle():
    """Load bundle and verify types."""
    from src.sites.data_loader import load_data_bundle
    from src.sites.rolling_types import ServiceDataBundle

    bundle = load_data_bundle(start_date=date(2025, 1, 1))
    assert isinstance(bundle, ServiceDataBundle)
    assert bundle.site_count > 0
```

## Acceptance Criteria
- [ ] All 3 functions implemented
- [ ] Tests pass
- [ ] Loading 2025 data completes in <10 seconds
- [ ] Memory usage <2GB for full load

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
