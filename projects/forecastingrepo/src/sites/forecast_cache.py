"""
Parquet-based forecast caching layer.

Caches forecast DataFrames with metadata for quick retrieval.
"""
from __future__ import annotations

from datetime import date, datetime
from functools import lru_cache
from pathlib import Path
import importlib
import json
import logging

import pandas as pd

from .rolling_types import CacheMetadata

CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "cache" / "forecasts"
logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _parquet_engine() -> str | None:
    for candidate in ("pyarrow", "fastparquet"):
        try:
            importlib.import_module(candidate)
            return candidate
        except ImportError:
            continue
    return None


@lru_cache(maxsize=None)
def _warn_missing_parquet_engine(action: str) -> None:
    logger.warning(
        "Parquet engine not available; skipping %s. Install pyarrow or fastparquet to enable caching.",
        action,
    )


def cache_key(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> str:
    """Generate cache filename from parameters."""
    base_key = f"forecast_{cutoff.isoformat()}_{start.isoformat()}_{end.isoformat()}"
    if cache_suffix:
        return f"{base_key}_{cache_suffix}"
    return base_key


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
    if _parquet_engine() is None:
        return False
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
    engine = _parquet_engine()
    if engine is None:
        _warn_missing_parquet_engine("cache writes")
        return cache_path(cutoff, start, end, cache_suffix)

    # Ensure CACHE_DIR exists
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Write df to parquet
    parquet_path = cache_path(cutoff, start, end, cache_suffix)
    df.to_parquet(parquet_path, index=False, engine=engine)

    # Write metadata JSON
    file_size_bytes = parquet_path.stat().st_size
    metadata: CacheMetadata = {
        "cutoff_date": cutoff.isoformat(),
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "site_count": site_count,
        "generated_at": datetime.now().isoformat(),
        "file_size_bytes": file_size_bytes,
    }
    meta_path = metadata_path(cutoff, start, end, cache_suffix)
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return parquet_path


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
    engine = _parquet_engine()
    if engine is None:
        _warn_missing_parquet_engine("cache reads")
        return None
    parquet_path = cache_path(cutoff, start, end, cache_suffix)
    if not parquet_path.exists():
        return None
    return pd.read_parquet(parquet_path, engine=engine)


def get_cache_metadata(
    cutoff: date,
    start: date,
    end: date,
    cache_suffix: str | None = None,
) -> CacheMetadata | None:
    """Load metadata for cached forecast."""
    meta_path = metadata_path(cutoff, start, end, cache_suffix)
    if not meta_path.exists():
        return None
    with open(meta_path, "r") as f:
        return json.load(f)


def clear_cache() -> int:
    """Remove all cached files. Returns count of files removed."""
    if not CACHE_DIR.exists():
        return 0

    count = 0
    for parquet_file in CACHE_DIR.glob("*.parquet"):
        parquet_file.unlink()
        count += 1

    for meta_file in CACHE_DIR.glob("*.meta.json"):
        meta_file.unlink()
        count += 1

    return count
