# Licensing Control Plane (Invite Trial → Payments Later)

## Local development quick start

1. Generate signing key (32-byte seed + public key): `go run tools/license_keygen.go`.
2. Update `licensePubKeyB64` in `services/go-anth-shim/cmd/ccp/main.go` if you rotate keys.
3. Drop the seed into env: `export PRIVATE_SEED_B64=...`.
4. Start the issuer: `go run services/go-anth-shim/cmd/licissuer/main.go --invites configs/invites.dev.json`.
5. Issue a license:
   ```bash
   curl -s http://127.0.0.1:8787/v1/license/issue \
     -H 'content-type: application/json' \
     -d '{"invite_code":"DEV-TRIAL-7D","email":"test@example.com"}'
   ```
6. Write outputs to files and point the shim:
   ```bash
   jq -r '.license' lic.json > license.json
   jq -r '.sigB64'  lic.json > license.sig
   export CC_LICENSE_JSON=$(pwd)/license.json
   export CC_LICENSE_SIG=$(cat license.sig)
   ```
   Or combine them once and let the helper script validate + persist the pack:
   ```bash
   jq '{license:.license,signature:.sigB64}' lic.json | cc license set
   cc license status
   ```
7. `ccc-on` (or `make go-proxy` + `source scripts/go-env.sh 8082`) → Haiku routes to Z.AI.
8. `ALLOW_REAL_API=1 make smoke-license` anytime you want to confirm the gate (community → trial → community). Use `SMOKE_LANES=zai` when you want the script to exercise only the Z.AI leg (no Anthropic calls).
9. Prefer the device flow? Start the issuer on :8787 and run:
   ```bash
   USE_LICENSE_LOGIN=1 LICISSUER_BASE_URL=http://127.0.0.1:8787 make smoke-license
   # or interactively
   ./bin/cc license login --issuer http://127.0.0.1:8787 --no-browser --invite DEV-TRIAL-7D
   ./bin/cc license login --issuer http://127.0.0.1:8787 --loopback --invite DEV-TRIAL-7D
   ```
   The CLI prints the device code, polls `/v1/device/poll`, and persists the returned `license_pack`. With `--loopback`, it also spins up a temporary localhost listener to capture the browser redirect automatically (prints the port first, then the confirmation code).

The issuer keeps in-memory redemption counts and ships with a default invite `DEV-TRIAL-7D` that never exhausts. Provide a JSON file to enforce limits.

### Invite file schema (`.json`)

```json
{
  "VIBE-TRIAL-7D": {
    "plan": "trial",
    "features": ["zai_offload"],
    "ttl_days": 7,
    "max_redemptions": 100,
    "expires_at": "2025-11-01T00:00:00Z"
  }
}
```

### Flags & env

- `--addr` (`LICISSUER_ADDR`): listen address (default `:8787`).
- `--seed` (`PRIVATE_SEED_B64`): required Ed25519 seed.
- `--kid` (`LICISSUER_KID`): key id embedded in licenses.
- `--invites` (`LICISSUER_INVITES`): JSON config for invite codes.
- `LICISSUER_INVITES_STATE`: optional path to persist dynamic invite counters (defaults to `invites_state.json`).
- `LICISSUER_DEVICE_STATE`: path for persisted device-code state (defaults to `device_state.json`).
- `LICISSUER_AUTHORIZE_BASE`: base URL for device authorization pages (defaults to `https://example.com/activate`).

### Response payload

```json
{
  "license": { ...ccp.license.v1... },
  "sigB64": "...",
  "license_pack": "{\"license\":{...},\"signature\":\"...\"}",
  "pubKeyB64": "...",
  "plan": "trial",
  "features": ["zai_offload"],
  "exp": 1761707395
}
```

`license` is ready to write as `license.json`; `sigB64` is the detached signature the shim expects; `license_pack` is a single JSON string (`{"license":{...},"signature":"..."}`) that `cc license set` can consume directly; `pubKeyB64` lets clients verify they’re using the right constant.

### Device flow endpoints

- `POST /v1/device/begin`
  - Body: `{ "invite_code": "DEV-TRIAL-7D", "email": "optional", "device": "hostname", "redirect_url": "optional" }`
  - Response: `{ "user_code": "AB-CD-EF-GH", "poll_token": "...", "authorize_url": "...", "interval": 2, "expires_in": 300, ... }`
  - Side-effects: issues a license using the invite, stores the resulting `license_pack` in `device_state.json` (ready immediately for now), and bumps invite redemption counts.
  - `redirect_url` may contain `%s` or `{code}` placeholders (or omit them, in which case the server appends `?code=`). The CLI uses this to target the loopback helper when `--loopback` is requested.
- `POST /v1/device/poll`
  - Body: `{ "poll_token": "..." }`
  - Responses:
    - `{ "status": "pending" }` while waiting
    - `{ "status": "ok", "license_pack": "{...}" }` once ready (the pack matches what `cc license set` expects)
    - `{ "status": "expired" }` after timeout
    - `{ "status": "not_found" }` when the token is unknown/cleared
- Device/state persistence mirrors invites: JSON snapshots under the configured state paths so CLI restarts can resume polling.

## Deploying beyond local

- **Supabase**: wrap the same logic in an Edge Function; call `ed25519.Sign` with the seed stored as a secret.
- **Cloud Run/App Runner**: containerise `licissuer`; mount invite JSON via config map or S3.
- **VPS**: run binary under systemd, keep `PRIVATE_SEED_B64` in the unit env; enable HTTPS with Caddy/NGINX.

Later, attach Stripe/LemonSqueezy webhooks that hit `/v1/license/issue` with a paid plan invite to extend `ttl_days`.

## Bundled assets

- Trial license pair: `services/go-anth-shim/testdata/license/trial_license.json` / `.sig` (7-day expiry, `zai_offload`).
- Invite issuer command: `services/go-anth-shim/cmd/licissuer`.
- Sample invites (create `configs/invites.dev.json` based on the schema above).
- License pack format: `{ "license": { ... }, "signature": "BASE64" }`. Drop it at `~/.config/ccp/license.pack` or point the shim at it with `--license-pack` / `CC_LICENSE_PACK` when you bundle the two files together.

Keep the signing seed private; only the public key lives in the repo/client.
