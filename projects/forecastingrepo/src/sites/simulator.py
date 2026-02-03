from __future__ import annotations

from datetime import date, timedelta

import pandas as pd


def simulate_fill(
    site_registry: pd.DataFrame,
    weekday_rates: pd.DataFrame,
    start_dt: date,
    end_dt: date,
    capacity_liters: int = 1100,
    overflow_threshold: float = 0.8,
    reset_on_near_capacity: bool = False,
) -> pd.DataFrame:
    """
    Simulate per-site fill trajectory using weekday rates.

    - site_registry: columns site_id, bin_count, bin_size_liters (optional)
    - weekday_rates: columns site_id, weekday, rate_m3_per_day
    - capacity per site: (bin_count * bin_size_liters) if available else capacity_liters

    Output columns: site_id,date,fill_pct,pred_volume_m3,overflow_prob (0/1)
    """
    if weekday_rates.empty:
        return pd.DataFrame(columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])

    # Build capacity table
    reg = site_registry.copy() if site_registry is not None else pd.DataFrame(columns=["site_id"])  # type: ignore
    if "bin_count" not in reg.columns:
        reg["bin_count"] = 1
    if "bin_size_liters" not in reg.columns:
        reg["bin_size_liters"] = capacity_liters
    reg["capacity_liters"] = reg["bin_count"].fillna(1).astype(float) * reg["bin_size_liters"].fillna(capacity_liters).astype(float)

    # Precompute date range and weekday map
    n_days = (end_dt - start_dt).days + 1
    dates = [start_dt + timedelta(days=i) for i in range(n_days)]
    wd_map = {d: d.weekday() for d in dates}

    # Pivot weekday rates to 7 columns for fast lookup
    wr = weekday_rates.pivot(index="site_id", columns="weekday", values="rate_m3_per_day").fillna(0.0)
    wr = wr[[0, 1, 2, 3, 4, 5, 6]] if all(c in wr.columns for c in [0,1,2,3,4,5,6]) else wr

    out_rows = []
    for site_id, rates_row in wr.iterrows():
        cap_l = float(reg.set_index("site_id").get("capacity_liters", pd.Series(dtype=float)).get(site_id, capacity_liters))
        cap_m3 = cap_l / 1000.0 if cap_l > 0 else 0.0
        fill_m3 = 0.0
        for d in dates:
            wd = wd_map[d]
            rate = float(rates_row.get(wd, 0.0))
            fill_m3 = max(0.0, fill_m3 + rate)
            if reset_on_near_capacity and cap_m3 > 0 and fill_m3 >= cap_m3 * 0.98:
                fill_m3 = 0.0
            fill_pct = 0.0 if cap_m3 <= 0 else min(1.0, fill_m3 / cap_m3)
            overflow = 1 if fill_pct >= overflow_threshold else 0
            out_rows.append((site_id, d.isoformat(), fill_pct, fill_m3, overflow))

    return pd.DataFrame(out_rows, columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
