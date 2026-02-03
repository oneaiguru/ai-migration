#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Optional


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _fmt_amount(value: Optional[float]) -> str:
    try:
        num = float(value or 0.0)
    except Exception:
        num = 0.0
    return f"{num:,.2f}"


def build_reconciliation_markdown(entries: List[Dict[str, Any]]) -> str:
    """Build a Markdown summary from reconciliation JSON entries."""
    lines: List[str] = []
    lines.append("# Export vs Bank Reconciliation (2023–2024)")
    lines.append("")

    # Top-level summary table
    lines.append("| Quarter | Reported export | Statements sum | Difference | Status |")
    lines.append("| --- | --- | --- | --- | --- |")
    for entry in entries:
        q = entry.get("quarter_id") or entry.get("report_file")
        reported = _fmt_amount(entry.get("reported_amount"))
        total = _fmt_amount(entry.get("transactions_sum"))
        diff = _fmt_amount(entry.get("difference"))
        status = entry.get("status", "")
        lines.append(f"| {q} | {reported} | {total} | {diff} | {status} |")
    lines.append("")

    # Detailed sections for non-matching quarters
    for entry in entries:
        status = entry.get("status", "")
        if status == "match":
            continue
        q = entry.get("quarter_id") or entry.get("report_file")
        lines.append(f"## {q} — {status}")
        lines.append("")
        lines.append(f"- Reported export amount: {_fmt_amount(entry.get('reported_amount'))}")
        lines.append(f"- Statements sum: {_fmt_amount(entry.get('transactions_sum'))}")
        lines.append(f"- Difference: {_fmt_amount(entry.get('difference'))}")
        lines.append("")

        txns = entry.get("transactions") or []
        if not txns:
            lines.append("No matched transactions in this quarter window.")
            lines.append("")
            continue

        lines.append("### Matched transactions")
        lines.append("")
        lines.append("| Date | Amount | Currency | Description | Statement file | Row |")
        lines.append("| --- | --- | --- | --- | --- | --- |")
        for t in txns:
            dt = t.get("txn_date") or t.get("value_date") or ""
            amt = _fmt_amount(t.get("amount"))
            cur = t.get("currency") or ""
            desc = (t.get("description") or "").replace("\n", " ")
            sfile = t.get("statement_file") or ""
            row = t.get("row_index") or ""
            lines.append(f"| {dt} | {amt} | {cur} | {desc} | {sfile} | {row} |")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a Markdown summary from export reconciliation JSON."
    )
    parser.add_argument(
        "--recon",
        type=str,
        required=True,
        help="Path to export_reconciliation_2023_2024.json.",
    )
    parser.add_argument(
        "--out",
        type=str,
        required=True,
        help="Path to the Markdown file to write.",
    )
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> None:
    args = parse_args(argv)
    recon_path = Path(args.recon).expanduser().resolve()
    out_path = Path(args.out).expanduser()

    entries = _load_json(recon_path)
    md = build_reconciliation_markdown(entries)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(md, encoding="utf-8")
    print(f"Wrote Markdown reconciliation summary to {out_path}")


if __name__ == "__main__":
    main()

