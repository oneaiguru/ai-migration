#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List

REPO_ROOT = Path(__file__).resolve().parents[2]
TRACKER_SRC = REPO_ROOT / "tracker" / "src"
if str(TRACKER_SRC) not in sys.path:
    sys.path.insert(0, str(TRACKER_SRC))

try:
    from tracker.formatting import format_percent as _format_percent_impl
except ModuleNotFoundError:  # pragma: no cover - sandbox fallback

    def _format_percent_impl(value: Any, *, digits: int = 1) -> str:
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            return "n/a"
        if math.isnan(numeric) or math.isinf(numeric):
            return "n/a"
        if math.isclose(numeric, round(numeric), abs_tol=10 ** (-(digits + 1))):
            return f"{int(round(numeric))}%"
        return f"{numeric:.{digits}f}%"


def _format_percent(value: Any, *, digits: int = 1) -> str:
    return _format_percent_impl(value, digits=digits)


def _load_jsonl(path: Path) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except Exception:
                continue
    return rows


def _load_csv(path: Path) -> List[Dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def evaluate_window(data_dir: Path, window: str) -> Dict[str, Any]:
    base = data_dir
    windows = _load_jsonl(base / "windows.jsonl")
    anomalies = _load_jsonl(base / "anomalies.jsonl")
    churn_csv = Path.cwd() / "docs" / "Ledgers" / "Churn_Ledger.csv"
    evidence_csv = Path.cwd() / "docs" / "Ledgers" / "Acceptance_Evidence.csv"

    wrec = next((w for w in windows if (w.get("window") or "") == window), None)
    anomalies_n = sum(1 for a in anomalies if (a.get("window") or "") == window)
    churn_rows = [r for r in _load_csv(churn_csv) if (r.get("window") or "") == window]
    evidence_rows = [r for r in _load_csv(evidence_csv) if (r.get("window_id") or "") == window]

    finalized = bool(wrec)
    outcome_ok = finalized and (str(wrec.get("outcome") or "") in ("pass", "partial"))

    status = "NO-GO"
    reasons: List[str] = []

    if anomalies_n > 0:
        reasons.append(f"anomalies={anomalies_n}")
    if not finalized:
        reasons.append("not-finalized")
    if finalized and not outcome_ok:
        reasons.append(f"outcome={wrec.get('outcome')}")
    if not churn_rows:
        reasons.append("no-churn-row")
    if not evidence_rows:
        reasons.append("no-evidence-row")

    if anomalies_n == 0 and finalized and outcome_ok:
        if churn_rows and evidence_rows:
            status = "GO"
        else:
            status = "SOFT GO"

    criteria = {
        "anomalies": anomalies_n == 0,
        "finalized": finalized,
        "outcome": outcome_ok,
        "churn": bool(churn_rows),
        "evidence": bool(evidence_rows),
    }
    met = sum(1 for ok in criteria.values() if ok)
    total = len(criteria)
    completeness_pct = (met / total * 100.0) if total else 0.0

    return {
        "window": window,
        "status": status,
        "anomalies": anomalies_n,
        "finalized": finalized,
        "outcome": (wrec or {}).get("outcome"),
        "evidence_count": len(evidence_rows),
        "churn_count": len(churn_rows),
        "reasons": reasons,
        "completeness_pct": completeness_pct,
        "completeness_total": total,
        "completeness_met": met,
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Print GO/SOFT GO/NO-GO decision for a tracker window")
    ap.add_argument("--data-dir", default="data/week0/live", help="Tracker data directory")
    ap.add_argument("--window", required=True, help="Window id (e.g., W0-20)")
    args = ap.parse_args(argv)

    data_dir = Path(args.data_dir)
    result = evaluate_window(data_dir, args.window)

    print("Decision Card")
    print(f"  Window:   {result['window']}")
    print(f"  Status:   {result['status']}")
    print(f"  Anoms:    {result['anomalies']}")
    print(f"  Finalized:{result['finalized']}")
    print(f"  Outcome:  {result.get('outcome')}")
    print(f"  Evidence: {result['evidence_count']}")
    print(f"  Churn:    {result['churn_count']}")
    print(
        "  Completeness:{pct} ({met}/{total})".format(
            pct=_format_percent(result.get("completeness_pct"), digits=1),
            met=result.get("completeness_met", 0),
            total=result.get("completeness_total", 0),
        )
    )
    if result["reasons"]:
        print("  Reasons:  " + ", ".join(result["reasons"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
