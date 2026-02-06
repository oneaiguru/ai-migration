# License UX Discovery

## Key Inputs
- Conversation notes (2025-10-22): user wants streamlined licensing flow without two files/env vars, referencing loopback browser OAuth-style, device-code fallback, and single-string license pack for CLI ease.

## Current State
- Shim accepts `CC_LICENSE_JSON` + `CC_LICENSE_SIG`; now also supports `CC_LICENSE_PACK` and defaults to `~/.config/ccp/license.pack` (implemented).
- Issuer (`cmd/licissuer`) exposes `/v1/license/issue` returning `license` JSON + `sigB64`, but no single-string pack endpoint or device flow.
- CLI (`bin/cc`) lacks `license` subcommands; licensing requires manual env exports.

## Desired UX (per discovery brief)
1. Loopback browser OAuth-style (PKCE) flow with begin/poll endpoints for zero copy/paste. ✅ (`cc license login --loopback` + `/v1/device/begin redirect_url`).
2. Device-code fallback for headless/SSH environments. ✅
3. Single-value license pack for manual paste (`ccp license set <PACK>`), persisted under `~/.config/ccp/license.pack`. ✅
4. CLI commands: `ccp license login`, `ccp license set`, `ccp license status`. ✅
5. Issuer persistence for invite redemption/poll tokens and host binding enforcement. ✅

## Constraints & Guardrails
- Maintain existing license enforcement logic (`zai_offload`, `hostHash`).
- Continue logging plan/features/expiry for observability.
- Plans must respect BDD guardrails: no schema drift without fixtures, easy rollback, CI-friendly commands.
