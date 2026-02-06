"""
Baseline engagement estimation from historical touchpoints.

Use a simple baseline estimation pattern:
  engagement_rate = interactions / days_since_last_touchpoint

Estimate per-account engagement patterns across weekly "campaign cycles"
(some accounts engage Mon-Wed, others Thu-Fri).
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Optional

import pandas as pd


def _smooth_cycle_day_engagement(
    day: int,  # 0-6 (day of week as proxy for cycle position)
    engagements: dict[int, float],
    counts: dict[int, int],
    min_obs: int,
    overall_mean: float,
) -> float:
    """
    Smooth engagement rate for undersampled cycle days.

    Priority:
    1) If cycle day has enough observations, use its rate.
    2) Else borrow from neighbors (+/-1, +/-2) if they have sufficient observations.
    3) Else fall back to account-level overall mean.
    """
    if counts.get(day, 0) >= min_obs and day in engagements:
        return engagements[day]
    for offset in (1, -1, 2, -2):
        neighbor = (day + offset) % 7
        if counts.get(neighbor, 0) >= min_obs and neighbor in engagements:
            return engagements[neighbor]
    return overall_mean


def estimate_engagement_rates(
    touchpoint_df: pd.DataFrame,
    cutoff: date,
    window_days: int = 90,
    min_obs: int = 2,
) -> pd.DataFrame:
    """
    Event-to-rate: for each touchpoint (account_id, touchpoint_dt, interaction_value),
    compute engagement_rate = interaction_value / days_since_previous_touchpoint
    and attribute it to each day in that interval. Aggregate per day-of-week.

    Args:
        touchpoint_df: columns account_id, touchpoint_dt, interaction_value
                      (interaction_value can be report opens, email responses, meetings, etc.)
        cutoff: last date of known data
        window_days: training window (default 90 = ~13 weeks)
        min_obs: threshold before borrowing from adjacent days (default 2)

    Returns:
        DataFrame with columns: account_id, day_of_week (0..6), engagement_rate_pct.
        Undersampled days are smoothed from neighbors or account-level fallback.
    """
    if touchpoint_df.empty:
        return pd.DataFrame(
            columns=["account_id", "day_of_week", "engagement_rate_pct"]
        ).astype({"day_of_week": int, "engagement_rate_pct": float})

    # Filter to window
    start = cutoff - timedelta(days=window_days - 1)
    tdf = touchpoint_df.copy()
    tdf["touchpoint_dt"] = pd.to_datetime(tdf["touchpoint_dt"]).dt.date
    # Real datasets often have multiple events per account per day; aggregate so they
    # don't get dropped by same-day (delta=0) handling below.
    tdf["interaction_value"] = pd.to_numeric(tdf["interaction_value"], errors="coerce")
    tdf = tdf.dropna(subset=["interaction_value"])
    tdf = tdf[(tdf["touchpoint_dt"] >= start) & (tdf["touchpoint_dt"] <= cutoff)]
    tdf = (
        tdf.groupby(["account_id", "touchpoint_dt"], as_index=False)["interaction_value"]
        .sum()
        .sort_values(["account_id", "touchpoint_dt"])
    )

    rows = []
    per_account_event_rates = {}

    for account_id, g in tdf.groupby("account_id"):
        if g.empty:
            continue

        prev_dt: Optional[date] = None
        for _, r in g.iterrows():
            dt: date = r["touchpoint_dt"]
            interaction_value = r.get("interaction_value")
            try:
                interaction_value = float(interaction_value) if interaction_value is not None else None
            except Exception:
                interaction_value = None

            if prev_dt is None:
                # Assume a default gap from window start to first touchpoint.
                # If first touchpoint is exactly on window start (gap=0), skip attribution
                # since there are no prior days in the window to spread across.
                default_gap = (dt - start).days
                if default_gap <= 0 or interaction_value is None:
                    prev_dt = dt
                    continue
                rate = interaction_value / float(default_gap)
                per_account_event_rates.setdefault(account_id, []).append(rate)
                # Attribute to each day in the gap
                for i in range(default_gap, 0, -1):
                    d = dt - timedelta(days=i)
                    rows.append((account_id, d.weekday(), rate))
                prev_dt = dt
                continue

            delta = (dt - prev_dt).days
            if delta <= 0:
                prev_dt = dt
                continue
            if interaction_value is None:
                prev_dt = dt
                continue

            rate = interaction_value / float(delta)
            per_account_event_rates.setdefault(account_id, []).append(rate)
            # Attribute to each day in (prev_dt, dt]
            for i in range(1, delta + 1):
                d = prev_dt + timedelta(days=i)
                rows.append((account_id, d.weekday(), rate))
            prev_dt = dt

    if not rows:
        return pd.DataFrame(
            columns=["account_id", "day_of_week", "engagement_rate_pct"]
        ).astype({"day_of_week": int, "engagement_rate_pct": float})

    df = pd.DataFrame(rows, columns=["account_id", "day_of_week", "rate"])

    # Overall means per account from event-level rates (fallback)
    overall_items = []
    for aid, rates_list in per_account_event_rates.items():
        if rates_list:
            overall_items.append((aid, sum(rates_list) / len(rates_list)))
    overall = (
        pd.DataFrame(overall_items, columns=["account_id", "overall"])
        if overall_items
        else pd.DataFrame(columns=["account_id", "overall"])
    )

    agg = (
        df.groupby(["account_id", "day_of_week"])
        .agg(sum_r=("rate", "sum"), cnt=("rate", "count"))
        .reset_index()
    )
    agg = agg.merge(overall, on="account_id", how="left")
    agg["overall"] = agg["overall"].fillna(0.0)

    smoothed_rows = []
    for account_id, acct_df in agg.groupby("account_id"):
        counts = acct_df.set_index("day_of_week")["cnt"].to_dict()
        engagement_rates = (
            acct_df.set_index("day_of_week")["sum_r"] / acct_df.set_index("day_of_week")["cnt"]
        ).to_dict()
        overall_mean = (
            float(acct_df["overall"].iloc[0])
            if not acct_df["overall"].isna().all()
            else 0.0
        )
        for day in range(7):
            rate = _smooth_cycle_day_engagement(day, engagement_rates, counts, min_obs, overall_mean)
            smoothed_rows.append((account_id, day, rate))

    result = pd.DataFrame(
        smoothed_rows, columns=["account_id", "day_of_week", "engagement_rate_pct"]
    )
    return result
