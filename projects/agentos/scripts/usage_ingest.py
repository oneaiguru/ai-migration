
#!/usr/bin/env python3
import argparse
import json
import re
import sys
from datetime import datetime
from typing import Any, Dict, Optional

LEDGER_PATH_DEFAULT = "/mnt/data/usage_ledger.jsonl"


def parse_claude_status(text: str) -> Dict[str, Optional[int]]:
    """
    Parse Claude CLI '/status' ASCII screen (pasted text).
    Expected sections:
      - "Current session ... <N>% used" and "Resets <time> (<tz>)"
      - "Current week ... <N>% used" with a 'Resets' line (single pool for all models)
    Returns dict with percentages and human reset strings (raw).
    """
    # Normalize whitespace
    lines = [l.rstrip() for l in text.splitlines()]
    # Concatenate for some regex, but mostly line-based parse for robustness
    out: Dict[str, Optional[int]] = {
        "session_pct": None,
        "session_resets": None,
        "week_all_pct": None,
        "week_all_resets": None,
    }

    for i, line in enumerate(lines):
        l = line.strip()
        if l.lower().startswith("current session"):
            # try to find percent in this or next few lines
            m = re.search(r'(\d+)\s*%\s*used', l)
            if not m and i+1 < len(lines):
                m = re.search(r'(\d+)\s*%\s*used', lines[i+1])
            if m:
                out["session_pct"] = int(m.group(1))
            # look ahead for resets
            for j in range(i, min(i+5, len(lines))):
                if "Resets" in lines[j]:
                    out["session_resets"] = lines[j].strip().replace("Resets", "").strip()
                    break

        # Current week (single weekly pool for all models). Ignore Opus-labeled
        # legacy sections to avoid overwriting the main weekly bar.
        lower_line = l.lower()
        if lower_line.startswith("current week") and "(opus" not in lower_line:
            m = re.search(r'(\d+)\s*%\s*used', l, re.I)
            if not m and i+1 < len(lines):
                m = re.search(r'(\d+)\s*%\s*used', lines[i+1], re.I)
            if m:
                out["week_all_pct"] = int(m.group(1))
            # look ahead for resets
            for j in range(i, min(i+5, len(lines))):
                if "Resets" in lines[j]:
                    out["week_all_resets"] = lines[j].strip().replace("Resets", "").strip()
                    break

    return out


def parse_codex_status(text: str) -> Dict[str, Optional[int]]:
    """
    Parse OpenAI Codex CLI status lines like:
      5h limit: [███░░░...] 14% used (resets 02:04 on 17 Oct)
      Weekly limit: [████...] 81% used (resets 21:30 on 19 Oct)
    Returns dict with 5h and weekly percentages and reset strings.
    """
    out: Dict[str, Optional[int]] = {
        "fiveh_pct": None,
        "fiveh_resets": None,
        "week_all_pct": None,
        "week_all_resets": None,
    }
    # Combine lines to simplify regex
    for line in text.splitlines():
        l = line.strip()
        if "5h limit" in l.lower():
            m = re.search(r'(\d+)\s*%\s*used', l)
            if m: out["fiveh_pct"] = int(m.group(1))
            m2 = re.search(r'\(resets\s+([^)]+)\)', l, re.I)
            if m2: out["fiveh_resets"] = m2.group(1).strip()
        elif "weekly limit" in l.lower():
            m = re.search(r'(\d+)\s*%\s*used', l, re.I)
            if m: out["week_all_pct"] = int(m.group(1))
            m2 = re.search(r'\(resets\s+([^)]+)\)', l, re.I)
            if m2: out["week_all_resets"] = m2.group(1).strip()
    return out


def resolve_parser(provider: str):
    p = provider.lower()
    if p in ("anthropic", "claude"):
        return parse_claude_status
    if p in ("openai_codex", "codex", "openai"):
        return parse_codex_status
    # Placeholder for z.ai CLI parser if needed later
    return None


def main() -> None:
    ap = argparse.ArgumentParser(description="Normalize provider usage status text into a JSONL ledger row.")
    ap.add_argument("--provider", required=True, help="anthropic|claude|openai_codex|openai|zai")
    ap.add_argument("--plan", required=True, help="e.g., pro20|max_x5|max_x20|pro200|zai_top")
    ap.add_argument("--account", required=True, help="account identifier/email")
    ap.add_argument("--ledger", default=LEDGER_PATH_DEFAULT, help=f"Path to JSONL ledger (default {LEDGER_PATH_DEFAULT})")
    ap.add_argument("--note", default="", help="optional freeform note")
    args = ap.parse_args()

    parser = resolve_parser(args.provider)
    if not parser:
        print(f"Unsupported provider parser for {args.provider}.", file=sys.stderr)
        sys.exit(2)

    text = sys.stdin.read()
    if not text.strip():
        print("No input text on STDIN. Paste the status screen into STDIN.", file=sys.stderr)
        sys.exit(2)

    parsed = parser(text)
    now = datetime.utcnow().isoformat() + "Z"
    row = {
        "ts_utc": now,
        "provider": args.provider,
        "plan": args.plan,
        "account": args.account,
        "raw_excerpt": text.strip()[:500],  # cap
        "fields": parsed,
        "note": args.note,
    }

    # Basic sanity: at least one percentage must be present
    if not any(v is not None for v in parsed.values()):
        print("Could not detect any usage percentages; check the pasted text.", file=sys.stderr)
        sys.exit(1)

    # Append to ledger
    with open(args.ledger, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(json.dumps(row, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
