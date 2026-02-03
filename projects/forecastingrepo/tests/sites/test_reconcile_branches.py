import pandas as pd
import numpy as np
import pytest

from src.sites.reconcile import reconcile_sites_to_district


@pytest.mark.spec_id("SITE-REC-ZERO-ZERO")
def test_reconcile_zero_sites_and_zero_district_no_warns():
    sites = pd.DataFrame([
        {"site_id": "S1", "date": "2024-08-01", "pred_volume_m3": 0.0, "fill_pct": 0.0, "overflow_prob": 0},
    ])
    reg = pd.DataFrame([
        {"site_id": "S1", "district": "D1", "bin_count": 1, "bin_size_liters": 1100},
    ])
    fc = pd.DataFrame([
        {"date": "2024-08-01", "district": "D1", "forecast_m3": 0.0},
    ])
    adj, dbg, warns = reconcile_sites_to_district(sites, reg, fc)
    assert warns == []
    assert not dbg.empty
    assert float(dbg.iloc[0]["sites_sum_after_m3"]) == 0.0


@pytest.mark.spec_id("SITE-REC-CLIP-AND-TOL")
def test_reconcile_scale_clipping_and_tolerance_warn():
    # s_before = 1.0 m3; fc = 2.0 m3 -> raw scale 2.0 but clip to 1.1
    sites = pd.DataFrame([
        {"site_id": "S1", "date": "2024-08-01", "pred_volume_m3": 1.0, "fill_pct": 0.0, "overflow_prob": 0},
    ])
    reg = pd.DataFrame([
        {"site_id": "S1", "district": "D1", "bin_count": 2, "bin_size_liters": 1100},
    ])
    fc = pd.DataFrame([
        {"date": "2024-08-01", "district": "D1", "forecast_m3": 2.0},
    ])
    adj, dbg, warns = reconcile_sites_to_district(
        sites, reg, fc, tolerance_pct=0.5, method="proportional", clip_min=0.9, clip_max=1.1
    )
    # Scale clipped to 1.1
    assert pytest.approx(float(dbg.iloc[0]["scale_applied"])) == 1.1
    # After scale, pred_volume_m3 becomes 1.1 m3
    assert pytest.approx(float(adj["pred_volume_m3"].sum())) == 1.1
    # fill_pct recomputed using capacity liters (2 bins * 1100L = 2200L)
    expected_fill = 1.1 / 2.2
    assert pytest.approx(float(adj.iloc[0]["fill_pct"])) == expected_fill
    # Tolerance likely triggers warn since fc=2.0m3 and s_after=1.1m3 -> delta ~45% => below 50%? adjust to trigger
    # Force a stricter tolerance to ensure warn
    adj2, dbg2, warns2 = reconcile_sites_to_district(
        sites, reg, fc, tolerance_pct=10.0, method="proportional", clip_min=0.9, clip_max=1.1
    )
    assert any(w.get("reason") == "delta_above_tolerance" for w in warns2)


@pytest.mark.spec_id("SITE-REC-EARLY-RETURN")
def test_reconcile_early_return_when_forecast_empty():
    sites = pd.DataFrame([
        {"site_id": "S1", "date": "2024-08-01", "pred_volume_m3": 100.0, "fill_pct": 0.0, "overflow_prob": 0},
    ])
    reg = pd.DataFrame([
        {"site_id": "S1", "district": "D1", "bin_count": 1, "bin_size_liters": 1100},
    ])
    fc = pd.DataFrame(columns=["date","district","forecast_m3"])  # empty
    adj, dbg, warns = reconcile_sites_to_district(sites, reg, fc)
    # early return: adjusted equals input shape; debug empty; no warns
    assert list(adj.columns) == list(sites.columns)
    assert dbg.empty and warns == []
