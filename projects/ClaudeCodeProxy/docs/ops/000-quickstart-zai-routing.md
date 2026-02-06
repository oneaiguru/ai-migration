**Goal:** Start the Go shim locally and route Haiku → Z.AI with the current paywall.

> Note: machine-specific profile tweaks (e.g. custom UAT flows) live in the private wiki; this guide stays platform-agnostic.

## A) Start the shim (keep this shell open)

```bash
cd /Users/m/git/tools/ClaudeCodeProxy
./scripts/install-shell-aliases.sh   # one-time, if not already sourced
ccc-on                               # starts shim, exports proxy env, tails usage (Ctrl-C to stop tail)
```

- Trial license ships in the repo; if you need it set before `ccc-on`, export:
  ```bash
  export CC_LICENSE_JSON=$(pwd)/services/go-anth-shim/testdata/license/trial_license.json
  export CC_LICENSE_SIG=$(pwd)/services/go-anth-shim/testdata/license/trial_license.sig
  export ZAI_API_KEY=$(grep -Ev '^[[:space:]]*#' .env | head -n1 | tr -d '\r')
  ```
- `ccc-status` prints the active port/profile; `ccc-logs` retails `usage.jsonl` if you want a separate tail.
  Run `ccc-status` at any time to see the active port/profile and the shim’s `/healthz` response.
- Manual fallback (if aliases unavailable):
  ```bash
  make go-proxy
  source scripts/go-env.sh 8082
  tail -f "${CCP_LOGS_DIR:-logs}/usage.jsonl"
  ```

## B) Use it from other shells

```bash
# in your project repo (leave the ccc-on shell running)
claude -p --model haiku "Say hi" --output-format json

# confirm lane
cd /Users/m/git/tools/ClaudeCodeProxy
LOG_FILE="${CCP_LOGS_DIR:-logs}/usage.jsonl"
rg '"lane":"zai".*"model":"claude-haiku' "$LOG_FILE"
```

- `/model haiku` routes to Z.AI; `/model sonnet|opus` remains on Anth lane.
- CLI `/context`, `/plan`, etc. work as usual; if routing falls back you’ll see `decision:"license_block"` in the log.
- The shim ignores `ANTHROPIC_BASE_URL`/`ZAI_BASE_URL` for upstream selection. To explicitly change upstream targets, use `CCP_UPSTREAM_ANTH` / `CCP_UPSTREAM_ZAI` (env) or a policy pack.
- Prefer a single file? Save `{ "license": {...}, "signature": "BASE64" }` to `~/.config/ccp/license.pack` (or point the shim at it with `--license-pack` / `CC_LICENSE_PACK`) and skip exporting separate JSON/signature vars. You can now run `cc license set "$(cat pack.json)"` to validate and persist the bundle, followed by `cc license status` to inspect the active plan.
- Want the new device flow? Run the issuer (`go run services/go-anth-shim/cmd/licissuer/main.go --seed $PRIVATE_SEED_B64`) and call `cc license login --no-browser --issuer http://127.0.0.1:8787 --invite DEV-TRIAL-7D`. Add `--loopback` if you want the CLI to handle the browser redirect automatically. The flow polls until the pack arrives, saves it to `~/.config/ccp/license.pack`, and confirms the plan with `cc license status`.

## C) Quick validation runs

- One-shot sanity: `ALLOW_REAL_API=1 SMOKE_LANES=zai make smoke-license`
- Full suites (consume real tokens):
  - `make repro-go-quick`
  - `make repro-go`
  - `MAX_MINUTES=30 TIMEOUT_SECS=45 SLEEP_BETWEEN=8 make overnight-go`

Acceptance gates stay the same: **no Haiku on Anth lane**, **no Z.AI headers on Anth lane**, **≥1×200 per lane**, bundle in `~/Downloads`.

## Notes & next steps

- When proxy-guard ships we’ll flip the CLI to use `HTTP(S)_PROXY` automatically; no changes to the flow above.
- If you see repeated `Unable to connect` or `/context` errors while on GLM, log them in `docs/BUGLOG.md` with the trace paths.
