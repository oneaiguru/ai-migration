#!/usr/bin/env python3
from pathlib import Path
import os
import shutil
from datetime import date

from generate_reports import (
    parse_account,
    extract_period,
    display_name,
    load_accounts_data,
    load_statements_data,
)


def main():
    data_root = Path(os.environ.get("DATA_ROOT", ".")).resolve()
    dest_root = data_root / "renamed-statements"
    if dest_root.exists():
        shutil.rmtree(dest_root)
    dest_root.mkdir(exist_ok=True)

    # Load aliases/types
    load_accounts_data(Path(__file__).resolve().parent / "config" / "accounts.toml")

    # Try statements.toml first
    statements = load_statements_data(data_root / "metadata" / "statements.toml", data_root)

    skipped = []
    copied = []

    if statements:
        for p in statements:
            src = p.path
            dest_path = p.dest
            if not dest_path:
                alias = display_name(p.account_id, p.account_label).replace(" ", "_")
                dest_path = dest_root / f"{alias}_{p.start.isoformat()}_{p.end.isoformat()}.xlsx"
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest_path)
            copied.append((src, dest_path))
        print("Copied files (from statements.toml):")
        for src, dst in copied:
            print(f"- {src} -> {dst}")
        return

    for path in sorted(data_root.rglob("*.xlsx")):
        if any(part.startswith(".") or part in {"draft", dest_root.name} for part in path.parts):
            continue
        rng = extract_period(path)
        if not rng:
            skipped.append((path, "no period in header"))
            continue
        start, end = rng
        acc_id, label = parse_account(path.parent.name)
        alias = display_name(acc_id, label).replace(" ", "_")
        new_name = f"{alias}_{start.isoformat()}_{end.isoformat()}.xlsx"
        dest_path = dest_root / new_name
        shutil.copy2(path, dest_path)
        copied.append((path, dest_path))

    print("Copied files:")
    for src, dst in copied:
        print(f"- {src} -> {dst}")
    if skipped:
        print("\nSkipped files (no period found):")
        for path, reason in skipped:
            print(f"- {path} ({reason})")


if __name__ == "__main__":
    main()
