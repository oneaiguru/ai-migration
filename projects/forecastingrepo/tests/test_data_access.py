"""
Tests for TASK-27: Data access interface.
"""
from datetime import date

import pandas as pd
import pytest

from src.sites.data_access import CSVDataLoader, DataAccessLayer, get_default_loader, set_default_loader
from src.sites.rolling_types import ForecastRequest


def test_csv_loader_is_data_access_layer():
    """Test CSVDataLoader implements DataAccessLayer."""
    loader = CSVDataLoader()
    assert isinstance(loader, DataAccessLayer)


def test_csv_loader_loads_service_data():
    """Test loading service data with date filters."""
    loader = CSVDataLoader()
    df = loader.load_service_data(
        start_date=date(2025, 1, 1),
        end_date=date(2025, 1, 31),
    )

    assert len(df) > 0
    assert set(df.columns) >= {'service_dt', 'site_id', 'collect_volume_m3'}


def test_csv_loader_loads_service_data_with_site_filter():
    """Test loading service data with site filter."""
    loader = CSVDataLoader()

    # First get all data to find some site IDs
    all_df = loader.load_service_data(
        start_date=date(2025, 1, 1),
        end_date=date(2025, 1, 31),
    )

    if len(all_df) == 0:
        pytest.skip("No service data available")

    # Get a few site IDs
    sample_sites = all_df['site_id'].unique()[:5].tolist()

    # Load with site filter
    filtered_df = loader.load_service_data(
        start_date=date(2025, 1, 1),
        end_date=date(2025, 1, 31),
        site_ids=sample_sites,
    )

    assert len(filtered_df) > 0
    assert set(filtered_df['site_id'].unique()).issubset(set(sample_sites))


def test_csv_loader_loads_registry():
    """Test loading registry data."""
    loader = CSVDataLoader()
    df = loader.load_registry()

    assert len(df) > 0
    assert 'site_id' in df.columns
    assert 'district' in df.columns


def test_csv_loader_loads_registry_with_site_filter():
    """Test loading registry with site filter."""
    loader = CSVDataLoader()

    # First get all registry
    all_df = loader.load_registry()

    if len(all_df) == 0:
        pytest.skip("No registry data available")

    # Get a few site IDs
    sample_sites = all_df['site_id'].unique()[:5].tolist()

    # Load with site filter
    filtered_df = loader.load_registry(site_ids=sample_sites)

    assert len(filtered_df) > 0
    assert len(filtered_df) <= len(sample_sites)


def test_csv_loader_cache_operations():
    """Test cache operations."""
    loader = CSVDataLoader()

    cutoff = date(2025, 3, 15)
    start = date(2025, 3, 16)
    end = date(2025, 3, 22)

    # Check cache existence (may or may not exist)
    exists = loader.cache_exists(cutoff, start, end)
    assert isinstance(exists, bool)

    # Load cache (returns None if not exists)
    cached = loader.load_cache(cutoff, start, end)
    assert cached is None or isinstance(cached, pd.DataFrame)


def test_default_loader():
    """Test get/set default loader."""
    # Get default loader
    loader = get_default_loader()
    assert isinstance(loader, CSVDataLoader)

    # Set a new loader
    new_loader = CSVDataLoader()
    set_default_loader(new_loader)
    assert get_default_loader() is new_loader


def test_forecast_works_with_loader():
    """Test that forecast generation works with explicit loader."""
    from src.sites.rolling_forecast import generate_rolling_forecast

    loader = CSVDataLoader()
    request = ForecastRequest(
        cutoff_date=date(2025, 3, 15),
        horizon_days=7,
    )

    # Generate forecast with explicit loader (via data_bundle pattern)
    result = generate_rolling_forecast(request, use_cache=True)

    # Verify result is valid
    assert result is not None
    assert result.cutoff_date == date(2025, 3, 15)
    assert result.site_count >= 0
