#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
from pathlib import Path
from typing import Dict, Tuple, List

import matplotlib

matplotlib.use("Agg")  # headless
import matplotlib.pyplot as plt


def read_monthly(path: Path) -> List[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        return list(r)


def save_histogram_wape(rows: List[dict], out: Path) -> Path:
    vals = []
    for rec in rows:
        try:
            vals.append(float(rec.get("wape") or 0.0))
        except Exception:
            pass
    if not vals:
        vals = [0.0]
    plt.figure(figsize=(6, 4))
    plt.hist(vals, bins=20, color="#007acc", alpha=0.85)
    plt.title("Site Monthly WAPE Distribution")
    plt.xlabel("WAPE")
    plt.ylabel("Count")
    out.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(out)
    plt.close()
    return out


def save_top_bottom_sites(rows: List[dict], out_top: Path, out_bottom: Path, k: int = 10) -> Tuple[Path, Path]:
    # Aggregate per-site WAPE as median-of-monthly-rows
    by_site: Dict[str, List[float]] = {}
    for rec in rows:
        sid = rec.get("site_id") or ""
        try:
            w = float(rec.get("wape") or 0.0)
        except Exception:
            continue
        if sid:
            by_site.setdefault(sid, []).append(w)
    med = []
    for sid, arr in by_site.items():
        if not arr:
            continue
        arrs = sorted(arr)
        med.append((sid, arrs[len(arrs) // 2]))
    med.sort(key=lambda x: x[1])
    top = med[:k]
    bottom = med[-k:][::-1]

    def _bar(data: List[Tuple[str, float]], title: str, outp: Path) -> Path:
        if not data:
            return outp
        names = [sid for sid, _ in data]
        vals = [v for _, v in data]
        plt.figure(figsize=(8, 4))
        plt.barh(names, vals, color="#2ca02c")
        plt.gca().invert_yaxis()
        plt.xlabel("Median WAPE")
        plt.title(title)
        plt.tight_layout()
        outp.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(outp)
        plt.close()
        return outp

    return _bar(top, "Top Sites by Median WAPE (best)", out_top), _bar(bottom, "Worst Sites by Median WAPE", out_bottom)


def write_report_md(outdir: Path, images: List[Path]) -> Path:
    lines = ["# Site Backtest Report", ""]
    for p in images:
        lines.append(f"![{p.stem}]({p.name})")
    rpt = outdir / "REPORT.md"
    rpt.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return rpt


def main():
    outdir = Path(os.environ.get("OUTDIR", "."))
    monthly = Path(os.environ.get("MONTHLY", str(outdir / "scoreboard_site_monthly.csv")))
    if not monthly.exists():
        raise SystemExit(f"Monthly scoreboard not found: {monthly}")
    rows = read_monthly(monthly)
    img1 = save_histogram_wape(rows, outdir / "hist_sites_wape.png")
    img2, img3 = save_top_bottom_sites(rows, outdir / "top_sites_median_wape.png", outdir / "worst_sites_median_wape.png")
    write_report_md(outdir, [img1, img2, img3])
    print("Wrote report images and REPORT.md to", outdir)


if __name__ == "__main__":
    main()

