"""Lightweight license pack loader/validator aligned with CCP ADRs."""

from __future__ import annotations

import base64
import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, Iterable, Optional

__all__ = [
    "LicenseError",
    "LicenseClient",
]


class LicenseError(RuntimeError):
    """Raised when license packs fail validation or entitlement checks."""


@dataclass
class LicensePack:
    payload: Dict[str, object]
    signature: str


def _canonical_dumps(obj: Dict[str, object]) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


VerifyCallable = Callable[[str, Dict[str, object], str], None]


class LicenseClient:
    """Handle loading and validating license packs referencing CCP ADRs."""

    def __init__(
        self,
        pack_path: Optional[Path] = None,
        *,
        pubkeys: Optional[Dict[str, str]] = None,
        verifier: Optional[VerifyCallable] = None,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._pack_path = Path(pack_path) if pack_path else None
        self._pubkeys = pubkeys or {}
        self._verifier = verifier or self._default_verify
        self._clock = clock
        self._pack: Optional[LicensePack] = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def load_pack(self, pack_path: Optional[Path] = None) -> LicensePack:
        selected = pack_path or self._pack_path
        if selected is None:
            raise LicenseError("No license pack path configured")
        path = Path(selected)
        if not path.exists():
            raise LicenseError(f"License pack not found at {path}")

        raw = path.read_text(encoding="utf-8").strip()
        data = json.loads(raw)

        if "license" in data and "signature" in data:
            pack = LicensePack(payload=data["license"], signature=data["signature"])
        else:
            # Support split {license, signature} files (lic.json + lic.sig).
            sig_path = path.with_suffix(path.suffix + ".sig") if path.suffix else path.with_name(f"{path.name}.sig")
            if not sig_path.exists():
                raise LicenseError("Signature file missing for split license pack")
            signature = sig_path.read_text(encoding="utf-8").strip()
            pack = LicensePack(payload=data, signature=signature)

        self._pack = pack
        return pack

    def validate_pack(self, pack: Optional[LicensePack] = None) -> Dict[str, object]:
        pack = pack or self._pack
        if not pack:
            raise LicenseError("License pack not loaded")

        payload = pack.payload
        required = {"schema", "kid", "plan", "features", "exp"}
        if not required.issubset(payload):
            missing = required - payload.keys()
            raise LicenseError(f"License pack missing fields: {sorted(missing)}")

        kid = str(payload["kid"])
        if kid not in self._pubkeys:
            raise LicenseError(f"Unknown key id '{kid}'")

        self._verifier(kid, payload, pack.signature)

        exp = float(payload["exp"])
        if exp < self._clock():
            raise LicenseError("License pack expired")

        features = payload.get("features")
        if not isinstance(features, list):
            raise LicenseError("License features must be a list")

        return payload

    def bind_device(self, device_id: str) -> None:
        payload = self.ensure_payload()
        bound_device = payload.get("device")
        if bound_device and bound_device != device_id:
            raise LicenseError("License bound to a different device")

    def check_entitlement(self, feature: str) -> bool:
        payload = self.ensure_payload()
        features: Iterable[str] = payload.get("features", [])  # type: ignore[assignment]
        return feature in features

    def ensure_payload(self) -> Dict[str, object]:
        pack = self._pack
        if not pack:
            raise LicenseError("License pack not loaded")
        return pack.payload

    def refresh(self) -> Dict[str, object]:
        pack = self.load_pack()
        return self.validate_pack(pack)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _default_verify(self, kid: str, payload: Dict[str, object], signature: str) -> None:
        pubkey_b64 = self._pubkeys.get(kid)
        if not pubkey_b64:
            raise LicenseError(f"Missing public key for kid '{kid}'")

        try:
            from cryptography.exceptions import InvalidSignature  # type: ignore
            from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey  # type: ignore
        except ModuleNotFoundError as exc:  # pragma: no cover - optional dependency
            raise LicenseError("cryptography package required for default verification") from exc

        message = _canonical_dumps(payload)
        signature_bytes = base64.b64decode(signature)
        pubkey_bytes = base64.b64decode(pubkey_b64)
        try:
            Ed25519PublicKey.from_public_bytes(pubkey_bytes).verify(signature_bytes, message)
        except InvalidSignature as exc:  # pragma: no cover - pass through for clarity
            raise LicenseError("License signature invalid") from exc


__all__.append("LicensePack")
