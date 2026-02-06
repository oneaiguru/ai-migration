# ADR-0015 — Artifact Naming and Retention Policy

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE/Infra)  
**References:** DR lines 5-13 (MinIO usage) & demo Excel section (5:00–7:00)

## Context
- Artifacts (audio, TXT, VTT, Excel) are currently named ad hoc and stored on local disks. That complicates retention, backups, and linking from reports.

## Decision
- Use deterministic S3 keys: `s3://asr/{client_id}/{yyyy}/{mm}/{dd}/{job_id}/{artifact_type}.ext`.
- Store retention_policy + expiry timestamps per job (default 90 days; configurable per client).
- Excel/CSV exports reference these URIs so managers can trace back to raw audio.

## Consequences
- Simplifies cleanup jobs and compliance requests.
- Enables direct linking from dashboards/reports without guessing paths.
