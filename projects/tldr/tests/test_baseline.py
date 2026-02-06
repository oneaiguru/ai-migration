"""Tests for baseline engagement estimation."""
import pytest
from datetime import date, timedelta
import pandas as pd
from src.account_health.baseline import estimate_engagement_rates


@pytest.fixture
def sample_touchpoints():
    """Sample touchpoint data with multiple accounts."""
    return pd.DataFrame([
        # Account A: consistent Mon-Wed engagement
        {"account_id": "acme-123", "touchpoint_dt": "2024-09-01", "interaction_value": 1.0},
        {"account_id": "acme-123", "touchpoint_dt": "2024-09-03", "interaction_value": 2.0},
        {"account_id": "acme-123", "touchpoint_dt": "2024-09-05", "interaction_value": 1.5},
        # Account B: sparse touchpoints
        {"account_id": "beta-456", "touchpoint_dt": "2024-09-02", "interaction_value": 3.0},
        {"account_id": "beta-456", "touchpoint_dt": "2024-09-10", "interaction_value": 2.0},
    ])


def test_estimate_engagement_rates_basic(sample_touchpoints):
    """Test that engagement rates are estimated for each account."""
    cutoff = date(2024, 9, 30)
    rates = estimate_engagement_rates(
        sample_touchpoints,
        cutoff=cutoff,
        window_days=90,
        min_obs=2,
    )
    
    # Should have 7 rows per account (one per day-of-week)
    assert len(rates) == 14  # 2 accounts x 7 days
    assert rates["account_id"].nunique() == 2
    assert set(rates["day_of_week"]) == set(range(7))


def test_estimate_engagement_rates_empty():
    """Test behavior with empty dataframe."""
    empty_df = pd.DataFrame(columns=["account_id", "touchpoint_dt", "interaction_value"])
    cutoff = date(2024, 9, 30)
    rates = estimate_engagement_rates(empty_df, cutoff=cutoff)
    
    assert rates.empty
    assert list(rates.columns) == ["account_id", "day_of_week", "engagement_rate_pct"]


def test_engagement_rates_positive():
    """Test that all engagement rates are non-negative."""
    touchpoints = pd.DataFrame([
        {"account_id": "test-1", "touchpoint_dt": "2024-09-05", "interaction_value": 5.0},
        {"account_id": "test-1", "touchpoint_dt": "2024-09-10", "interaction_value": 3.0},
    ])
    
    cutoff = date(2024, 9, 30)
    rates = estimate_engagement_rates(touchpoints, cutoff=cutoff, window_days=90)
    
    assert (rates["engagement_rate_pct"] >= 0).all()


def test_engagement_rates_smoothing():
    """Test that undersampled days are smoothed from neighbors."""
    # Single touchpoint -> only 1 day of week will have observations
    touchpoints = pd.DataFrame([
        {"account_id": "sparse", "touchpoint_dt": "2024-09-03", "interaction_value": 2.0},  # Tuesday
    ])
    
    cutoff = date(2024, 9, 30)
    rates = estimate_engagement_rates(touchpoints, cutoff=cutoff, window_days=90, min_obs=2)
    
    # All 7 days should have non-zero rates (smoothed)
    rate_by_day = rates.set_index("day_of_week")["engagement_rate_pct"]
    assert (rate_by_day > 0).all(), "All weekdays should have smoothed rates"


def test_multiple_touchpoints_same_day_are_aggregated():
    """Multiple events on the same day should contribute (not get dropped)."""
    touchpoints = pd.DataFrame([
        {"account_id": "dup", "touchpoint_dt": "2024-09-10", "interaction_value": 1.0},
        {"account_id": "dup", "touchpoint_dt": "2024-09-10", "interaction_value": 2.0},
        {"account_id": "dup", "touchpoint_dt": "2024-09-12", "interaction_value": 1.0},
    ])
    cutoff = date(2024, 9, 12)
    rates = estimate_engagement_rates(touchpoints, cutoff=cutoff, window_days=5, min_obs=1)

    # Window start is 2024-09-08; the first touchpoint day aggregates to 3.0 over a 2-day gap -> 1.5/day.
    rate_by_day = rates.set_index("day_of_week")["engagement_rate_pct"]
    assert rate_by_day[6] == pytest.approx(1.5)  # 2024-09-08 (Sun) attributed from first gap
    assert rate_by_day[0] == pytest.approx(1.5)  # 2024-09-09 (Mon) attributed from first gap


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
