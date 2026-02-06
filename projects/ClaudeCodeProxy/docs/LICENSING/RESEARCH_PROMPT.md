# Research Brief — Licensing & Monetization for Local Orchestrators (Oct 2025)

## Context
We ship a local routing shim with optional premium features (e.g., Z.AI offload). We need a practical, privacy-preserving licensing strategy from trials to paid plans, with offline verification and a future control plane.

## Scope (Oct 2024–Oct 2025; prioritize Aug–Oct 2025)
- Signed license packs (Ed25519 vs JWS/PASETO), KID rotation, revocation.
- Device-code vs loopback flows (CLI UX).
- Comparable tools: Copilot, Sourcegraph Amp/Cody, Cursor, Zed agents, JetBrains AI, Claude Code tiers, OpenAI Deep Research access.
- Billing: Stripe vs LemonSqueezy vs Paddle (fees, webhooks, test modes, global support).
- Distribution/signing: macOS notarization, Windows codesign, Homebrew tap/winget.
- Anti-abuse: host binding, soft limits, offline grace, telemetry minima (no body logs).
- Legal/privacy & regional constraints.

## Deliverables
1) Decision table: pack format choice with examples and tradeoffs.
2) 3 best CLI license flows (quotes/screenshots/links).
3) Issuer blueprint (endpoints, models, key rotation, rate-limits).
4) Billing connector comparison with webhook mapping to pack issuance.
5) Distribution checklists (darwin/win/linux).
6) Risk register (top 10 risks + mitigations).
7) Recommended MVP (what to build now vs later).

## Acceptance
- ≥25 sources, ≥10 official docs; every numeric claim linked with date.
- Final “What we’ll do” section ready to paste into EXECUTION_PLAN.md.
