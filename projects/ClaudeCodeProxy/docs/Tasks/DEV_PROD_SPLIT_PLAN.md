Title
Dev/Prod Profile Split — Default‑On Proxy, Simple Toggle, Release Flow

Goals
- Make the proxy “just work” by default (auto env) while keeping dev and prod fully separate.
- Give the operator simple one‑liners/aliases to start/stop each profile and switch safely.
- Establish a clear release path: develop/verify in dev → promote to prod with rollback.

What Exists Today (baseline)
- Aliases write an env file: `scripts/install-shell-aliases.sh` adds a loader for `~/.config/ccc/env`.
- Start/stop helpers: `ccc-on`, `ccc-off`, `ccc-status`, `ccc-logs` (+ `ccp-*` fallbacks).
- Current default profile is `prod`; logs under `logs/prod/`.
- Local CI checks: `make ci-fw0..ci-fw3` and UAT scripts in `scripts/uat/`.

Use Now — One‑Liners (no code changes)
- Start Prod (port 8082):
  - `CCP_PROFILE=prod ccc-on 8082`
- Stop (either profile):
  - `ccc-off`
- Start Dev (port 8182, stable networking):
  - `CCP_PROFILE=dev MITM_FORCE_H1=1 ccc-on 8182`
- Status + Logs:
  - `ccc-status`
  - `ccp-logs` (tails `logs/<profile>/usage.jsonl`)

Proposal — Simple Aliases (to add)
- `ccc-use-prod` → `CCP_PROFILE=prod ccc-restart 8082`
- `ccc-use-dev` → `CCP_PROFILE=dev  ccc-restart 8182` (also exports `MITM_FORCE_H1=1` by default)
- `ccc-autostart` → start shim if not running based on `~/.config/ccc/env`
- `ccc-enable-autostart` / `ccc-disable-autostart` → install/remove a macOS LaunchAgent for auto‑start at login

Separation Model
- Ports/Dirs
  - prod: `:8082`, logs at `logs/prod/`, results at `results/prod/`
  - dev:  `:8182`, logs at `logs/dev/`, results at `results/dev/`
- Networking
  - prod: HTTP/2 preferred; automatic fallback retry; no global H1.
  - dev: default `MITM_FORCE_H1=1` for stability on flaky links.
- Credentials & Licensing
  - prod: no `.env` parsing for provider secrets; accept only trusted pubkeys; license packs from a standard secure path.
  - dev: allow `.env` parsing for `ZAI_API_KEY`; accept env pubkeys (`CCP_LICENSE_PUBKEY_B64`) and local trial issuer.
- Policy/Catalog
  - prod: signed policy only (no env overrides).
  - dev: allow local catalog/policy for rapid iteration.

ASCII — Runtime Toggle
```
        ┌─────────┐               ┌───────────┐
        │  Shell  │   ccc-use-*   │  Env file │  ( ~/.config/ccc/env )
        └────┬────┘──────────────▶└────┬──────┘
             │                         │
             │  ccc-on/off/restart     │  exports ANTHROPIC_BASE_URL, CCP_* vars
             ▼                         ▼
        ┌──────────┐           ┌──────────────────┐
        │  Shim    │◀────────▶│  Claude CLI      │
        │ :8082/82 │           │ (interactive/-p) │
        └──────────┘           └──────────────────┘
```

ASCII — Release Gating
```
dev profile  ──► local FW0–FW3 ──► human UAT ──► PR/merge ──► prod profile
   ^                                                      │
   └───────── rollback (git revert) ◄────────────────────┘
```

Implementation Plan (how we’ll make it)
1) Aliases + Profile Wiring (no core behavior change)
   - Add `ccc-use-dev`, `ccc-use-prod`, `ccc-autostart`, `ccc-enable-autostart`, `ccc-disable-autostart` in `scripts/shell/ccc-aliases.sh`.
   - Ensure `ccc-on` writes `CCP_PROFILE`, ports, and directories to `~/.config/ccc/env`.
2) Prod Hardening
   - Disable `.env` key loading when `CCP_PROFILE=prod` in `scripts/run-go-shim.sh`.
   - Disallow env pubkeys in prod (keep embedded/trusted only) in `services/go-anth-shim/cmd/ccp/main.go`.
   - Keep HTTP/2 preferred in prod; add retry to H1 on header timeout.
3) Dev Defaults
   - Default `MITM_FORCE_H1=1` when `CCP_PROFILE=dev` in alias wrapper.
   - Keep Accept‑Encoding normalization on Z.ai lane.
4) Docs & Wiki
   - Update `docs/SOP/PROFILES.md`, `docs/SOP/proxy-aliases.md`, and `/Users/m/wiki/dotfiles/HaikuZaiRouting.md` with profile‑specific recipes and one‑liners.
5) Acceptance & Rollback
   - Acceptance: FW0–FW3 pass in both profiles; interactive checks work; logs go to the correct profile dirs; autostart works.
   - Rollback: single PR with commits grouped by (aliases), (prod hardening), (docs). Revert any commit cleanly if needed.

Operator Flow (how you’ll work)
- Day‑to‑day (prod): `ccc-use-prod` → work in Claude as usual; logs under `logs/prod/`.
- Switch to dev for UAT:
  - Exit Claude, run `ccc-use-dev` (port 8182) → run UAT scripts (`scripts/uat/run_*.sh`) and manual checks.
  - Tail with `ccp-logs`; capture evidence.
  - If approved, green‑light PR. I merge and switch you back with `ccc-use-prod`.

One‑liners Cheat Sheet (today, before aliases ship)
- Prod start: `CCP_PROFILE=prod ccc-on 8082`
- Dev start: `CCP_PROFILE=dev MITM_FORCE_H1=1 ccc-on 8182`
- Stop: `ccc-off`
- Status: `ccc-status`
- Logs: `ccp-logs`

Testing Matrix
- FW0: `make ci-fw0` (tests green)
- FW1: `make ci-fw1` (Anth lane OK)
- FW2: `make ci-fw2` (Z.ai lane OK; licensed)
- FW3: `make ci-fw3` (back‑to‑back Anth/Z.ai OK)

Security Notes
- Prod will never parse `.env` for provider secrets; use a secure store.
- Prod only trusts built‑in/signed pubkeys; dev can trust env‑supplied keys for the local issuer.

Open Questions (to confirm before implementation)
- Do you want autostart enabled by default after installation?
- Is `prod=:8082, dev=:8182` acceptable, or prefer different ports?
- Any additional provider keys we should split (future multi‑provider)?

Quick Start — Prod (licensed Haiku → Z.ai)
```
cd /Users/m/git/tools/ClaudeCodeProxy
mkdir -p ~/.claude/debug
scripts/dev/dev-license-activate.sh
source logs/dev-license/exports.sh
CCP_PROFILE=prod ccc-restart 8082
source scripts/go-env.sh 8082
```

Quick Start — Dev (licensed; network-stable H1)
```
CCP_PROFILE=dev MITM_FORCE_H1=1 ccc-restart 8182
source /Users/m/git/tools/ClaudeCodeProxy/scripts/go-env.sh 8182
```

One‑line Probes (non‑interactive)
```
timeout 60 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model claude-haiku-4-5-20251001 "Say ok" --output-format json
timeout 60 claude -p --model claude-sonnet-4-5-20250929 "Say hi" --output-format json
```

Interactive (any folder after env is set)
```
claude
> /model claude-haiku-4-5-20251001
> say hi
```

Consumer Process (day‑to‑day usage)
1) Start the desired profile once per login session:
   - Prod: `CCP_PROFILE=prod ccc-on 8082` (after provisioning and sourcing license exports once)
   - Dev: `CCP_PROFILE=dev MITM_FORCE_H1=1 ccc-on 8182`
2) Work from any folder with `claude` or `claude -p`.
3) Tail routing: `ccp-logs`.
4) Switch profiles without stopping: `ccc-restart 8082|8182` with the target `CCP_PROFILE` exported.
5) Stop when done: `ccc-off`.

Autostart (planned)
```
ccc-enable-autostart   # start prod on login
ccc-disable-autostart
```
This writes a LaunchAgent plist to start the shim and loads `~/.config/ccc/env` so Claude works in any folder immediately.

