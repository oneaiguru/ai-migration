# ADR-0009: Key Management & Rotation

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- Embed **public keys** with `kid`s in shim.
- Issue licenses signed with server-side **Ed25519** private key.
- Rotate by publishing a new `kid` and updating shim in releases.

## Rationale
- Simple; avoids online trust.
- Backward compatible with multiple keys embedded.

## Consequences
- Need release discipline for key rotation & sunsets.
