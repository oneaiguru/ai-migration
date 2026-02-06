#!/usr/bin/env python3
from pathlib import Path
import os
import sys

ROOT = Path(os.environ.get("DATA_ROOT", Path(__file__).resolve().parents[1])).resolve()
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from generate_reports import (
    display_name,
    extract_period,
    extract_account_id,
    load_accounts_data,
)

def parse_from_filename(path: Path):
    name = path.name.replace('.xlsx','')
    parts = name.split('_')
    if len(parts) >= 3:
        alias = '_'.join(parts[:-2])
        start = parts[-2]
        end = parts[-1]
        return alias, start, end
    return None, None, None


def main():
    load_accounts_data(ROOT / "config" / "accounts.toml")
    out_path = ROOT / "metadata" / "statements.toml"
    entries = []

    xlsx_files = []
    for base in [ROOT/'renamed-statements', ROOT/'renamed-statements-2025']:
        if base.exists():
            xlsx_files.extend(base.glob('*.xlsx'))

    for p in sorted(set(xlsx_files)):
        alias, start, end = parse_from_filename(p)
        account_id = extract_account_id(p) or ""
        if (not start or not end) and extract_period(p):
            per = extract_period(p)
            start = per[0].isoformat()
            end = per[1].isoformat()
        if not account_id and alias:
            account_id = alias.split('-')[-1]
        if not start or not end or not account_id:
            continue
        entries.append((p, alias or account_id, account_id, start, end))

    lines = ["# Auto-generated inventory of statements", ""]
    for p, alias, acc_id, start, end in entries:
        # Keep dest aligned to the actual source folder (renamed-statements or renamed-statements-2025)
        dest = p.relative_to(ROOT).as_posix()
        lines.append("[[statement]]")
        lines.append(f'src = "{p.relative_to(ROOT).as_posix()}"')
        lines.append(f'account_id = "{acc_id}"')
        lines.append(f'alias = "{alias}"')
        lines.append(f'start = "{start}"')
        lines.append(f'end = "{end}"')
        lines.append(f'dest = "{dest}"')
        lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out_path} ({len(entries)} entries)")


if __name__ == "__main__":
    main()
