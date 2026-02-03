#!/usr/bin/env python3
"""Minimal CLI to exercise the CCC adapter end-to-end."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from agentos.integrations.ccc_client import CCCClient
from agentos.licensing.client import LicenseClient
from agentos.privacy.tier import Full, LocalOnly, Minimized


def _build_license_client(path: Path | None, tier: str) -> LicenseClient | None:
    if tier == "local":
        return None
    if path is None:
        raise SystemExit("--license is required for minimized/full tiers")

    dummy_pubkey = "ZmFrZS1wdWJrZXk="  # replace with real key in production

    def _noop_verify(kid: str, payload: Dict[str, object], signature: str) -> None:
        # TODO: replace with Ed25519 verification once pubkeys are wired.
        return None

    kid = payload_kid(payload_path=path)

    return LicenseClient(
        pack_path=path,
        pubkeys={kid: dummy_pubkey},
        verifier=_noop_verify,
        clock=lambda: 0,
    )


def payload_kid(payload_path: Path) -> str:
    data = json.loads(payload_path.read_text(encoding="utf-8"))
    if "license" in data:
        return str(data["license"].get("kid", "test-key"))
    return str(data.get("kid", "test-key"))


def _resolve_privacy(name: str):
    match name:
        case "local":
            return LocalOnly()
        case "minimized":
            return Minimized()
        case "full":
            return Full()
        case _:
            raise SystemExit(f"Unsupported privacy tier '{name}'")


def main(argv: List[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=Path("data/integration/sample"))
    parser.add_argument("--base-url", default="https://example.invalid")
    parser.add_argument("--api-key", default="dev-key")
    parser.add_argument("--privacy", choices=["local", "minimized", "full"], default="local")
    parser.add_argument("--license", type=Path, help="Path to license pack (JSON)")
    args = parser.parse_args(argv)

    args.data_dir.mkdir(parents=True, exist_ok=True)

    transport_log: List[tuple[str, Dict[str, object]]] = []

    def _transport(route: str, payload: Dict[str, object]) -> None:
        transport_log.append((route, payload))

    privacy = _resolve_privacy(args.privacy)
    license_client = _build_license_client(args.license, args.privacy)

    client = CCCClient(
        base_url=args.base_url,
        api_key=args.api_key,
        data_dir=args.data_dir,
        privacy=privacy,
        licensing=license_client,
        transport=_transport,
    )

    session_id = client.start_session(
        repo_id="agentos-repo",
        branch="main",
        commit="HEAD",
        license_id="sample",
        metadata={"example": True},
    )
    client.log_event(
        model="glm/test" if args.privacy != "local" else "anthropic/sample",
        subagent="executor",
        tokens_in=42,
        tokens_out=128,
        input_kind="text",
        latency_ms=987,
        measurement={"cls": 1.0, "impf": 3.0, "churn_score": 0.1, "feature_delta": 1.0},
        value={"summary": "Sample task", "links": []},
        attribution={"glm/test" if args.privacy != "local" else "claude-3": 1.0},
        capacity_used=0.5,
    )
    summary = client.upload_minimized_metrics()
    client.end_session()

    print("Session:", session_id)
    print("Metrics summary:")
    print(json.dumps(summary, indent=2))

    if transport_log:
        print("\nNetwork payloads:")
        for route, payload in transport_log:
            print(route, json.dumps(payload, indent=2))
    else:
        print("\nNo network payloads emitted (local tier).")


if __name__ == "__main__":
    main()
