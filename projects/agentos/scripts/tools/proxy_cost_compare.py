#!/usr/bin/env python3
"""
Proxy Cost Compare — GLM vs Baseline

Reads proxy telemetry (newline-delimited JSON) and computes, per feature (rid),
token totals and deltas between GLM-routed and non‑GLM events. Prints a summary
with at least 3 matched features when available.

Usage:
  # From tracker data dir (default):
  python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live

  # Or from a raw telemetry file
  python scripts/tools/proxy_cost_compare.py --file logs/usage.jsonl

Input event fields:
  ts, rid, lane, model, status, input_tokens, output_tokens, reason, latency_ms

Output columns:
  rid, total_baseline_tokens, total_glm_tokens, delta_glm_minus_base

Notes:
  - GLM events are detected if model or lane contains 'glm' or model starts with 'z.'
  - Baseline are all other events for the same rid.
  - If no events exist for a rid on either side, that rid is skipped.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, Tuple

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


def _is_glm(evt: Dict[str, Any]) -> bool:
    model = str(evt.get("model") or "").lower()
    lane = str(evt.get("lane") or "").lower()
    return ("glm" in model) or ("glm" in lane) or model.startswith("z.")


def _to_int(value: Any) -> int:
    try:
        return int(value)
    except Exception:
        return 0


def _read_jsonl_lines(path: Path | None, stdin_fallback: bool = True) -> Iterable[Dict[str, Any]]:
    if path is None:
        # Try data dir default file
        yield from ()
        return
    if path == Path("-"):
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except Exception:
                continue
        return
    if not path.exists():
        return
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except Exception:
                continue


def _group_costs(events: Iterable[Dict[str, Any]]) -> Dict[str, Tuple[int, int]]:
    # rid -> (baseline_tokens, glm_tokens)
    groups: Dict[str, Tuple[int, int]] = {}
    for evt in events:
        rid = str(evt.get("rid") or "")
        if not rid:
            # Ignore events without a feature/rid id
            continue
        total_tokens = _to_int(evt.get("input_tokens")) + _to_int(evt.get("output_tokens"))
        base, glm = groups.get(rid, (0, 0))
        if _is_glm(evt):
            glm += total_tokens
        else:
            base += total_tokens
        groups[rid] = (base, glm)
    return groups


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Compare GLM vs baseline token costs per feature (rid)")
    ap.add_argument("--data-dir", default=None, help="Tracker data dir (to read proxy_telemetry.jsonl)")
    ap.add_argument("--file", default=None, help="Explicit telemetry file path (JSONL). Use '-' for stdin")
    ap.add_argument("--min", dest="min_rows", type=int, default=3, help="Minimum rows to print (default: 3)")
    args = ap.parse_args(argv)

    telemetry_path: Path | None
    if args.file:
        telemetry_path = Path(args.file)
    else:
        telemetry_path = Path(args.data_dir or "data/week0/live").joinpath("proxy_telemetry.jsonl")

    events: list[Dict[str, Any]] = []
    # If the default tracker file exists, it stores summary rows with raw_text (newline JSON)
    if args.file == "-":
        events = list(_read_jsonl_lines(Path("-")))
    elif not telemetry_path.exists():
        print(f"telemetry file not found: {telemetry_path}", file=sys.stderr)
        return 1
    elif telemetry_path.name == "proxy_telemetry.jsonl":
        with telemetry_path.open("r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                raw = obj.get("raw_text") or ""
                if raw:
                    for raw_line in str(raw).splitlines():
                        raw_line = raw_line.strip()
                        if not raw_line:
                            continue
                        try:
                            events.append(json.loads(raw_line))
                        except Exception:
                            continue
    else:
        # Fallback: consume events directly from the given file/stdin
        events = list(_read_jsonl_lines(telemetry_path))

    groups = _group_costs(events)
    if not groups:
        print("no matched features (rid) found", file=sys.stderr)
        return 0

    # Print header
    print("rid,baseline_tokens,glm_tokens,delta_glm_minus_base")
    # Order by absolute delta desc
    rows = [
        (rid, base, glm, glm - base) for rid, (base, glm) in groups.items() if base > 0 or glm > 0
    ]
    rows.sort(key=lambda r: abs(r[3]), reverse=True)

    count = 0
    for rid, base, glm, delta in rows:
        print(f"{rid},{base},{glm},{delta}")
        count += 1
        if count >= args.min_rows:
            break

    total_baseline = sum(base for base, _ in groups.values())
    total_glm = sum(glm for _, glm in groups.values())
    total_tokens = total_baseline + total_glm
    glm_share = _format_percent((total_glm / total_tokens * 100.0) if total_tokens else None, digits=1)
    print(
        f"# totals baseline={total_baseline} glm={total_glm} glm_share={glm_share}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
