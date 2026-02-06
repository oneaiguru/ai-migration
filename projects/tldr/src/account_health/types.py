"""
Type definitions for account health and churn prediction.

The model uses a simple "reservoir + decay" framing:
- engagement_score in [0, 1]
- daily decay toward 0 without touchpoints
- churn risk increases as engagement_score falls below churn_threshold
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional, TypedDict

import pandas as pd


@dataclass
class AccountDataBundle:
    """Bundle of loaded account engagement and registry data."""
    touchpoint_df: pd.DataFrame  # columns: account_id, touchpoint_dt, interaction_value
    registry_df: pd.DataFrame  # columns: account_id, company, tier, arr
    date_range: tuple[date, date]  # (min_date, max_date) in touchpoint_df
    account_count: int


@dataclass
class ChurnForecastRequest:
    """Request parameters for account health forecast."""
    cutoff_date: date  # Last date of known engagement data
    horizon_days: int  # Days to forecast (1-365, typically 30 for renewal window)
    account_ids: Optional[list[str]] = None  # None = all accounts


@dataclass
class ChurnForecastResult:
    """Result of an account health forecast."""
    cutoff_date: date
    start_date: date  # cutoff_date + 1
    end_date: date  # start_date + horizon_days - 1
    account_count: int
    forecast_df: pd.DataFrame  # columns: account_id, date, engagement_score, decay_risk, churn_prob
    generated_at: str  # ISO timestamp
    cached: bool


# --- API Response Types ---

class RenewalRadarSummary(TypedDict):
    """Summary response for renewal forecast."""
    cutoff_date: str
    horizon_days: int
    start_date: str
    end_date: str
    account_count: int
    accounts_at_risk: int  # churn_prob >= 0.5
    generated_at: str


class AccountChurnPoint(TypedDict):
    """Single forecast point for one account/date."""
    account_id: str
    date: str
    engagement_score: float  # 0-1, normalized
    decay_risk: float  # rate of engagement decline per day
    churn_prob: float  # probability of churn by this date


# --- Constants ---

MIN_HORIZON_DAYS = 1
MAX_HORIZON_DAYS = 365
DEFAULT_WINDOW_DAYS = 90  # Training window for baseline engagement estimation
DEFAULT_MIN_OBS = 2  # Minimum interactions per campaign cycle before smoothing
CHURN_THRESHOLD = 0.5  # Engagement score <= 0.5 = at risk
ENGAGEMENT_DECAY_RATE = 0.02  # % per day without touchpoint
