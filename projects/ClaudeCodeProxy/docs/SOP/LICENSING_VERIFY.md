# Licensing Verification SOP (Offline Ed25519)

Summary
- Use the published key bundle to verify signed license JSON offline.
- Optional `/readyz` license block surfaces plan/features for ops.

Read first
- `docs/LEGAL/README.md`
- `docs/LEGAL/PUBKEYS.json`

Operator commands (CCC)
```bash
./services/go-anth-shim/bin/ccp serve --license-json path/to/lic.json --license-sig path/to/lic.sig
curl -s :8082/readyz | jq '.license'
```

Notes
- Keys are public; never commit private material.
- Keep verification offline‑first.

