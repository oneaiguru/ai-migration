# ADR-0003: License Binding & Offline Behavior

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- **Trial/Pro**: No binding by default (portable across dev machines).
- **Enterprise**: Optional **device binding** via hostname hash; issuer includes `device` claim.
- **Offline**: License is valid until `exp`. We rely on expiry/rotation rather than online revocation.

## Rationale
- Developer ergonomics first; minimize lock-in surprises.
- Device binding only where required by compliance.

## Consequences
- Document portability clearly.
- Provide a “grace” window policy later if needed (not MVP).
