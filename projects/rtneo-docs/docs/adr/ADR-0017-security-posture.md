# ADR-0017 — Security Posture (Rate Limits, Validation, Data Residency)

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE), Claude (Compliance)  
**References:** DR architecture section (lines 5-13) & demo script (API + quotas)

## Context
- Call recordings contain PII; uploads may come from untrusted networks. The MVP must stay within RU data-localization rules while we scale.

## Decision
- Enforce request size caps (default 200 MB) and MIME/extension validation before enqueueing.
- Apply per-IP and per-client rate limits (shared with ADR-0010).
- Keep all audio/artifacts in RU-hosted infrastructure (MinIO cluster + PostgreSQL inside the same DC/VPC).
- Provide audit logs for uploads/downloads; expose admin tooling for revoke/delete on demand.

## Consequences
- Reduces risk of abuse or accidental leakage during demos.
- Adds small latency for validation but avoids catastrophic queue poisoning.
