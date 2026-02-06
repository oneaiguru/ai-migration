"""
Forward engagement decay simulation.

Model engagement_score as a 0-1 "reservoir" updated daily:
- add learned baseline engagement for that day-of-week
- apply daily decay when accounts go quiet
- compute churn probability around the churn threshold
"""
from __future__ import annotations

from datetime import date, timedelta
import math
from typing import Optional

import pandas as pd


def simulate_engagement_decay(
    account_registry: pd.DataFrame,
    engagement_rates: pd.DataFrame,
    start_dt: date,
    end_dt: date,
    max_engagement_score: float = 1.0,
    churn_threshold: float = 0.5,
    decay_rate_per_day: float = 0.02,
    reset_on_touchpoint: bool = False,
    normalization_factor: Optional[float] = None,
) -> pd.DataFrame:
    """
    Simulate per-account engagement trajectory using historical patterns.
    
    Engagement decays daily without touchpoints; key dates (renewal, expansion opp)
    can trigger reset or acceleration.
    
    Args:
        account_registry: columns account_id, company, tier, arr
        engagement_rates: columns account_id, day_of_week, engagement_rate_pct
        start_dt: forecast start date
        end_dt: forecast end date
        max_engagement_score: maximum normalized score (1.0 = perfect engagement)
        churn_threshold: engagement_score <= this value = at risk
        decay_rate_per_day: % decay per day without activity (0.02 = 2%/day)
        reset_on_touchpoint: if True, reset decay on detected touchpoint
        normalization_factor: scale factor for mapping learned daily engagement rates into a 0-1
            engagement_score. If None, auto-calibrates so the median account sits near churn_threshold.
    
    Output columns:
        account_id, date, engagement_score (0-1), decay_risk (0-1), churn_prob (0-1)
    """
    if engagement_rates.empty:
        return pd.DataFrame(
            columns=["account_id", "date", "engagement_score", "decay_risk", "churn_prob"]
        )

    if churn_threshold <= 0:
        raise ValueError("churn_threshold must be > 0")

    # Pivot engagement rates to 7 columns for fast lookup
    er = engagement_rates.pivot(
        index="account_id", columns="day_of_week", values="engagement_rate_pct"
    ).fillna(0.0)
    # Ensure all 7 days exist
    for day in range(7):
        if day not in er.columns:
            er[day] = 0.0
    er = er[[0, 1, 2, 3, 4, 5, 6]]

    # Precompute date range and day-of-week map
    n_days = (end_dt - start_dt).days + 1
    dates = [start_dt + timedelta(days=i) for i in range(n_days)]
    dow_map = {d: d.weekday() for d in dates}

    # Auto-calibrate normalization so the median account's steady-state score is ~ churn_threshold.
    norm = float(normalization_factor) if normalization_factor is not None else None
    if norm is None:
        if decay_rate_per_day <= 0 or churn_threshold <= 0:
            norm = 1.0
        else:
            median_avg_rate = float(er.mean(axis=1).median())
            norm = (
                median_avg_rate * (1.0 - decay_rate_per_day) / (decay_rate_per_day * churn_threshold)
                if median_avg_rate > 0
                else 1.0
            )
    norm = max(1e-6, float(norm))

    out_rows = []
    for account_id, rates_row in er.iterrows():
        # Initialize at the account's steady-state score implied by its average learned rate.
        avg_rate = sum(float(rates_row.get(d, 0.0)) for d in range(7)) / 7.0
        steady_state = (avg_rate / norm) * (1.0 - decay_rate_per_day) / max(decay_rate_per_day, 1e-9)
        engagement_score = min(max_engagement_score, steady_state)
        engagement_score = max(0.0, min(max_engagement_score, engagement_score))

        for d in dates:
            dow = dow_map[d]
            # Get expected engagement for this day and scale into [0, 1] space.
            expected = float(rates_row.get(dow, 0.0)) / norm

            # Add expected engagement and decay daily. This keeps scores stable and prevents
            # unrealistic monotonic growth when expected engagement is small but non-zero.
            engagement_score = (engagement_score + expected) * (1.0 - decay_rate_per_day)
            engagement_score = max(0.0, min(max_engagement_score, engagement_score))
            if reset_on_touchpoint and expected > 0:
                engagement_score = max_engagement_score

            # Compute churn probability (sigmoid centered on churn_threshold)
            decay_risk = max(0.0, (churn_threshold - engagement_score) / churn_threshold)
            risk_scale = max(0.05, churn_threshold * 0.2)
            churn_prob = 1.0 / (1.0 + math.exp((engagement_score - churn_threshold) / risk_scale))

            out_rows.append(
                (account_id, d.isoformat(), engagement_score, decay_risk, churn_prob)
            )

    return pd.DataFrame(
        out_rows, columns=["account_id", "date", "engagement_score", "decay_risk", "churn_prob"]
    )
