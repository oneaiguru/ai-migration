# Processing Pipeline Specification (Queue → GPU → Artifacts)

This doc expands on `docs/architecture/ASR_MVP.md` with demo-facing requirements.

## Queueing
- FastAPI enqueues jobs via Celery into Redis (default) with payload: `job_id`, `client_id`, `language`, `source`, `priority`.
- Jobs transition through `queued → running → completed/failed`. Transitions must be observable via `/v1/jobs` for the UI.
- Queue metrics (depth, enqueue latency) exported to Prometheus (ADR-0014).

## Worker behavior
- Detect stereo vs mono using ffprobe; store `channel_mode`.
- Run VAD chunking, feed segments to faster-whisper.
- Record timing data: `queue_ms`, `gpu_ms`, `total_ms`.
- Persist artifacts to MinIO using ADR-0015 naming convention.
- On failure: capture exception, number of retries, final status.

## Excel generator hook
- After job completion, emit row into `reports_jobs` table for Excel scheduler.
- Nightly cron reads rows since last run and generates workbook defined in `Excel_Report_Spec.md`.

## Watcher / SFTP
- CLI script monitors configured folders, validates filenames, and enqueues via REST (API key).
- Config lives in `config/watchers.yml` with per-client paths + languages (overrides `auto`).

## Acceptance Criteria
- API returns job history with accurate timings for demo screenshot.
- Back-pressure: when queue > threshold, new uploads display “Estimated wait X min”.
- Workers auto-retry transient errors (network, GPU OOM) up to N attempts before marking failed.
