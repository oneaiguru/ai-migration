#!/usr/bin/env python3
"""
Simple routes recommender (S4 helper)

Inputs:
- --sites-csv: daily_fill_YYYY-MM-DD_to_YYYY-MM-DD.csv (columns: site_id,date,fill_pct,pred_volume_m3,overflow_prob)
- --d-day: YYYY-MM-DD (target day)
- --lookahead: N days (default 1) — currently we evaluate D-day only; parameter kept for future
- --policy: expression using 'risk' (overflow_prob) and 'fill' (fill_pct), e.g. 'risk>=0.8 or fill>=0.8'

Output:
- routes/recommendations_<YYYY-MM-DD>_<policy_name>.csv with columns: site_id,date,fill_pct,overflow_prob,policy,visit

Notes:
- This helper is deterministic, filesystem-only, and does not alter default forecasts.
"""
from __future__ import annotations

import argparse
import csv
import os
from datetime import datetime


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Routes recommendations (flagged helper)")
    p.add_argument("--sites-csv", required=True)
    p.add_argument("--d-day", required=True)
    p.add_argument("--lookahead", type=int, default=1)
    p.add_argument("--policy", default="risk>=0.8 or fill>=0.8")
    p.add_argument("--outdir", default="routes")
    return p.parse_args()


def policy_name(expr: str) -> str:
    # normalize to short name
    return "strict" if expr.strip().replace(" ", "") == "risk>=0.8orfill>=0.8" else "showcase" if expr.strip().replace(" ", "") == "fill>=0.5" else "custom"


def eval_policy(expr: str, fill: float, risk: float) -> bool:
    # very small safe eval: allowed names only
    allowed = {"fill": fill, "risk": risk}
    expr2 = expr.replace("and", " and ").replace("or", " or ")
    try:
        return bool(eval(expr2, {"__builtins__": {}}, allowed))
    except Exception:
        return False


def main():
    args = parse_args()
    dday = datetime.strptime(args.d_day, "%Y-%m-%d").date()
    os.makedirs(args.outdir, exist_ok=True)

    rows = []
    with open(args.sites_csv, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            if (rec.get("date") or "") != dday.isoformat():
                continue
            try:
                fill = float(rec.get("fill_pct") or 0.0)
            except Exception:
                fill = 0.0
            try:
                risk = float(rec.get("overflow_prob") or 0.0)
            except Exception:
                risk = 0.0
            visit = 1 if eval_policy(args.policy, fill, risk) else 0
            rows.append({
                "site_id": rec.get("site_id"),
                "date": dday.isoformat(),
                "fill_pct": fill,
                "overflow_prob": risk,
                "policy": args.policy,
                "visit": visit,
            })

    name = policy_name(args.policy)
    out = os.path.join(args.outdir, f"recommendations_{name}_{dday.isoformat()}.csv")
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["site_id", "date", "fill_pct", "overflow_prob", "policy", "visit"])
        w.writeheader()
        for r in rows:
            w.writerow(r)
    print("Wrote:", out)


if __name__ == "__main__":
    main()
