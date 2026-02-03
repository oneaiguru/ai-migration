#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
from pathlib import Path

HEADER = [
    "date",
    "window_id",
    "provider",
    "feature_file",
    "scenario",
    "commit_id",
    "notes",
    "baseline_commit",
    "implementation_commit",
    "docs_commit",
    "lines_added",
    "lines_removed",
]


def ensure_header(path: Path) -> None:
    if path.exists() and path.stat().st_size > 0:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(HEADER)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Reserve a planned feature row in the ledger")
    parser.add_argument("--window", required=True, help="Window identifier (e.g., W0-22)")
    parser.add_argument(
        "--capability",
        required=True,
        help="Capability identifier (e.g., CAP-LEDGER-CHECKPOINT-AUTO)",
    )
    parser.add_argument(
        "--description",
        required=True,
        help="Short description of the planned work",
    )
    parser.add_argument("--provider", default="codex", help="Provider label (default: codex)")
    parser.add_argument("--notes", default="", help="Optional notes to store with the row")
    parser.add_argument(
        "--ledger-path",
        default="docs/Ledgers/Feature_Log.csv",
        help="Override ledger path (defaults to repo Feature_Log)",
    )
    args = parser.parse_args(argv)

    repo_root = Path(__file__).resolve().parents[2]
    ledger_path = (repo_root / args.ledger_path).resolve()
    ensure_header(ledger_path)

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    row = {
        "date": timestamp,
        "window_id": args.window,
        "provider": args.provider,
        "feature_file": args.capability,
        "scenario": args.description,
        "commit_id": "",
        "notes": args.notes,
        "baseline_commit": "",
        "implementation_commit": "",
        "docs_commit": "",
        "lines_added": "",
        "lines_removed": "",
    }

    with ledger_path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADER)
        writer.writerow(row)

    print(
        f"reserved feature row for window={args.window} capability={args.capability}"
    )
    print(f"ledger: {ledger_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
