"""Legacy v1.3 Claude /usage parser (archived)."""
import re

_SECTION_PAT = re.compile(
    r'^(Current\s+session|Current\s+week\s*\(all\s+models\)|Current\s+week\s*\(Opus\)).*?$',
    re.I | re.M,
)
_PCT = re.compile(r'(\d+)%\s*u\s*s\s*e\s*d', re.I | re.S)
_RESETS = re.compile(r'Resets\s+([^\n]+)', re.I)


def parse_claude_usage(text: str) -> dict:
    """Parse Claude Code `/usage` output into structured percentages."""
    sanitized = re.sub(r"\x1b\[[0-9;?]*[ -/]*[@-~]", "", text)
    result = {
        "session_pct": None,
        "session_resets": None,
        "all_models_pct": None,
        "all_models_resets": None,
        "opus_pct": None,
        "errors": [],
    }

    if "Failed to load usage data" in sanitized or "Status dialog dismissed" in sanitized:
        result["errors"].append("usage-not-loaded")
        return result

    positions = [(match.group(1), match.start()) for match in _SECTION_PAT.finditer(sanitized)]
    positions.append(("__END__", len(sanitized)))

    for (name, start), (_, end) in zip(positions, positions[1:]):
        chunk = sanitized[start:end]
        pct_match = _PCT.search(chunk)
        reset_match = _RESETS.search(chunk)
        pct = int(pct_match.group(1)) if pct_match else None
        reset_val = reset_match.group(1).strip() if reset_match else None

        key = None
        if name.lower().startswith("current session"):
            key = "session"
        elif "(all models)" in name:
            key = "all_models"
        elif "(opus" in name.lower():
            key = "opus"

        if key:
            result[f"{key}_pct"] = pct
            if key != "opus":
                result[f"{key}_resets"] = reset_val

    if result["all_models_pct"] is None and "Current week (all models)" in sanitized:
        result["errors"].append("section-missing-all-models")

    return result
