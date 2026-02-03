#!/usr/bin/env python3
from pathlib import Path
import os
import shutil

from generate_reports import extract_period, extract_account_id, display_name, load_accounts_data, is_business


# Use DATA_ROOT when provided (data lives outside the code repo)
CODE_ROOT = Path(__file__).resolve().parent
DATA_ROOT = Path(os.environ.get("DATA_ROOT", CODE_ROOT)).resolve()


def main():
    root = DATA_ROOT
    dest_root = root / "renamed-statements-2025"
    if dest_root.exists():
        shutil.rmtree(dest_root)
    dest_root.mkdir(exist_ok=True)

    load_accounts_data(CODE_ROOT / "config" / "accounts.toml")

    copied = []
    for path in sorted(root.rglob("*.xlsx")):
        if any(part.startswith(".") or part in {"draft", "renamed-statements", "renamed-statements-2025"} for part in path.parts):
            continue
        period = extract_period(path)
        if not period:
            continue
        start, end = period
        if end.year <= 2024:
            continue  # current package only
        acc_id, label = path.parent.name.split()[0], path.parent.name
        if not is_business(acc_id):
            acc_from_sheet = extract_account_id(path)
            if not acc_from_sheet or not is_business(acc_from_sheet):
                continue
            acc_id = acc_from_sheet
            label = acc_from_sheet
        alias = display_name(acc_id, label).replace(" ", "_")
        dest = dest_root / f"{alias}_{start.isoformat()}_{end.isoformat()}.xlsx"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        copied.append((path, dest))

    print("Copied future (post-2024) business statements:")
    for src, dst in copied:
        print(f"- {src} -> {dst}")


if __name__ == "__main__":
    main()
