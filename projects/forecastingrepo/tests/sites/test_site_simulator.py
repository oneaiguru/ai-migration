from datetime import date

import pandas as pd
import pytest

from src.sites.simulator import simulate_fill


@pytest.mark.spec_id("SITE-SIM-001")
def test_simulate_fill_overflow_and_reset_like_behavior():
    # Minimal registry: one site with capacity 1100 L
    reg = pd.DataFrame([
        {"site_id": "S1", "bin_count": 1, "bin_size_liters": 1100}
    ])
    # Weekday rates: 300 m3/day Mon-Fri, 0 Sat/Sun
    wr = pd.DataFrame([{ "site_id": "S1", "weekday": wd, "rate_m3_per_day": (300.0 if wd < 5 else 0.0)} for wd in range(7)])

    out = simulate_fill(reg, wr, date(2024, 7, 1), date(2024, 7, 10), capacity_liters=1100, overflow_threshold=0.8)
    # Expect overflow once cumulative volume exceeds 0.88 m3
    # First five weekdays sum to 1500 => overflow yes by end of first work week
    assert (out["overflow_prob"] == 1).any()
    # Fill pct never exceeds 1.0
    assert out["fill_pct"].max() <= 1.0


def test_simulate_fill_resets_near_capacity_when_flag_enabled():
    reg = pd.DataFrame([
        {"site_id": "S1", "bin_count": 1, "bin_size_liters": 1000},
    ])
    weekday_rates = pd.DataFrame([
        {"site_id": "S1", "weekday": wd, "rate_m3_per_day": 250.0}
        for wd in range(7)
    ])
    out = simulate_fill(
        reg,
        weekday_rates,
        start_dt=date(2024, 10, 1),
        end_dt=date(2024, 10, 4),
        capacity_liters=1000,
        overflow_threshold=0.8,
        reset_on_near_capacity=True,
    )
    last_row = out[out["date"] == "2024-10-04"].iloc[0]
    assert float(last_row["pred_volume_m3"]) == 0.0
    assert float(last_row["fill_pct"]) == 0.0
