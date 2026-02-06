#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Compatibility shim for running ai_flow from the repo checkout."""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent
    src_dir = root / "src"
    if src_dir.exists():
        sys.path.insert(0, str(src_dir))

    from ai_flow.cli import main as cli_main

    cli_main()


if __name__ == "__main__":
    main()
