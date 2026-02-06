"""Tests for engagement decay simulation."""
import pytest
from datetime import date
import pandas as pd
from src.account_health.simulator import simulate_engagement_decay


@pytest.fixture
def sample_rates():
    """Sample engagement rates."""
    rows = [
        # Account A: high engagement Mon-Wed
        {"account_id": "acme-123", "day_of_week": 0, "engagement_rate_pct": 1.0},  # Mon
        {"account_id": "acme-123", "day_of_week": 1, "engagement_rate_pct": 1.0},  # Tue
        {"account_id": "acme-123", "day_of_week": 2, "engagement_rate_pct": 1.0},  # Wed
        {"account_id": "acme-123", "day_of_week": 3, "engagement_rate_pct": 0.0},  # Thu
        {"account_id": "acme-123", "day_of_week": 4, "engagement_rate_pct": 0.0},  # Fri
        {"account_id": "acme-123", "day_of_week": 5, "engagement_rate_pct": 0.0},  # Sat
        {"account_id": "acme-123", "day_of_week": 6, "engagement_rate_pct": 0.0},  # Sun
        # Account B: low engagement
    ]
    rows += [
        {"account_id": "beta-456", "day_of_week": i, "engagement_rate_pct": 0.2}
        for i in range(7)
    ]
    return pd.DataFrame(rows)


def test_simulate_engagement_decay_basic(sample_rates):
    """Test basic engagement decay simulation."""
    registry = pd.DataFrame([
        {"account_id": "acme-123", "company": "Acme", "tier": "enterprise", "arr": 500000},
        {"account_id": "beta-456", "company": "Beta", "tier": "mid-market", "arr": 100000},
    ])
    
    start = date(2024, 12, 1)
    end = date(2024, 12, 7)
    
    result = simulate_engagement_decay(
        account_registry=registry,
        engagement_rates=sample_rates,
        start_dt=start,
        end_dt=end,
        decay_rate_per_day=0.02,
    )
    
    assert len(result) == 14  # 2 accounts x 7 days
    assert set(result.columns) == {"account_id", "date", "engagement_score", "decay_risk", "churn_prob"}


def test_engagement_scores_bounded():
    """Test that engagement scores stay within [0, 1]."""
    rates = pd.DataFrame([
        {"account_id": "test", "day_of_week": i, "engagement_rate_pct": 0.5}
        for i in range(7)
    ])
    registry = pd.DataFrame([{"account_id": "test", "company": "Test", "tier": "small", "arr": 10000}])
    
    result = simulate_engagement_decay(
        account_registry=registry,
        engagement_rates=rates,
        start_dt=date(2024, 12, 1),
        end_dt=date(2024, 12, 31),
    )
    
    assert (result["engagement_score"] >= 0).all()
    assert (result["engagement_score"] <= 1).all()


def test_churn_threshold_must_be_positive():
    """churn_threshold must be > 0 to avoid divide-by-zero in decay_risk."""
    rates = pd.DataFrame([
        {"account_id": "test", "day_of_week": i, "engagement_rate_pct": 0.5}
        for i in range(7)
    ])
    registry = pd.DataFrame([{"account_id": "test", "company": "Test", "tier": "small", "arr": 10000}])

    with pytest.raises(ValueError, match="churn_threshold must be > 0"):
        simulate_engagement_decay(
            account_registry=registry,
            engagement_rates=rates,
            start_dt=date(2024, 12, 1),
            end_dt=date(2024, 12, 7),
            churn_threshold=0.0,
        )


def test_churn_prob_increases_with_decay(sample_rates):
    """Test that churn_prob increases as engagement_score drops."""
    registry = pd.DataFrame([{"account_id": "acme-123", "company": "Acme", "tier": "enterprise", "arr": 500000}])
    
    # Filter to single account
    acme_rates = sample_rates[sample_rates["account_id"] == "acme-123"]
    
    result = simulate_engagement_decay(
        account_registry=registry,
        engagement_rates=acme_rates,
        start_dt=date(2024, 12, 1),
        end_dt=date(2024, 12, 31),
        decay_rate_per_day=0.05,  # Faster decay
    )
    
    # Lower engagement scores should map to higher churn probabilities
    low_score = result.nsmallest(5, "engagement_score")["churn_prob"].mean()
    high_score = result.nlargest(5, "engagement_score")["churn_prob"].mean()

    assert low_score >= high_score, "Churn probability should rise as engagement drops"


def test_simulate_empty_rates():
    """Test behavior with empty engagement rates."""
    empty_rates = pd.DataFrame(columns=["account_id", "day_of_week", "engagement_rate_pct"])
    empty_registry = pd.DataFrame(columns=["account_id", "company", "tier", "arr"])
    
    result = simulate_engagement_decay(
        account_registry=empty_registry,
        engagement_rates=empty_rates,
        start_dt=date(2024, 12, 1),
        end_dt=date(2024, 12, 7),
    )
    
    assert result.empty


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
