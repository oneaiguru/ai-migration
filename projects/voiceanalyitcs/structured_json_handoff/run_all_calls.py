#!/usr/bin/env python3
"""
Batch runner for converter_stub across all 20 calls.

Discovers VTT/timestamps in repo calls/ or external golden folder,
runs converter_stub.convert_call, and copies outputs to a Desktop folder.
"""

import shutil
from pathlib import Path
from typing import Optional, Sequence, Tuple

from converter_stub import convert_call, REPO_ROOT, OUTPUT_DIR


EXTERNAL_CALLS_BASE = Path("/Users/m/Documents/_move_back/desikotmoveafterjuryback/golden_review_package_full/calls")
DESKTOP_OUT = Path.home() / "Desktop" / "preprocessor_all_calls_signals"


def find_first(external_dir: Path, names: Sequence[str]) -> Optional[Path]:
    for name in names:
        candidate = external_dir / name
        if candidate.exists():
            return candidate
    return None


def resolve_paths(call_id: str) -> Tuple[Optional[Path], Optional[Path]]:
    external_call = EXTERNAL_CALLS_BASE / f"call_{call_id}"
    vtt = find_first(
        external_call,
        ["transcript-2.vtt", "transcript-3.vtt", "transcript.vtt", "transcript-1.vtt"],
    )
    timestamps = find_first(
        external_call,
        ["timestamps-2.json", "timestamps-3.json", "timestamps.json", "timestamps-1.json"],
    )
    return vtt, timestamps


def main():
    DESKTOP_OUT.mkdir(parents=True, exist_ok=True)
    # Clear previous run artifacts in the desktop folder (only our call_* jsons)
    for old in DESKTOP_OUT.glob("call_*_structured*.json"):
        try:
            old.unlink()
        except Exception:
            pass
    configs = []
    for i in range(1, 21):
        call_id = f"{i:02d}"
        vtt_path, ts_path = resolve_paths(call_id)
        if not vtt_path:
            print(f"[SKIP] call_{call_id}: no VTT found")
            continue
        configs.append(
            {
                "call_id": call_id,
                "operator": f"Operator_{call_id}",
                "vtt": vtt_path,
                "diar": ts_path,
                "total_ms": None,
                "date": None,
                "out": f"call_{call_id}_structured.json",
                "simplified_out": f"call_{call_id}_structured_input_min.json",
                "signals_out": f"call_{call_id}_structured_input_signals.json",
            }
        )

    processed_signals = []
    for cfg in configs:
        out = convert_call(
            call_id=cfg["call_id"],
            operator=cfg["operator"],
            vtt_path=cfg["vtt"],
            diarized_path=cfg.get("diar"),
            total_duration_ms=cfg.get("total_ms"),
            date_str=cfg.get("date"),
            out_name=cfg.get("out"),
            simplified_out_name=cfg.get("simplified_out"),
            signals_out_name=cfg.get("signals_out"),
        )
        print(f"[OK] call_{cfg['call_id']} -> {out}")
        sig = cfg.get("signals_out")
        if sig:
            sig_path = OUTPUT_DIR / sig
            if sig_path.exists():
                processed_signals.append(sig_path)

    # Copy outputs to Desktop
    for path in processed_signals:
        dest = DESKTOP_OUT / path.name
        shutil.copy2(path, dest)
    print(f"Copied {len(processed_signals)} signals-only outputs to {DESKTOP_OUT}")


if __name__ == "__main__":
    main()
