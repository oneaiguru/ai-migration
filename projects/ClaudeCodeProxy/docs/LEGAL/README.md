# License Verification (CCP ⇄ AgentOS)

CCP uses offline, signed license claims. Verification is Ed25519-based and does not
require network access.

## Key bundle

- Path: `docs/LEGAL/PUBKEYS.json`
- Format:

```
{
  "version": "YYYY-MM-DD",
  "keys": [
    { "id": "default", "type": "ed25519", "base64": "<pubkey>" }
  ]
}
```

AgentOS (or any integrator) can load this bundle and verify signed license JSON using
Ed25519. CCP already verifies at startup when `--license-json`/`--license-sig` flags (or
env) are provided.

## CCP startup flags (recap)

- `--license-json <path>`: path to signed license JSON (base64-encoded JSON contents).
- `--license-sig  <path>`: path to signature (base64 for Ed25519 signature over the JSON).

On success, CCP exposes the plan and feature set internally (no secret material is ever
logged). When no license is provided, CCP runs in community mode.

## /readyz license surface (additive)

`GET /readyz` JSON now includes a `license` block:

```
{
  "providers": { ... },
  "ts": 1761267000.0,
  "license": { "ok": true, "plan": "pro", "features": ["zai_offload"] }
}
```

This is informational only and can be used by AgentOS to gate optional flows. Absence of
the block means community mode.

## AgentOS usage

- Load `PUBKEYS.json`, pick the `id` you trust (default), and verify the claim the user
  supplies. For convenience, you can ship the key bundle under an optional extra
  (`agentos[ccc]`) and refresh it as needed.

## Security notes

- Keys are public; do not include any private material.
- Keep verification offline-first to avoid runtime failures.
- Treat license feature toggles as hints only; the shim should remain safe by default.

