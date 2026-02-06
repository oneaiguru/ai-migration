from __future__ import annotations

"""Universal icon→key language for AXR chord mnemonics."""

# Seed mapping; extend via PRs backed by AXR data/perf experiments
ICON_LANG: dict[str, str] = {
    # Save family
    "💾": "s", "💿": "s", "📀": "s",
    # Data/Dashboard/Charts
    "📊": "d", "📈": "d", "📉": "d",
    # Favorites
    "⭐": "f", "⭐️": "f", "★": "f",
    # Search / find
    "🔍": "/", "🔎": "/", "🔭": "/",
    # Add / new
    "➕": "+", "✚": "+", "🆕": "n",
    # Edit / compose
    "✏": "e", "✏️": "e", "📝": "e", "✒": "e", "✒️": "e",
    # Delete / close
    "🗑": "x", "🗑️": "x", "❌": "x", "✖": "x", "✖️": "x",
    # Tagging
    "🏷": "t",
    # Settings / tools
    "⚙": "c", "⚙️": "c", "🔧": "c", "🛠": "c", "🛠️": "c",
    # Numbers (keycap digits + plain digits)
    "0️⃣": "0", "1️⃣": "1", "2️⃣": "2", "3️⃣": "3", "4️⃣": "4",
    "5️⃣": "5", "6️⃣": "6", "7️⃣": "7", "8️⃣": "8", "9️⃣": "9",
    "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
    "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
    # Symbols commonly used in UI labels
    "❗": "!", "❓": "?", "💯": "%",
}

# Pre-sort tokens by length for greedy scanning (supports multi-codepoint emoji)
_ICON_TOKENS = tuple(sorted(ICON_LANG.keys(), key=len, reverse=True))


def scan_icon_tokens(text: str) -> list[str]:
    """Greedily scan `text` for known icon tokens (emoji/symbols)."""

    tokens: list[str] = []
    i = 0
    n = len(text)
    while i < n:
        matched = False
        for tok in _ICON_TOKENS:
            if text.startswith(tok, i):
                tokens.append(tok)
                i += len(tok)
                matched = True
                break
        if not matched:
            i += 1
    return tokens


def icons_to_mnemonic(icons: list[str] | str) -> str:
    """Convert an icon list or raw icon string into a chord mnemonic string."""

    if isinstance(icons, str):
        icons = scan_icon_tokens(icons)
    return "".join(ICON_LANG.get(tok, "") for tok in icons)


def derive_icons_and_mnemonic_from_label(label: str) -> tuple[list[str], str]:
    """Convenience helper: scan a label string and derive icons + mnemonic."""

    icons = scan_icon_tokens(label or "")
    return icons, icons_to_mnemonic(icons)


__all__ = [
    "ICON_LANG",
    "scan_icon_tokens",
    "icons_to_mnemonic",
    "derive_icons_and_mnemonic_from_label",
]
