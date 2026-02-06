# PRD — ASR-Only MVP (2025-11-12)

**Audience:** Voice analytics client, engineering  
**Source:** Deep-research report (lines 201-220) + demo script

## Goal
Deliver a production-ready transcription service with TXT/VTT outputs, Excel summaries, and API access so the client can monetize minutes immediately while analytics are layered later.

## User Stories
- As an operator, I upload MP3/WAV (stereo or mono) and see job status/progress.
- As an integrator, I call `/v1/audio/transcriptions` with API key auth and poll for results.
- As a QA manager, I download TXT/VTT and Excel reports to review greetings, objections, checklist items.

## Scope
- FastAPI ingress, Celery queue, PostgreSQL persistence, MinIO storage (see architecture doc).
- VAD chunking + stereo channel split with timestamped transcripts.
- Excel export with 3 sheets (Call Details, Issues/Objections, Team Summary).
- REST API + watcher for bulk ingestion; rate limits + quotas enforced.

## Non-Goals (Phase 1)
- Automated analytics/scoring (rules/ML) — deferred to Phase 2.
- Real-time/streaming transcription.
- Non-RU data residency.

## Acceptance Criteria
- Upload UI shows `language=auto`, progress, and job history.
- API returns job IDs, TXT/VTT URLs, detected language, timings.
- Excel generator runs nightly (or on-demand) and matches agreed schema.
- Metrics endpoint exposes queue/gpu/total histograms.

## Deliverables
- Running demo stack (UI `/ui`, API `/v1/audio/transcriptions`, sample Excel).
- Updated ADRs (0009–0017) and roadmap.
- Operator runbook + pricing deck references.
