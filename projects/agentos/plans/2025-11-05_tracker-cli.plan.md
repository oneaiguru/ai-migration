# Plan 2025-11-05 – Implement Tracker CLI (Week-0 MVP)

## Metadata
- Task: Implement subscription tracker CLI pipeline for Week-0.
- Discovery: `docs/Tasks/tracker_cli_discovery.md`
- Related docs: `docs/SOP/PRD_v1.6-final.md`, `docs/SOP/week0_final_protocol.md`, `docs/SOP/saturday_prep_checklist.md`, `docs/System/ADR/ADR-001-subscription-ingestion.md`.

## Desired End State
- `tracker` package installable with `pip install -e tracker/` exposing a `tracker` command.
- `tracker ingest` records Codex/Claude meters into `data/week0/snapshots.jsonl` with parsed values and errors captured.
- `tracker override` allows manual snapshot entry when parsers fail.
- `tracker complete` aggregates a window into `data/week0/windows.jsonl`, computing deltas per provider and tracking feature counts/quality.
- Pytest suite covers parsers and CLI flow using existing fixtures.

### Key Discoveries
- Empty `tracker/` directories need a real package and CLI (`docs/Tasks/tracker_cli_discovery.md`).
- PRD defines append-only JSONL outputs and parser guarantees (`docs/SOP/PRD_v1.6-final.md:59`).
- Week-0 protocol depends on `tracker ingest … --stdin` and `tracker complete` orchestration (`docs/SOP/week0_final_protocol.md:104`).
- Fixtures in `tests/fixtures/{codex,claude}` mirror legacy BDD expectations (`archive/v1_3/tests/bdd/features/codex_status_parse.feature:6`).

## What We're NOT Doing
- No ccusage/GLM bridge implementation (placeholder only).
- No bandit/estimator logic beyond window aggregation.
- No behaviour beyond Week-0 MVP (e.g., REST API, dashboard).

## Implementation Approach
Build a `src` layout Python package under `tracker/`, port archived parser logic with improved resilience, add JSONL persistence helpers, and wire an `argparse` CLI with `ingest`, `override`, and `complete` subcommands. Provide pytest coverage for parser fixtures and an end-to-end CLI flow writing to a temporary data directory.

## Phase 1: Package skeleton & storage helpers
### Overview
Create a `src`-layout package, remove empty placeholders, and add JSONL store utilities.

### Changes Required:
1. Remove empty placeholder directories so the new `src` tree is authoritative:
   ```bash
   rmdir tracker/sources tracker/estimators tracker/optimizer tracker/tests 2>/dev/null || true
   ```
2. Create package directories:
   ```bash
   mkdir -p tracker/src/tracker/{sources,storage,normalize} tracker/tests
   ```
3. Add `tracker/pyproject.toml`:
   ```bash
   cat <<'TPL' > tracker/pyproject.toml
   [build-system]
   requires = ["setuptools>=68", "wheel"]
   build-backend = "setuptools.build_meta"
   
   [project]
   name = "subscription-tracker"
   version = "0.1.0"
   description = "Subscription usage tracker CLI for Week-0 experiments"
   requires-python = ">=3.11"
   authors = [{ name = "Subscription Optimizer Team" }]
   dependencies = []
   
   [project.optional-dependencies]
   dev = ["pytest>=7.4"]
   
   [tool.pytest.ini_options]
   pythonpath = ["src"]
   testpaths = ["tests"]
   TPL
   ```
4. Add package init/entry modules:
   ```bash
   cat <<'TPL' > tracker/src/tracker/__init__.py
   """Subscription usage tracker package."""
   from __future__ import annotations
   
   __all__ = ["__version__"]
   
   __version__ = "0.1.0"
   TPL
   
   cat <<'TPL' > tracker/src/tracker/__main__.py
   """Enable `python -m tracker`."""
   from __future__ import annotations
   
   from .cli import main
   
   if __name__ == "__main__":
       raise SystemExit(main())
   TPL
   ```
5. Add storage helpers:
   ```bash
   cat <<'TPL' > tracker/src/tracker/storage/__init__.py
   """JSONL persistence helpers."""
   from __future__ import annotations
   
   from .jsonl import JsonlStore
   
   __all__ = ["JsonlStore"]
   TPL
   
   cat <<'TPL' > tracker/src/tracker/storage/jsonl.py
   from __future__ import annotations
   
   import json
   from pathlib import Path
   from typing import Any, List, Optional
   
   
   class JsonlStore:
       """Persist tracker data in newline-delimited JSON files."""
   
       def __init__(self, base_dir: Path | str) -> None:
           self.base_dir = Path(base_dir)
           self.base_dir.mkdir(parents=True, exist_ok=True)
           self.snapshots_path = self.base_dir / "snapshots.jsonl"
           self.windows_path = self.base_dir / "windows.jsonl"
           self.glm_counts_path = self.base_dir / "glm_counts.jsonl"
   
       def append_snapshot(self, record: dict[str, Any]) -> None:
           self._append(self.snapshots_path, record)
   
       def append_window(self, record: dict[str, Any]) -> None:
           self._append(self.windows_path, record)
   
       def append_glm_counts(self, record: dict[str, Any]) -> None:
           self._append(self.glm_counts_path, record)
   
       def load_snapshots(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
           return self._load(self.snapshots_path, window_id)
   
       def load_windows(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
           return self._load(self.windows_path, window_id)
   
       def _append(self, path: Path, record: dict[str, Any]) -> None:
           path.parent.mkdir(parents=True, exist_ok=True)
           with path.open("a", encoding="utf-8") as handle:
               json.dump(record, handle, ensure_ascii=False)
               handle.write("\n")
   
       def _load(self, path: Path, window_id: Optional[str]) -> List[dict[str, Any]]:
           if not path.exists():
               return []
           rows: List[dict[str, Any]] = []
           with path.open("r", encoding="utf-8") as handle:
               for line in handle:
                   line = line.strip()
                   if not line:
                       continue
                   data = json.loads(line)
                   if window_id and data.get("window") != window_id:
                       continue
                   rows.append(data)
           rows.sort(key=lambda item: item.get("captured_at") or item.get("finalized_at") or "")
           return rows
   TPL
   ```

## Phase 2: Parser implementations
### Overview
Port Codex/Claude parsers with ANSI stripping, wrap-tolerant regex, and error handling.

### Changes Required:
1. Add parser exports:
   ```bash
   cat <<'TPL' > tracker/src/tracker/sources/__init__.py
   """Meter parsing entry points."""
   from __future__ import annotations
   
   from .codex import parse_codex_status
   from .claude import parse_claude_usage
   
   __all__ = ["parse_codex_status", "parse_claude_usage"]
   TPL
   ```
2. Add Codex parser:
   ```bash
   cat <<'TPL' > tracker/src/tracker/sources/codex.py
   from __future__ import annotations
   
   import re
   from typing import Any
   
   _ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]")
   _BAR_RE = re.compile(
       r"""
       (?P<label>5h\s*limit|Weekly\s*limit)
       \s*:\s*\[[^\]]*\]\s*
       (?P<value>\d+)%
       \s*u\s*s\s*e\s*d
       (?:.*?\(\s*resets?\s*(?P<reset>[^)]+)\))?
       """,
       re.IGNORECASE | re.DOTALL | re.VERBOSE,
   )
   
   
   def _strip_ansi(text: str) -> str:
       return _ANSI_RE.sub("", text)
   
   
   def _dedupe(errors: list[str]) -> list[str]:
       seen: list[str] = []
       for err in errors:
           if err not in seen:
               seen.append(err)
       return seen
   
   
   def parse_codex_status(text: str) -> dict[str, Any]:
       """Parse Codex CLI `/status` output into structured fields."""
       sanitized = _strip_ansi(text)
       result: dict[str, Any] = {
           "fiveh_pct": None,
           "fiveh_resets": None,
           "weekly_pct": None,
           "weekly_resets": None,
           "errors": [],
       }
   
       for match in _BAR_RE.finditer(sanitized):
           label = (match.group("label") or "").lower()
           pct = int(match.group("value"))
           reset = (match.group("reset") or "").strip() or None
           if "5h" in label:
               result["fiveh_pct"] = pct
               result["fiveh_resets"] = reset
           elif "weekly" in label:
               result["weekly_pct"] = pct
               result["weekly_resets"] = reset
   
       if result["fiveh_pct"] is None and result["weekly_pct"] is None:
           result["errors"].append("insufficient-data")
   
       result["errors"] = _dedupe(result["errors"])
       return result
   TPL
   ```
3. Add Claude parser:
   ```bash
   cat <<'TPL' > tracker/src/tracker/sources/claude.py
   from __future__ import annotations
   
   import re
   from typing import Any
   
   _ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]")
   _SECTION_RE = re.compile(
       r"^(Current\s+session|Current\s+week\s*\(all\s+models\)|Current\s+week\s*\(Opus\)).*?$",
       re.IGNORECASE | re.MULTILINE,
   )
   _PCT_RE = re.compile(r"(\d+)%\s*u\s*s\s*e\s*d", re.IGNORECASE | re.DOTALL)
   _RESET_RE = re.compile(r"Resets\s+([^\n]+)", re.IGNORECASE)
   
   
   def _strip_ansi(text: str) -> str:
       return _ANSI_RE.sub("", text)
   
   
   def _dedupe(errors: list[str]) -> list[str]:
       seen: list[str] = []
       for err in errors:
           if err not in seen:
               seen.append(err)
       return seen
   
   
   def parse_claude_usage(text: str) -> dict[str, Any]:
       """Parse Claude `/usage` output into structured fields."""
       sanitized = _strip_ansi(text)
       result: dict[str, Any] = {
           "session_pct": None,
           "session_resets": None,
           "all_models_pct": None,
           "all_models_resets": None,
           "opus_pct": None,
           "errors": [],
       }
   
       lowered = sanitized.lower()
       if "failed to load usage data" in lowered or "status dialog dismissed" in lowered:
           result["errors"].append("usage-not-loaded")
           return result
   
       sections = [(match.group(1), match.start()) for match in _SECTION_RE.finditer(sanitized)]
       sections.append(("__END__", len(sanitized)))
   
       for (name, start), (_, end) in zip(sections, sections[1:]):
           chunk = sanitized[start:end]
           pct_match = _PCT_RE.search(chunk)
           pct = int(pct_match.group(1)) if pct_match else None
           reset_match = _RESET_RE.search(chunk)
           reset_val = reset_match.group(1).strip() if reset_match else None
   
           lower_name = name.lower()
           if lower_name.startswith("current session"):
               result["session_pct"] = pct
               result["session_resets"] = reset_val
           elif "(all models" in lower_name:
               result["all_models_pct"] = pct
               result["all_models_resets"] = reset_val
               if pct is None:
                   result["errors"].append("section-missing-all-models")
           elif "(opus" in lower_name:
               result["opus_pct"] = pct
   
       result["errors"] = _dedupe(result["errors"])
       return result
   TPL
   ```

## Phase 3: Normalization & CLI
### Overview
Add window normalization helpers and the argparse-based CLI with `ingest`, `override`, and `complete` subcommands.

### Changes Required:
1. Add normalization helpers:
   ```bash
   cat <<'TPL' > tracker/src/tracker/normalize/__init__.py
   """Window normalization utilities."""
   from __future__ import annotations
   
   from .windows import build_window_summary, group_snapshots_by_provider
   
   __all__ = ["build_window_summary", "group_snapshots_by_provider"]
   TPL
   
   cat <<'TPL' > tracker/src/tracker/normalize/windows.py
   from __future__ import annotations
   
   from datetime import datetime, timezone
   from typing import Any, Dict, List, Tuple
   
   PROVIDER_FIELDS: dict[str, tuple[str, ...]] = {
       "codex": ("fiveh_pct", "weekly_pct"),
       "claude": ("session_pct", "all_models_pct", "opus_pct"),
   }
   
   
   def group_snapshots_by_provider(snapshots: List[dict[str, Any]]) -> dict[str, dict[str, dict[str, Any]]]:
       grouped: dict[str, dict[str, dict[str, Any]]] = {}
       for snap in snapshots:
           provider = snap.get("provider")
           phase = snap.get("phase")
           if not provider or not phase:
               continue
           by_phase = grouped.setdefault(provider, {})
           current = by_phase.get(phase)
           if current is None or (snap.get("captured_at") or "") > (current.get("captured_at") or ""):
               by_phase[phase] = snap
       return grouped
   
   
   def _delta(before: Any, after: Any) -> Any:
       if before is None or after is None:
           return None
       if after >= before:
           return after - before
       # Handle reset: wrap remaining percentage.
       return (100 - before) + after
   
   
   def _collect_notes(*snapshots: dict[str, Any]) -> list[str]:
       notes: list[str] = []
       for snap in snapshots:
           note = snap.get("notes")
           if note:
               notes.append(note)
       return notes
   
   
   def _summarize_provider(provider: str, before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
       fields = PROVIDER_FIELDS.get(provider, ())
       delta = {field: _delta(before["parsed"].get(field), after["parsed"].get(field)) for field in fields}
       errors_before = before["parsed"].get("errors", [])
       errors_after = after["parsed"].get("errors", [])
       errors: list[str] = []
       for err in [*errors_before, *errors_after]:
           if err not in errors:
               errors.append(err)
       return {
           "before": before["parsed"],
           "after": after["parsed"],
           "delta": delta,
           "captured_at": {
               "before": before.get("captured_at"),
               "after": after.get("captured_at"),
           },
           "notes": _collect_notes(before, after),
           "errors": errors,
       }
   
   
   def build_window_summary(
       window_id: str,
       snapshots: List[dict[str, Any]],
       features: Dict[str, int],
       quality: float,
       notes: str,
   ) -> Tuple[dict[str, Any], list[str]]:
       grouped = group_snapshots_by_provider(snapshots)
       providers: dict[str, Any] = {}
       missing: list[str] = []
       for provider, phases in grouped.items():
           before = phases.get("before")
           after = phases.get("after")
           if not before or not after:
               missing.append(provider)
               continue
           providers[provider] = _summarize_provider(provider, before, after)
       record = {
           "window": window_id,
           "finalized_at": datetime.now(timezone.utc).isoformat(),
           "features": features,
           "quality": quality,
           "notes": notes,
           "providers": providers,
       }
       return record, missing
   TPL
   ```
2. Add CLI implementation:
   ```bash
   cat <<'TPL' > tracker/src/tracker/cli.py
   from __future__ import annotations
   
   import argparse
   import io
   import sys
   from datetime import datetime, timezone
   from pathlib import Path
   from typing import Any, Callable
   
   from .normalize.windows import build_window_summary
   from .sources import parse_claude_usage, parse_codex_status
   from .storage import JsonlStore
   
   DEFAULT_DATA_DIR = Path.cwd() / "data" / "week0"
   PARSERS: dict[str, Callable[[str], dict[str, Any]]] = {
       "codex": parse_codex_status,
       "claude": parse_claude_usage,
   }
   
   
   class TrackerCliError(Exception):
       """Raised for recoverable CLI errors."""
   
   
   def main(argv: list[str] | None = None, *, stdin: io.TextIOBase | None = None,
            stdout: io.TextIOBase | None = None, stderr: io.TextIOBase | None = None) -> int:
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
           else:  # complete / window-finalize alias
               _handle_complete(args, store, stdout, stderr)
       except TrackerCliError as exc:
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
       ingest.add_argument("--phase", choices=["before", "after"], required=True)
       ingest.add_argument("--stdin", action="store_true", help="Read pane content from STDIN")
       ingest.add_argument("--file", help="Read pane content from a file path")
       ingest.add_argument("--notes", default="", help="Optional operator note")
   
       override = subparsers.add_parser("override", help="Manually record meter values")
       override.add_argument("provider", choices=sorted(PARSERS.keys()))
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
       override.add_argument("--opus-pct", type=int)
       override.add_argument("--notes", default="manual override")
   
       complete = subparsers.add_parser("complete", aliases=["window-finalize"], help="Finalize a window summary")
       complete.add_argument("--window", required=True)
       complete.add_argument("--codex-features", type=int, default=0)
       complete.add_argument("--claude-features", type=int, default=0)
       complete.add_argument("--glm-features", type=int, default=0)
      complete.add_argument("--quality", "--quality-score", dest="quality_score", type=float, default=1.0)
      complete.add_argument("--outcome", default="unknown")
       complete.add_argument("--notes", default="")
   
       return parser
   
   
   def _read_input(args: argparse.Namespace, stdin: io.TextIOBase) -> str:
       sources = [flag for flag in (args.stdin, args.file) if flag]
       if not sources:
           raise TrackerCliError("provide --stdin or --file for ingest")
       if args.stdin and args.file:
           raise TrackerCliError("choose one input source")
       if args.stdin:
           data = stdin.read()
       else:
           data = Path(args.file).read_text(encoding="utf-8")
       if not data.strip():
           raise TrackerCliError("no content received")
       return data
   
   
   def _handle_ingest(args: argparse.Namespace, store: JsonlStore,
                      stdin: io.TextIOBase, stdout: io.TextIOBase) -> None:
       parser = PARSERS[args.provider]
       raw_text = _read_input(args, stdin)
       parsed = parser(raw_text)
       record = {
           "window": args.window,
           "provider": args.provider,
           "phase": args.phase,
           "captured_at": datetime.now(timezone.utc).isoformat(),
           "notes": args.notes,
           "raw_text": raw_text.rstrip(),
           "parsed": parsed,
           "source": "ingest",
       }
       store.append_snapshot(record)
       stdout.write(
           f"stored {args.provider} {args.phase} snapshot for {args.window} (errors={parsed.get('errors', [])})\n"
       )
   
   
   def _handle_override(args: argparse.Namespace, store: JsonlStore, stdout: io.TextIOBase) -> None:
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
       else:  # claude
           if args.session_pct is None and args.all_models_pct is None and args.opus_pct is None:
               raise TrackerCliError("claude override requires at least one percentage flag")
           parsed.update(
               {
                   "session_pct": args.session_pct,
                   "session_resets": args.session_resets,
                   "all_models_pct": args.all_models_pct,
                   "all_models_resets": args.all_models_resets,
                   "opus_pct": args.opus_pct,
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
   
   
   def _handle_complete(args: argparse.Namespace, store: JsonlStore,
                        stdout: io.TextIOBase, stderr: io.TextIOBase) -> None:
       snapshots = store.load_snapshots(args.window)
       if not snapshots:
           raise TrackerCliError(f"no snapshots found for window {args.window}")
       features = {
           "codex": args.codex_features,
           "claude": args.claude_features,
           "glm": args.glm_features,
       }
      summary, missing = build_window_summary(args.window, snapshots, features, args.quality_score, args.outcome, args.notes)
       if missing:
           raise TrackerCliError(f"missing before/after snapshots for providers: {', '.join(sorted(missing))}")
       store.append_window(summary)
       stdout.write(f"finalized window {args.window} with providers: {', '.join(summary['providers'].keys())}\n")
   TPL
   ```

## Phase 4: Tests
### Overview
Add pytest coverage for parser fixtures and CLI ingest/complete flow.

### Changes Required:
1. Seed test package:
   ```bash
   cat <<'TPL' > tracker/tests/__init__.py
   """Tracker package test suite."""
   TPL
   ```
2. Parser tests:
   ```bash
   cat <<'TPL' > tracker/tests/test_parsers.py
   from __future__ import annotations
   
   from pathlib import Path
   
   from tracker.sources import parse_claude_usage, parse_codex_status
   
   FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"
   
   
   def _load(name: str) -> str:
       return (FIXTURES / name).read_text(encoding="utf-8")
   
   
   def test_parse_codex_wide_snapshot() -> None:
       result = parse_codex_status(_load("codex/wide_status_82_1.txt"))
       assert result["fiveh_pct"] == 1
       assert result["weekly_pct"] == 82
       assert result["errors"] == []
   
   
   def test_parse_codex_too_narrow_flags_error() -> None:
       result = parse_codex_status(_load("codex/too_narrow_missing_numbers.txt"))
       assert "insufficient-data" in result["errors"]
   
   
   def test_parse_claude_usage_sections() -> None:
       result = parse_claude_usage(_load("claude/usage_wide_90_1_0.txt"))
       assert result["session_pct"] == 1
       assert result["all_models_pct"] == 90
       assert result["opus_pct"] == 0
       assert result["errors"] == []
   
   
   def test_parse_claude_usage_not_loaded() -> None:
       result = parse_claude_usage(_load("claude/usage_failed_to_load.txt"))
       assert "usage-not-loaded" in result["errors"]
   TPL
   ```
3. CLI flow tests:
   ```bash
   cat <<'TPL' > tracker/tests/test_cli_flow.py
   from __future__ import annotations
   
   import io
   import json
   from pathlib import Path
   
   from tracker.cli import main
   
   FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"
   
   
   def _run(argv: list[str], stdin_text: str = ""):
       stdout, stderr = io.StringIO(), io.StringIO()
       exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
       return exit_code, stdout.getvalue(), stderr.getvalue()
   
   
   def test_ingest_and_complete_flow(tmp_path: Path) -> None:
       data_dir = tmp_path / "week0"
       codex_before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
       codex_after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")
       claude_before = (FIXTURES / "claude/usage_wide_90_1_0.txt").read_text(encoding="utf-8")
       claude_after = (FIXTURES / "claude/usage_narrow_90_1_0.txt").read_text(encoding="utf-8")
   
       assert _run(["--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-01", "--phase", "before", "--stdin"], codex_before)[0] == 0
       assert _run(["--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-01", "--phase", "after", "--stdin"], codex_after)[0] == 0
       assert _run(["--data-dir", str(data_dir), "ingest", "claude", "--window", "W0-01", "--phase", "before", "--stdin"], claude_before)[0] == 0
       assert _run(["--data-dir", str(data_dir), "ingest", "claude", "--window", "W0-01", "--phase", "after", "--stdin"], claude_after)[0] == 0
   
       exit_code, _, err = _run([
           "--data-dir", str(data_dir),
           "complete",
           "--window", "W0-01",
           "--codex-features", "3",
           "--claude-features", "3",
          "--quality", "1.0",
          "--outcome", "pass",
           "--notes", "pytest",
       ])
       assert exit_code == 0, err
   
       windows_file = data_dir / "windows.jsonl"
       record = json.loads(windows_file.read_text(encoding="utf-8").strip())
       codex_delta = record["providers"]["codex"]["delta"]
       assert codex_delta["weekly_pct"] == 18
       assert codex_delta["fiveh_pct"] == 1
   
   
   def test_override_records_snapshot(tmp_path: Path) -> None:
       data_dir = tmp_path / "week0"
       exit_code, _, err = _run([
           "--data-dir", str(data_dir),
           "override",
           "codex",
           "--window", "W0-OVR",
           "--phase", "before",
           "--weekly-pct", "82",
           "--fiveh-pct", "1",
           "--notes", "manual",
       ])
       assert exit_code == 0, err
       snapshots_file = data_dir / "snapshots.jsonl"
       record = json.loads(snapshots_file.read_text(encoding="utf-8").strip())
       assert record["parsed"]["weekly_pct"] == 82
       assert record["parsed"]["errors"] == ["manual-override"]
   TPL
   ```

## Tests & Validation
1. Create a virtualenv if desired (`python -m venv .venv && source .venv/bin/activate`).
2. Install the package in editable mode:
   ```bash
   cd tracker
   python -m pip install -e .[dev]
   ```
3. Run unit tests:
   ```bash
   python -m pytest
   ```
4. Sanity check CLI using a fixture snapshot:
   ```bash
   < ../tests/fixtures/codex/wide_status_82_1.txt tracker ingest codex --window W0-TEST --phase before --stdin
  tracker complete --window W0-TEST --codex-features 0 --claude-features 0 --quality 1.0 --outcome pass --notes "dry run"
   cat data/week0/snapshots.jsonl
   cat data/week0/windows.jsonl
   ```

## Rollback
- Delete `tracker/src` and `tracker/tests` directories, remove `tracker/pyproject.toml`, and restore prior empty placeholders if needed (`git checkout -- tracker`).

## Handoff
- Update `progress.md` with implementation summary and validation commands.
- Append detailed Executor notes to `docs/SESSION_HANDOFF.md` (tests run, JSONL outputs, follow-ups).
- Archive fixtures or logs under `data/week0/` if sample outputs were generated.
