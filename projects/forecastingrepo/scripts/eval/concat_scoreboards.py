#!/usr/bin/env python3
"""
Concatenate monthly scoreboards from multiple backtest runs and compute
percentiles + provisional thresholds (T1/T2). Also saves simple histograms.

Outputs:
- <outdir>/scoreboard_consolidated.csv
- <outdir>/SUMMARY.md (p50/p70/p90, suggested T1/T2)
- <outdir>/hist_region.png, <outdir>/hist_district_micro.png
- docs/contract/thresholds_provisional.md (overwritten)

No runtime behavior changes; analysis-only.
"""
from __future__ import annotations

import argparse
import csv
import math
import re
import subprocess
from pathlib import Path
from typing import List, Tuple

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

EPS = 1e-9


def discover_scoreboards(inputs: List[str]) -> List[Tuple[str, Path]]:
    out: List[Tuple[str, Path]] = []
    rx = re.compile(r"backtest_(\d{4}-\d{2}-\d{2})")
    for p in inputs:
        pth = Path(p)
        if pth.is_file() and pth.name == "scoreboard_monthly.csv":
            m = rx.search(str(pth.parent))
            label = m.group(1) if m else "unknown"
            out.append((label, pth))
        elif pth.is_dir():
            f = pth / "scoreboard_monthly.csv"
            if f.exists():
                m = rx.search(str(pth))
                label = m.group(1) if m else "unknown"
                out.append((label, f))
    return out


def read_rows_stdlib(label: str, path: Path) -> List[dict]:
    rows: List[dict] = []
    with path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            rec = {k.lower(): v for k, v in rec.items()}
            rec["cutoff"] = label
            # Ensure numeric strings exist
            for k in ("actual", "forecast"):
                try:
                    rec[k] = float(rec.get(k, 0.0))
                except Exception:
                    rec[k] = 0.0
            if "wape" not in rec:
                a = abs(float(rec.get("actual", 0.0)))
                yhat = float(rec.get("forecast", 0.0))
                rec["wape"] = abs(yhat - a) / (a + EPS)
            rows.append(rec)
    return rows


def percentiles_std(values: List[float]) -> Tuple[float | None, float | None, float | None]:
    if not values:
        return None, None, None
    xs = sorted(values)
    def pct(p: float) -> float:
        k = (len(xs) - 1) * p
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return xs[int(k)]
        return xs[f] + (xs[c] - xs[f]) * (k - f)
    return pct(0.50), pct(0.70), pct(0.90)


def plot_hist(out_png: Path, values: List[float], title: str) -> None:
    fig, ax = plt.subplots()
    if values:
        ax.hist([v * 100.0 for v in values], bins=20)
        ax.set_xlabel("WAPE, %")
        ax.set_ylabel("Count")
    else:
        ax.text(0.5, 0.5, "No data", ha="center")
    ax.set_title(title)
    fig.savefig(str(out_png), bbox_inches="tight")
    plt.close(fig)


def get_git_sha() -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], stderr=subprocess.DEVNULL, text=True).strip()
    except Exception:
        return "n/a"


def main() -> None:
    ap = argparse.ArgumentParser(description="Consolidate backtest scoreboards and compute thresholds")
    ap.add_argument("--inputs", nargs="+", required=False, help="Backtest dirs or scoreboard_monthly.csv files")
    ap.add_argument("--outdir", default=None)
    args = ap.parse_args()

    inputs = args.inputs or sorted([str(p) for p in Path("reports").glob("backtest_*")])
    pairs = discover_scoreboards(inputs)
    if not pairs:
        raise SystemExit("[ERROR] No scoreboard_monthly.csv found in inputs.")

    outdir = Path(args.outdir or f"reports/backtest_consolidated_{Path.cwd().name}")
    outdir.mkdir(parents=True, exist_ok=True)

    # Read & concat (stdlib-only path)
    rows: List[dict] = []
    for label, p in pairs:
        rows.extend(read_rows_stdlib(label, p))
    # Save consolidated CSV
    cons_csv = outdir / "scoreboard_consolidated.csv"
    with cons_csv.open("w", newline="", encoding="utf-8") as f:
        # Use keys from first row
        fieldnames = list(rows[0].keys()) if rows else ["cutoff","level","district","year_month","actual","forecast","wape"]
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow(r)
    reg_wapes = [float(r["wape"]) for r in rows if str(r.get("level","")).lower() == "region"]
    # compute district-micro per (cutoff, year_month)
    acc: dict[Tuple[str,str], Tuple[float,float]] = {}
    for r in rows:
        if str(r.get("level","")).lower() != "district":
            continue
        key = (str(r.get("cutoff","")), str(r.get("year_month","")))
        a = abs(float(r.get("actual", 0.0)))
        y = float(r.get("forecast", 0.0))
        err = abs(y - a)
        se, sa = acc.get(key, (0.0, 0.0))
        acc[key] = (se + err, sa + a)
    dm_wapes = [(se / (sa if sa != 0 else EPS)) for (se, sa) in acc.values()]
    rp50, rp70, rp90 = percentiles_std(reg_wapes)
    dp50, dp70, dp90 = percentiles_std(dm_wapes)

    # Thresholds
    T1 = None if rp70 is None else math.ceil(rp70 * 100 + 2)
    T2 = None if dp70 is None else math.ceil(dp70 * 100 + 3)

    # Plots
    plot_hist(outdir / "hist_region.png", reg_wapes, "Region Monthly WAPE")
    plot_hist(outdir / "hist_district_micro.png", dm_wapes, "District-Micro Monthly WAPE")

    # SUMMARY.md
    def pct_to_str(x: float | None) -> str:
        return "n/a" if x is None else f"{x*100:.2f}%"

    summary = outdir / "SUMMARY.md"
    with summary.open("w", encoding="utf-8") as f:
        f.write("# Consolidated Backtest Summary\n\n")
        f.write(f"- Inputs: {', '.join(str(p) for _, p in pairs)}\n")
        f.write(f"- Consolidated CSV: `{cons_csv}`\n\n")
        f.write("## Region Monthly WAPE\n")
        f.write(f"- p50: {pct_to_str(rp50)}\n")
        f.write(f"- p70: {pct_to_str(rp70)}\n")
        f.write(f"- p90: {pct_to_str(rp90)}\n\n")
        f.write("## District-Micro Monthly WAPE\n")
        f.write(f"- p50: {pct_to_str(dp50)}\n")
        f.write(f"- p70: {pct_to_str(dp70)}\n")
        f.write(f"- p90: {pct_to_str(dp90)}\n\n")
        f.write("## Suggested Provisional Thresholds\n")
        f.write(f"- T1 (region) = ceil(p70 + 2pp) → {('n/a' if T1 is None else str(T1)+'%')}\n")
        f.write(f"- T2 (district micro) = ceil(p70 + 3pp) → {('n/a' if T2 is None else str(T2)+'%')}\n")

    # thresholds_provisional.md
    thr_dir = Path("docs/contract")
    thr_dir.mkdir(parents=True, exist_ok=True)
    thr_file = thr_dir / "thresholds_provisional.md"
    with thr_file.open("w", encoding="utf-8") as f:
        f.write("# Provisional Forecast Thresholds\n\n")
        f.write(f"- Commit: `{get_git_sha()}`\n")
        f.write("- Inputs:\n")
        for label, p in pairs:
            f.write(f"  - `{p}` (cutoff: {label})\n")
        f.write("\n## Region Monthly WAPE\n")
        f.write(f"- p50: {pct_to_str(rp50)}  p70: {pct_to_str(rp70)}  p90: {pct_to_str(rp90)}\n")
        f.write("\n## District-Micro Monthly WAPE\n")
        f.write(f"- p50: {pct_to_str(dp50)}  p70: {pct_to_str(dp70)}  p90: {pct_to_str(dp90)}\n")
        f.write("\n## Suggested Thresholds\n")
        f.write(f"- **T1 (region)** = ceil(p70 + 2pp) → {('n/a' if T1 is None else str(T1)+'%')}\n")
        f.write(f"- **T2 (district micro)** = ceil(p70 + 3pp) → {('n/a' if T2 is None else str(T2)+'%')}\n")

    print(f"[OK] Wrote consolidated CSV → {cons_csv}")
    print(f"[OK] Wrote summary → {summary}")
    print(f"[OK] Wrote thresholds → {thr_file}")


if __name__ == "__main__":
    main()
