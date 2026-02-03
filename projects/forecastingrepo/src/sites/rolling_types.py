"""
Type definitions for rolling-cutoff forecast demo.

These types define the interfaces for the data loader, cache, and forecast generator.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional, TypedDict

import pandas as pd


# --- Data Loader Types ---

@dataclass
class ServiceDataBundle:
    """Bundle of loaded service history and registry data."""
    service_df: pd.DataFrame  # columns: site_id, service_dt, collect_volume_m3
    registry_df: pd.DataFrame  # columns: site_id, district, address, bin_count, bin_size_liters
    date_range: tuple[date, date]  # (min_date, max_date) in service_df
    site_count: int


# --- Forecast Types ---

@dataclass
class ForecastRequest:
    """Request parameters for rolling forecast generation."""
    cutoff_date: date  # Last date of known data (max: 2025-05-31)
    horizon_days: int  # Days to forecast (1-365)
    site_ids: Optional[list[str]] = None  # None = all sites


@dataclass
class ForecastResult:
    """Result of a forecast generation."""
    cutoff_date: date
    start_date: date  # cutoff_date + 1
    end_date: date  # start_date + horizon_days - 1
    site_count: int
    forecast_df: pd.DataFrame  # columns: site_id, date, fill_pct, pred_volume_m3, overflow_prob
    generated_at: str  # ISO timestamp
    cached: bool  # True if loaded from cache


# --- Cache Types ---

class CacheMetadata(TypedDict):
    """Metadata stored alongside cached forecasts."""
    cutoff_date: str
    start_date: str
    end_date: str
    site_count: int
    generated_at: str
    file_size_bytes: int


# --- API Response Types ---

class RollingForecastSummary(TypedDict):
    """Summary response for all-KP forecast."""
    cutoff_date: str
    horizon_days: int
    start_date: str
    end_date: str
    site_count: int
    total_forecast_m3: float
    generated_at: str
    download_url: str


class SingleSiteForecastPoint(TypedDict):
    """Single forecast point for one site/date."""
    site_id: str
    date: str
    fill_pct: float
    pred_volume_m3: float
    overflow_prob: float


# --- Constants ---

MAX_CUTOFF_DATE = date(2025, 5, 31)  # Last available actual data
MIN_HORIZON_DAYS = 1
MAX_HORIZON_DAYS = 365
DEFAULT_WINDOW_DAYS = 56  # Training window for baseline estimation
