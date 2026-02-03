"""Tests for wide report utilities."""
import math
from datetime import date

import pandas as pd


def test_build_date_columns_respects_boundaries():
    from src.sites.wide_report import build_date_columns

    dates = build_date_columns(date(2025, 6, 15), date(2025, 6, 20))

    assert len(dates) == 6
    assert dates[0] == date(2025, 6, 15)
    assert dates[-1] == date(2025, 6, 20)


def test_read_wide_report_handles_bom_header(tmp_path):
    from src.sites.wide_report import read_wide_report

    path = tmp_path / "forecast_2025-06-01_2025-06-02.csv"
    path.write_text("\ufeffКод КП;1;2\nsite1;10,0;20,0\n", encoding="utf-8")

    df = read_wide_report(path, date(2025, 6, 1), date(2025, 6, 2), "forecast_m3")

    assert len(df) == 2
    assert set(df["site_id"]) == {"site1"}


def test_read_wide_report_accepts_padded_days(tmp_path):
    from src.sites.wide_report import read_wide_report

    path = tmp_path / "forecast_2025-06-01_2025-06-02.csv"
    path.write_text("Код КП;01;02;\nsite1;10,0;20,0\n", encoding="utf-8")

    df = read_wide_report(path, date(2025, 6, 1), date(2025, 6, 2), "forecast_m3")

    assert len(df) == 2
    assert set(df["date"]) == {"2025-06-01", "2025-06-02"}


def test_write_wide_report_blanks_nan(tmp_path):
    from src.sites.wide_report import write_wide_report

    df = pd.DataFrame(
        {
            "site_id": ["site1", "site1"],
            "date": ["2025-06-01", "2025-06-02"],
            "forecast_m3": [10.0, math.nan],
        }
    )
    output_path = tmp_path / "wide.csv"

    write_wide_report(df, output_path, date(2025, 6, 1), date(2025, 6, 2), "forecast_m3")

    content = output_path.read_text(encoding="utf-8")
    assert "nan" not in content.lower()
    row = content.splitlines()[1].split(";")
    assert row[2] == ""
