from datetime import date, timedelta
import pandas as pd
import pytest

from src.sites.baseline import estimate_weekday_rates


@pytest.mark.spec_id("SITE-BSL-EMPTY")
def test_estimate_weekday_rates_empty_input_returns_typed_empty():
    svc = pd.DataFrame(columns=["site_id","service_dt","collect_volume_m3"])  # empty
    rates = estimate_weekday_rates(svc, cutoff=date(2024, 8, 3))
    assert list(rates.columns) == ["site_id","weekday","rate_m3_per_day"]
    assert rates.empty


@pytest.mark.spec_id("SITE-BSL-MASS-NONE-AND-DELTA-0")
def test_estimate_weekday_rates_handles_none_mass_and_duplicate_dates():
    # First event mass None (skipped), then duplicate same-day event (delta=0), then a valid next-day event
    d1 = date(2024, 8, 1)
    d2 = date(2024, 8, 1)  # duplicate day
    d3 = date(2024, 8, 2)
    svc = pd.DataFrame([
        {"site_id": "S1", "service_dt": d1.isoformat(), "collect_volume_m3": None},
        {"site_id": "S1", "service_dt": d2.isoformat(), "collect_volume_m3": 5.0},
        {"site_id": "S1", "service_dt": d3.isoformat(), "collect_volume_m3": 5.0},
    ])
    cutoff = date(2024, 8, 3)
    rates = estimate_weekday_rates(svc, cutoff, window_days=7, min_obs=1)
    # Should not crash; produce non-empty rates with finite values
    assert not rates.empty
    assert rates["rate_m3_per_day"].notna().all()


@pytest.mark.spec_id("SITE-BSL-DEFAULT-GAP")
def test_estimate_weekday_rates_default_gap_bounds():
    # First event at window start -> (dt - start).days == 0 -> default gap becomes 7 (bounded)
    cutoff = date(2024, 8, 8)
    start = cutoff - timedelta(days=6)
    svc = pd.DataFrame([
        {"site_id": "S1", "service_dt": start.isoformat(), "collect_volume_m3": 14.0},
    ])
    rates = estimate_weekday_rates(svc, cutoff, window_days=7, min_obs=10)  # high min_obs -> fallback to overall
    # overall rate == mass/default_gap == 14/7 = 2.0
    assert not rates.empty
    assert pytest.approx(float(rates.iloc[0]["rate_m3_per_day"])) == 2.0

