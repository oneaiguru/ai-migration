from datetime import date

import pandas as pd
import pytest

from src.sites.baseline import estimate_weekday_rates


@pytest.mark.spec_id("SITE-BSL-001")
def test_estimate_weekday_rates_sparse_weekdays_fallback():
    # Two intervals for one site: 2024-07-01 to 2024-07-08 (7d) volume=7,
    # then 2024-07-08 to 2024-07-15 (7d) volume=14
    svc = pd.DataFrame(
        [
            {"site_id": "S1", "service_dt": "2024-07-08", "collect_volume_m3": 7.0},
            {"site_id": "S1", "service_dt": "2024-07-15", "collect_volume_m3": 14.0},
        ]
    )
    cutoff = date(2024, 7, 15)
    rates = estimate_weekday_rates(svc, cutoff, window_days=56, min_obs=10)  # high min_obs to trigger fallback
    # overall mean rate across events: (7/7 + 14/7)/2 = (1 + 2)/2 = 1.5 m3/day
    df = rates[rates["site_id"] == "S1"]
    assert not df.empty
    # Every weekday rate equals fallback overall 1.5
    assert pytest.approx(df["rate_m3_per_day"].unique()[0], rel=1e-6) == 1.5
