# Transcript Detail Specification

**Goal:** Support the 3:00–5:00 demo segment (channel tags, timestamps, downloads, search). Depends on `Upload_UX_Spec`.

## Layout
1. **Header**
   - Job ID, client ID, status pill, created/finished timestamps, total duration (queue + GPU).
   - Buttons: `Download TXT`, `Download VTT`, `Download Audio`.

2. **Metadata panel**
   - Detected language, channel mode (`stereo_agent_client` / `mono`), model, device, quotas remaining.

3. **Transcript viewer**
   - Table with columns: Timestamp, Speaker (Agent/Client), Text.
   - Stereo inputs use deterministic tags (ADR-0011). Mono shows `Speaker A/B` when diarization added later.
   - Click timestamp → seek audio (if player visible).

4. **Search/filters**
   - Keyword search (highlight matches, scroll to first hit).
   - Optional quick filters: `cancel`, `complaint`, `escalation` (rule-based until analytics layer arrives).

5. **JSON/API tab**
   - Show raw response from `GET /v1/audio/transcriptions/{job_id}` for integrators.

## Acceptance Criteria
- Opening a job from the list preloads metadata + transcript.
- TXT/VTT buttons hit signed URLs and download without exposing MinIO creds.
- Search is case-insensitive and updates highlight count.
- If job failed, show error reason + retry button (if allowable per quota).
