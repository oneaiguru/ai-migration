#!/usr/bin/env python3
"""
Consolidate raw XLSX files into raw-consolidated/ with normalized names,
splitting into:
  - raw-matched/: raws that hash-match files in renamed-statements/
  - raw-extra/: everything else (personal, future, or unmatched)
Manifest marks matches vs renamed-statements.
"""
from __future__ import annotations

import hashlib
import shutil
from pathlib import Path
import os
from typing import Dict, Optional, Tuple

from generate_reports import (
    load_accounts_data,
    display_name,
    extract_period,
    extract_account_id,
)

ROOT = Path(os.environ.get("DATA_ROOT", Path(__file__).resolve().parent)).resolve()


def md5sum(path: Path) -> str:
    h = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def collect_hashes(paths):
    hashes = {}
    for p in paths:
        hashes[md5sum(p)] = p
    return hashes


def normalize_name(alias: str, account_id: str, period: Optional[Tuple[str, str]], suffix: str) -> str:
    base = alias or account_id or "UNKNOWN"
    base = base.replace(" ", "_")
    if period:
        start, end = period
        name = f"{base}_{start}_{end}"
    else:
        name = f"{base}_nodates"
    return f"{name}{suffix}"


def main():
    load_accounts_data(Path(__file__).resolve().parent / "config" / "accounts.toml")

    renamed_main = ROOT / "renamed-statements"
    renamed_future = ROOT / "renamed-statements-2025"
    main_hashes = collect_hashes(list(renamed_main.glob("*.xlsx")))
    future_hashes = collect_hashes(list(renamed_future.glob("*.xlsx")))  # currently unused, but kept for reference

    dest_root = ROOT / "raw-consolidated"
    matched_root = dest_root / "raw-matched"
    extra_root = dest_root / "raw-extra"
    if dest_root.exists():
        shutil.rmtree(dest_root)
    matched_root.mkdir(parents=True, exist_ok=True)
    extra_root.mkdir(parents=True, exist_ok=True)

    raw_files = [
        p
        for p in ROOT.rglob("*.xlsx")
        if not any(part.startswith("renamed-statements") for part in p.parts)
        and "raw-consolidated" not in p.parts
        and "draft" not in p.parts
        and p.name.lower() != "statements.xlsx"
    ]

    manifest_lines = [
        "dest\tsource\taccount_id\talias\tstart\tend\tmd5\tcategory",
    ]
    used_names: Dict[str, int] = {}

    for p in sorted(raw_files):
        rel_src = p.relative_to(ROOT)
        period = extract_period(p)
        account_id = extract_account_id(p) or p.parent.name.split()[0]
        alias = display_name(account_id, account_id)
        start_str = period[0].isoformat() if period else ""
        end_str = period[1].isoformat() if period else ""

        base_name = normalize_name(alias, account_id, (start_str, end_str) if period else None, ".xlsx")
        if base_name in used_names:
            used_names[base_name] += 1
            name = f"{base_name.rsplit('.xlsx',1)[0]}_{used_names[base_name]}.xlsx"
        else:
            used_names[base_name] = 0
            name = base_name

        temp_dest = dest_root / name
        shutil.copy2(p, temp_dest)
        h = md5sum(temp_dest)

        if h in main_hashes:
            category = "matched_main"
            final_dest = matched_root / name
        else:
            category = "extra"
            final_dest = extra_root / name

        shutil.move(temp_dest, final_dest)

        manifest_lines.append(
            f"{final_dest.relative_to(dest_root)}\t{rel_src}\t{account_id}\t{alias}\t{start_str}\t{end_str}\t{h}\t{category}"
        )

    manifest_path = dest_root / "manifest.tsv"
    manifest_path.write_text("\n".join(manifest_lines), encoding="utf-8")
    print(f"Consolidated {len(raw_files)} raw files into {dest_root}")
    print(f" - matched_main: {len(list(matched_root.glob('*.xlsx')))} files")
    print(f" - extra: {len(list(extra_root.glob('*.xlsx')))} files")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
