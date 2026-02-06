# TASK-02: Forecast Cache Layer

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Create `src/sites/forecast_cache.py` with functions to cache/retrieve forecast DataFrames as Parquet files.

## Cache Directory
```
/Users/m/ai/projects/forecastingrepo/data/cache/forecasts/
```
(Already created with .gitignore)

## Required Functions

```python
# src/sites/forecast_cache.py

from datetime import date
from pathlib import Path
import json
import pandas as pd
from .rolling_types import CacheMetadata

CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "cache" / "forecasts"


def cache_key(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> str:
    """Generate cache filename from parameters (optional suffix for filters)."""
    base_key = f"forecast_{cutoff.isoformat()}_{start.isoformat()}_{end.isoformat()}"
    return f"{base_key}_{cache_suffix}" if cache_suffix else base_key


def cache_path(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> Path:
    """Full path to cache parquet file."""
    return CACHE_DIR / f"{cache_key(cutoff, start, end, cache_suffix)}.parquet"


def metadata_path(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> Path:
    """Full path to cache metadata JSON file."""
    return CACHE_DIR / f"{cache_key(cutoff, start, end, cache_suffix)}.meta.json"


def cache_exists(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> bool:
    """Check if cached forecast exists."""
    return cache_path(cutoff, start, end, cache_suffix).exists()


def save_to_cache(
    df: pd.DataFrame,
    cutoff: date,
    start: date,
    end: date,
    site_count: int,
    cache_suffix: str | None = None,
) -> Path:
    """
    Save forecast DataFrame to cache.

    Returns path to saved parquet file.
    """
    # TODO: Implement
    # 1. Ensure CACHE_DIR exists
    # 2. Write df to parquet
    # 3. Write metadata JSON
    # 4. Return parquet path


def load_from_cache(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> pd.DataFrame | None:
    """
    Load cached forecast if exists.

    Returns None if cache miss.
    """
    # TODO: Implement


def get_cache_metadata(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> CacheMetadata | None:
    """Load metadata for cached forecast."""
    # TODO: Implement


def clear_cache() -> int:
    """Remove all cached files. Returns count of files removed."""
    # TODO: Implement
```

## Implementation Notes

1. Use `df.to_parquet(path, index=False)` for writing
2. Use `pd.read_parquet(path)` for reading
3. Metadata JSON should include: cutoff_date, start_date, end_date, site_count, generated_at, file_size_bytes
4. Use `datetime.now().isoformat()` for generated_at
5. `cache_suffix` is optional and should be appended to the key when provided
6. Handle missing files gracefully (return None, not exception)

## Tests to Write

```python
# tests/sites/test_forecast_cache.py

import pandas as pd
from datetime import date
from src.sites.forecast_cache import (
    cache_key, cache_path, cache_exists,
    save_to_cache, load_from_cache, clear_cache
)


def test_cache_key_format():
    key = cache_key(date(2025, 3, 15), date(2025, 3, 16), date(2025, 4, 15))
    assert key == "forecast_2025-03-15_2025-03-16_2025-04-15"

    key_with_suffix = cache_key(
        date(2025, 3, 15),
        date(2025, 3, 16),
        date(2025, 4, 15),
        cache_suffix="fabc1234def0",
    )
    assert key_with_suffix == "forecast_2025-03-15_2025-03-16_2025-04-15_fabc1234def0"


def test_save_and_load_cache(tmp_path, monkeypatch):
    """Round-trip test for cache."""
    import src.sites.forecast_cache as cache_mod
    monkeypatch.setattr(cache_mod, 'CACHE_DIR', tmp_path)

    df = pd.DataFrame({
        'site_id': ['S1', 'S1', 'S2'],
        'date': ['2025-03-16', '2025-03-17', '2025-03-16'],
        'fill_pct': [0.5, 0.6, 0.3],
        'pred_volume_m3': [500, 600, 300],
        'overflow_prob': [0, 0, 0],
    })

    cutoff = date(2025, 3, 15)
    start = date(2025, 3, 16)
    end = date(2025, 3, 17)

    save_to_cache(df, cutoff, start, end, site_count=2)
    assert cache_exists(cutoff, start, end)

    loaded = load_from_cache(cutoff, start, end)
    assert loaded is not None
    assert len(loaded) == len(df)


def test_cache_miss_returns_none(tmp_path, monkeypatch):
    import src.sites.forecast_cache as cache_mod
    monkeypatch.setattr(cache_mod, 'CACHE_DIR', tmp_path)

    result = load_from_cache(date(2099, 1, 1), date(2099, 1, 2), date(2099, 1, 3))
    assert result is None
```

## Acceptance Criteria
- [ ] All functions implemented
- [ ] Tests pass
- [ ] Parquet files are human-readable (can be opened with pandas)
- [ ] Metadata JSON is valid and complete

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
