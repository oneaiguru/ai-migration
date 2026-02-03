# ASR API Endpoints (v1 Draft)

These endpoints power the demo flow described in the script (sections 0:00–8:00). They will be merged into `docs/api/openapi.json` after implementation.

## Auth
- Header: `Authorization: Bearer <api_key>` (see ADR-0010).
- Rate limits: per-client + per-IP (ADR-0017).

## `POST /v1/audio/transcriptions`
- Multipart form fields:
  - `file`: audio file (MP3/WAV/OGG).
  - `language` (optional): ISO code (`auto` default).
- Response `201 Created`:
```json
{
  "job_id": "job_20251112_123456",
  "status": "queued",
  "language_requested": "auto",
  "language_detected": null,
  "channel_mode": "pending",
  "quota_remaining_minutes": 12345,
  "links": {
    "self": "/v1/audio/transcriptions/job_20251112_123456"
  }
}
```

## `GET /v1/audio/transcriptions/{job_id}`
- Returns metadata + artifact links:
```json
{
  "job_id": "...",
  "status": "completed",
  "language_detected": "ru",
  "queue_ms": 950,
  "gpu_ms": 4123,
  "total_ms": 5073,
  "channel_mode": "stereo_agent_client",
  "txt_url": "https://...",
  "vtt_url": "https://...",
  "audio_url": "https://...",
  "excel_row": {
    "workbook_url": "https://...",
    "sheet": "Call Details",
    "row": 42
  }
}
```

## `GET /v1/audio/transcriptions`
- Query params: `status`, `client_id`, `page`, `page_size`.
- Used by the UI job list (Upload UX spec).

## `GET /v1/usage`
- Returns current billing cycle totals, allowance, rollover, overage.
- Enables self-service quota checks.

## `POST /v1/watchers/enqueue`
- Internal endpoint for watcher script; accepts JSON manifest of files dropped via SFTP.

## Notes
- All endpoints emit structured logs with `job_id` for traceability (ADR-0014).
- Artifact URLs are signed and expire in 24h to satisfy security posture (ADR-0015/0017).
