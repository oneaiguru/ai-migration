# ADR-0009 — Job Persistence and Artifact Storage

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE), Claude (Strategy)  
**References:** DR report “ASR-Only MVP …” lines 5-18

## Context
- The ASR MVP currently keeps transcription results in memory. Restarts lose state and there is no durable usage ledger.
- The deep-research report validated the FastAPI → Celery → PostgreSQL/MinIO pattern as reliable and cost-effective for 10k–45k calls/month.

## Decision
- Persist every transcription job in **PostgreSQL** with fields: `job_id`, `client_id`, `status`, `queue_time_ms`, `gpu_time_ms`, `language`, `channel_mode`, `artifact_paths`, `errors`.
- Store binary artifacts (audio inputs, TXT, VTT, Excel snapshots) in **MinIO/S3** under deterministic prefixes (`client_id/job_id/<artifact>`). Metadata points to those URIs.
- Celery workers read/write exclusively through the database and object store; API never touches raw files directly.

## Consequences
- Jobs survive API or worker crashes; clients can poll for status at any time.
- Usage/quota enforcement has a durable source-of-truth.
- Adds dependency on PostgreSQL and MinIO deployments, but both are already part of the reference architecture.
