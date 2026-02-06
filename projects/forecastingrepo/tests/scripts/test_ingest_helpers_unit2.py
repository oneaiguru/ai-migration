from datetime import date

import scripts.ingest_and_forecast as ing


def test_col_index_roundtrip_basic():
    for idx in [1, 2, 25, 26, 27, 52, 53, 702, 703, 704]:
        letters = ing.index_to_col_letters(idx)
        assert ing.col_letters_to_index(letters) == idx


def test_days_in_month_and_month_iter():
    assert ing.days_in_month(2024, 2) == 29  # leap year
    months = list(ing.month_iter(date(2024, 10, 1), date(2024, 12, 31)))
    assert months == [(2024, 10), (2024, 11), (2024, 12)]


def test_build_day_column_mapping_two_months():
    # Simulate header cells: columns 10..70 labeled '1'..'61' (31+30 days)
    header = {i: str(i - 9) for i in range(10, 71)}  # 61 sequential numeric labels
    mapping = ing.build_day_column_mapping(header, date(2024, 10, 1), date(2024, 11, 30))
    # Expect 61 days from 2024-10-01 to 2024-11-30
    assert len(mapping) == 61
    assert mapping[0][0] == date(2024, 10, 1)
    assert mapping[-1][0] == date(2024, 11, 30)


def test_to_float_variants():
    assert ing.to_float("1.25") == 1.25
    assert ing.to_float("1,25") == 1.25
    assert ing.to_float(None) is None
    assert ing.to_float("bad") is None


def test_ym_and_date_helpers(tmp_path):
    # ym_range and helpers
    out = ing.ym_range("2024-10", "2025-01")
    assert out == ["2024-10", "2024-11", "2024-12", "2025-01"]
    # daterange length
    days = ing.daterange(date(2025, 1, 1), date(2025, 1, 5))
    assert len(days) == 5
    # sha256_of_file
    p = tmp_path / "t.txt"; p.write_text("hello", encoding="utf-8")
    h = ing.sha256_of_file(str(p))
    assert len(h) == 64
    # get_git_commit returns str or None; should not raise
    _ = ing.get_git_commit()


def test_load_csv_helpers(tmp_path):
    d = tmp_path / "daily.csv"
    d.write_text("date,district,actual_m3\n2024-01-01,D1,1\n", encoding="utf-8")
    m = tmp_path / "monthly.csv"
    m.write_text("year_month,district,actual_m3\n2024-01,D1,2\n", encoding="utf-8")
    daily = ing.load_daily_csv(str(d))
    monthly = ing.load_monthly_csv(str(m))
    assert daily and monthly


def test_run_phase0_methods_error(tmp_path):
    # Minimal fixtures
    d = tmp_path / "daily.csv"; d.write_text("date,district,actual_m3\n2024-01-01,D1,1\n", encoding="utf-8")
    m = tmp_path / "monthly.csv"; m.write_text("year_month,district,actual_m3\n2024-01,D1,2\n", encoding="utf-8")
    args = type("Args", (), {
        "methods": "daily=foo,monthly=bar",  # invalid pair triggers error path
        "scopes": "region,districts",
        "train_until": "2024-01-31",
        "daily_csv": str(d),
        "monthly_csv": str(m),
        "outdir": str(tmp_path / "deliveries"),
        "daily_window": ["2024-02-01:2024-02-02"],
        "monthly_window": ["2024-02:2024-02"],
    })
    import pytest
    with pytest.raises(SystemExit):
        ing.run_phase0_forecast(args)


def test_run_phase0_no_districts_exits(tmp_path):
    # daily is outside cutoff so no training districts remain
    d = tmp_path / "daily.csv"; d.write_text("date,district,actual_m3\n2024-02-01,D1,1\n", encoding="utf-8")
    m = tmp_path / "monthly.csv"; m.write_text("year_month,district,actual_m3\n2024-01,D1,2\n", encoding="utf-8")
    args = type("Args", (), {
        "methods": "daily=weekday_mean,monthly=last3m_mean",
        "scopes": "region,districts",
        "train_until": "2024-01-01",
        "daily_csv": str(d),
        "monthly_csv": str(m),
        "outdir": str(tmp_path / "deliveries"),
        "daily_window": ["2024-02-01:2024-02-02"],
        "monthly_window": ["2024-02:2024-02"],
    })
    import pytest
    with pytest.raises(SystemExit):
        ing.run_phase0_forecast(args)
