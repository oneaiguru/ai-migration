#!/usr/bin/env python3
"""Extract transcription lines from Groq Whisperer CLI output."""

from __future__ import annotations

import argparse
import io
import re
import sys
from pathlib import Path
from typing import Iterable, List


TRANSCRIPTION_PATTERN = re.compile(r"^\s*Transcription:\s*(.*\S.*)$", re.IGNORECASE)


def extract_transcriptions(lines: Iterable[str], normalize_spaces: bool = False) -> List[str]:
    """Return only the transcription payloads from CLI output lines."""
    transcripts: List[str] = []
    for line in lines:
        match = TRANSCRIPTION_PATTERN.match(line)
        if not match:
            continue
        text = match.group(1).strip()
        if not text:
            continue
        if normalize_spaces:
            text = " ".join(text.split())
        transcripts.append(text)
    return transcripts


def decode_separator(separator: str) -> str:
    """Interpret common escape sequences (e.g., \\n) in separators."""
    encoded = separator.encode("latin-1", "backslashreplace")
    try:
        return encoded.decode("unicode_escape")
    except UnicodeDecodeError:
        return separator


def read_stream(path: Path | None) -> io.TextIOBase:
    """Open a file for reading (or stdin when path is None)."""
    if path is None:
        return sys.stdin
    return path.open("r", encoding="utf-8")


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract only the transcribed text from Groq Whisperer CLI output.",
    )
    parser.add_argument(
        "input",
        nargs="*",
        type=Path,
        help="Input file(s); omit to read from stdin.",
    )
    parser.add_argument(
        "--separator",
        default="\n",
        help="Separator used between transcripts in output (default: newline).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional output file path. Writes to stdout when omitted.",
    )
    parser.add_argument(
        "--normalize-spaces",
        action="store_true",
        help="Collapse repeated whitespace inside transcripts.",
    )
    return parser.parse_args(argv)


def main(argv: List[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    inputs = args.input or [None]

    all_transcripts: List[str] = []
    for path in inputs:
        with read_stream(path) as fh:
            all_transcripts.extend(
                extract_transcriptions(fh, normalize_spaces=args.normalize_spaces)
            )

    separator = decode_separator(args.separator)
    output = separator.join(all_transcripts)
    text = output + ("\n" if output and not output.endswith("\n") else "")
    if args.output:
        args.output.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
