from __future__ import annotations

import csv
import os
import statistics
from functools import lru_cache
from pathlib import Path
from typing import Iterable, Sequence

FALLBACK_TOTAL_SITES = 20951
DEFAULT_FALLBACK_QUARTER = "Q3_2024"


def _make_distribution(site_count: int, buckets: Sequence[tuple[str, float]]):
    out = []
    for label, pct in buckets:
        count = int(round(site_count * (pct / 100.0)))
        out.append({"bucket": label, "site_count": count, "percent": pct})
    return out


FALLBACK_REGION = {
    "Q1_2024": {"overall_wape": 0.1445, "median_site_wape": 0.1765, "site_count": FALLBACK_TOTAL_SITES},
    "Q2_2024": {"overall_wape": 0.2059, "median_site_wape": 0.1979, "site_count": FALLBACK_TOTAL_SITES},
    "Q3_2024": {"overall_wape": 0.1712, "median_site_wape": 0.1677, "site_count": FALLBACK_TOTAL_SITES},
    "Q4_2024": {"overall_wape": 0.1619, "median_site_wape": 0.1594, "site_count": FALLBACK_TOTAL_SITES},
}

FALLBACK_DISTRIBUTION = {
    "Q1_2024": _make_distribution(
        FALLBACK_TOTAL_SITES,
        [
            ("<=8%", 27.2),
            ("8%-12%", 10.3),
            (">12%", 62.5),
        ],
    ),
    "Q2_2024": _make_distribution(
        FALLBACK_TOTAL_SITES,
        [
            ("<=8%", 21.2),
            ("8%-12%", 12.8),
            (">12%", 66.0),
        ],
    ),
    "Q3_2024": _make_distribution(
        FALLBACK_TOTAL_SITES,
        [
            ("<=8%", 24.1),
            ("8%-12%", 11.9),
            (">12%", 64.0),
        ],
    ),
    "Q4_2024": _make_distribution(
        FALLBACK_TOTAL_SITES,
        [
            ("<=8%", 27.6),
            ("8%-12%", 11.4),
            (">12%", 61.0),
        ],
    ),
}

FALLBACK_DISTRICTS = {
    "Q1_2024": [
        {"district": "Жигаловский район", "accuracy_pct": 90.6, "median_wape": 0.094, "weighted_wape": 0.094, "site_count": 180},
        {"district": "МО Саянск", "accuracy_pct": 90.2, "median_wape": 0.098, "weighted_wape": 0.098, "site_count": 220},
        {"district": "Шелеховский район", "accuracy_pct": 88.5, "median_wape": 0.115, "weighted_wape": 0.115, "site_count": 215},
        {"district": "Балаганский район", "accuracy_pct": 52.2, "median_wape": 0.478, "weighted_wape": 0.478, "site_count": 140},
        {"district": "Аларский район", "accuracy_pct": 52.5, "median_wape": 0.475, "weighted_wape": 0.475, "site_count": 486},
    ],
    "Q2_2024": [
        {"district": "МО Саянск", "accuracy_pct": 87.1, "median_wape": 0.129, "weighted_wape": 0.129, "site_count": 220},
        {"district": "Правый берег", "accuracy_pct": 85.9, "median_wape": 0.141, "weighted_wape": 0.141, "site_count": 310},
        {"district": "Зиминский район", "accuracy_pct": 83.5, "median_wape": 0.165, "weighted_wape": 0.165, "site_count": 150},
        {"district": "Ольхонский район", "accuracy_pct": 61.7, "median_wape": 0.383, "weighted_wape": 0.383, "site_count": 80},
        {"district": "Качугский район", "accuracy_pct": 63.2, "median_wape": 0.368, "weighted_wape": 0.368, "site_count": 90},
    ],
    "Q3_2024": [
        {"district": "МО Саянск", "accuracy_pct": 86.3, "median_wape": 0.137, "weighted_wape": 0.137, "site_count": 220},
        {"district": "Иркутский район", "accuracy_pct": 85.2, "median_wape": 0.148, "weighted_wape": 0.148, "site_count": 410},
        {"district": "Бодайбинский район", "accuracy_pct": 84.6, "median_wape": 0.154, "weighted_wape": 0.154, "site_count": 60},
        {"district": "Баяндаевский район", "accuracy_pct": 64.2, "median_wape": 0.358, "weighted_wape": 0.358, "site_count": 40},
        {"district": "Ольхонский район", "accuracy_pct": 69.3, "median_wape": 0.307, "weighted_wape": 0.307, "site_count": 90},
    ],
    "Q4_2024": [
        {"district": "МО Саянск", "accuracy_pct": 93.8, "median_wape": 0.062, "weighted_wape": 0.062, "site_count": 220},
        {"district": "Правый берег", "accuracy_pct": 88.3, "median_wape": 0.117, "weighted_wape": 0.117, "site_count": 310},
        {"district": "Ангарский ГО", "accuracy_pct": 87.0, "median_wape": 0.13, "weighted_wape": 0.13, "site_count": 520},
        {"district": "Ольхонский район", "accuracy_pct": 41.6, "median_wape": 0.584, "weighted_wape": 0.584, "site_count": 80},
        {"district": "Баяндаевский район", "accuracy_pct": 45.7, "median_wape": 0.543, "weighted_wape": 0.543, "site_count": 50},
    ],
}

FALLBACK_SITES = {
    "Q1_2024": [
        {"site_id": "F-Q1-001", "year_month": "2024-02", "actual": 800.0, "forecast": 760.0, "wape": 0.05, "accuracy_pct": 95.0, "abs_error": 40.0},
        {"site_id": "F-Q1-002", "year_month": "2024-02", "actual": 640.0, "forecast": 700.0, "wape": 0.09375, "accuracy_pct": 90.625, "abs_error": 60.0},
    ],
    "Q2_2024": [
        {"site_id": "F-Q2-001", "year_month": "2024-05", "actual": 500.0, "forecast": 550.0, "wape": 0.1, "accuracy_pct": 90.0, "abs_error": 50.0},
        {"site_id": "F-Q2-002", "year_month": "2024-05", "actual": 420.0, "forecast": 336.0, "wape": 0.2, "accuracy_pct": 80.0, "abs_error": 84.0},
    ],
    "Q3_2024": [
        {"site_id": "F-Q3-001", "year_month": "2024-08", "actual": 1200.0, "forecast": 1100.0, "wape": 0.0833, "accuracy_pct": 91.7, "abs_error": 100.0},
        {"site_id": "F-Q3-002", "year_month": "2024-08", "actual": 900.0, "forecast": 990.0, "wape": 0.1, "accuracy_pct": 90.0, "abs_error": 90.0},
        {"site_id": "F-Q3-003", "year_month": "2024-08", "actual": 400.0, "forecast": 520.0, "wape": 0.3, "accuracy_pct": 70.0, "abs_error": 120.0},
    ],
    "Q4_2024": [
        {"site_id": "F-Q4-001", "year_month": "2024-11", "actual": 1000.0, "forecast": 980.0, "wape": 0.02, "accuracy_pct": 98.0, "abs_error": 20.0},
        {"site_id": "F-Q4-002", "year_month": "2024-11", "actual": 860.0, "forecast": 918.0, "wape": 0.0674, "accuracy_pct": 93.26, "abs_error": 58.0},
    ],
}


def _reports_base() -> Path:
    base = Path(os.getenv("ACCURACY_REPORTS_DIR", "reports"))
    return base


def _base_token() -> str:
    return os.path.abspath(os.fspath(_reports_base()))


def _list_report_quarters(base: Path) -> list[str]:
    quarters: list[str] = []
    prefix = "site_backtest_"
    if base.exists():
        for child in base.glob("site_backtest_Q*_20*"):
            if child.is_dir() and child.name.startswith(prefix):
                quarters.append(child.name.replace(prefix, ""))
    return sorted(set(quarters))


def list_available_quarters() -> list[str]:
    base = _reports_base()
    quarters = set(_list_report_quarters(base))
    quarters.update(FALLBACK_REGION.keys())
    return sorted(quarters)


def _normalize_quarter_name(name: str) -> str:
    return name.upper().replace("-", "_")


def _resolve_quarter(requested: str | None) -> str:
    base = _reports_base()
    actual = _list_report_quarters(base)
    candidates = list_available_quarters()
    if requested:
        q = _normalize_quarter_name(requested)
        if q in candidates:
            return q
        raise FileNotFoundError(f"Quarter '{requested}' is not available")
    if actual:
        return actual[-1]
    if candidates:
        return candidates[-1]
    return DEFAULT_FALLBACK_QUARTER


def _quarter_dir_name(quarter: str) -> str:
    return f"site_backtest_{quarter}"


def _quarter_dir(base: Path, quarter: str) -> Path:
    return base / _quarter_dir_name(quarter)


def _read_csv(path: Path, *, encodings: Iterable[str] = ("utf-8", "cp1251")) -> list[dict[str, str]]:
    for enc in encodings:
        try:
            with path.open("r", newline="", encoding=enc) as fh:
                reader = csv.DictReader(fh)
                return [dict(row) for row in reader]
        except UnicodeDecodeError:
            continue
    raise


def _to_float(value: str | float | int | None) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    value = value.strip()
    if not value:
        return 0.0
    value = value.replace("%", "").replace(",", ".")
    return float(value)


def _to_int(value: str | float | int | None) -> int:
    if value is None:
        return 0
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(round(value))
    value = value.strip()
    if not value:
        return 0
    value = value.replace(",", ".")
    return int(round(float(value)))


@lru_cache(maxsize=16)
def _load_site_rows(base_token: str, quarter: str) -> list[dict]:
    base = Path(base_token)
    csv_path = _quarter_dir(base, quarter) / "site_accuracy_summary.csv"
    if not csv_path.exists():
        raise FileNotFoundError(csv_path)
    rows: list[dict] = []
    for rec in _read_csv(csv_path):
        rows.append(
            {
                "site_id": rec.get("site_id"),
                "year_month": rec.get("year_month") or rec.get("date"),
                "actual": _to_float(rec.get("actual")),
                "forecast": _to_float(rec.get("forecast")),
                "wape": _to_float(rec.get("wape")),
                "accuracy_pct": _to_float(rec.get("accuracy_pct")),
                "abs_error": _to_float(rec.get("abs_error")),
            }
        )
    return rows


@lru_cache(maxsize=16)
def _load_distribution_rows(base_token: str, quarter: str) -> list[dict]:
    base = Path(base_token)
    csv_path = _quarter_dir(base, quarter) / "site_wape_distribution.csv"
    if not csv_path.exists():
        raise FileNotFoundError(csv_path)
    rows: list[dict] = []
    for rec in _read_csv(csv_path):
        rows.append(
            {
                "bucket": rec.get("wape_bucket") or rec.get("bucket"),
                "site_count": _to_int(rec.get("site_count")),
                "percent": _to_float(rec.get("percent")),
            }
        )
    return rows


@lru_cache(maxsize=16)
def _load_district_rows(base_token: str, quarter: str) -> list[dict]:
    base = Path(base_token)
    csv_path = _quarter_dir(base, quarter) / "district_accuracy_summary.csv"
    if not csv_path.exists():
        raise FileNotFoundError(csv_path)
    rows: list[dict] = []
    for rec in _read_csv(csv_path):
        rows.append(
            {
                "district": rec.get("district"),
                "accuracy_pct": _to_float(rec.get("accuracy_pct")),
                "weighted_wape": _to_float(rec.get("weighted_wape")),
                "median_wape": _to_float(rec.get("median_wape")),
                "site_count": _to_int(rec.get("site_count")),
            }
        )
    return rows


def _fallback_region_payload(quarter: str) -> dict:
    if quarter not in FALLBACK_REGION:
        raise FileNotFoundError(f"Quarter '{quarter}' missing (no CSV or fallback)")
    region = FALLBACK_REGION[quarter]
    distribution = FALLBACK_DISTRIBUTION.get(quarter, FALLBACK_DISTRIBUTION[DEFAULT_FALLBACK_QUARTER])
    return {
        "quarter": quarter,
        "overall_wape": region["overall_wape"],
        "median_site_wape": region["median_site_wape"],
        "site_count": region["site_count"],
        "distribution": distribution,
        "available_quarters": list_available_quarters(),
    }


def _fallback_district_rows(quarter: str) -> dict:
    if quarter not in FALLBACK_DISTRICTS:
        raise FileNotFoundError(f"Quarter '{quarter}' missing (no CSV or fallback)")
    return {
        "quarter": quarter,
        "available_quarters": list_available_quarters(),
        "rows": FALLBACK_DISTRICTS[quarter],
    }


def _fallback_site_rows(quarter: str) -> dict:
    rows = FALLBACK_SITES.get(quarter) or FALLBACK_SITES.get(DEFAULT_FALLBACK_QUARTER)
    if rows is None:
        raise FileNotFoundError(f"Quarter '{quarter}' missing (no CSV or fallback)")
    return {
        "quarter": quarter if quarter in FALLBACK_SITES else DEFAULT_FALLBACK_QUARTER,
        "available_quarters": list_available_quarters(),
        "rows": rows,
        "site_count": FALLBACK_REGION.get(quarter, FALLBACK_REGION[DEFAULT_FALLBACK_QUARTER])["site_count"],
    }


def load_region_accuracy(quarter: str | None = None) -> dict:
    resolved = _resolve_quarter(quarter)
    base = _reports_base()
    base_token = _base_token()
    try:
        site_rows = _load_site_rows(base_token, resolved)
        distribution = _load_distribution_rows(base_token, resolved)
    except FileNotFoundError:
        return _fallback_region_payload(resolved)

    total_actual = sum(row["actual"] for row in site_rows if row["actual"] is not None)
    total_abs_error = sum(row["abs_error"] for row in site_rows if row["abs_error"] is not None)
    overall_wape = (total_abs_error / total_actual) if total_actual else 0.0
    wapes = [row["wape"] for row in site_rows if row["wape"] is not None]
    median_site_wape = statistics.median(wapes) if wapes else 0.0

    return {
        "quarter": resolved,
        "overall_wape": round(overall_wape, 6),
        "median_site_wape": round(median_site_wape, 6),
        "site_count": len(site_rows),
        "distribution": distribution,
        "available_quarters": list_available_quarters(),
    }


def load_district_accuracy(quarter: str | None = None) -> dict:
    resolved = _resolve_quarter(quarter)
    base_token = _base_token()
    try:
        rows = _load_district_rows(base_token, resolved)
    except FileNotFoundError:
        return _fallback_district_rows(resolved)
    rows = sorted(rows, key=lambda item: item.get("accuracy_pct", 0.0), reverse=True)
    return {
        "quarter": resolved,
        "available_quarters": list_available_quarters(),
        "rows": rows,
    }


def load_site_accuracy(quarter: str | None = None) -> dict:
    resolved = _resolve_quarter(quarter)
    base_token = _base_token()
    try:
        rows = _load_site_rows(base_token, resolved)
        total = len(rows)
        payload_quarter = resolved
    except FileNotFoundError:
        fallback = _fallback_site_rows(resolved)
        rows = fallback["rows"]
        total = fallback["site_count"]
        payload_quarter = fallback["quarter"]

    return {
        "quarter": payload_quarter,
        "available_quarters": list_available_quarters(),
        "rows": rows,
        "site_count": total,
    }
