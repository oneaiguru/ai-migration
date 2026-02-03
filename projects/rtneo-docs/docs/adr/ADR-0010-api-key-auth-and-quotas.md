# ADR-0010 — API Key Authentication and Per-Client Quotas

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE), Claude (Biz)  
**References:** DR report “ASR-Only MVP …” lines 5-13 (cost/scaling) & demo pricing script (8:00–10:00)

## Context
- The MVP demo exposes unauthenticated endpoints; there is no way to meter usage or prevent queue abuse.
- Pricing depends on minutes/month commitments (0.70 ₽ vs 3 ₽ tiers); we must enforce quotas to keep margins predictable.

## Decision
- Require every REST request to include `Authorization: Bearer <api_key>`.
- Maintain `clients` and `usage_ledger` tables (monthly minute allowance, rollover, overage policy).
- Reject new jobs with HTTP 429 when a client exceeds their cap; include `Retry-After` metadata.
- Surface `/v1/usage` so clients can self-check remaining minutes.

## Consequences
- Enables safe multi-tenant demos and production pilots.
- Adds small operational overhead (key issuance, rotation), but reuses existing PostgreSQL schema.
