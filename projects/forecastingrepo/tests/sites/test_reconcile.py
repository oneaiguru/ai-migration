import pandas as pd
import pytest

from src.sites.reconcile import reconcile_sites_to_district


@pytest.mark.spec_id("SITE-REC-001")
def test_reconcile_basic_scaling_matches_forecast():
    # Two sites in district D1 on 2024-08-01 with total 1000 m3; district fc = 1100 m3
    sites = pd.DataFrame([
        {"site_id": "S1", "date": "2024-08-01", "pred_volume_m3": 400.0, "fill_pct": 0.3, "overflow_prob": 0},
        {"site_id": "S2", "date": "2024-08-01", "pred_volume_m3": 600.0, "fill_pct": 0.6, "overflow_prob": 0},
    ])
    reg = pd.DataFrame([
        {"site_id": "S1", "district": "D1", "bin_count": 1, "bin_size_liters": 1100},
        {"site_id": "S2", "district": "D1", "bin_count": 1, "bin_size_liters": 1100},
    ])
    fc = pd.DataFrame([
        {"date": "2024-08-01", "district": "D1", "forecast_m3": 1100.0},
    ])

    adj, dbg, warns = reconcile_sites_to_district(sites, reg, fc, tolerance_pct=0.5, method='proportional', clip_min=0.9, clip_max=1.1)

    assert warns == []
    # After scaling 1.1, total should be 1100 m3
    total_after = adj["pred_volume_m3"].sum()
    assert pytest.approx(total_after, rel=1e-6) == 1100.0
    assert not dbg.empty and float(dbg.iloc[0]["sites_sum_after_m3"]) == pytest.approx(1100.0, rel=1e-6)


@pytest.mark.spec_id("SITE-REC-001")
def test_reconcile_zero_sites_positive_district_warns():
    sites = pd.DataFrame([
        {"site_id": "S1", "date": "2024-08-01", "pred_volume_m3": 0.0, "fill_pct": 0.0, "overflow_prob": 0},
    ])
    reg = pd.DataFrame([
        {"site_id": "S1", "district": "D1", "bin_count": 1, "bin_size_liters": 1100},
    ])
    fc = pd.DataFrame([
        {"date": "2024-08-01", "district": "D1", "forecast_m3": 0.5},
    ])
    adj, dbg, warns = reconcile_sites_to_district(sites, reg, fc)
    assert any(w.get("reason") == "site_sum_zero_district_positive" for w in warns)


def test_reconcile_unmapped_site_warns_and_marks_default():
    sites = pd.DataFrame([
        {"site_id": "S1", "date": "2024-08-01", "pred_volume_m3": 100.0, "fill_pct": 0.2, "overflow_prob": 0},
    ])
    reg = pd.DataFrame([], columns=["site_id", "district"])
    fc = pd.DataFrame([
        {"date": "2024-08-01", "district": "D1", "forecast_m3": 0.1},
    ])
    _, debug_df, warnings = reconcile_sites_to_district(sites, reg, fc)
    assert any(w.get("reason") == "site_missing_district" for w in warnings)
    assert "__unmapped__" in debug_df["district"].unique()
