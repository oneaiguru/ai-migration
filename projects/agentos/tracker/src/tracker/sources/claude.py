from __future__ import annotations

import re
from typing import Any

_ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]")
_SECTION_RE = re.compile(
    r"^\s*(Current\s+session|Current\s+week(?:\s*\([^)]+\))?).*?$",
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
        elif "week" in lower_name:
            if "opus" in lower_name:
                result["opus_pct"] = pct
            else:
                result["all_models_pct"] = pct
                result["all_models_resets"] = reset_val
                if pct is None:
                    result["errors"].append("section-missing-week")

    if result["session_pct"] is None and "current session" in sanitized.lower():
        result["errors"].append("section-missing-session")

    result["errors"] = _dedupe(result["errors"])
    return result
