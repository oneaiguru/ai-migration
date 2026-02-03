from datetime import date
import pytest
from scripts.ingest_and_forecast import parse_date, parse_year_month, ym_range


@pytest.mark.spec_id("CLI-001")
def test_parse_date_and_year_month():
    assert parse_date("2024-12-31") == date(2024, 12, 31)
    assert parse_year_month("2024-01") == (2024, 1)
    assert ym_range("2024-11", "2025-02") == ["2024-11", "2024-12", "2025-01", "2025-02"]

