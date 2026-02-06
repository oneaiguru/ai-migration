```md
# ADR-0002: Device-Code vs Loopback License Login

**Status**: Proposed
**Date**: 2025-10-23

## Context
We want a “zero-copy” onboarding flow that works for headless shells and local GUI.

## Options
1) **Device-Code Flow (OAuth-style)**: user opens a URL, enters a code; CLI polls issuer.
2) **Loopback Redirect**: CLI starts a localhost listener; browser redirects directly back to CLI.

## Decision
**Support both**; default to device-code, `--loopback` optional.

## Rationale
- Device-code works everywhere (SSH, remote, CI).
- Loopback is luxurious when ports free; falls back cleanly.

## Consequences
- Issuer must expose `/v1/device/begin` (with optional `redirect_url`) and `/v1/device/poll`.
- CLI implements `cc license login [--loopback]`.

## Open Questions
- Port selection & firewall prompts on macOS for loopback listener.
````