from __future__ import annotations

from datetime import date, timedelta
from typing import Optional

import pandas as pd


def estimate_weekday_rates(
    service_df: pd.DataFrame,
    cutoff: date,
    window_days: int = 56,
    min_obs: int = 4,
) -> pd.DataFrame:
    """
    Event-to-rate: for each service event (site_id, service_dt, collect_volume_m3),
    compute r = volume / Δdays since previous service and attribute r to each weekday
    in that interval. Aggregate sums & counts per weekday; rate = sum/count.

    Returns DataFrame with columns: site_id, weekday (0..6), rate_m3_per_day.
    If a site has < min_obs for a weekday, fallback to that site's overall_mean_56d.
    """
    if service_df.empty:
        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype({"weekday": int, "rate_m3_per_day": float})

    # Filter to window
    start = cutoff - timedelta(days=window_days - 1)
    sdf = service_df.copy()
    sdf["service_dt"] = pd.to_datetime(sdf["service_dt"]).dt.date
    sdf = sdf.sort_values(["site_id", "service_dt"])  # ensure order

    rows = []
    per_site_event_rates = {}
    for site_id, g in sdf.groupby("site_id"):
        g = g[(g["service_dt"] >= start) & (g["service_dt"] <= cutoff)]
        if g.empty:
            continue
        prev_dt: Optional[date] = None
        for _, r in g.iterrows():
            dt: date = r["service_dt"]
            volume = r.get("collect_volume_m3")
            try:
                volume = float(volume) if volume is not None else None
            except Exception:
                volume = None
            if prev_dt is None:
                # Assume a default 7-day gap for the first observed event, bounded by window start
                default_gap = max(1, min(7, (dt - start).days if (dt - start).days > 0 else 7))
                if volume is None:
                    prev_dt = dt
                    continue
                rate = volume / float(default_gap)
                per_site_event_rates.setdefault(str(site_id), []).append(rate)
                for i in range(default_gap, 0, -1):
                    d = dt - timedelta(days=i)
                    rows.append((site_id, d.weekday(), rate))
                prev_dt = dt
                continue
            delta = (dt - prev_dt).days
            if delta <= 0:
                prev_dt = dt
                continue
            if volume is None:
                prev_dt = dt
                continue
            rate = volume / float(delta)
            per_site_event_rates.setdefault(str(site_id), []).append(rate)
            # Attribute to each weekday in (prev_dt, dt]
            for i in range(1, delta + 1):
                d = prev_dt + timedelta(days=i)
                rows.append((site_id, d.weekday(), rate))
            prev_dt = dt

    if not rows:
        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype({"weekday": int, "rate_m3_per_day": float})

    df = pd.DataFrame(rows, columns=["site_id", "weekday", "rate"])
    # Overall means per site from event-level rates (fallback value)
    overall_items = []
    for sid, rates_list in per_site_event_rates.items():
        if rates_list:
            overall_items.append((sid, sum(rates_list) / len(rates_list)))
    overall = pd.DataFrame(overall_items, columns=["site_id", "overall"]) if overall_items else pd.DataFrame(columns=["site_id", "overall"])
    agg = df.groupby(["site_id", "weekday"]).agg(sum_r=("rate", "sum"), cnt=("rate", "count")).reset_index()
    agg = agg.merge(overall, on="site_id", how="left")
    # Review follow-up: ensure missing overall means do not propagate NaN into weekday rates
    agg["overall"] = agg["overall"].fillna(0.0)
    agg["rate_m3_per_day"] = agg.apply(
        lambda r: (r["sum_r"] / r["cnt"]) if r["cnt"] >= min_obs else r["overall"], axis=1
    )
    return agg[["site_id", "weekday", "rate_m3_per_day"]]
