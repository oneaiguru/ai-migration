from __future__ import annotations

from tracker.estimators import compute_efficiency


def _build_window(window_id: str, features: float, capacity: float) -> dict[str, object]:
    return {
        "window": window_id,
        "features": {"codex": features},
        "providers": {
            "codex": {
                "delta": {
                    "weekly_pct": capacity,
                }
            }
        },
    }


def test_efficiency_gates_ci_for_low_sample_size() -> None:
    windows = [
        _build_window("W0-01", 2, 10),
        _build_window("W0-02", 3, 12),
    ]

    reports = compute_efficiency(windows)
    codex_report = next(report for report in reports if report.provider == "codex")

    assert codex_report.sample_size == 2
    assert codex_report.ci_low is None
    assert codex_report.ci_high is None
    assert codex_report.power is None


def test_efficiency_reports_ci_and_power_for_valid_sample() -> None:
    windows = [
        _build_window("W0-11", 2, 10),
        _build_window("W0-12", 4, 8),
        _build_window("W0-13", 1, 6),
    ]

    reports = compute_efficiency(windows)
    codex_report = next(report for report in reports if report.provider == "codex")

    assert codex_report.sample_size == 3
    assert codex_report.ci_low is not None
    assert codex_report.ci_high is not None
    assert codex_report.ci_low <= codex_report.efficiency <= codex_report.ci_high
    assert codex_report.power is not None
    assert 0.0 <= codex_report.power <= 1.0
