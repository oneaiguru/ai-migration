"""Tests for forecast_cache module."""
from datetime import date
from pathlib import Path

import pandas as pd
import pytest

from src.sites.forecast_cache import (
    cache_key,
    cache_path,
    cache_exists,
    save_to_cache,
    load_from_cache,
    get_cache_metadata,
    clear_cache,
)


def _has_parquet_engine() -> bool:
    try:
        import pyarrow  # noqa: F401
        return True
    except Exception:
        try:
            import fastparquet  # noqa: F401
            return True
        except Exception:
            return False


PARQUET_AVAILABLE = _has_parquet_engine()


class TestCacheKey:
    """Tests for cache key generation."""

    def test_cache_key_format(self):
        """Verify cache key format."""
        key = cache_key(date(2025, 3, 15), date(2025, 3, 16), date(2025, 4, 15))
        assert key == "forecast_2025-03-15_2025-03-16_2025-04-15"


class TestCachePaths:
    """Tests for cache path generation."""

    def test_cache_path_has_parquet_extension(self):
        """Verify cache path ends with .parquet."""
        path = cache_path(date(2025, 3, 15), date(2025, 3, 16), date(2025, 4, 15))
        assert str(path).endswith(".parquet")

    def test_metadata_path_has_meta_json_extension(self):
        """Verify metadata path ends with .meta.json."""
        from src.sites.forecast_cache import metadata_path
        path = metadata_path(date(2025, 3, 15), date(2025, 3, 16), date(2025, 4, 15))
        assert str(path).endswith(".meta.json")


@pytest.mark.skipif(not PARQUET_AVAILABLE, reason="parquet engine not installed")
class TestSaveAndLoad:
    """Tests for cache save/load round-trip."""

    def test_save_and_load_cache(self, tmp_path, monkeypatch):
        """Round-trip test for cache."""
        import src.sites.forecast_cache as cache_mod

        monkeypatch.setattr(cache_mod, "CACHE_DIR", tmp_path)

        df = pd.DataFrame(
            {
                "site_id": ["S1", "S1", "S2"],
                "date": ["2025-03-16", "2025-03-17", "2025-03-16"],
                "fill_pct": [0.5, 0.6, 0.3],
                "pred_volume_m3": [500.0, 600.0, 300.0],
                "overflow_prob": [0.0, 0.0, 0.0],
            }
        )

        cutoff = date(2025, 3, 15)
        start = date(2025, 3, 16)
        end = date(2025, 3, 17)

        save_to_cache(df, cutoff, start, end, site_count=2)
        assert cache_exists(cutoff, start, end)

        loaded = load_from_cache(cutoff, start, end)
        assert loaded is not None
        assert len(loaded) == len(df)
        assert list(loaded.columns) == list(df.columns)

    def test_cache_miss_returns_none(self, tmp_path, monkeypatch):
        """Test that cache miss returns None."""
        import src.sites.forecast_cache as cache_mod

        monkeypatch.setattr(cache_mod, "CACHE_DIR", tmp_path)

        result = load_from_cache(date(2099, 1, 1), date(2099, 1, 2), date(2099, 1, 3))
        assert result is None


@pytest.mark.skipif(not PARQUET_AVAILABLE, reason="parquet engine not installed")
class TestMetadata:
    """Tests for cache metadata."""

    def test_save_to_cache_creates_metadata(self, tmp_path, monkeypatch):
        """Verify metadata is saved alongside cache."""
        import src.sites.forecast_cache as cache_mod

        monkeypatch.setattr(cache_mod, "CACHE_DIR", tmp_path)

        df = pd.DataFrame(
            {
                "site_id": ["S1"],
                "date": ["2025-03-16"],
                "fill_pct": [0.5],
                "pred_volume_m3": [500.0],
                "overflow_prob": [0.0],
            }
        )

        cutoff = date(2025, 3, 15)
        start = date(2025, 3, 16)
        end = date(2025, 3, 17)

        save_to_cache(df, cutoff, start, end, site_count=1)

        metadata = get_cache_metadata(cutoff, start, end)
        assert metadata is not None
        assert metadata["cutoff_date"] == "2025-03-15"
        assert metadata["start_date"] == "2025-03-16"
        assert metadata["end_date"] == "2025-03-17"
        assert metadata["site_count"] == 1
        assert "generated_at" in metadata
        assert "file_size_bytes" in metadata
        assert metadata["file_size_bytes"] > 0

    def test_metadata_miss_returns_none(self, tmp_path, monkeypatch):
        """Test that metadata miss returns None."""
        import src.sites.forecast_cache as cache_mod

        monkeypatch.setattr(cache_mod, "CACHE_DIR", tmp_path)

        result = get_cache_metadata(date(2099, 1, 1), date(2099, 1, 2), date(2099, 1, 3))
        assert result is None


@pytest.mark.skipif(not PARQUET_AVAILABLE, reason="parquet engine not installed")
class TestClearCache:
    """Tests for cache clearing."""

    def test_clear_cache_removes_files(self, tmp_path, monkeypatch):
        """Verify clear_cache removes all cached files."""
        import src.sites.forecast_cache as cache_mod

        monkeypatch.setattr(cache_mod, "CACHE_DIR", tmp_path)

        # Create two cached forecasts
        df = pd.DataFrame(
            {
                "site_id": ["S1"],
                "date": ["2025-03-16"],
                "fill_pct": [0.5],
                "pred_volume_m3": [500.0],
                "overflow_prob": [0.0],
            }
        )

        save_to_cache(df, date(2025, 3, 15), date(2025, 3, 16), date(2025, 3, 17), 1)
        save_to_cache(df, date(2025, 4, 15), date(2025, 4, 16), date(2025, 4, 17), 1)

        assert cache_exists(date(2025, 3, 15), date(2025, 3, 16), date(2025, 3, 17))
        assert cache_exists(date(2025, 4, 15), date(2025, 4, 16), date(2025, 4, 17))

        count = clear_cache()
        assert count == 4  # 2 parquet + 2 metadata files

        assert not cache_exists(date(2025, 3, 15), date(2025, 3, 16), date(2025, 3, 17))
        assert not cache_exists(date(2025, 4, 15), date(2025, 4, 16), date(2025, 4, 17))

    def test_clear_cache_empty_dir(self, tmp_path, monkeypatch):
        """Test clear_cache on empty directory."""
        import src.sites.forecast_cache as cache_mod

        monkeypatch.setattr(cache_mod, "CACHE_DIR", tmp_path)
        count = clear_cache()
        assert count == 0
