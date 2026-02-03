"""
Data Access Layer abstraction for ClickHouse preparation.

TASK-27: Abstract data loading to prepare for future ClickHouse integration.
Current implementation: CSV files + Pandas (CSVDataLoader).
Future implementation: ClickHouse queries (ClickHouseDataLoader).
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date
from pathlib import Path
from typing import Optional

import pandas as pd


class DataAccessLayer(ABC):
    """
    Abstract interface for data access.

    Implementations:
    - CSVDataLoader: Current implementation using CSV files + Pandas
    - ClickHouseDataLoader: Future implementation using ClickHouse queries
    """

    @abstractmethod
    def load_service_data(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        site_ids: Optional[list[str]] = None,
    ) -> pd.DataFrame:
        """
        Load service data (waste collection records).

        Args:
            start_date: Filter to records on or after this date
            end_date: Filter to records on or before this date
            site_ids: Filter to specific site IDs

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

        Args:
            site_ids: Filter to specific site IDs

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

        Args:
            cutoff: Cutoff date used for forecast
            start: Forecast start date
            end: Forecast end date

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
        """
        Save forecast to cache.

        Args:
            df: Forecast DataFrame
            cutoff: Cutoff date
            start: Forecast start date
            end: Forecast end date
            site_count: Number of unique sites
        """
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
    """
    Current implementation: CSV files + Pandas.

    Data files:
    - sites_service.csv: Waste collection records (5.6M rows)
    - sites_registry.csv: Site metadata (~24k rows)

    Cache:
    - data/cache/forecasts/*.parquet: Cached forecast results
    """

    def __init__(
        self,
        service_path: Optional[Path] = None,
        registry_path: Optional[Path] = None,
    ):
        """
        Initialize CSV data loader.

        Args:
            service_path: Path to sites_service.csv
            registry_path: Path to sites_registry.csv
        """
        from .data_loader import DEFAULT_SERVICE_PATH, DEFAULT_REGISTRY_PATH

        self.service_path = service_path or DEFAULT_SERVICE_PATH
        self.registry_path = registry_path or DEFAULT_REGISTRY_PATH

    def load_service_data(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        site_ids: Optional[list[str]] = None,
    ) -> pd.DataFrame:
        """Load from CSV file."""
        from .data_loader import load_service_data

        return load_service_data(
            start_date=start_date,
            end_date=end_date,
            site_ids=site_ids,
            service_path=self.service_path,
        )

    def load_registry(
        self,
        site_ids: Optional[list[str]] = None,
    ) -> pd.DataFrame:
        """Load from CSV file."""
        from .data_loader import load_registry

        return load_registry(
            site_ids=site_ids,
            registry_path=self.registry_path,
        )

    def load_cache(
        self,
        cutoff: date,
        start: date,
        end: date,
    ) -> Optional[pd.DataFrame]:
        """Load from Parquet cache."""
        from .forecast_cache import load_from_cache

        return load_from_cache(cutoff, start, end)

    def save_cache(
        self,
        df: pd.DataFrame,
        cutoff: date,
        start: date,
        end: date,
        site_count: int,
    ) -> None:
        """Save to Parquet cache."""
        from .forecast_cache import save_to_cache

        save_to_cache(df, cutoff, start, end, site_count)

    def cache_exists(
        self,
        cutoff: date,
        start: date,
        end: date,
    ) -> bool:
        """Check if Parquet cache file exists."""
        from .forecast_cache import cache_exists

        return cache_exists(cutoff, start, end)

    def clear_cache(self) -> None:
        """Clear Parquet cache directory."""
        from .forecast_cache import clear_cache

        clear_cache()


# Default loader instance
_default_loader: Optional[DataAccessLayer] = None


def get_default_loader() -> DataAccessLayer:
    """Get the default data loader (singleton)."""
    global _default_loader
    if _default_loader is None:
        _default_loader = CSVDataLoader()
    return _default_loader


def set_default_loader(loader: DataAccessLayer) -> None:
    """Set the default data loader (for testing or switching to ClickHouse)."""
    global _default_loader
    _default_loader = loader
