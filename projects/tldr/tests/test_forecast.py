from __future__ import annotations

from datetime import date

import pandas as pd

from src.account_health import ChurnForecastRequest, generate_churn_forecast


def test_generate_churn_forecast_includes_accounts_with_no_touchpoints() -> None:
    registry_df = pd.DataFrame(
        [
            {"account_id": "a1", "company": "Acme"},
            {"account_id": "a2", "company": "Beta"},
        ]
    )
    touchpoint_df = pd.DataFrame(
        [
            {"account_id": "a1", "touchpoint_dt": "2025-01-01", "interaction_value": 2.0},
            {"account_id": "a1", "touchpoint_dt": "2025-01-05", "interaction_value": 1.0},
        ]
    )
    req = ChurnForecastRequest(cutoff_date=date(2025, 1, 5), horizon_days=3)
    result = generate_churn_forecast(req, touchpoint_df=touchpoint_df, registry_df=registry_df)

    assert result.account_count == 2
    assert set(result.forecast_df["account_id"].unique()) == {"a1", "a2"}

    # Accounts with no touchpoints should be treated as very high risk (near 1.0 churn_prob).
    a2 = result.forecast_df[result.forecast_df["account_id"] == "a2"]
    assert float(a2["churn_prob"].min()) > 0.9

