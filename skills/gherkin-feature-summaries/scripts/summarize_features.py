#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

STEP_PREFIX_RE = re.compile(r"^(Given|When|Then|And|But|\*)\s+")


def parse_feature(path: Path) -> tuple[str | None, list[tuple[str, list[str]]]]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    feature_name = None
    scenarios: list[tuple[str, list[str]]] = []
    current_name = None
    current_steps: list[str] = []

    def flush() -> None:
        nonlocal current_name, current_steps
        if current_name is not None:
            scenarios.append((current_name, current_steps))
        current_name = None
        current_steps = []

    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if line.startswith("Feature:"):
            feature_name = line.split(":", 1)[1].strip()
            continue
        if line.startswith("Scenario Outline:") or line.startswith("Scenario:"):
            flush()
            current_name = line.split(":", 1)[1].strip()
            current_steps = []
            continue
        if line.startswith("Background:"):
            flush()
            continue
        if line.startswith("@"):
            continue
        if line.startswith("|"):
            continue
        if current_name and STEP_PREFIX_RE.match(line):
            current_steps.append(line)

    if current_name is not None:
        scenarios.append((current_name, current_steps))

    return feature_name, scenarios


def summarize_steps(steps: list[str], max_steps: int) -> str:
    cleaned: list[str] = []
    for step in steps:
        text = STEP_PREFIX_RE.sub("", step).strip()
        if text.endswith(":"):
            continue
        cleaned.append(text)
        if len(cleaned) >= max_steps:
            break

    if not cleaned:
        for step in steps:
            text = STEP_PREFIX_RE.sub("", step).strip()
            text = text.rstrip(":")
            if text:
                cleaned.append(text)
                break

    if not cleaned:
        return "No steps captured."
    if len(cleaned) == 1:
        return cleaned[0]
    return "; ".join(cleaned)


def build_full_summary(
    feature_files: list[Path],
    features_dir: Path,
    summary_step_count: int,
) -> str:
    lines: list[str] = []
    lines.append("# Feature Scenarios")
    lines.append("")

    for path in feature_files:
        rel_path = path.relative_to(features_dir).as_posix()
        feature_name, scenarios = parse_feature(path)
        lines.append(f"## {rel_path}")
        lines.append(f"Feature: {feature_name or '(missing)'}")
        lines.append("")
        if scenarios:
            for scenario_name, steps in scenarios:
                summary = summarize_steps(steps, summary_step_count)
                lines.append(f"- Scenario: {scenario_name} | Summary: {summary}")
        else:
            lines.append("- Scenario: (none found) | Summary: N/A")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def build_one_line_summary(
    feature_files: list[Path],
    features_dir: Path,
    one_line_title_count: int,
) -> str:
    lines: list[str] = []
    lines.append("# Feature Scenarios (Condensed)")
    lines.append("")

    for path in feature_files:
        rel_path = path.relative_to(features_dir).as_posix()
        feature_name, scenarios = parse_feature(path)
        scenario_titles = [name for name, _ in scenarios]
        if scenario_titles and one_line_title_count > 0:
            if len(scenario_titles) > one_line_title_count:
                titles = "; ".join(scenario_titles[:one_line_title_count])
                titles = f"{titles} (+{len(scenario_titles) - one_line_title_count} more)"
            else:
                titles = "; ".join(scenario_titles)
        elif scenario_titles:
            titles = "none"
        else:
            titles = "none"
        lines.append(
            f"{rel_path} | Feature: {feature_name or '(missing)'} | "
            f"Scenarios: {len(scenario_titles)} | Titles: {titles}"
        )

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Generate full and/or condensed markdown summaries from Gherkin "
            ".feature files."
        )
    )
    parser.add_argument(
        "--features-dir",
        required=True,
        help="Directory containing .feature files (scanned recursively).",
    )
    parser.add_argument(
        "--full-out",
        help="Output path for the full summary markdown.",
    )
    parser.add_argument(
        "--one-line-out",
        help="Output path for the one-line summary markdown.",
    )
    parser.add_argument(
        "--summary-step-count",
        type=int,
        default=2,
        help="Number of step lines to include per scenario summary.",
    )
    parser.add_argument(
        "--one-line-title-count",
        type=int,
        default=3,
        help="Number of scenario titles to include per one-line summary.",
    )
    args = parser.parse_args()

    if not args.full_out and not args.one_line_out:
        parser.error("Provide --full-out and/or --one-line-out.")
    if args.summary_step_count < 1:
        parser.error("--summary-step-count must be >= 1.")
    if args.one_line_title_count < 0:
        parser.error("--one-line-title-count must be >= 0.")

    features_dir = Path(args.features_dir).expanduser()
    if not features_dir.is_dir():
        print(f"Features dir not found: {features_dir}", file=sys.stderr)
        return 1

    feature_files = sorted(features_dir.rglob("*.feature"))
    if not feature_files:
        print(f"No .feature files found under {features_dir}", file=sys.stderr)
        return 1

    if args.full_out:
        full_out = Path(args.full_out).expanduser()
        full_text = build_full_summary(feature_files, features_dir, args.summary_step_count)
        full_out.write_text(full_text, encoding="utf-8")

    if args.one_line_out:
        one_line_out = Path(args.one_line_out).expanduser()
        one_line_text = build_one_line_summary(
            feature_files, features_dir, args.one_line_title_count
        )
        one_line_out.write_text(one_line_text, encoding="utf-8")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
