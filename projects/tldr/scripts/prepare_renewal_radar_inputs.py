#!/usr/bin/env python3
"""
Prepare Renewal Radar input CSVs from "raw" exports.

This script is intentionally generic: instead of hardcoding HubSpot/Salesforce/etc,
it uses a JSON mapping file to rename columns and map event types -> interaction_value.

Outputs (required by Renewal Radar):
  - accounts.csv:   account_id, company, (tier), (arr), (renewal_date)
  - touchpoints.csv: account_id, touchpoint_dt, interaction_value, (interaction_type)

Example:
  python3 scripts/prepare_renewal_radar_inputs.py \
    --accounts-in exports/accounts_raw.csv \
    --events-in exports/events_raw.csv \
    --mapping config/renewal_radar_mapping.example.json \
    --out-dir data/real
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd


REQUIRED_ACCOUNTS_COLS = ["account_id", "company"]
REQUIRED_TOUCHPOINT_COLS = ["account_id", "touchpoint_dt", "interaction_value"]


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _require_columns(df: pd.DataFrame, required: list[str], context: str) -> None:
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise SystemExit(f"{context}: missing required columns: {missing}")


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Prepare Renewal Radar input CSVs")
    p.add_argument("--accounts-in", required=True, help="Raw accounts export CSV")
    p.add_argument("--events-in", required=True, help="Raw events/touchpoints export CSV")
    p.add_argument(
        "--mapping",
        required=True,
        help="JSON mapping file (see config/renewal_radar_mapping.example.json)",
    )
    p.add_argument("--out-dir", default="data/real", help="Output directory")
    p.add_argument(
        "--aggregate-daily",
        action="store_true",
        help="Aggregate multiple events per account/day into a single row (recommended).",
    )
    return p.parse_args()


def _select_and_rename(df: pd.DataFrame, colmap: dict[str, object]) -> pd.DataFrame:
    out: dict[str, pd.Series] = {}
    for out_col, in_col in colmap.items():
        if in_col is None:
            continue
        if isinstance(in_col, list):
            candidates = [str(c) for c in in_col]
            chosen = next((c for c in candidates if c in df.columns), None)
            if chosen is None:
                preview = ", ".join(list(df.columns)[:30])
                raise SystemExit(
                    f"Mapping for '{out_col}' expects one of {candidates}, but none are present.\n"
                    f"Available columns (first 30): {preview}"
                )
            out[out_col] = df[chosen]
            continue
        if not isinstance(in_col, str):
            raise SystemExit(f"Mapping for '{out_col}' must be a string, list, or null")
        if in_col not in df.columns:
            preview = ", ".join(list(df.columns)[:30])
            raise SystemExit(
                f"Mapping expects column '{in_col}' for '{out_col}', but it is not present.\n"
                f"Available columns (first 30): {preview}"
            )
        out[out_col] = df[in_col]
    return pd.DataFrame(out)


def main() -> None:
    args = _parse_args()
    mapping_path = Path(args.mapping)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    mapping = _read_json(mapping_path)
    accounts_map = mapping.get("accounts", {})
    touchpoints_map = mapping.get("touchpoints", {})
    value_map = mapping.get("interaction_value_map", {})
    default_value = mapping.get("default_interaction_value", None)
    drop_unmapped = bool(mapping.get("drop_unmapped_event_types", True))

    # --- Accounts ---
    raw_accounts = pd.read_csv(args.accounts_in)
    accounts_df = _select_and_rename(raw_accounts, accounts_map)
    _require_columns(accounts_df, REQUIRED_ACCOUNTS_COLS, context="accounts")

    # Normalize types
    accounts_df["account_id"] = accounts_df["account_id"].astype(str)
    accounts_df["company"] = accounts_df["company"].astype(str)
    if "arr" in accounts_df.columns:
        accounts_df["arr"] = pd.to_numeric(accounts_df["arr"], errors="coerce").fillna(0.0)
    if "renewal_date" in accounts_df.columns:
        accounts_df["renewal_date"] = pd.to_datetime(accounts_df["renewal_date"], errors="coerce").dt.date

    # --- Touchpoints / events ---
    raw_events = pd.read_csv(args.events_in)
    tp_df = _select_and_rename(raw_events, touchpoints_map)

    # If interaction_value wasn't provided directly, derive it from interaction_type.
    if "interaction_value" not in tp_df.columns:
        if "interaction_type" not in tp_df.columns:
            raise SystemExit(
                "touchpoints: need either an 'interaction_value' column or an 'interaction_type' column + mapping"
            )
        if not isinstance(value_map, dict) or not value_map:
            raise SystemExit(
                "touchpoints: missing interaction_value_map in mapping (required when deriving from interaction_type)"
            )
        tp_df["interaction_value"] = tp_df["interaction_type"].map(value_map)
        unmapped = tp_df["interaction_value"].isna()
        unmapped_count = int(unmapped.sum())
        if unmapped_count:
            top_unmapped = (
                tp_df.loc[unmapped, "interaction_type"]
                .astype(str)
                .value_counts()
                .head(10)
            )
            print(f"touchpoints: unmapped event types: {unmapped_count} rows")
            print(f"touchpoints: top unmapped types (up to 10): {top_unmapped.to_dict()}")
        if default_value is not None:
            tp_df["interaction_value"] = tp_df["interaction_value"].fillna(float(default_value))
        if drop_unmapped:
            before = len(tp_df)
            tp_df = tp_df.dropna(subset=["interaction_value"])
            dropped = before - len(tp_df)
            if dropped:
                print(f"touchpoints: dropped {dropped} rows due to unmapped event types (drop_unmapped_event_types=true)")

    _require_columns(tp_df, REQUIRED_TOUCHPOINT_COLS, context="touchpoints")

    tp_df["account_id"] = tp_df["account_id"].astype(str)
    tp_df["touchpoint_dt"] = pd.to_datetime(tp_df["touchpoint_dt"], errors="coerce").dt.date
    tp_df["interaction_value"] = pd.to_numeric(tp_df["interaction_value"], errors="coerce")
    tp_df = tp_df.dropna(subset=["touchpoint_dt", "interaction_value"])
    tp_df = tp_df[tp_df["interaction_value"] >= 0]

    if args.aggregate_daily:
        # Keep a single daily row per account so multi-event days don't balloon the file.
        tp_df = (
            tp_df.groupby(["account_id", "touchpoint_dt"], as_index=False)["interaction_value"]
            .sum()
            .sort_values(["account_id", "touchpoint_dt"])
        )

    accounts_out = out_dir / "accounts.csv"
    touchpoints_out = out_dir / "touchpoints.csv"
    accounts_df.to_csv(accounts_out, index=False)
    tp_df.to_csv(touchpoints_out, index=False)

    # --- Summary ---
    tp_min = tp_df["touchpoint_dt"].min() if not tp_df.empty else None
    tp_max = tp_df["touchpoint_dt"].max() if not tp_df.empty else None
    print(f"Wrote {accounts_out} ({len(accounts_df)} accounts)")
    print(f"Wrote {touchpoints_out} ({len(tp_df)} touchpoints; range {tp_min}..{tp_max})")


if __name__ == "__main__":
    main()
