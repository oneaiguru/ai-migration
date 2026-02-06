````md
# ADR-0001: License Pack Format (Ed25519 over Canonical JSON)

**Status**: Proposed
**Date**: 2025-10-23
**Decision Owner**: Licensing Track L1

## Context
We need an offline-verifiable license mechanism to gate premium features (e.g., Z.AI offload) in a local CLI/shim. Requirements:
- No secrets in the license (only plan/features/exp/kid/device).
- Client-side verify, no network dependency.
- Easy to paste/store and inspect (human-friendly).

## Options
1) **Canonical JSON + Ed25519 signature (detached)**
   - Pack: `{"license":{...},"signature":"BASE64"}`
   - Client verifies JSON (canonicalized) against embedded pubkey(s) by `kid`.

2) **JWS (JOSE)**
   - JSON Web Signature with JOSE headers. Mature libs, but extra complexity and bloat for CLI UX.

3) **PASETO**
   - Modern JWT alternative. Good crypto defaults, but fewer standard tooling options on all platforms.

## Decision
**Option 1: Canonical JSON + Ed25519 (detached)** for MVP.

**Rationale**
- Minimal, dependency-light, easy to debug.
- Fits “paste a single string” and device-flow UX.
- Clear separation of data (`license`) and signature.

## Consequences
- We must ship a tiny canonicalizer and Ed25519 verify in the shim.
- To interop with other systems later, we can add a JWS adapter, but MVP remains small.

## Structure
```json
{
  "license": {
    "schema": "ccp.license.v1",
    "kid": "main-2025-10",
    "plan": "trial|pro|enterprise",
    "features": ["zai_offload"],
    "exp": 1761782400,
    "device": "optional-host-hash"
  },
  "signature": "BASE64_ED25519_SIG"
}
````

## Open Questions

* Whether to bind `device` (hostname hash) for paid tiers. See ADR-0003.

````