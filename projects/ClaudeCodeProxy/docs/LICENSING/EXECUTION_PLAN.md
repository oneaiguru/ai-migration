# Execution Plan — Licensing

## L1: Pack & Verify
- Schema: `{"license":{...},"signature":"BASE64"}`; Ed25519 over canonical JSON; `kid` selects pubkey.
- CLI: `cc license status --pack ~/.config/ccp/license.pack`.
- Tests: golden good/bad/expired/wrong-kid.

## L2: Local Issuer
- Endpoints: `/v1/license/issue`, `/v1/device/begin`, `/v1/device/poll`.
- State: JSON files (invites, device codes, license packs).
- Rate limits & TTL.

## L3: CLI UX
- `cc license login [--issuer URL] [--loopback]`
- `cc license set <PACK>`
- `cc license status`

## L4: Shim Gating
- Gate offload by feature flag (e.g., `zai_offload`).
- `/readyz` includes `reason:"license"`.
- `make smoke-license` toggles lanes.

## DoD
- End-to-end works offline except initial issuer call; robust tests & docs.
