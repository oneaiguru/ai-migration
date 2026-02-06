"""
Account health and churn forecasting for renewal radar.

Exports the main generate_churn_forecast function and related types.
"""

from .baseline import estimate_engagement_rates
from .churn_forecast import generate_churn_forecast
from .simulator import simulate_engagement_decay
from .types import (
    AccountDataBundle,
    ChurnForecastRequest,
    ChurnForecastResult,
    RenewalRadarSummary,
    AccountChurnPoint,
    CHURN_THRESHOLD,
    DEFAULT_MIN_OBS,
    DEFAULT_WINDOW_DAYS,
    ENGAGEMENT_DECAY_RATE,
    MAX_HORIZON_DAYS,
    MIN_HORIZON_DAYS,
)

__all__ = [
    # Main functions
    "generate_churn_forecast",
    "estimate_engagement_rates",
    "simulate_engagement_decay",
    # Types
    "AccountDataBundle",
    "ChurnForecastRequest",
    "ChurnForecastResult",
    "RenewalRadarSummary",
    "AccountChurnPoint",
    # Constants
    "CHURN_THRESHOLD",
    "DEFAULT_MIN_OBS",
    "DEFAULT_WINDOW_DAYS",
    "ENGAGEMENT_DECAY_RATE",
    "MAX_HORIZON_DAYS",
    "MIN_HORIZON_DAYS",
]
