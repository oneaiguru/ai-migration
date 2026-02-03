from datetime import date, timedelta

import pytest

from src.sites.service_day_adjust import (
    ServiceDayPattern,
    mean_weights_from_sums_and_counts,
    parse_grafik_weekdays,
    pick_top_k_weekdays,
    spikeify_weekly_values,
    week_groups,
    week_groups_split_by_month,
)


@pytest.mark.spec_id("SITE-SVC-001")
def test_spikeify_preserves_week_sum_and_zeros_non_service_days():
    start = date(2025, 6, 2)  # Monday
    dates = [start + timedelta(days=i) for i in range(7)]
    values = [1.0] * 7

    pattern = ServiceDayPattern(
        weekdays=(0, 2),
        weekday_weights=(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0),
    )

    groups = week_groups(dates)
    out = spikeify_weekly_values(dates, values, pattern, groups=groups, decimals=6)

    assert pytest.approx(sum(out), rel=0, abs=1e-9) == 7.0
    assert out[0] == pytest.approx(3.5, rel=0, abs=1e-6)
    assert out[2] == pytest.approx(3.5, rel=0, abs=1e-6)

    for i in (1, 3, 4, 5, 6):
        assert out[i] == 0.0


@pytest.mark.spec_id("SITE-SVC-002")
def test_spikeify_keeps_shape_when_week_has_no_service_days():
    # Only Sat/Sun provided, but pattern expects Monday -> no selected indices.
    start = date(2025, 6, 7)  # Saturday
    dates = [start + timedelta(days=i) for i in range(2)]
    values = [2.0, 3.0]

    pattern = ServiceDayPattern(
        weekdays=(0,),
        weekday_weights=(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0),
    )

    out = spikeify_weekly_values(dates, values, pattern, groups=week_groups(dates), decimals=6)
    assert out == values


@pytest.mark.spec_id("SITE-SVC-003")
def test_pick_top_k_weekdays_and_weights_helpers():
    counts = [10, 0, 5, 5, 1, 0, 0]
    assert pick_top_k_weekdays(counts, k=2) == (0, 2)

    sums = [100.0, 0.0, 50.0, 25.0, 10.0, 0.0, 0.0]
    weights = mean_weights_from_sums_and_counts(sums, counts)
    assert len(weights) == 7
    assert weights[0] == pytest.approx(10.0)
    assert weights[2] == pytest.approx(10.0)
    assert weights[3] == pytest.approx(5.0)


@pytest.mark.spec_id("SITE-SVC-004")
def test_parse_grafik_weekdays():
    assert parse_grafik_weekdays(None) == tuple()
    assert parse_grafik_weekdays("-") == tuple()
    assert parse_grafik_weekdays("Ежедневно") == (0, 1, 2, 3, 4, 5, 6)
    assert parse_grafik_weekdays("пн, ср, пт") == (0, 2, 4)
    assert parse_grafik_weekdays("вт, пт / вт, пт") == (1, 4)


@pytest.mark.spec_id("SITE-SVC-005")
def test_week_groups_split_by_month_breaks_cross_month_iso_weeks():
    dates = [date(2025, 10, 30), date(2025, 10, 31), date(2025, 11, 1), date(2025, 11, 2)]
    groups = week_groups(dates)
    assert len(groups) == 1  # same ISO week

    split_groups = week_groups_split_by_month(dates)
    assert split_groups == [[0, 1], [2, 3]]
