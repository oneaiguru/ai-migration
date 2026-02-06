# docs/ADR/ADR-0011-license-pack-format.md

Status: Accepted
Date: 2025-10-23 10:44 UTC

Decision
Use an **Ed25519-signed JSON “license pack”** as the only artifact the client needs. The pack is a compact JSON string:
{ "license": { ... }, "signature": "BASE64" }

Rationale
- Offline verification with a baked-in public key; no JWS library dependency or clock skew pitfalls.
- Simple CLI UX: `cc license set <PACK>`; persistence at `~/.config/ccp/license.pack`.
- Matches our Go verifier already present; aligns with device-code flow.

Consequences
- Rotation: publish new pubkey in the binary; support multiple pubkeys in verifier for rolling windows.
- Revocation: rely on short TTL + renewal; no phone-home in the hot path.
- Server: issuer signs packs and returns the single string; webhooks can carry the same string.

Migration
- None (new). For future: add multi-key support and pack version field.
