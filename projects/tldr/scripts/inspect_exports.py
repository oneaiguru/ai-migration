#!/usr/bin/env python3
"""
Inspect "raw" CSV exports before running Renewal Radar.

This is designed for non-technical users (Claude Cowork) and uses only the Python
standard library so it can run even before installing dependencies.

It prints:
  - detected columns
  - sample rows
  - (events) top event types by count

Optional:
  --write-mapping config/renewal_radar_mapping.json
to generate a starter mapping file that works with prepare_renewal_radar_inputs.py.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Optional


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.strip().lower()).strip("_")


def _choose_column(header: list[str], candidates: list[str]) -> Optional[str]:
    # Match using a normalized form so "Event Type" matches "event_type" candidates.
    norm_to_raw = {_norm(h): h for h in header}
    for c in candidates:
        raw = norm_to_raw.get(_norm(c))
        if raw:
            return raw
    return None


def _read_csv(
    path: Path,
    *,
    max_sample_rows: int,
    count_values_col: Optional[str] = None,
    max_value_counts: int = 50,
) -> dict[str, Any]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []

        sample: list[dict[str, str]] = []
        total_rows = 0
        value_counts: Counter[str] = Counter()

        for row in reader:
            total_rows += 1
            if len(sample) < max_sample_rows:
                sample.append(row)
            if count_values_col and count_values_col in row:
                v = (row.get(count_values_col) or "").strip()
                if v:
                    value_counts[v] += 1

        top_values = value_counts.most_common(max_value_counts) if value_counts else []
        return {
            "header": header,
            "row_count": total_rows,
            "sample_rows": sample,
            "top_values": top_values,
        }


def _guess_event_weight(event_type: str) -> float:
    et = event_type.strip().lower()
    high = ("meeting", "demo", "call", "booked", "attended", "proposal", "contract", "renew", "upgrade")
    mid = ("reply", "respond", "response", "click", "download", "register", "webinar", "form")
    low = ("open", "view", "impression")

    if any(k in et for k in high):
        return 3.0
    if any(k in et for k in mid):
        return 2.0
    if any(k in et for k in low):
        return 1.0
    return 1.0


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Inspect Renewal Radar raw exports (CSV)")
    p.add_argument("--accounts-raw", default="exports/accounts_raw.csv", help="Raw accounts export CSV")
    p.add_argument("--events-raw", default="exports/events_raw.csv", help="Raw events export CSV")
    p.add_argument("--max-sample-rows", type=int, default=5, help="How many rows to print as a preview")
    p.add_argument(
        "--write-mapping",
        default=None,
        help="Write a starter mapping JSON to this path (e.g., config/renewal_radar_mapping.json)",
    )
    return p.parse_args()


def main() -> None:
    args = _parse_args()
    repo_root = Path(__file__).resolve().parents[1]

    accounts_path = (repo_root / args.accounts_raw).resolve()
    events_path = (repo_root / args.events_raw).resolve()

    if not accounts_path.exists():
        raise SystemExit(f"Missing file: {accounts_path}")
    if not events_path.exists():
        raise SystemExit(f"Missing file: {events_path}")

    # Column candidates (common across exports).
    acct_id_candidates = ["account_id", "accountid", "account id", "company_id", "company id", "id", "hs_object_id"]
    acct_company_candidates = ["company", "company_name", "company name", "name", "account_name", "account name"]
    acct_tier_candidates = ["tier", "plan", "segment"]
    acct_arr_candidates = ["arr", "mrr", "annual_recurring_revenue", "annual revenue", "revenue"]
    acct_renewal_candidates = ["renewal_date", "renewal date", "contract_end", "contract_end_date", "end_date"]

    evt_id_candidates = ["account_id", "accountid", "account id", "company_id", "company id", "hs_object_id"]
    evt_ts_candidates = ["timestamp", "touchpoint_dt", "touchpoint date", "date", "created_at", "createdat", "time"]
    evt_type_candidates = ["event_type", "event type", "interaction_type", "interaction type", "type", "activity_type"]
    evt_value_candidates = ["interaction_value", "value", "weight", "score"]

    # Inspect accounts CSV (header + sample).
    acct_meta = _read_csv(accounts_path, max_sample_rows=args.max_sample_rows)
    acct_header: list[str] = acct_meta["header"]
    acct_id_col = _choose_column(acct_header, acct_id_candidates)
    acct_company_col = _choose_column(acct_header, acct_company_candidates)

    print("ACCOUNTS EXPORT")
    print(f"- path: {accounts_path}")
    print(f"- rows: {acct_meta['row_count']}")
    print(f"- columns ({len(acct_header)}): {', '.join(acct_header)}")
    if acct_id_col:
        print(f"- detected account_id column: {acct_id_col}")
    if acct_company_col:
        print(f"- detected company column: {acct_company_col}")
    if acct_meta["sample_rows"]:
        print("- sample rows:")
        for r in acct_meta["sample_rows"]:
            print(f"  {r}")
    print("")

    # Inspect events CSV (header + sample + top event types).
    # First read header to decide what to count.
    with events_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        evt_header = reader.fieldnames or []

    evt_id_col = _choose_column(evt_header, evt_id_candidates)
    evt_ts_col = _choose_column(evt_header, evt_ts_candidates)
    evt_type_col = _choose_column(evt_header, evt_type_candidates)
    evt_value_col = _choose_column(evt_header, evt_value_candidates)

    count_col = evt_type_col or None
    evt_meta = _read_csv(
        events_path,
        max_sample_rows=args.max_sample_rows,
        count_values_col=count_col,
    )

    print("EVENTS EXPORT")
    print(f"- path: {events_path}")
    print(f"- rows: {evt_meta['row_count']}")
    print(f"- columns ({len(evt_header)}): {', '.join(evt_header)}")
    if evt_id_col:
        print(f"- detected account_id column: {evt_id_col}")
    if evt_ts_col:
        print(f"- detected timestamp column: {evt_ts_col}")
    if evt_type_col:
        print(f"- detected event_type column: {evt_type_col}")
    if evt_value_col:
        print(f"- detected interaction_value column: {evt_value_col} (already numeric weights)")
    if evt_meta["sample_rows"]:
        print("- sample rows:")
        for r in evt_meta["sample_rows"]:
            print(f"  {r}")
    if evt_meta["top_values"]:
        print("")
        print(f"Top {min(20, len(evt_meta['top_values']))} event types by count:")
        for v, n in evt_meta["top_values"][:20]:
            print(f"- {v}: {n}")
    print("")

    # Optionally write a mapping skeleton.
    if args.write_mapping:
        mapping_path = (repo_root / args.write_mapping).resolve()
        mapping_path.parent.mkdir(parents=True, exist_ok=True)

        accounts_map: dict[str, object] = {
            "account_id": acct_id_col or acct_id_candidates,
            "company": acct_company_col or acct_company_candidates,
            "tier": _choose_column(acct_header, acct_tier_candidates),
            "arr": _choose_column(acct_header, acct_arr_candidates),
            "renewal_date": _choose_column(acct_header, acct_renewal_candidates),
        }

        touchpoints_map: dict[str, object] = {
            "account_id": evt_id_col or evt_id_candidates,
        }
        if evt_value_col:
            touchpoints_map["touchpoint_dt"] = evt_ts_col or evt_ts_candidates
            touchpoints_map["interaction_value"] = evt_value_col
        else:
            touchpoints_map["touchpoint_dt"] = evt_ts_col or evt_ts_candidates
            touchpoints_map["interaction_type"] = evt_type_col or evt_type_candidates

        interaction_value_map: dict[str, float] = {}
        if evt_meta["top_values"]:
            for v, _n in evt_meta["top_values"]:
                interaction_value_map[v] = _guess_event_weight(v)

        mapping: dict[str, Any] = {
            "accounts": accounts_map,
            "touchpoints": touchpoints_map,
            "interaction_value_map": interaction_value_map,
            # Safe default so every event counts until you tune weights.
            "default_interaction_value": 1.0,
            "drop_unmapped_event_types": False,
        }
        mapping_path.write_text(json.dumps(mapping, indent=2, sort_keys=False) + "\n", encoding="utf-8")
        print(f"Wrote mapping skeleton: {mapping_path}")
        print("Next: open that file, confirm the column names, and tune event weights (1.0/2.0/3.0).")


if __name__ == "__main__":
    main()

