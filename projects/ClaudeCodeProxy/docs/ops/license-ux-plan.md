## Metadata
- Task: License UX overhaul (loopback/device flow, single-pack CLI)
- Discovery: docs/Tasks/license_ux_discovery.md
- Related docs: bin/cc, services/go-anth-shim/cmd/licissuer/main.go, services/go-anth-shim/cmd/ccp/main.go

## Desired End State
Users run `cc license login` to complete a browser-based (PKCE) flow or `cc license set <PACK>` to paste a single string. The CLI persists the pack in `~/.config/ccp/license.pack`, and the shim already consumes it. The issuer exposes `/v1/device/begin` and `/v1/device/poll`, stores invite/poll state durably, and returns `license_pack` to existing clients. Device-code fallback works for SSH. Observability shows license plan/kid, and tests cover CLI, issuer, and shim integration.

### Key Discoveries
- docs/Tasks/license_ux_discovery.md:4-16 — UX goals: loopback/device flow, single pack, CLI commands, persistence.
- docs/Tasks/license_ux_discovery.md:6-9 — Current gaps: issuer lacks pack endpoint/device flow; CLI has no license helpers.

## What We're NOT Doing
- No changes to policy-pack logic, sandbox/L2 tracks, or proxy-guard deployment.
- No alteration to shim routing heuristics (`FORCE_HAIKU_TO_ZAI`, policy engine) beyond existing license activation.
- No public SaaS billing integration (Stripe/LemonSqueezy) in this iteration; we'll stub webhook references only.

## Implementation Approach
Reuse the existing Go issuer for signing logic, layering new endpoints, storage, and CLI helpers. Extend the bash-based `cc` CLI with modular `license_*` functions and reuse `scripts/go-env.sh`. Persist device codes in a lightweight storage (JSON file) first, with an interface ready for Supabase swap. Leverage existing logging (`license_active`, `license_plan`, `license_kid`) to assert success.

## Phase 1: CLI Single-Pack Support
### Overview
Provide `cc license set` and `cc license status` commands so users can paste/output packs locally without manual env exports.

### Changes Required
1. CLI helper
   **File**: `bin/cc`
   **Changes**:
   - Add subcommands `license set <PACK>`, `license status`, parsing pack string, saving to `~/.config/ccp/license.pack`, verifying via shim helper script.
   - Introduce helper function to call `services/go-anth-shim/bin/ccp license verify` (added later) or direct shim binary to validate pack.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: bin/cc
   @@
   +license_dir="$HOME/.config/ccp"
   +license_pack="$license_dir/license.pack"
   +
   +cmd_license_set() {
   +  local pack="${1:-}"
   +  if [[ -z "$pack" ]]; then
   +    echo "Usage: cc license set <LICENSE_PACK>" >&2
   +    exit 1
   +  fi
   +  mkdir -p "$license_dir"
   +  cat <<'EOF' >"$license_pack.tmp"
   +$pack
   +EOF
   +  mv "$license_pack.tmp" "$license_pack"
   +  echo "[cc] Saved license pack to $license_pack"
   +}
   +
   +cmd_license_status() {
   +  if [[ ! -f "$license_pack" ]]; then
   +    echo "[cc] No license pack at $license_pack"; exit 0
   +  fi
   +  ./services/go-anth-shim/bin/ccp license status --pack "$license_pack"
   +}
   *** End Patch
   PATCH
   ```

2. Shim CLI entrypoint
   **File**: `services/go-anth-shim/cmd/ccp/main.go`
   **Changes**:
   - Add subcommand `license status` (accessible via `go run` or binary) to print plan/features/exp/kid for a supplied pack file.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: services/go-anth-shim/cmd/ccp/main.go
   @@
   +if len(os.Args) > 1 && os.Args[1] == "license" {
   +    handleLicenseCli(os.Args[2:])
   +    return
   +}
   *** End Patch
   PATCH
   ```
   - Implement `handleLicenseCli` to read pack, call `license.VerifyBytes`, and pretty-print details.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: services/go-anth-shim/cmd/ccp/main.go
   @@
   +func handleLicenseCli(args []string) {
   +    fs := flag.NewFlagSet("license", flag.ExitOnError)
   +    packPath := fs.String("pack", defaultLicensePackPath(), "Path to license pack file")
   +    fs.Parse(args)
   +    cmd := fs.Arg(0)
   +    switch cmd {
   +    case "status":
   +        data, err := os.ReadFile(*packPath)
   +        if err != nil {
   +            log.Fatalf("read pack: %v", err)
   +        }
   +        lic, err := license.VerifyBytes(licensePubKeys, nil, strings.TrimSpace(string(data)), time.Now(), hostHash())
   +        if err != nil {
   +            log.Fatalf("verify pack: %v", err)
   +        }
   +        fmt.Printf("plan=%s features=%v exp=%s kid=%s\n", lic.Plan, lic.Features, time.Unix(lic.Exp, 0).UTC().Format(time.RFC3339), lic.Kid)
   +    default:
   +        log.Fatalf("usage: ccp license status [--pack FILE]")
   +    }
   +}
   *** End Patch
   PATCH
   ```

## Phase 2: Issuer `license_pack` Output
### Overview
Expose pack string from `/v1/license/issue` so CLI can fetch it, and persist invite counters.

### Changes Required
1. Response struct update
   **File**: `services/go-anth-shim/cmd/licissuer/main.go`
   **Changes**:
   - Include `LicensePack string` in `issueResponse`.
   - Generate `pack = base64.RawURLEncoding.EncodeToString(licData) + "." + base64.RawURLEncoding.EncodeToString(sig)`.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: services/go-anth-shim/cmd/licissuer/main.go
   @@
   -type issueResponse struct {
   -    License   json.RawMessage `json:"license"`
   -    SigB64    string          `json:"sigB64"`
   -    PubKeyB64 string          `json:"pubKeyB64"`
   -    Plan      string          `json:"plan"`
   -    Features  []string        `json:"features"`
   -    Exp       int64           `json:"exp"`
   -}
   +type issueResponse struct {
   +    License     json.RawMessage `json:"license"`
   +    SigB64      string          `json:"sigB64"`
   +    LicensePack string          `json:"license_pack"`
   +    PubKeyB64   string          `json:"pubKeyB64"`
   +    Plan        string          `json:"plan"`
   +    Features    []string        `json:"features"`
   +    Exp         int64           `json:"exp"`
   +}
   *** End Patch
   PATCH
   ```
2. Persistence stub
   **File**: `services/go-anth-shim/cmd/licissuer/main.go`
   **Changes**:
   - After incrementing `Redeemed`, write invites map to disk (`invites.json`). Add new helper `saveInvites`.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: services/go-anth-shim/cmd/licissuer/main.go
   @@
   -    inv.cfg.Redeemed++
   -    s.invites[req.InviteCode] = inv
   +    inv.cfg.Redeemed++
   +    s.invites[req.InviteCode] = inv
   +    _ = saveInvites("invites_state.json", s.invites)
   *** End Patch
   PATCH
   ```

## Phase 3: Device Code Flow (CLI + Issuer) – ✅ shipped
### Overview
Implement begin/poll endpoints and CLI `license login` with polling + device code fallback.

### Changes Required
1. Issuer endpoints
   **File**: `services/go-anth-shim/cmd/licissuer/main.go`
   **Changes**:
   - Add `deviceState` struct (code, pollToken, license pack, expiry).
   - New handlers: `/v1/device/begin`, `/v1/device/poll`, storing state in memory + `device_state.json`.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: services/go-anth-shim/cmd/licissuer/main.go
   @@
   +mux.HandleFunc("/v1/device/begin", srv.handleDeviceBegin)
   +mux.HandleFunc("/v1/device/poll", srv.handleDevicePoll)
   *** End Patch
   PATCH
   ```
2. CLI login command
   **File**: `bin/cc`
   **Changes**:
   - Add `cmd_license_login` that calls `/v1/device/begin`, opens browser (using `open` / `xdg-open`), polls `poll_token`, saves pack.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: bin/cc
   @@
   +cmd_license_login() {
   +  local begin_json
   +  begin_json=$(curl -sS http://127.0.0.1:8787/v1/device/begin -d "{}" -H 'content-type: application/json')
   +  local authorize_url poll_token interval
   +  authorize_url=$(echo "$begin_json" | jq -r '.authorize_url')
   +  poll_token=$(echo "$begin_json" | jq -r '.poll_token')
   +  interval=$(echo "$begin_json" | jq -r '.interval // 2')
   +  echo "[cc] Opening browser for license authorization..."
   +  (command -v open >/dev/null && open "$authorize_url") || xdg-open "$authorize_url" || echo "Visit: $authorize_url"
   +  while true; do
   +    sleep "$interval"
   +    local poll_json
   +    poll_json=$(curl -sS http://127.0.0.1:8787/v1/device/poll -d "{\"poll_token\":\"$poll_token\"}" -H 'content-type: application/json')
   +    if [[ $(echo "$poll_json" | jq -r '.status') == "ok" ]]; then
   +      cmd_license_set "$(echo "$poll_json" | jq -r '.license_pack')"
   +      cmd_license_status
   +      break
   +    fi
   +  done
   +}
   *** End Patch
   PATCH
   ```

## Phase 4: Loopback OAuth Flow (Optional Enhancement) – ✅ shipped
`cc license login --loopback` now spins up a localhost listener (see `scripts/license/login_loopback.sh`), requests a redirect-aware `authorize_url` via `/v1/device/begin`'s new `redirect_url` field, and auto-captures the browser callback. The issuer formats overrides via `formatAuthorizeURL`, and the CLI tears everything down via a `trap` once the pack lands.

## Tests & Validation
- `ALLOW_REAL_API=1 SMOKE_LANES=zai make smoke-license` — ensure Haiku routes via Z.AI after CLI login (set `USE_LICENSE_LOGIN=1` to exercise the new flow without exporting env vars).
- `go test ./services/go-anth-shim/cmd/licissuer -run TestDeviceFlow` (add tests to cover begin/poll once implemented).
- `shellcheck bin/cc scripts/license/login_loopback.sh` — ensure CLI scripts remain portable.
- Manual: `cc license set $(cat pack)` then `cc license status` prints plan/features/exp.

## Rollback
- Remove `~/.config/ccp/license.pack` to return to community mode.
- `git checkout -- bin/cc services/go-anth-shim/cmd/licissuer/main.go services/go-anth-shim/cmd/ccp/main.go scripts/license/login_loopback.sh` to revert code.
- Delete persisted state files (`invites_state.json`, `device_state.json`).

## Handoff
- Update `docs/SESSION_HANDOFF.md` with new CLI commands and activation flow.
- Record executed validation commands and resulting packs in `docs/BUGLOG.md` or `results/TESTS.md`.
