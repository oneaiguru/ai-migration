"""Backward-compatible wrapper for the unified configuration module."""

import os
import sys

# Allow running this file directly without package context
sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)  # noqa: E402

from config import Config, get_config  # noqa: E402

__all__ = ["Config", "get_config"]
