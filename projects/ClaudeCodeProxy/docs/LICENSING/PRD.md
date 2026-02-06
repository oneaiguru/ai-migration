# PRD — Licensing & Feature Gating v1

## Goals
- Gate premium features (e.g., Z.AI offload) with a **signed license pack** (Ed25519).
- UX: `cc license login` (device-code), `cc license set <PACK>`, `cc license status`.
- Offline-friendly: local verify against embedded pubkey(s); cached pack.

## Non-Goals
- Payments beyond a stub local issuer; cloud control plane later.

## User Stories
- Trial activation in <60s via device-code; paste-in pack alternative.
- Operators can check plan/features/exp/kid via CLI.
- `make smoke-license` demonstrates community → trial → community with clear logs.

## Acceptance
- Smoke passes; routing flips accordingly; `/readyz` reflects license-gated lanes cleanly.
