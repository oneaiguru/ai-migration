from __future__ import annotations

import argparse
import csv
import io
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from .alias_runtime import AliasError, AliasProcessor
from .churn import (
    ChurnError,
    ChurnStats,
    build_churn_record,
    compute_churn,
    resolve_commit,
    resolve_git_root,
)
from .formatting import format_percent
from .estimators import compute_efficiency
from .normalize.windows import build_window_summary, group_snapshots_by_provider
from .sources import (
    parse_ccusage_counts,
    parse_claude_usage,
    parse_claude_monitor_realtime,
    parse_codex_ccusage,
    parse_codex_status,
    # proxy telemetry
)
from .sources.proxy_telemetry import parse_proxy_telemetry_stream
from .storage import JsonlStore

DEFAULT_DATA_DIR = Path.cwd() / "data" / "week0" / "live"
PARSERS: dict[str, Callable[[str], dict[str, Any]]] = {
    "codex": parse_codex_status,
    "codex-ccusage": lambda text: parse_codex_ccusage(text),
    "claude": parse_claude_usage,
    "claude-monitor": parse_claude_monitor_realtime,
    "glm": parse_ccusage_counts,
    "proxy-telemetry": parse_proxy_telemetry_stream,
}
ALIAS_PROVIDERS = ("codex", "claude", "glm")
OVERRIDE_PROVIDERS = ("codex", "claude")


class TrackerCliError(Exception):
    """Raised for recoverable CLI errors."""


def main(
    argv: list[str] | None = None,
    *,
    stdin: io.TextIOBase | None = None,
    stdout: io.TextIOBase | None = None,
    stderr: io.TextIOBase | None = None,
) -> int:
    parser = _build_parser()
    stdin = stdin or sys.stdin
    stdout = stdout or sys.stdout
    stderr = stderr or sys.stderr
    args = parser.parse_args(argv)

    data_dir = Path(args.data_dir) if args.data_dir else DEFAULT_DATA_DIR
    store = JsonlStore(data_dir)

    try:
        if args.command == "ingest":
            _handle_ingest(args, store, stdin, stdout)
        elif args.command == "override":
            _handle_override(args, store, stdout)
        elif args.command == "preview":
            _handle_preview(args, store, stdout)
        elif args.command == "churn":
            _handle_churn(args, store, stdout)
        elif args.command == "window-audit":
            _handle_window_audit(args, store, stdout)
        elif args.command == "alias":
            _handle_alias(args, store, stdin, stdout)
        else:  # complete / window-finalize alias
            _handle_complete(args, store, stdout)
    except (TrackerCliError, ChurnError) as exc:
        stderr.write(f"error: {exc}\n")
        return 1
    return 0


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="tracker",
        description="Subscription usage tracker CLI",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--data-dir", dest="data_dir", help="Directory for JSONL outputs")
    subparsers = parser.add_subparsers(dest="command", required=True)

    ingest = subparsers.add_parser("ingest", help="Parse and store a meter snapshot")
    ingest.add_argument("provider", choices=sorted(PARSERS.keys()))
    ingest.add_argument("--window", required=True, help="Window identifier (e.g., W0-01)")
    ingest.add_argument("--phase", choices=["before", "after"], help="Required for codex/claude ingestion")
    ingest.add_argument("--stdin", action="store_true", help="Read meter output from STDIN")
    ingest.add_argument("--file", help="Read meter output from a file path")
    ingest.add_argument("--notes", default="", help="Optional operator note")
    ingest.add_argument(
        "--scope",
        choices=["session", "daily", "weekly"],
        help="Scope for codex-ccusage ingestion",
    )

    override = subparsers.add_parser("override", help="Manually record meter values")
    override.add_argument("provider", choices=sorted(OVERRIDE_PROVIDERS))
    override.add_argument("--window", required=True)
    override.add_argument("--phase", choices=["before", "after"], required=True)
    override.add_argument("--fiveh-pct", type=int)
    override.add_argument("--fiveh-resets")
    override.add_argument("--weekly-pct", type=int)
    override.add_argument("--weekly-resets")
    override.add_argument("--session-pct", type=int)
    override.add_argument("--session-resets")
    override.add_argument("--all-models-pct", type=int)
    override.add_argument("--all-models-resets")
    override.add_argument("--notes", default="manual override")

    audit = subparsers.add_parser(
        "window-audit",
        help="Inspect a window for duplicate snapshots and finalize rows",
    )
    audit.add_argument("--window", required=True)
    audit.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Output format (default: text)",
    )
    audit.add_argument(
        "--json",
        action="store_true",
        help="Shorthand for --format json",
    )

    complete = subparsers.add_parser(
        "complete",
        aliases=["window-finalize"],
        help="Finalize a window summary",
    )
    complete.add_argument("--window", required=True)
    complete.add_argument("--codex-features", type=int, default=0)
    complete.add_argument("--claude-features", type=int, default=0)
    complete.add_argument("--glm-features", type=int, default=0)
    complete.add_argument(
        "--quality",
        "--quality-score",
        dest="quality_score",
        type=float,
        default=1.0,
        help="Quality score for the window (1-5 rubric)",
    )
    complete.add_argument(
        "--outcome",
        default="unknown",
        help="Outcome tag (e.g., pass, partial, fail, docs:api-research)",
    )
    complete.add_argument("--spec-id", dest="spec_id", default=None, help="Capability map identifier (e.g., replica spec id)")
    complete.add_argument("--spec-version", dest="spec_version", default=None, help="Capability map version")
    complete.add_argument("--methodology", dest="methodology", default=None, help="Methodology tag for this window")
    complete.add_argument("--commit-start", dest="commit_start", default=None, help="Base commit SHA for churn range (optional)")
    complete.add_argument("--commit-end", dest="commit_end", default=None, help="Head commit SHA for churn range (optional)")
    complete.add_argument("--notes", default="")

    preview = subparsers.add_parser(
        "preview",
        help="Summarize windows, snapshots, and efficiency metrics",
    )
    preview.add_argument("--window", help="Optional window identifier to filter by")

    churn = subparsers.add_parser(
        "churn",
        help="Compute git churn statistics for a window",
    )
    churn.add_argument("--window", required=True, help="Window identifier (e.g., W0-21)")
    churn.add_argument(
        "--provider",
        help="Provider label for ledger output (auto-detected when omitted)",
    )
    churn.add_argument(
        "--methodology",
        help="Override methodology tag for the churn record",
    )
    churn.add_argument(
        "--commit-start",
        dest="commit_start",
        help="Override baseline commit hash (defaults to window metadata)",
    )
    churn.add_argument(
        "--commit-end",
        dest="commit_end",
        help="Override implementation commit hash (defaults to window metadata or HEAD)",
    )
    churn.add_argument(
        "--paths",
        nargs="+",
        help="Optional path filters passed to git diff",
    )
    churn.add_argument(
        "--features",
        type=int,
        help="Override feature count used for normalized churn",
    )
    churn.add_argument(
        "--notes",
        default="",
        help="Optional notes stored with the churn record",
    )
    churn.add_argument(
        "--ledger-path",
        help="Override churn ledger CSV path (defaults to docs/Ledgers/Churn_Ledger.csv at repo root)",
    )

    alias = subparsers.add_parser(
        "alias",
        help="Record meter snapshots via alias semantics",
    )
    alias.add_argument(
        "action",
        choices=["start", "end", "cross", "delete"],
        help="Alias action to perform",
    )
    alias.add_argument("provider", choices=sorted(ALIAS_PROVIDERS))
    alias.add_argument("--window", help="Override window identifier")
    alias.add_argument("--stdin", action="store_true", help="Read meter output from STDIN")
    alias.add_argument("--file", help="Read meter output from a file path")
    alias.add_argument("--notes", default="", help="Optional operator note")
    alias.add_argument(
        "--source",
        default="alias",
        help="Override source label stored in JSONL (default: alias)",
    )
    alias.add_argument(
        "--state-dir",
        help="Directory for alias state tracking (defaults to <data-dir>/state)",
    )
    alias.add_argument(
        "--index",
        type=int,
        default=1,
        help="Delete action: Nth matching snapshot from the end (default 1)",
    )
    alias.add_argument(
        "--phase",
        choices=["before", "after"],
        help="Delete action: restrict to a specific phase",
    )

    return parser


def _read_input(args: argparse.Namespace, stdin: io.TextIOBase) -> str:
    sources = [flag for flag in (args.stdin, args.file) if flag]
    if not sources:
        raise TrackerCliError("provide --stdin or --file")
    if args.stdin and args.file:
        raise TrackerCliError("choose one input source")
    if args.stdin:
        data = stdin.read()
    else:
        data = Path(args.file).read_text(encoding="utf-8")
    if not data.strip():
        raise TrackerCliError("no content received")
    return data


def _handle_ingest(
    args: argparse.Namespace,
    store: JsonlStore,
    stdin: io.TextIOBase,
    stdout: io.TextIOBase,
) -> None:
    raw_text = _read_input(args, stdin)
    captured_at = datetime.now(timezone.utc).isoformat()

    if args.provider == "codex-ccusage":
        scope = args.scope or "session"
        parsed = parse_codex_ccusage(raw_text, scope=scope)
        record = {
            "window": args.window,
            "provider": args.provider,
            "scope": parsed.get("scope", scope),
            "captured_at": captured_at,
            "notes": args.notes,
            "raw_text": raw_text.rstrip(),
            "parsed": parsed,
            "source": "ingest",
        }
        store.append_codex_ccusage(record)
        tokens = parsed.get("total_tokens")
        stdout.write(
            "stored codex ccusage {scope} summary for {window} (tokens={tokens})\n".format(
                scope=record["scope"],
                window=args.window,
                tokens=_format_number(tokens or 0),
            )
        )
        return

    parser = PARSERS[args.provider]
    parsed = parser(raw_text)
    if isinstance(parsed, dict) and "errors" not in parsed:
        parsed["errors"] = []

    if args.provider == "glm":
        record = {
            "window": args.window,
            "provider": args.provider,
            "captured_at": captured_at,
            "notes": args.notes,
            "raw_text": raw_text.rstrip(),
            "parsed": parsed,
            "source": "ingest",
            "prompts_used": parsed.get("prompts_used", 0.0),
        }
        store.append_glm_counts(record)
        stdout.write(
            "stored glm prompts for {window} (prompts={prompts})\n".format(
                window=args.window,
                prompts=_format_number(record["prompts_used"]),
            )
        )
        return

    if args.provider == "claude-monitor":
        record = {
            "window": args.window,
            "provider": args.provider,
            "captured_at": captured_at,
            "notes": args.notes,
            "raw_text": raw_text.rstrip(),
            "parsed": parsed,
            "source": "ingest",
        }
        store.append_claude_monitor(record)
        stdout.write(
            "stored claude monitor summary for {window} (usage={pct})\n".format(
                window=args.window,
                pct=_format_percent(parsed.get("token_usage_pct"), digits=1),
            )
        )
        return

    if args.provider == "proxy-telemetry":
        record = {
            "window": args.window,
            "provider": args.provider,
            "captured_at": captured_at,
            "notes": args.notes,
            "raw_text": raw_text.rstrip(),
            "parsed": parsed,
            "source": "ingest",
        }
        store.append_proxy_telemetry(record)
        stdout.write(
            "stored proxy telemetry for {window} (events={n}, routed={pct})\n".format(
                window=args.window,
                n=int(parsed.get("total") or 0),
                pct=_format_percent(parsed.get("routed_to_glm_pct"), digits=1),
            )
        )
        return

    if args.phase is None:
        raise TrackerCliError("codex/claude ingest requires --phase")
    record = {
        "window": args.window,
        "provider": args.provider,
        "phase": args.phase,
        "captured_at": captured_at,
        "notes": args.notes,
        "raw_text": raw_text.rstrip(),
        "parsed": parsed,
        "source": "ingest",
    }
    store.append_snapshot(record)
    stdout.write(
        f"stored {args.provider} {args.phase} snapshot for {args.window} (errors={parsed.get('errors', [])})\n"
    )


def _handle_override(
    args: argparse.Namespace,
    store: JsonlStore,
    stdout: io.TextIOBase,
) -> None:
    parsed: dict[str, Any] = {"errors": ["manual-override"]}
    if args.provider == "codex":
        if args.fiveh_pct is None and args.weekly_pct is None:
            raise TrackerCliError("codex override requires --fiveh-pct and/or --weekly-pct")
        parsed.update(
            {
                "fiveh_pct": args.fiveh_pct,
                "fiveh_resets": args.fiveh_resets,
                "weekly_pct": args.weekly_pct,
                "weekly_resets": args.weekly_resets,
            }
        )
    else:
        if args.session_pct is None and args.all_models_pct is None:
            raise TrackerCliError("claude override requires at least one percentage flag")
        parsed.update(
            {
                "session_pct": args.session_pct,
                "session_resets": args.session_resets,
                "all_models_pct": args.all_models_pct,
                "all_models_resets": args.all_models_resets,
            }
        )
    record = {
        "window": args.window,
        "provider": args.provider,
        "phase": args.phase,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "notes": args.notes,
        "raw_text": "",
        "parsed": parsed,
        "source": "override",
    }
    store.append_snapshot(record)
    stdout.write(f"recorded manual {args.provider} {args.phase} snapshot for {args.window}\n")


def _handle_complete(
    args: argparse.Namespace,
    store: JsonlStore,
    stdout: io.TextIOBase,
) -> None:
    snapshots = store.load_snapshots(args.window)
    if not snapshots:
        raise TrackerCliError(f"no snapshots found for window {args.window}")
    features = {
        "codex": args.codex_features,
        "claude": args.claude_features,
        "glm": args.glm_features,
    }
    summary, missing = build_window_summary(
        args.window,
        snapshots,
        features,
        args.quality_score,
        args.outcome,
        args.notes,
    )
    # Optional value instrumentation hooks
    if args.spec_id is not None:
        summary["spec_id"] = args.spec_id
    if args.spec_version is not None:
        summary["spec_version"] = args.spec_version
    if args.methodology is not None:
        summary["methodology"] = args.methodology
    if args.commit_start is not None:
        summary["commit_start"] = args.commit_start
    if args.commit_end is not None:
        summary["commit_end"] = args.commit_end
    if missing:
        missing_list = ", ".join(sorted(missing))
        raise TrackerCliError(
            f"missing before/after snapshots for providers: {missing_list}"
        )
    store.append_window(summary)
    # Anomaly guard: log negative deltas if any slip through
    try:
        for provider, pdata in (summary.get("providers") or {}).items():
            delta = (pdata or {}).get("delta") or {}
            negatives = {k: v for k, v in delta.items() if isinstance(v, (int, float)) and v < 0}
            if negatives:
                store.append_anomaly(
                    {
                        "window": args.window,
                        "provider": provider,
                        "captured_at": datetime.now(timezone.utc).isoformat(),
                        "notes": "negative-delta-detected",
                        "delta": delta,
                        "before": (pdata or {}).get("before"),
                        "after": (pdata or {}).get("after"),
                        "source": "finalize",
                    }
                )
    except Exception:
        # Do not block finalization on anomaly logging failures.
        pass
    stdout.write(
        f"finalized window {args.window} with providers: {', '.join(summary['providers'].keys())}\n"
    )


def _handle_preview(
    args: argparse.Namespace,
    store: JsonlStore,
    stdout: io.TextIOBase,
) -> None:
    window_filter = args.window
    windows = store.load_windows(window_filter)
    if not windows:
        stdout.write("no windows recorded\n")
        return

    snapshots = store.load_snapshots(window_filter)
    glm_loader = getattr(store, "load_glm_counts", None)
    glm_counts = glm_loader(window_filter) if callable(glm_loader) else None
    anomalies = store.load_anomalies(window_filter)

    reports = compute_efficiency(windows, glm_counts=glm_counts or [])
    window_list = sorted({window.get("window", "unknown") for window in windows})
    stdout.write(f"Windows: {', '.join(window_list)}\n")

    # Surface anomaly count to operators (always print count)
    stdout.write(f"Anomalies: {len(anomalies)} (see anomalies.jsonl)\n")

    stdout.write("Providers:\n")
    for report in reports:
        stdout.write(
            "  - {provider}: features={features}, capacity={capacity} {unit}, "
            "efficiency={efficiency}, ci={ci}, n={sample_size}, power={power}\n".format(
                provider=report.provider,
                features=_format_number(report.total_features),
                capacity=_format_number(report.total_capacity),
                unit=report.capacity_unit,
                efficiency=_format_efficiency(report.efficiency),
                ci=_format_ci(report.ci_low, report.ci_high),
                sample_size=report.sample_size,
                power=_format_power(report.power),
            )
        )

    outcome_map: dict[str, tuple[float | None, str | None]] = {}
    for window in windows:
        window_id = window.get("window") or "unknown"
        quality_value = window.get("quality_score")
        if quality_value is None:
            quality_value = window.get("quality")
        outcome_value = window.get("outcome")
        outcome_map[window_id] = (quality_value, outcome_value)

    if outcome_map:
        if len(outcome_map) == 1:
            _, (quality_value, outcome_value) = next(iter(outcome_map.items()))
            stdout.write(
                "Outcome: quality={quality}, outcome={outcome}\n".format(
                    quality=_format_quality(quality_value),
                    outcome=outcome_value or "unknown",
                )
            )
            # Surface window notes for single-window view
            try:
                window_notes = None
                if windows:
                    # Filter to the active window if provided
                    if args.window:
                        for w in windows:
                            if (w.get("window") or "") == args.window:
                                window_notes = w.get("notes")
                                break
                    if window_notes is None:
                        window_notes = windows[0].get("notes")
                if window_notes:
                    if isinstance(window_notes, (list, tuple)):
                        note_str = "; ".join(str(n) for n in window_notes if n)
                    else:
                        note_str = str(window_notes)
                    stdout.write(f"Notes: {note_str}\n")
            except Exception:
                # Notes are optional; never fail preview on metadata formatting.
                pass
        else:
            stdout.write("Outcome:\n")
            for window_id in sorted(outcome_map):
                quality_value, outcome_value = outcome_map[window_id]
                stdout.write(
                    "  - {window}: quality={quality}, outcome={outcome}\n".format(
                        window=window_id,
                        quality=_format_quality(quality_value),
                        outcome=outcome_value or "unknown",
                )
            )

    churn_records = store.load_churn(window_filter)
    if churn_records:
        stdout.write("Churn:\n")
        churn_records.sort(
            key=lambda item: (
                item.get("window") or "",
                item.get("captured_at") or "",
            )
        )
        for record in churn_records:
            window = record.get("window") or "unknown"
            provider = record.get("provider") or "unknown"
            methodology = record.get("methodology") or "n/a"
            files_changed = _to_int(record.get("files_changed"))
            insertions = _to_int(record.get("insertions"))
            deletions = _to_int(record.get("deletions"))
            net = _to_int(record.get("net"))
            normalized = record.get("normalized_churn")
            stdout.write(
                "  - provider={provider} window={window} method={method}: files={files}, +{adds}/-{dels} (net={net}), per-feature={per_feature}\n".format(
                    provider=provider,
                    window=window,
                    method=methodology,
                    files=files_changed,
                    adds=insertions,
                    dels=deletions,
                    net=net,
                    per_feature=_format_efficiency(normalized),
                )
            )

    # Subagent proxy preview block
    proxy_rows = store.load_proxy_telemetry(window_filter)
    if proxy_rows:
        latest = proxy_rows[-1].get("parsed") or {}
        stdout.write(
            "Subagent Proxy:\n  - routed={pct} (events={n}), latency={p50} ms p50 / {p95} ms p95, errors={err}\n".format(
                pct=_format_percent(latest.get("routed_to_glm_pct"), digits=1),
                n=int(latest.get("total") or 0),
                p50=_format_number(float(latest.get("latency_p50_ms") or 0.0), decimals=0),
                p95=_format_number(float(latest.get("latency_p95_ms") or 0.0), decimals=0),
                err=_format_percent(latest.get("error_rate_pct"), digits=1),
            )
        )

    ccusage_records = store.load_codex_ccusage(window_filter)
    if ccusage_records:
        stdout.write("ccusage:\n")
        latest_by_scope: dict[str, dict[str, Any]] = {}
        for record in ccusage_records:
            parsed = record.get("parsed") or {}
            scope = parsed.get("scope") or record.get("scope") or "session"
            latest_by_scope[scope] = parsed

        if "weekly" in latest_by_scope:
            weekly_parsed = latest_by_scope["weekly"]
            weekly = weekly_parsed.get("weekly") or {}
            stdout.write(
                "  - weekly: percent_used={percent} tokens={tokens} reset={reset}\n".format(
                    percent=_format_percent(weekly.get("percent_used"), digits=1),
                    tokens=_format_number(float(weekly.get("tokens_used") or 0), decimals=0),
                    reset=weekly_parsed.get("reset_at") or "unknown",
                )
            )

        if "daily" in latest_by_scope:
            daily_parsed = latest_by_scope["daily"]
            days = daily_parsed.get("days") or []
            latest_day = max(
                days,
                key=lambda item: item.get("date") or "",
            ) if days else {}
            stdout.write(
                "  - daily: latest={date} tokens={tokens} percent={percent} reset={reset}\n".format(
                    date=latest_day.get("date") or "n/a",
                    tokens=_format_number(float(latest_day.get("total_tokens") or 0), decimals=0),
                    percent=_format_percent(latest_day.get("percent_used"), digits=1),
                    reset=daily_parsed.get("reset_at") or "unknown",
                )
            )

        if "session" in latest_by_scope:
            session_parsed = latest_by_scope["session"]
            latest_session = session_parsed.get("latest_session") or {}
            stdout.write(
                "  - session: count={count} tokens={tokens} latest={latest}\n".format(
                    count=session_parsed.get("session_count", 0),
                    tokens=_format_number(float(session_parsed.get("total_tokens") or 0), decimals=0),
                    latest=latest_session.get("last_activity") or "n/a",
                )
            )

    if snapshots:
        stdout.write("Snapshots:\n")
        grouped = group_snapshots_by_provider(snapshots)
        for provider in sorted(grouped):
            phases_dict = grouped[provider]
            phases = ", ".join(sorted(phases_dict.keys()))
            sources = sorted({(phases_dict[phase] or {}).get("source") or "unknown" for phase in phases_dict})
            notes = sorted({phase_info.get("notes") for phase_info in phases_dict.values() if phase_info.get("notes")})
            source_label = "/".join(sources) if sources else "unknown"
            notes_label = "; ".join(notes) if notes else "n/a"
            stdout.write(
                f"  - {provider}: {phases} (source={source_label}, notes={notes_label})\n"
            )


def _handle_window_audit(
    args: argparse.Namespace,
    store: JsonlStore,
    stdout: io.TextIOBase,
) -> None:
    window_id = args.window
    snapshots = store.load_snapshots(window_id)
    window_rows = store.load_windows(window_id)
    anomalies = store.load_anomalies(window_id)
    churn_rows = store.load_churn(window_id)

    if not (snapshots or window_rows or anomalies or churn_rows):
        stdout.write(f"no records found for {window_id}\n")
        return

    output_format = "json" if getattr(args, "json", False) else args.format

    snapshot_summaries: list[dict[str, Any]] = []
    if snapshots:
        grouped: dict[tuple[str, str], list[dict[str, Any]]] = {}
        for snapshot in snapshots:
            provider = snapshot.get("provider") or "unknown"
            phase = snapshot.get("phase") or "unknown"
            grouped.setdefault((provider, phase), []).append(snapshot)

        for (provider, phase), rows in sorted(grouped.items()):
            rows.sort(key=lambda item: item.get("captured_at") or "")
            canonical = rows[-1]
            snapshot_summaries.append(
                {
                    "provider": provider,
                    "phase": phase,
                    "entries": len(rows),
                    "duplicates": max(len(rows) - 1, 0),
                    "canonical_captured_at": canonical.get("captured_at"),
                    "source": canonical.get("source"),
                    "notes": canonical.get("notes"),
                }
            )

    finalize_summary: dict[str, Any] | None = None
    if window_rows:
        window_rows.sort(key=lambda item: item.get("finalized_at") or "")
        canonical = window_rows[-1]
        finalize_summary = {
            "entries": len(window_rows),
            "duplicates": max(len(window_rows) - 1, 0),
            "canonical_finalized_at": canonical.get("finalized_at"),
            "methodology": canonical.get("methodology"),
        }

    anomalies_summary = {
        "count": len(anomalies),
    }
    if anomalies:
        anomalies_summary["records"] = anomalies

    churn_summary = {
        "count": len(churn_rows),
    }
    if churn_rows:
        churn_summary["records"] = churn_rows

    if output_format == "json":
        payload = {
            "window": window_id,
            "snapshots": snapshot_summaries,
            "finalize": finalize_summary,
            "anomalies": anomalies_summary,
            "churn": churn_summary,
        }
        json.dump(payload, stdout, indent=2)
        stdout.write("\n")
        return

    stdout.write(f"Window Audit: {window_id}\n")

    if snapshot_summaries:
        stdout.write("Snapshots:\n")
        for item in snapshot_summaries:
            stdout.write(
                "  - {provider}/{phase}: entries={entries}, duplicates={dups}, canonical={ts}, source={source}, notes={notes}\n".format(
                    provider=item["provider"],
                    phase=item["phase"],
                    entries=item["entries"],
                    dups=item["duplicates"],
                    ts=item["canonical_captured_at"] or "n/a",
                    source=item.get("source") or "unknown",
                    notes=item.get("notes") or "n/a",
                )
            )

    if finalize_summary:
        stdout.write(
            "Finalize rows: entries={count}, duplicates={dups}, canonical={ts}, methodology={method}\n".format(
                count=finalize_summary["entries"],
                dups=finalize_summary["duplicates"],
                ts=finalize_summary["canonical_finalized_at"] or "n/a",
                method=finalize_summary.get("methodology") or "n/a",
            )
        )

    stdout.write(f"Anomalies: {anomalies_summary['count']}\n")
    stdout.write(f"Churn rows: {churn_summary['count']}\n")


def _handle_churn(
    args: argparse.Namespace,
    store: JsonlStore,
    stdout: io.TextIOBase,
) -> None:
    window_id = args.window
    windows = store.load_windows(window_id)
    if not windows:
        raise TrackerCliError(f"no window summary found for {window_id}")
    window_record = sorted(
        windows,
        key=lambda item: item.get("finalized_at") or "",
    )[-1]

    commit_start_value = (
        args.commit_start
        or window_record.get("commit_start")
        or window_record.get("commit_start_sha")
    )
    commit_end_value = (
        args.commit_end
        or window_record.get("commit_end")
        or window_record.get("commit_end_sha")
    )

    missing_bounds: list[str] = []
    if not commit_start_value:
        missing_bounds.append("commit_start")

    repo_root = resolve_git_root()
    commit_start = commit_start_value or ""
    commit_end = commit_end_value or ""

    if missing_bounds:
        stats = ChurnStats(files_changed=0, insertions=0, deletions=0, net=0)
        stdout.write(
            "warn: missing {labels} — skipping git diff\n".format(
                labels=", ".join(missing_bounds)
            )
        )
    else:
        commit_start = resolve_commit(commit_start_value, default=None, cwd=repo_root)
        commit_end = resolve_commit(commit_end_value, default="HEAD", cwd=repo_root)
        stats = compute_churn(
            commit_start,
            commit_end,
            paths=args.paths or None,
            cwd=repo_root,
        )

    features_map = window_record.get("features") or {}
    features_total = args.features if args.features is not None else _sum_features(features_map)
    methodology = args.methodology or window_record.get("methodology")
    provider = args.provider or _detect_provider(features_map)

    churn_record = build_churn_record(
        window=window_id,
        provider=provider,
        methodology=methodology,
        commit_start=commit_start,
        commit_end=commit_end,
        features=max(features_total, 0),
        stats=stats,
        notes=_merge_notes(args.notes, missing_bounds),
        paths=args.paths,
    )
    store.append_churn(churn_record)

    ledger_path = (
        Path(args.ledger_path)
        if args.ledger_path
        else repo_root / "docs" / "Ledgers" / "Churn_Ledger.csv"
    )
    _append_churn_ledger(ledger_path, churn_record)

    normalized = churn_record.get("normalized_churn")
    per_feature = _format_efficiency(normalized) if normalized is not None else "n/a"
    if missing_bounds:
        stdout.write(
            "churn {window}: skipped (decision=missing-commit-range)\n".format(
                window=window_id
            )
        )
    else:
        stdout.write(
            "churn {window}: files={files} +{adds}/-{dels} net={net} per-feature={per_feature}\n".format(
                window=window_id,
                files=stats.files_changed,
                adds=stats.insertions,
                dels=stats.deletions,
                net=stats.net,
                per_feature=per_feature,
            )
        )


def _merge_notes(notes: str | None, missing_bounds: list[str]) -> str:
    pieces: list[str] = []
    if notes:
        stripped = str(notes).strip()
        if stripped:
            pieces.append(stripped)
    if missing_bounds:
        label = "decision=missing-commit-range"
        if len(missing_bounds) == 1:
            suffix = missing_bounds[0]
        else:
            suffix = ",".join(missing_bounds)
        pieces.append(f"{label}({suffix})")
    return "; ".join(pieces)


def _sum_features(features_map: dict[str, Any]) -> int:
    total = 0
    for value in (features_map or {}).values():
        try:
            total += int(value)
        except (TypeError, ValueError):
            continue
    return total


def _detect_provider(features_map: dict[str, Any]) -> str:
    active = [name for name, value in (features_map or {}).items() if _to_int(value) > 0]
    if len(active) == 1:
        return active[0]
    if not active:
        return "unknown"
    return "multi"


def _to_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


LEDGER_FIELDS = [
    "date",
    "window",
    "provider",
    "methodology",
    "commit_start",
    "commit_end",
    "files_changed",
    "insertions",
    "deletions",
    "net",
    "features",
    "normalized_churn",
    "notes",
]


def _append_churn_ledger(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    exists = path.exists() and path.stat().st_size > 0
    normalized = record.get("normalized_churn")
    normalized_cell = "" if normalized is None else f"{normalized:.2f}"
    notes = str(record.get("notes") or "")
    paths = record.get("paths")
    if paths:
        suffix = f"; paths={','.join(paths)}"
        notes = f"{notes}{suffix}" if notes else f"paths={','.join(paths)}"
    row = {
        "date": datetime.now(timezone.utc).date().isoformat(),
        "window": record.get("window") or "unknown",
        "provider": record.get("provider") or "unknown",
        "methodology": record.get("methodology") or "",
        "commit_start": record.get("commit_start") or "",
        "commit_end": record.get("commit_end") or "",
        "files_changed": record.get("files_changed", 0),
        "insertions": record.get("insertions", 0),
        "deletions": record.get("deletions", 0),
        "net": record.get("net", 0),
        "features": record.get("features", 0),
        "normalized_churn": normalized_cell,
        "notes": notes,
    }
    with path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=LEDGER_FIELDS)
        if not exists:
            writer.writeheader()
        writer.writerow(row)
def _handle_alias(
    args: argparse.Namespace,
    store: JsonlStore,
    stdin: io.TextIOBase,
    stdout: io.TextIOBase,
) -> None:
    state_dir = Path(args.state_dir) if args.state_dir else store.base_dir / "state"
    processor = AliasProcessor(
        provider=args.provider,
        store=store,
        parser=PARSERS[args.provider],
        state_dir=state_dir,
        window_override=args.window,
        source_label=args.source or "alias",
    )
    try:
        if args.action == "delete":
            message = processor.delete(
                index=args.index,
                phase=args.phase,
                window=args.window,
            )
        else:
            raw_text = _read_input(args, stdin)
            if args.action == "start":
                message = processor.start(raw_text, args.notes)
            elif args.action == "end":
                message = processor.end(raw_text, args.notes)
            else:
                message = processor.cross(raw_text, args.notes)
    except AliasError as exc:
        raise TrackerCliError(str(exc)) from exc
    stdout.write(f"{message}\n")


def _format_number(value: float, *, decimals: int = 2) -> str:
    if math.isclose(value, round(value), abs_tol=1e-6):
        return str(int(round(value)))
    return f"{value:.{decimals}f}"


def _format_percent(value: Any, *, digits: int = 1) -> str:
    return format_percent(value, digits=digits)


def _format_efficiency(value: float | None) -> str:
    if value is None:
        return "n/a"
    return f"{value:.2f}"


def _format_ci(lower: float | None, upper: float | None) -> str:
    if lower is None or upper is None:
        return "n/a"
    if math.isclose(lower, upper, abs_tol=1e-6):
        return f"[{lower:.2f}, {upper:.2f}]"
    return f"[{lower:.2f}, {upper:.2f}]"


def _format_power(value: float | None) -> str:
    if value is None:
        return "n/a"
    return f"{value:.2f}"


def _format_quality(value: float | None) -> str:
    if value is None:
        return "n/a"
    return f"{float(value):.1f}"


if __name__ == "__main__":  # pragma: no cover - executable entry
    raise SystemExit(main())
