from __future__ import annotations

import math
from typing import Any

__all__ = ["format_percent"]


def format_percent(value: Any, *, digits: int = 1, default: str = "n/a") -> str:
    """Return a human-friendly percent string with consistent rounding.

    Values that cannot be converted to float (including ``None``) fall back to
    ``default``. Whole numbers render without a decimal suffix (``50%`` instead
    of ``50.0%``), while fractional values retain the requested precision.
    """
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return default

    if math.isnan(numeric) or math.isinf(numeric):
        return default

    if math.isclose(numeric, round(numeric), abs_tol=10 ** (-(digits + 1))):
        return f"{int(round(numeric))}%"
    return f"{numeric:.{digits}f}%"

