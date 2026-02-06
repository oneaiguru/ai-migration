# ADR-0004: Pack Distribution & Revocation

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- Packs delivered via **issuer** or manual paste.
- Shim caches a **last-known-good** pack; verification uses embedded pubkeys.
- **Revocation** is via short TTL (`exp`) and **pubkey rotation** (`kid`). No CRL in MVP.

## Rationale
- Offline-friendly; simple.
- If leakage occurs, rotate keys quickly and revoke via `exp`.

## Consequences
- Operators must accept that revocation is not instantaneous.
- Logging must never include pack content (only plan/features/exp/kid).
