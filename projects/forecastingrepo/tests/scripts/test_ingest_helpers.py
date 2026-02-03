import os
from datetime import date
import csv

import pytest

from scripts.ingest_and_forecast import (
    col_letters_to_index,
    index_to_col_letters,
    days_in_month,
    daterange,
    ensure_dirs,
    write_daily_csv,
    aggregate_monthly,
    forecast_daily_naive,
    forecast_monthly_naive,
)


@pytest.mark.spec_id("CLI-001")
def test_col_index_roundtrip_and_date_utils():
    assert col_letters_to_index("A") == 1
    assert col_letters_to_index("AA") == 27
    assert index_to_col_letters(1) == "A"
    assert index_to_col_letters(27) == "AA"

    # 2024 is leap year; February has 29 days
    assert days_in_month(2024, 2) == 29
    r = daterange(date(2024, 1, 1), date(2024, 1, 5))
    assert len(r) == 5


@pytest.mark.spec_id("QA-005")
def test_write_and_aggregate_and_forecast(tmp_path, monkeypatch):
    # Work in tmp cwd because helper functions use relative paths
    monkeypatch.chdir(tmp_path)

    # Build tiny daily_by_district mapping
    daily_by_district = {
        (date(2024, 12, 30), "D1"): 10.0,
        (date(2024, 12, 31), "D1"): 10.0,
        (date(2024, 12, 30), "D2"): 5.0,
        (date(2024, 12, 31), "D2"): 5.0,
    }

    # Write daily CSV
    ensure_dirs()
    path_daily = write_daily_csv(daily_by_district)
    assert os.path.exists(path_daily)

    # Aggregate monthly and create region dict
    path_md, path_mr, monthly_region = aggregate_monthly(daily_by_district)
    assert os.path.exists(path_md)
    assert os.path.exists(path_mr)
    # monthly_region has a single month 2024-12 with total 30
    assert abs(list(monthly_region.values())[0] - 30.0) < 1e-9

    # Forecast helpers produce files in ./forecasts
    path_df = forecast_daily_naive(daily_by_district)
    assert os.path.exists(path_df)
    # 30 rows + header
    assert sum(1 for _ in open(path_df, encoding="utf-8")) == 31

    path_mf = forecast_monthly_naive(monthly_region)
    assert os.path.exists(path_mf)
    # 3 rows + header
    assert sum(1 for _ in open(path_mf, encoding="utf-8")) == 4
