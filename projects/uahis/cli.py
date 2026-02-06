from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterable, List

from .env import apply_key, init_env, render_ascii, screen_hash
from .parser import parse_ui
from .render_react import generate_component
from .render_terminal import render as render_terminal
from .render_terminal_canvas import render_canvas as render_terminal_canvas
from .tui import run_curses
from .render_osc import render as render_osc
from .layout import compute_layout
from .render_html import build_html
from .render_html_static import render_static_html


def _read_input(path: str) -> str:
    if path == "-":
        return sys.stdin.read()
    return Path(path).read_text(encoding="utf-8")


def _parse_steps_arg(steps: str) -> List[str]:
    if not steps:
        return []
    out: List[str] = []
    tokens: Iterable[str] = steps.replace("\n", ",").split(",")
    for token in tokens:
        item = token.strip()
        if item:
            out.append(item)
    return out


def _load_steps(steps: str, steps_file: str | None) -> List[str]:
    values: List[str] = []
    if steps_file:
        values.extend(_parse_steps_arg(Path(steps_file).read_text(encoding="utf-8")))
    values.extend(_parse_steps_arg(steps))
    return values


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _slugify(value: str, default: str = "scenario") -> str:
    slug = re.sub(r"[^a-zA-Z0-9._-]+", "-", value.strip()).strip("-")
    return slug or default


def _coerce_steps(value) -> List[str]:
    if isinstance(value, str):
        return _parse_steps_arg(value)
    if isinstance(value, Iterable):
        out: List[str] = []
        for item in value:
            if item is None:
                continue
            token = str(item).strip()
            if token:
                out.append(token)
        return out
    raise ValueError("steps must be string or iterable")


def _run_trace(screen, steps: Iterable[str], *, width: int, height: int):
    env = init_env(screen, width=width, height=height)
    records = []
    changed_frames: List[tuple[int, str]] = []

    for idx, key in enumerate(steps, start=1):
        before_ascii = render_ascii(screen, env.focus_id, width=width, height=height)
        before_hash = screen_hash(before_ascii)
        focus_before = env.focus_id

        env = apply_key(screen, env, key)

        after_ascii = render_ascii(screen, env.focus_id, width=width, height=height)
        after_hash = screen_hash(after_ascii)
        changed = after_hash != before_hash or env.focus_changed or env.mutated

        if changed:
            changed_frames.append((idx, after_ascii))

        records.append(
            {
                "step": idx,
                "key": key,
                "focus_before": focus_before,
                "focus_after": env.focus_id,
                "screen_before_hash": before_hash,
                "screen_after_hash": after_hash,
                "focus_changed": env.focus_changed,
                "mutated": env.mutated,
                "changed": changed,
                "done": env.done,
                "message": env.last_message,
                "activated": env.activated,
            }
        )

        if env.done:
            break

    final_ascii = render_ascii(screen, env.focus_id, width=width, height=height)
    final_hash = screen_hash(final_ascii)
    return env, records, changed_frames, final_ascii, final_hash


def render_introspect_json(screen) -> str:
    # Flatten into a simple list of actionable elements for agents.
    items = []

    def walk(node):
        from .ast import Button, Checkbox, Input, Link, Header, Text

        for c in getattr(node, "children", []):
            if isinstance(c, Button):
                items.append({
                    "type": "button",
                    "id": c.id,
                    "label": c.label,
                    "state": "disabled" if c.disabled else "enabled",
                    "x": c.x, "y": c.y, "w": c.w, "h": c.h,
                    "events": c.events,
                    "tabindex": c.tabindex,
                    "nav": c.props.get("nav"),
                })
            elif isinstance(c, Checkbox):
                items.append({
                    "type": "checkbox",
                    "id": c.id,
                    "label": c.label,
                    "checked": c.checked,
                    "x": c.x, "y": c.y, "w": c.w, "h": c.h,
                    "events": c.events,
                    "tabindex": c.tabindex,
                    "nav": c.props.get("nav"),
                })
            elif isinstance(c, Input):
                items.append({
                    "type": "input",
                    "id": c.id,
                    "name": c.name,
                    "value": c.value,
                    "placeholder": c.placeholder,
                    "x": c.x, "y": c.y, "w": c.w, "h": c.h,
                    "events": c.events,
                    "tabindex": c.tabindex,
                    "nav": c.props.get("nav"),
                })
            elif isinstance(c, Link):
                items.append({
                    "type": "link",
                    "id": c.id,
                    "label": c.label,
                    "href": c.href or "#",
                    "x": c.x, "y": c.y, "w": c.w, "h": c.h,
                    "events": c.events,
                    "tabindex": c.tabindex,
                    "nav": c.props.get("nav"),
                })
            elif c.kind == "radio":
                items.append({
                    "type": "radio",
                    "id": c.id,
                    "label": getattr(c, 'label', None),
                    "checked": getattr(c, 'selected', False),
                    "x": c.x, "y": c.y, "w": c.w, "h": c.h,
                    "events": c.events,
                    "tabindex": c.tabindex,
                    "nav": c.props.get("nav"),
                })
            elif hasattr(c, "children"):
                walk(c)

    walk(screen)
    payload = {
        "ui_state": {
            "type": "hierarchical",
            "name": screen.name,
            "elements": items,
            "focus_order": screen.props.get("focus_order") if isinstance(screen.props, dict) else None,
        }
    }
    return json.dumps(payload, indent=2)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="uahis", description="UAHIS compiler prototype")
    sub = p.add_subparsers(dest="cmd", required=True)

    pc = sub.add_parser("compile", help="Compile a UI description to a target")
    pc.add_argument("input", help="Input .ui/.txt file (or - for stdin)")
    pc.add_argument(
        "--target",
        choices=[
            "terminal",
            "terminal_canvas",
            "react",
            "introspect",
            "json",
            "osc",
            "html",
            "html_static",
        ],
        default="terminal",
    )
    pc.add_argument("--width", type=int, default=80, help="layout width (for json/osc/react)")
    pc.add_argument("--height", type=int, default=24, help="layout height (for json/osc)")
    pc.add_argument("--component", default="GeneratedUI", help="React component name (for target=react)")

    # Screenshot subcommand (headless browser)
    ps = sub.add_parser("screenshot", help="Render UI in headless browser and capture a screenshot")
    ps.add_argument("input", help="Input .ui/.txt file")
    ps.add_argument("--width", type=int, default=1000)
    ps.add_argument("--height", type=int, default=300)
    ps.add_argument("--out", default=None, help="Output PNG (default: Desktop/UAHIS_Shot_<name>.png)")
    ps.add_argument("--component", default="GeneratedUI")
    ps.add_argument("--steps", default="", help="Comma-separated key presses (e.g., ArrowRight,ArrowDown,Enter)")
    ps.add_argument("--static", action="store_true", help="Use static HTML (no React/Babel)")

    # Interactive TUI (curses)
    pt = sub.add_parser("tui", help="Run interactive TUI in terminal (curses)")
    pt.add_argument("input", help="Input .ui/.txt file")
    pt.add_argument("--width", type=int, default=80)
    pt.add_argument("--height", type=int, default=24)

    # Simulation (headless key flow)
    psm = sub.add_parser("simulate", help="Simulate key navigation without curses; prints focus ids")
    psm.add_argument("input", help="Input .ui/.txt file")
    psm.add_argument("--width", type=int, default=80)
    psm.add_argument("--height", type=int, default=24)
    psm.add_argument("--steps", default="ArrowRight,ArrowDown,Tab,Enter")

    px = sub.add_parser("explore", help="Run a key sequence and persist trace artifacts")
    px.add_argument("input", help="Input .ui/.txt file")
    px.add_argument("--width", type=int, default=80)
    px.add_argument("--height", type=int, default=24)
    px.add_argument("--steps", default="", help="Comma or newline separated key sequence")
    px.add_argument("--steps-file", default=None, help="Optional file containing key sequence")
    px.add_argument("--out", required=True, help="Directory for trace artifacts")

    pb = sub.add_parser("batch_explore", help="Run multiple key sequences and store traces")
    pb.add_argument("input", help="Input .ui/.txt file")
    pb.add_argument("--width", type=int, default=80)
    pb.add_argument("--height", type=int, default=24)
    pb.add_argument("--plan", required=True, help="JSON file describing scenarios [{name, steps}]")
    pb.add_argument("--out", required=True, help="Directory to write runs (one subdir per scenario)")

    pr = sub.add_parser("replay", help="Replay a trace and optionally emit frames/final screen")
    pr.add_argument("input", help="Input .ui/.txt file used to capture the trace")
    pr.add_argument("--trace", required=True, help="Trace jsonl file produced by explore/batch_explore")
    pr.add_argument("--width", type=int, default=80)
    pr.add_argument("--height", type=int, default=24)
    pr.add_argument("--out", default=None, help="Directory to store replay frames and final.txt")
    pr.add_argument("--verify", action="store_true", help="Fail if hashes mismatch trace entries")

    psu = sub.add_parser("summarize", help="Summarize a trace into aggregate stats")
    psu.add_argument("--trace", required=True, help="Trace jsonl file")

    args = p.parse_args(argv)

    if args.cmd == "compile":
        data: str
        if args.input == "-":
            data = sys.stdin.read()
        else:
            data = Path(args.input).read_text(encoding="utf-8")
        screen = parse_ui(data)
        if args.target == "terminal":
            sys.stdout.write(render_terminal(screen))
        elif args.target == "terminal_canvas":
            compute_layout(screen, width=args.width, height=args.height)
            sys.stdout.write(render_terminal_canvas(screen, width=args.width, height=args.height))
        elif args.target == "react":
            compute_layout(screen, width=args.width, height=args.height)
            sys.stdout.write(generate_component(screen, args.component))
        elif args.target in {"introspect", "json"}:
            compute_layout(screen, width=args.width, height=args.height)
            sys.stdout.write(render_introspect_json(screen))
        elif args.target == "osc":
            compute_layout(screen, width=args.width, height=args.height)
            sys.stdout.write(render_osc(screen))
        elif args.target == "html":
            compute_layout(screen, width=args.width, height=args.height)
            tsx = generate_component(screen, args.component)
            html = build_html(tsx, args.component, title=f"UAHIS Preview: {screen.name}")
            sys.stdout.write(html)
        elif args.target == "html_static":
            compute_layout(screen, width=args.width, height=args.height)
            sys.stdout.write(render_static_html(screen, title=f"UAHIS Preview (Static): {screen.name}"))
        return 0

    if args.cmd == "screenshot":
        from pathlib import Path as _Path
        import tempfile as _tempfile
        import time as _time
        # build HTML
        data = _Path(args.input).read_text(encoding="utf-8")
        screen = parse_ui(data)
        compute_layout(screen, width=args.width, height=args.height)
        if args.static:
            html = render_static_html(screen, title=f"UAHIS Preview (Static): {screen.name}")
        else:
            tsx = generate_component(screen, args.component)
            html = build_html(tsx, args.component, title=f"UAHIS Preview: {screen.name}")
        tmp = _tempfile.NamedTemporaryFile(delete=False, suffix=".html")
        tmp.write(html.encode("utf-8"))
        tmp.flush(); tmp.close()

        # ensure playwright is available
        try:
            from playwright.sync_api import sync_playwright  # type: ignore
        except Exception:
            import subprocess, sys as _sys
            subprocess.run([_sys.executable, "-m", "pip", "install", "playwright", "--quiet"], check=True)
            subprocess.run([_sys.executable, "-m", "playwright", "install", "chromium"], check=True)
            from playwright.sync_api import sync_playwright  # type: ignore

        out_path = args.out or str(_Path.home() / "Desktop" / f"UAHIS_Shot_{_Path(args.input).stem}.png")

        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": args.width, "height": args.height})
            page.goto("file://" + tmp.name)
            if not args.static:
                # wait for React root to render
                try:
                    page.wait_for_selector("#root :first-child", timeout=8000)
                except Exception:
                    pass
            _steps = [s.strip() for s in (args.steps or "").split(",") if s.strip()]
            if _steps:
                # focus root element
                page.click("#root", position={"x": 10, "y": 10}) if not args.static else None
                for k in _steps:
                    page.keyboard.press(k)
                    _time.sleep(0.1)
            page.screenshot(path=out_path, full_page=True)
            browser.close()
        print(out_path)
        return 0

    if args.cmd == "tui":
        data = Path(args.input).read_text(encoding="utf-8")
        screen = parse_ui(data)
        compute_layout(screen, width=args.width, height=args.height)
        run_curses(screen, width=args.width, height=args.height)
        return 0

    if args.cmd == "simulate":
        data = _read_input(args.input)
        screen = parse_ui(data)
        env = init_env(screen, width=args.width, height=args.height)
        steps = _parse_steps_arg(args.steps)
        log: List[str] = []
        for key in steps:
            env = apply_key(screen, env, key)
            log.append(env.focus_id or "")
            if env.done:
                break
        print("\n".join(log))
        return 0

    if args.cmd == "explore":
        data = _read_input(args.input)
        screen = parse_ui(data)
        steps = _load_steps(args.steps, args.steps_file)
        if not steps:
            raise SystemExit("explore requires at least one key (use --steps or --steps-file)")
        out_dir = Path(args.out)
        out_dir.mkdir(parents=True, exist_ok=True)

        env, records, changed_frames, final_ascii, final_hash = _run_trace(
            screen,
            steps,
            width=args.width,
            height=args.height,
        )

        trace_path = out_dir / "trace.jsonl"
        with trace_path.open("w", encoding="utf-8") as fh:
            for rec in records:
                fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

        meta = {
            "input": args.input,
            "steps": steps,
            "step_count": len(records),
            "final_focus": env.focus_id,
            "final_hash": final_hash,
            "width": args.width,
            "height": args.height,
        }
        _write_text(out_dir / "meta.json", json.dumps(meta, indent=2))
        _write_text(out_dir / "final.txt", final_ascii)

        if changed_frames:
            frames_dir = out_dir / "frames"
            frames_dir.mkdir(parents=True, exist_ok=True)
            for idx, ascii_frame in changed_frames:
                _write_text(frames_dir / f"{idx:04d}.txt", ascii_frame)

        return 0

    if args.cmd == "batch_explore":
        source = _read_input(args.input)
        try:
            scenarios = json.loads(Path(args.plan).read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise SystemExit(f"Failed to parse plan '{args.plan}': {exc}")

        if not isinstance(scenarios, list):
            raise SystemExit("plan file must contain a list of scenarios")

        base_out = Path(args.out)
        base_out.mkdir(parents=True, exist_ok=True)

        summary = []
        for idx, entry in enumerate(scenarios, start=1):
            if not isinstance(entry, dict):
                raise SystemExit(f"Scenario #{idx} must be an object with keys name/steps")
            name = entry.get("name") or f"scenario-{idx:03d}"
            steps_value = entry.get("steps")
            if steps_value is None:
                raise SystemExit(f"Scenario '{name}' is missing 'steps'")
            steps = _coerce_steps(steps_value)
            if not steps:
                raise SystemExit(f"Scenario '{name}' produced an empty step list")

            scenario_screen = parse_ui(source)
            scenario_dir = base_out / _slugify(str(name))
            scenario_dir.mkdir(parents=True, exist_ok=True)

            env, records, changed_frames, final_ascii, final_hash = _run_trace(
                scenario_screen,
                steps,
                width=args.width,
                height=args.height,
            )

            trace_path = scenario_dir / "trace.jsonl"
            with trace_path.open("w", encoding="utf-8") as fh:
                for rec in records:
                    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

            meta = {
                "name": name,
                "steps": steps,
                "step_count": len(records),
                "final_focus": env.focus_id,
                "final_hash": final_hash,
                "width": args.width,
                "height": args.height,
            }
            if "goal" in entry:
                meta["goal"] = entry["goal"]

            _write_text(scenario_dir / "meta.json", json.dumps(meta, indent=2))
            _write_text(scenario_dir / "final.txt", final_ascii)

            if changed_frames:
                frames_dir = scenario_dir / "frames"
                frames_dir.mkdir(parents=True, exist_ok=True)
                for step_idx, ascii_frame in changed_frames:
                    _write_text(frames_dir / f"{step_idx:04d}.txt", ascii_frame)

            summary.append({key: meta[key] for key in meta})

        _write_text(base_out / "batch_summary.json", json.dumps(summary, indent=2))
        return 0

    if args.cmd == "replay":
        data = _read_input(args.input)
        screen = parse_ui(data)
        trace_path = Path(args.trace)
        trace_entries = []
        with trace_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                trace_entries.append(json.loads(line))
        steps = [entry.get("key", "") for entry in trace_entries]

        env, records, changed_frames, final_ascii, final_hash = _run_trace(
            screen,
            steps,
            width=args.width,
            height=args.height,
        )

        if args.verify:
            if len(trace_entries) != len(records):
                raise SystemExit(
                    f"Trace length mismatch: expected {len(trace_entries)} steps, replay produced {len(records)}"
                )
            for expected, actual in zip(trace_entries, records):
                step = expected.get("step")
                if expected.get("screen_before_hash") != actual.get("screen_before_hash"):
                    raise SystemExit(f"Replay mismatch at step {step}: before hash differs")
                if expected.get("screen_after_hash") != actual.get("screen_after_hash"):
                    raise SystemExit(f"Replay mismatch at step {step}: after hash differs")
                if expected.get("focus_after") != actual.get("focus_after"):
                    raise SystemExit(f"Replay mismatch at step {step}: focus id differs")

        if args.out:
            out_dir = Path(args.out)
            out_dir.mkdir(parents=True, exist_ok=True)
            _write_text(out_dir / "final.txt", final_ascii)
            meta = {
                "input": args.input,
                "trace": str(trace_path),
                "step_count": len(records),
                "final_focus": env.focus_id,
                "final_hash": final_hash,
                "width": args.width,
                "height": args.height,
            }
            _write_text(out_dir / "meta.json", json.dumps(meta, indent=2))
            if changed_frames:
                frames_dir = out_dir / "frames"
                frames_dir.mkdir(parents=True, exist_ok=True)
                for idx, ascii_frame in changed_frames:
                    _write_text(frames_dir / f"{idx:04d}.txt", ascii_frame)
        else:
            print(final_ascii.rstrip("\n"))

        return 0

    if args.cmd == "summarize":
        trace_path = Path(args.trace)
        entries = []
        with trace_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                entries.append(json.loads(line))

        if not entries:
            print(json.dumps({"steps": 0, "message": "empty trace"}, indent=2))
            return 0

        changed = sum(1 for e in entries if e.get("changed"))
        mutated = sum(1 for e in entries if e.get("mutated"))
        focus_changes = sum(1 for e in entries if e.get("focus_changed"))
        keys: dict[str, int] = {}
        hashes = set()
        activations: List[str] = []
        for e in entries:
            key = e.get("key")
            if key:
                keys[key] = keys.get(key, 0) + 1
            h = e.get("screen_after_hash")
            if h:
                hashes.add(h)
            act = e.get("activated")
            if act:
                activations.append(act)

        summary = {
            "steps": len(entries),
            "changed_steps": changed,
            "mutated_steps": mutated,
            "focus_changes": focus_changes,
            "unique_screens": len(hashes),
            "final_focus": entries[-1].get("focus_after"),
            "final_hash": entries[-1].get("screen_after_hash"),
            "keys": keys,
            "activations": activations,
        }
        print(json.dumps(summary, indent=2))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
