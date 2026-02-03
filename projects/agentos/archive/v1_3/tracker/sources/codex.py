"""Legacy v1.3 Codex /status parser (archived)."""
import re

_RE_5H = re.compile(
    r'5h\s*limit:\s*\[[^\]]*\]\s*(\d+)%\s*u\s*s\s*e\s*d\s*\(\s*resets\s*([^)]+)\)',
    re.I | re.S,
)
_RE_WEEKLY = re.compile(
    r'Weekly\s*limit:\s*\[[^\]]*\]\s*(\d+)%\s*u\s*s\s*e\s*d\s*\(\s*resets\s*([^)]+)\)',
    re.I | re.S,
)


def _strip_ansi(text: str) -> str:
    return re.sub(r"\x1b\[[0-9;?]*[ -/]*[@-~]", "", text)


def parse_codex_status(text: str) -> dict:
    """Parse Codex CLI `/status` output into structured percentages."""
    s = _strip_ansi(text)
    result = {
        "fiveh_pct": None,
        "fiveh_resets": None,
        "weekly_pct": None,
        "weekly_resets": None,
        "errors": [],
    }

    match_5h = _RE_5H.search(s)
    if match_5h:
        result["fiveh_pct"] = int(match_5h.group(1))
        result["fiveh_resets"] = match_5h.group(2).strip()

    match_weekly = _RE_WEEKLY.search(s)
    if match_weekly:
        result["weekly_pct"] = int(match_weekly.group(1))
        result["weekly_resets"] = match_weekly.group(2).strip()

    if result["fiveh_pct"] is None and result["weekly_pct"] is None:
        result["errors"].append("insufficient-data")

    return result
