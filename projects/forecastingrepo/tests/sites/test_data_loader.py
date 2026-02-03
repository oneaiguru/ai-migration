"""Tests for data_loader module."""
from datetime import date
from pathlib import Path

import pandas as pd
import pytest

from src.sites.data_loader import load_service_data, load_registry, load_data_bundle
from src.sites.rolling_types import ServiceDataBundle


# Use real data paths for integration tests
REAL_SERVICE_PATH = Path("/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv")
REAL_REGISTRY_PATH = Path("/Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv")


class TestLoadServiceData:
    """Tests for load_service_data function."""

    @pytest.mark.skipif(not REAL_SERVICE_PATH.exists(), reason="Real data not available")
    def test_load_service_data_date_filter(self):
        """Load only 2025 data, verify row count < 5.6M."""
        df = load_service_data(
            start_date=date(2025, 1, 1),
            end_date=date(2025, 5, 31),
        )
        assert len(df) > 0
        assert len(df) < 5_000_000  # Less than full dataset
        assert df["service_dt"].min() >= date(2025, 1, 1)
        assert df["service_dt"].max() <= date(2025, 5, 31)

    @pytest.mark.skipif(not REAL_SERVICE_PATH.exists(), reason="Real data not available")
    def test_load_service_data_site_filter(self):
        """Load specific sites only."""
        df = load_service_data(site_ids=["38105070", "38100003"])
        assert len(df) > 0
        assert set(df["site_id"].unique()) <= {"38105070", "38100003"}

    def test_load_service_data_missing_file(self, tmp_path):
        """Return empty DataFrame for missing file."""
        df = load_service_data(service_path=tmp_path / "nonexistent.csv")
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 0
        assert "site_id" in df.columns

    def test_load_service_data_with_fixture(self, tmp_path):
        """Test with a small fixture file."""
        csv_path = tmp_path / "test_service.csv"
        csv_path.write_text(
            "site_id,service_dt,collect_volume_m3\n"
            "S1,2025-01-01,100.0\n"
            "S1,2025-01-08,200.0\n"
            "S2,2025-01-05,150.0\n"
        )
        df = load_service_data(service_path=csv_path)
        assert len(df) == 3
        assert df["service_dt"].iloc[0] == date(2025, 1, 1)


class TestLoadRegistry:
    """Tests for load_registry function."""

    @pytest.mark.skipif(not REAL_REGISTRY_PATH.exists(), reason="Real data not available")
    def test_load_registry(self):
        """Load registry and verify columns."""
        df = load_registry()
        assert "site_id" in df.columns
        assert "bin_count" in df.columns
        assert "bin_size_liters" in df.columns
        assert len(df) > 20000  # ~24k sites

    def test_load_registry_missing_file(self, tmp_path):
        """Return empty DataFrame for missing file."""
        df = load_registry(registry_path=tmp_path / "nonexistent.csv")
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 0

    def test_load_registry_with_fixture(self, tmp_path):
        """Test with a small fixture file."""
        csv_path = tmp_path / "test_registry.csv"
        csv_path.write_text(
            "site_id,district,bin_count,bin_size_liters\n"
            "S1,D1,2,1100\n"
            "S2,D1,,\n"  # Missing values should get defaults
        )
        df = load_registry(registry_path=csv_path)
        assert len(df) == 2
        # Check defaults are applied
        s2 = df[df["site_id"] == "S2"].iloc[0]
        assert s2["bin_count"] == 1
        assert s2["bin_size_liters"] == 1100.0


class TestLoadDataBundle:
    """Tests for load_data_bundle function."""

    @pytest.mark.skipif(not REAL_SERVICE_PATH.exists(), reason="Real data not available")
    def test_load_data_bundle(self):
        """Load bundle and verify types."""
        bundle = load_data_bundle(start_date=date(2025, 1, 1))
        assert isinstance(bundle, ServiceDataBundle)
        assert bundle.site_count > 0
        assert not bundle.service_df.empty
        assert bundle.date_range[0] >= date(2025, 1, 1)

    def test_load_data_bundle_with_fixtures(self, tmp_path):
        """Test bundle with fixture files."""
        service_path = tmp_path / "service.csv"
        registry_path = tmp_path / "registry.csv"

        service_path.write_text(
            "site_id,service_dt,collect_volume_m3\n"
            "S1,2025-01-01,100.0\n"
            "S1,2025-01-08,200.0\n"
        )
        registry_path.write_text(
            "site_id,district,bin_count,bin_size_liters\n"
            "S1,D1,2,1100\n"
        )

        bundle = load_data_bundle(
            service_path=service_path,
            registry_path=registry_path,
        )

        assert bundle.site_count == 1
        assert bundle.date_range == (date(2025, 1, 1), date(2025, 1, 8))
        assert len(bundle.service_df) == 2
        assert len(bundle.registry_df) == 1
