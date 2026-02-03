
#!/usr/bin/env python3
import json, argparse, collections, os, sys
from datetime import datetime

LEDGER_PATH_DEFAULT = "/mnt/data/usage_ledger.jsonl"

def parse_ts(s):
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None

def main():
    ap = argparse.ArgumentParser(description="Summarize last-two deltas per provider/plan/account from usage ledger.")
    ap.add_argument("--ledger", default=LEDGER_PATH_DEFAULT, help=f"Path to JSONL ledger (default {LEDGER_PATH_DEFAULT})")
    ap.add_argument("--scope", default="week", choices=["week","5h","all"], help="Which scopes to report (week=weekly only, 5h=session only, all=both)")
    args = ap.parse_args()

    if not os.path.exists(args.ledger):
        print(f"No ledger found at {args.ledger}")
        sys.exit(1)

    rows = []
    with open(args.ledger, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try:
                rows.append(json.loads(line))
            except Exception:
                continue

    # Group by provider/plan/account and (for weekly) reset signature (string), and sort by ts
    def key(r):
        return (r["provider"], r["plan"], r["account"])

    rows.sort(key=lambda r: parse_ts(r.get("ts_utc","")) or datetime.min)

    groups = collections.defaultdict(list)
    for r in rows:
        groups[key(r)].append(r)

    report = []
    for k, items in groups.items():
        # last two entries
        if len(items) < 2:
            continue
        prev, curr = items[-2], items[-1]
        pprov, pplan, pacc = k
        entry = {
            "provider": pprov,
            "plan": pplan,
            "account": pacc,
            "prev_ts": prev["ts_utc"],
            "curr_ts": curr["ts_utc"],
        }
        pf = prev.get("fields", {})
        cf = curr.get("fields", {})

        if args.scope in ("5h","all"):
            sp = (pf.get("session_pct"), cf.get("session_pct"))
            if all(v is not None for v in sp):
                entry["delta_session_pct"] = cf["session_pct"] - pf["session_pct"]
                entry["session_pct_prev_curr"] = sp

        if args.scope in ("week","all"):
            # Weekly "all models"
            wap = (pf.get("week_all_pct"), cf.get("week_all_pct"))
            if all(v is not None for v in wap):
                entry["delta_week_all_pct"] = cf["week_all_pct"] - pf["week_all_pct"]
                entry["week_all_pct_prev_curr"] = wap

        report.append(entry)

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
