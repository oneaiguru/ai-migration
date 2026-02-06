#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

DEFAULT_HEADER_REGEXES = [
    r"^###\\s*FILE:\\s*(?P<path>.+)$",
    r"^##\\s*FILE:\\s*(?P<path>.+)$",
    r"^#\\s*FILE:\\s*(?P<path>.+)$",
    r"^//\\s*FILE:\\s*(?P<path>.+)$",
    r"^--\\s*FILE\\s*:\\s*(?P<path>.+)$",
    r"^FILE:\\s*(?P<path>.+)$",
]

FENCE_RE = re.compile(r"^(\s*)([`~]{3,})(.*)$")


@dataclass
class FenceInfo:
    char: str
    length: int
    info: str


@dataclass
class HeaderMatch:
    raw_path: str
    pattern: str
    is_fence_line: bool
    fence_info: Optional[FenceInfo]


@dataclass
class SegmentMeta:
    type: str
    segment: Optional[str] = None
    path: Optional[str] = None
    output: Optional[str] = None
    normalized_path: Optional[str] = None
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    bytes: int = 0
    lines: int = 0
    sha256: Optional[str] = None
    duplicate: bool = False
    fence: Optional[Dict[str, str]] = None


class SplitError(Exception):
    pass


def read_text(path: Path) -> str:
    data = path.read_bytes()
    return data.decode("utf-8", errors="surrogateescape")


def encode_text(text: str) -> bytes:
    return text.encode("utf-8", errors="surrogateescape")


def split_lines(text: str) -> List[str]:
    return text.splitlines(keepends=True)


def parse_fence(line: str) -> Optional[FenceInfo]:
    m = FENCE_RE.match(line.rstrip("\r\n"))
    if not m:
        return None
    fence = m.group(2)
    info = m.group(3).strip()
    return FenceInfo(char=fence[0], length=len(fence), info=info)


def header_match(line: str, regexes: List[re.Pattern]) -> Optional[HeaderMatch]:
    stripped = line.rstrip("\r\n")
    for rx in regexes:
        m = rx.match(stripped)
        if not m:
            continue
        if "path" in m.groupdict():
            raw = m.group("path")
        elif m.groups():
            raw = m.group(1)
        else:
            raw = m.group(0)
        fence_info = parse_fence(stripped)
        return HeaderMatch(
            raw_path=raw.strip(),
            pattern=rx.pattern,
            is_fence_line=fence_info is not None,
            fence_info=fence_info,
        )
    return None


def normalize_path(raw: str, strip_prefix: Optional[str]) -> str:
    path = raw.strip().strip("`")
    if len(path) >= 2 and path[0] == path[-1] and path[0] in ("\"", "'"):
        path = path[1:-1]
    path = path.replace("\\", "/")
    if strip_prefix and path.startswith(strip_prefix):
        path = path[len(strip_prefix):]
    path = path.lstrip("/")
    if path.startswith("./"):
        path = path[2:]
    path = path.replace(":", "_")
    parts = []
    for part in path.split("/"):
        if not part or part == ".":
            continue
        if part == "..":
            continue
        parts.append(part)
    if not parts:
        return "unnamed"
    return "/".join(parts)


def safe_join(root: Path, rel: str) -> Path:
    target = (root / rel).resolve()
    root_resolved = root.resolve()
    try:
        target.relative_to(root_resolved)
    except ValueError as exc:
        raise SplitError(f"Unsafe output path: {rel}") from exc
    return target


def write_lines(path: Path, lines: List[str]) -> Tuple[int, str, int]:
    hasher = hashlib.sha256()
    total = 0
    with path.open("wb") as f:
        for line in lines:
            data = encode_text(line)
            f.write(data)
            hasher.update(data)
            total += len(data)
    return total, hasher.hexdigest(), len(lines)


def hash_file(path: Path) -> Tuple[int, str]:
    hasher = hashlib.sha256()
    total = 0
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            hasher.update(chunk)
            total += len(chunk)
    return total, hasher.hexdigest()


def load_config(path: Optional[str]) -> Dict[str, object]:
    if not path:
        return {}
    cfg_path = Path(path)
    data = cfg_path.read_text(encoding="utf-8")
    if cfg_path.suffix.lower() in (".yaml", ".yml"):
        try:
            import yaml  # type: ignore
        except Exception as exc:
            raise SplitError("YAML config requires pyyaml installed") from exc
        return yaml.safe_load(data) or {}
    return json.loads(data or "{}")


def scan_fences(text: str) -> Dict[str, object]:
    lines = split_lines(text)
    stack: List[Tuple[str, int, int, str]] = []
    events: List[Dict[str, object]] = []
    suspicious: List[Dict[str, object]] = []
    counts: Dict[str, int] = {"`": 0, "~": 0}

    for idx, line in enumerate(lines, 1):
        info = parse_fence(line)
        if not info:
            continue
        counts[info.char] = counts.get(info.char, 0) + 1
        if not stack:
            stack.append((info.char, info.length, idx, line.rstrip("\r\n")))
            events.append({"line": idx, "type": "open", "char": info.char, "len": info.length})
            continue
        cur_char, cur_len, _, _ = stack[-1]
        if info.char == cur_char and info.length >= cur_len:
            stack.pop()
            events.append({"line": idx, "type": "close", "char": info.char, "len": info.length})
        else:
            suspicious.append({
                "line": idx,
                "line_text": line.rstrip("\r\n"),
                "open_char": cur_char,
                "open_len": cur_len,
                "found_char": info.char,
                "found_len": info.length,
            })

    return {
        "counts": counts,
        "events": events,
        "suspicious": suspicious,
        "unmatched": [
            {"line": entry[2], "char": entry[0], "len": entry[1], "line_text": entry[3]}
            for entry in stack
        ],
        "total_lines": len(lines),
    }


def print_scan_report(report: Dict[str, object], text: str, context: int) -> int:
    counts = report["counts"]
    unmatched = report["unmatched"]
    suspicious = report["suspicious"]
    print("Fence scan summary")
    print(f"- backticks: {counts.get('`', 0)}")
    print(f"- tildes: {counts.get('~', 0)}")
    print(f"- unmatched opens: {len(unmatched)}")
    print(f"- suspicious fences: {len(suspicious)}")

    lines = split_lines(text)
    if unmatched:
        for item in unmatched:
            line_no = item["line"]
            print(f"\nUnmatched open fence at line {line_no}: {item['line_text']}")
            start = max(1, line_no - context)
            end = min(len(lines), line_no + context)
            for i in range(start, end + 1):
                marker = ">" if i == line_no else " "
                line_text = lines[i - 1].rstrip("\r\n")
                print(f"{marker}{i}: {line_text}")

    if suspicious:
        for item in suspicious[:10]:
            print(
                f"Suspicious fence at line {item['line']}: expected {item['open_char']*item['open_len']}, "
                f"found {item['found_char']*item['found_len']}"
            )

    if unmatched:
        return 1
    return 0


def split_message(args: argparse.Namespace) -> None:
    config = load_config(args.config)
    header_patterns = config.get("header_regexes") or []
    if args.header_regex:
        header_patterns.extend(args.header_regex)
    if not header_patterns:
        header_patterns = DEFAULT_HEADER_REGEXES
    regexes = [re.compile(p) for p in header_patterns]

    strip_prefix = args.strip_prefix or config.get("strip_prefix")
    files_dir_name = config.get("files_dir", "files")
    segments_dir_name = config.get("segments_dir", "segments")

    input_path = Path(args.input)
    out_dir = Path(args.out_dir)
    files_dir = out_dir / files_dir_name
    segments_dir = out_dir / segments_dir_name
    files_dir.mkdir(parents=True, exist_ok=True)
    segments_dir.mkdir(parents=True, exist_ok=True)

    text = read_text(input_path)
    lines = split_lines(text)

    if not args.force:
        report = scan_fences(text)
        if report["unmatched"]:
            raise SplitError("Unmatched code fences found. Fix or use --force.")

    entries: List[SegmentMeta] = []
    garbage_buf: List[str] = []
    garbage_start_line: Optional[int] = None

    file_buf: List[str] = []
    file_start_line: Optional[int] = None
    file_end_line: Optional[int] = None

    pending_path: Optional[str] = None
    pending_header_pattern: Optional[str] = None
    in_file = False
    file_fence: Optional[FenceInfo] = None

    segment_index = 1
    seen_paths: Dict[str, int] = {}

    garbage_fence: Optional[FenceInfo] = None

    def append_garbage(line: str, line_no: int) -> None:
        nonlocal garbage_start_line
        if garbage_start_line is None:
            garbage_start_line = line_no
        garbage_buf.append(line)

    def flush_garbage() -> None:
        nonlocal garbage_buf, garbage_start_line, segment_index
        if not garbage_buf:
            return
        seg_name = f"{segment_index:04d}_garbage.txt"
        seg_path = safe_join(segments_dir, seg_name)
        seg_path.parent.mkdir(parents=True, exist_ok=True)
        bytes_count, sha, line_count = write_lines(seg_path, garbage_buf)
        entries.append(
            SegmentMeta(
                type="garbage",
                segment=os.path.relpath(seg_path.resolve(), out_dir.resolve()),
                line_start=garbage_start_line,
                line_end=garbage_start_line + line_count - 1 if garbage_start_line else None,
                bytes=bytes_count,
                lines=line_count,
                sha256=sha,
            )
        )
        garbage_buf = []
        garbage_start_line = None
        segment_index += 1

    def allocate_output_path(path: str) -> Tuple[str, bool]:
        count = seen_paths.get(path, 0)
        if count == 0:
            seen_paths[path] = 1
            return path, False
        seen_paths[path] = count + 1
        p = Path(path)
        dup_name = f"{p.stem}.__dup{count + 1}{p.suffix}"
        return str(p.with_name(dup_name)), True

    def flush_file() -> None:
        nonlocal file_buf, file_start_line, file_end_line, pending_path, in_file, file_fence, pending_header_pattern
        if pending_path is None:
            return
        normalized = normalize_path(pending_path, strip_prefix)
        output_rel, duplicate = allocate_output_path(normalized)
        output_path = safe_join(files_dir, output_rel)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        bytes_count, sha, line_count = write_lines(output_path, file_buf)
        fence_meta = None
        if file_fence:
            fence_meta = {
                "char": file_fence.char,
                "length": str(file_fence.length),
                "info": file_fence.info,
                "header_pattern": pending_header_pattern or "",
            }
        entries.append(
            SegmentMeta(
                type="file",
                path=pending_path,
                output=os.path.relpath(output_path.resolve(), out_dir.resolve()),
                normalized_path=normalized,
                line_start=file_start_line,
                line_end=file_end_line,
                bytes=bytes_count,
                lines=line_count,
                sha256=sha,
                duplicate=duplicate,
                fence=fence_meta,
            )
        )
        file_buf = []
        file_start_line = None
        file_end_line = None
        pending_path = None
        pending_header_pattern = None
        in_file = False
        file_fence = None

    def update_garbage_fence(line: str) -> None:
        nonlocal garbage_fence
        info = parse_fence(line)
        if not info:
            return
        if garbage_fence is None:
            garbage_fence = info
            return
        if info.char == garbage_fence.char and info.length >= garbage_fence.length:
            garbage_fence = None

    def start_header(match: HeaderMatch, line: str, line_no: int) -> None:
        nonlocal pending_path, pending_header_pattern, in_file, file_fence
        pending_path = match.raw_path
        pending_header_pattern = match.pattern
        append_garbage(line, line_no)
        if args.no_fence:
            flush_garbage()
            in_file = True
            file_fence = None
            return
        if match.is_fence_line and match.fence_info:
            flush_garbage()
            in_file = True
            file_fence = match.fence_info

    for idx, line in enumerate(lines, 1):
        # In file content
        if in_file:
            if args.no_fence:
                header = header_match(line, regexes)
                if header and (args.allow_headers_in_fence or not garbage_fence):
                    flush_file()
                    start_header(header, line, idx)
                    continue
                file_buf.append(line)
                if file_start_line is None:
                    file_start_line = idx
                file_end_line = idx
                continue
            info = parse_fence(line)
            if info and file_fence and info.char == file_fence.char and info.length >= file_fence.length:
                flush_file()
                append_garbage(line, idx)
                update_garbage_fence(line)
                continue
            file_buf.append(line)
            if file_start_line is None:
                file_start_line = idx
            file_end_line = idx
            continue

        # Not in file content
        header = header_match(line, regexes)
        if header and (args.allow_headers_in_fence or not garbage_fence):
            if pending_path and not args.no_fence:
                # Pending file had no fence/content
                flush_garbage()
                if not args.force:
                    raise SplitError(
                        f"Header for '{pending_path}' had no fence/content before new header at line {idx}."
                    )
                flush_file()
            start_header(header, line, idx)
            update_garbage_fence(line)
            continue

        if pending_path and not args.no_fence:
            info = parse_fence(line)
            if info:
                append_garbage(line, idx)
                flush_garbage()
                in_file = True
                file_fence = info
                continue

        append_garbage(line, idx)
        update_garbage_fence(line)

    # End of file
    if in_file:
        if not args.no_fence and not args.force:
            raise SplitError(f"Unclosed fence for file '{pending_path}'.")
        flush_file()
    elif pending_path and not args.no_fence:
        flush_garbage()
        if not args.force:
            raise SplitError(f"Header for '{pending_path}' had no fence/content before EOF.")
        flush_file()

    flush_garbage()

    manifest = {
        "input": str(input_path),
        "output_dir": str(out_dir),
        "files_dir": files_dir_name,
        "segments_dir": segments_dir_name,
        "entries": [entry.__dict__ for entry in entries],
    }
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def verify_message(args: argparse.Namespace) -> None:
    manifest_path = Path(args.manifest)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    base_dir = manifest_path.parent
    input_path = Path(args.input or manifest.get("input"))

    orig_bytes, orig_hash = hash_file(input_path)

    out_path = Path(args.output) if args.output else None
    out_handle = out_path.open("wb") if out_path else None
    try:
        total = 0
        hasher = hashlib.sha256()
        for entry in manifest.get("entries", []):
            entry_type = entry.get("type")
            rel_path = entry.get("segment") if entry_type == "garbage" else entry.get("output")
            if not rel_path:
                raise SplitError("Manifest entry missing path")
            path = (base_dir / rel_path).resolve()
            if not path.exists():
                raise SplitError(f"Missing entry file: {path}")
            with path.open("rb") as f:
                for chunk in iter(lambda: f.read(1024 * 1024), b""):
                    hasher.update(chunk)
                    total += len(chunk)
                    if out_handle:
                        out_handle.write(chunk)
            expected = entry.get("sha256")
            if expected:
                _, actual = hash_file(path)
                if actual != expected:
                    print(f"Warning: hash mismatch for {rel_path}")
        recon_hash = hasher.hexdigest()
    finally:
        if out_handle:
            out_handle.close()

    print("Verification summary")
    print(f"- original bytes: {orig_bytes}")
    print(f"- reconstructed bytes: {total}")
    print(f"- original sha256: {orig_hash}")
    print(f"- reconstructed sha256: {recon_hash}")

    if orig_bytes == total and orig_hash == recon_hash:
        print("PASS: reconstruction matches input")
        return
    raise SplitError("FAIL: reconstruction does not match input")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Split message files into extracted files and garbage segments")
    sub = parser.add_subparsers(dest="command", required=True)

    scan_p = sub.add_parser("scan", help="Scan for unbalanced or mixed code fences")
    scan_p.add_argument("--input", required=True, help="Path to message file")
    scan_p.add_argument("--context", type=int, default=2, help="Context lines for unmatched fences")
    scan_p.add_argument("--json", action="store_true", help="Print JSON report")

    split_p = sub.add_parser("split", help="Split message file into segments and extracted files")
    split_p.add_argument("--input", required=True, help="Path to message file")
    split_p.add_argument("--out-dir", required=True, help="Output directory")
    split_p.add_argument("--config", help="Optional config file (json or yaml)")
    split_p.add_argument("--header-regex", action="append", help="Header regex (repeatable)")
    split_p.add_argument("--strip-prefix", help="Prefix to strip from file paths")
    split_p.add_argument("--allow-headers-in-fence", action="store_true", help="Allow headers inside fences")
    split_p.add_argument("--no-fence", action="store_true", help="Treat content as unfenced until next header")
    split_p.add_argument("--force", action="store_true", help="Proceed despite fence or header issues")

    verify_p = sub.add_parser("verify", help="Verify recomposition against original")
    verify_p.add_argument("--input", help="Original message file (overrides manifest)")
    verify_p.add_argument("--manifest", required=True, help="Path to manifest.json")
    verify_p.add_argument("--output", help="Optional output file for reconstructed text")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        if args.command == "scan":
            text = read_text(Path(args.input))
            report = scan_fences(text)
            if args.json:
                print(json.dumps(report, indent=2))
                return 1 if report.get("unmatched") else 0
            return print_scan_report(report, text, args.context)
        if args.command == "split":
            split_message(args)
            return 0
        if args.command == "verify":
            verify_message(args)
            return 0
    except SplitError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
