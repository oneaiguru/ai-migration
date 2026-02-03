import pytest
from datetime import date

from src.sites.schema import (
    coerce_date,
    ensure_unique_keys,
    ensure_nonnegative_volume,
    SiteServiceRow,
)


@pytest.mark.spec_id("SCHEMA-COERCE-DATE")
def test_coerce_date_multiple_formats_and_errors():
    # ISO
    assert coerce_date("2025-01-02").isoformat() == "2025-01-02"
    # dd.mm.yyyy
    assert coerce_date("03.01.2025").isoformat() == "2025-01-03"
    # dd/mm/yyyy
    assert coerce_date("04/01/2025").isoformat() == "2025-01-04"
    # yyyy/mm/dd
    assert coerce_date("2025/01/05").isoformat() == "2025-01-05"

    # datetime to date
    import datetime as _dt
    assert coerce_date(_dt.datetime(2025, 1, 6, 12, 0, 0)).isoformat() == "2025-01-06"
    # already date returns same object
    d = date(2025, 1, 7)
    assert coerce_date(d) == d

    # invalid types and strings
    with pytest.raises(ValueError):
        coerce_date("not-a-date")
    with pytest.raises(TypeError):
        coerce_date(12345)


@pytest.mark.spec_id("SCHEMA-UNIQUE-AND-NONNEG")
def test_ensure_unique_and_nonnegative():
    rows = [
        SiteServiceRow(site_id="S1", service_dt=date(2025, 1, 1), service_time=None, collect_volume_m3=10.0),
        SiteServiceRow(site_id="S1", service_dt=date(2025, 1, 2), service_time="AM", collect_volume_m3=0.0),
    ]
    # Ok: unique keys
    ensure_unique_keys(rows)
    ensure_nonnegative_volume(rows)

    # Duplicate key
    dup = rows + [SiteServiceRow(site_id="S1", service_dt=date(2025, 1, 1), service_time=None, collect_volume_m3=5.0)]
    with pytest.raises(ValueError):
        ensure_unique_keys(dup)

    # Negative mass
    bad = rows + [SiteServiceRow(site_id="S1", service_dt=date(2025, 1, 3), service_time=None, collect_volume_m3=-1.0)]
    with pytest.raises(ValueError):
        ensure_nonnegative_volume(bad)
