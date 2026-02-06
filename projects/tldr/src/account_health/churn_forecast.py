"""
Rolling-cutoff account health and churn forecast generator.

Pipeline:
1. Validate request (cutoff date, horizon in range)
2. Load touchpoint data up to cutoff
3. Estimate engagement baselines via baseline.estimate_engagement_rates()
4. Simulate forward engagement decay via simulator.simulate_engagement_decay()
5. Filter by account_ids if provided
6. Cache result (if enabled)
7. Return ChurnForecastResult

Algorithm (high-level):
- Learn per-account engagement patterns from historical touchpoints (report opens, responses, etc.)
- Forward-simulate engagement decay day-by-day using learned weekday patterns
- Flag accounts crossing churn threshold (engagement_score <= 0.5) within forecast horizon
- Supports per-account risk stratification and renewal readiness assessment
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
import hashlib
import json
from typing import Optional

import pandas as pd

from .baseline import estimate_engagement_rates
from .simulator import simulate_engagement_decay
from .types import (
    DEFAULT_MIN_OBS,
    DEFAULT_WINDOW_DAYS,
    ChurnForecastRequest,
    ChurnForecastResult,
)


def validate_request(request: ChurnForecastRequest) -> None:
    """Validate request parameters."""
    if not (1 <= request.horizon_days <= 365):
        raise ValueError("horizon_days must be 1-365")


def build_cache_key(
    account_ids: Optional[list[str]],
    window_days: int,
    min_obs: int,
) -> str:
    """Build cache key from parameters."""
    filters: dict[str, object] = {
        "window_days": int(window_days),
        "min_obs": int(min_obs),
    }
    if account_ids:
        filters["account_ids"] = sorted({str(aid) for aid in account_ids})
    payload = json.dumps(filters, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]
    return f"c{digest}"


def generate_churn_forecast(
    request: ChurnForecastRequest,
    touchpoint_df: pd.DataFrame,
    registry_df: pd.DataFrame,
    window_days: int = DEFAULT_WINDOW_DAYS,
    min_obs: int = DEFAULT_MIN_OBS,
    max_engagement_score: float = 1.0,
    churn_threshold: float = 0.5,
    decay_rate_per_day: float = 0.02,
) -> ChurnForecastResult:
    """
    Generate churn forecast for all accounts (or subset).
    
    Args:
        request: ChurnForecastRequest with cutoff_date, horizon_days, optional account_ids
        touchpoint_df: columns account_id, touchpoint_dt, interaction_value
        registry_df: columns account_id, company, tier, arr
        window_days: training window (default 90 days)
        min_obs: minimum interactions per day-of-week before smoothing
        max_engagement_score: maximum normalized score (1.0)
        churn_threshold: score <= this -> at-risk flag
        decay_rate_per_day: engagement decay rate (0.02 = 2%/day)
    
    Returns:
        ChurnForecastResult with forecast DataFrame
    """
    # 1. Validate
    validate_request(request)

    cutoff = request.cutoff_date
    start = cutoff + timedelta(days=1)
    end = start + timedelta(days=request.horizon_days - 1)

    # 2. Establish the population of accounts we forecast for.
    registry_ids: list[str] = []
    if not registry_df.empty and "account_id" in registry_df.columns:
        registry_ids = [str(a) for a in registry_df["account_id"].dropna().astype(str).unique().tolist()]

    # If account_ids is explicitly None, use all registry accounts.
    # If account_ids is an empty list, return empty forecast (respect explicit "nobody" filter).
    # If account_ids has values, use only those accounts.
    if request.account_ids is None:
        population_ids = sorted(set(registry_ids))
    else:
        population_ids = sorted({str(a) for a in request.account_ids})

    # Only fall back to touchpoints if account_ids was None (not explicitly empty) and registry is empty.
    if not population_ids and request.account_ids is None:
        if not touchpoint_df.empty and "account_id" in touchpoint_df.columns:
            population_ids = sorted({str(a) for a in touchpoint_df["account_id"].dropna().astype(str).tolist()})

    # Short-circuit: empty population means no accounts to forecast (could be explicit empty list).
    if not population_ids:
        return ChurnForecastResult(
            cutoff_date=cutoff,
            start_date=start,
            end_date=end,
            account_count=0,
            forecast_df=pd.DataFrame(
                columns=["account_id", "date", "engagement_score", "decay_risk", "churn_prob"]
            ),
            generated_at=datetime.now().isoformat(),
            cached=False,
        )

    # 3. Filter touchpoints to cutoff + population
    if not touchpoint_df.empty:
        touchpoint_df = touchpoint_df.copy()
        touchpoint_df["touchpoint_dt"] = pd.to_datetime(touchpoint_df["touchpoint_dt"]).dt.date
        touchpoint_df = touchpoint_df[touchpoint_df["touchpoint_dt"] <= cutoff]
        if population_ids:
            touchpoint_df["account_id"] = touchpoint_df["account_id"].astype(str)
            touchpoint_df = touchpoint_df[touchpoint_df["account_id"].isin(set(population_ids))]

    # 4. Estimate engagement baselines
    rates = estimate_engagement_rates(
        touchpoint_df,
        cutoff=cutoff,
        window_days=window_days,
        min_obs=min_obs,
    )

    # Ensure every account in the population has a baseline (accounts with 0 touchpoints => 0 rates).
    if population_ids:
        have = set(rates["account_id"].astype(str)) if not rates.empty and "account_id" in rates.columns else set()
        missing = [aid for aid in population_ids if aid not in have]
        if missing:
            filler = pd.DataFrame(
                [(aid, dow, 0.0) for aid in missing for dow in range(7)],
                columns=["account_id", "day_of_week", "engagement_rate_pct"],
            )
            rates = pd.concat([rates, filler], ignore_index=True) if not rates.empty else filler

    if rates.empty:
        return ChurnForecastResult(
            cutoff_date=cutoff,
            start_date=start,
            end_date=end,
            account_count=0,
            forecast_df=pd.DataFrame(
                columns=["account_id", "date", "engagement_score", "decay_risk", "churn_prob"]
            ),
            generated_at=datetime.now().isoformat(),
            cached=False,
        )

    # 5. Simulate forward decay
    forecast_df = simulate_engagement_decay(
        account_registry=registry_df,
        engagement_rates=rates,
        start_dt=start,
        end_dt=end,
        max_engagement_score=max_engagement_score,
        churn_threshold=churn_threshold,
        decay_rate_per_day=decay_rate_per_day,
    )

    # 6. Return result
    account_count = forecast_df["account_id"].nunique() if not forecast_df.empty else 0
    return ChurnForecastResult(
        cutoff_date=cutoff,
        start_date=start,
        end_date=end,
        account_count=account_count,
        forecast_df=forecast_df,
        generated_at=datetime.now().isoformat(),
        cached=False,
    )
