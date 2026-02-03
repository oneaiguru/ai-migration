from __future__ import annotations

import argparse
from datetime import date, timedelta
from pathlib import Path

from src.sites.rolling_backtest import run_backtest


def _parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"Invalid date: {value}") from exc


def _build_cutoff_dates(start: date, end: date, step_days: int) -> list[date]:
    dates = []
    cursor = start
    while cursor <= end:
        dates.append(cursor)
        cursor += timedelta(days=step_days)
    return dates


def main() -> None:
    parser = argparse.ArgumentParser(description="Rolling forecast backtest across cutoff dates.")
    parser.add_argument("--start-cutoff", type=_parse_date, required=True)
    parser.add_argument("--end-cutoff", type=_parse_date, required=True)
    parser.add_argument("--step-days", type=int, default=7)
    parser.add_argument("--horizon-days", type=int, default=7)
    parser.add_argument("--sample-sites", type=str, default="")
    parser.add_argument("--out", type=str, default="")
    args = parser.parse_args()

    cutoff_dates = _build_cutoff_dates(args.start_cutoff, args.end_cutoff, args.step_days)
    sample_sites = [s.strip() for s in args.sample_sites.split(",") if s.strip()] or None

    df = run_backtest(
        cutoff_dates=cutoff_dates,
        horizon_days=args.horizon_days,
        sample_sites=sample_sites,
    )

    if args.out:
        out_path = Path(args.out)
    else:
        out_path = Path(
            f"reports/rolling_backtest_{args.start_cutoff.isoformat()}_{args.end_cutoff.isoformat()}_h{args.horizon_days}.csv"
        )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Wrote backtest results to {out_path}")


if __name__ == "__main__":
    main()
