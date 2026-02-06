# ADR-0007: Billing Connector (Stripe vs LemonSqueezy vs Paddle)

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- MVP ships **without** live billing; licenses from invites.
- Next step: **Stripe** webhook → `license/issue` mapping (w/ test mode).
- Keep adapter interface so LemonSqueezy/Paddle can be swapped.

## Rationale
- Speed > completeness. Stripe has best docs/tools; others are viable later.

## Consequences
- Document manual steps for trials; “paywall” remains soft until billing lands.
