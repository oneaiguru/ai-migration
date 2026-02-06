# ADR-0013 — Batch-First Ingestion Strategy

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE), Claude (Strategy)  
**References:** DR report lines 201-220 (“ASR-first”) & demo script (Upload + watcher notes)

## Context
- Stakeholders want a working demo in days, not weeks. Real-time streaming is complex (bi-directional gRPC, diarization, QoS).
- Call centers already export WAV/MP3 nightly; Oktell delivers stereo files easily.

## Decision
- Phase 1 focuses on **batch + manual uploads**:
  - `/ui` supports single uploads with validation/progress.
  - `/watcher` script polls folders/SFTP drops and enqueues files automatically.
  - REST API handles single or batched multipart uploads.
- Streaming transcription remains out-of-scope until ASR-only MVP is proven in production.

## Consequences
- Faster time-to-demo; aligns with how customers already deliver recordings.
- Simplifies resource planning (queue can be drained overnight).
- Keeps an explicit backlog item for future streaming work instead of mixing it into MVP.
