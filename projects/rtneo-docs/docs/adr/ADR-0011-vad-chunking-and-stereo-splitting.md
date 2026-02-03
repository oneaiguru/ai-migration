# ADR-0011 — VAD Chunking and Stereo Channel Splitting

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (Audio), Claude (QA)  
**References:** DR report lines 9-11 (scalability) & demo script 1:00–3:00 / 3:00–5:00

## Context
- Long audio files cause GPU memory spikes and unstable timestamps if processed as a single chunk.
- Oktell supplies stereo WAVs with agent/client on separate channels; leveraging that yields perfect diarization without ML.

## Decision
- Apply voice-activity-detection (VAD) before sending segments to faster-whisper. Each chunk keeps overlap padding so timestamps stitch cleanly.
- For stereo inputs, run transcription per channel (Agent = left, Client = right) and merge with interleaved timestamps.
- Mono files continue as single-channel + timestamps; diarization ML modules remain optional for Phase 2.

## Consequences
- Predictable GPU footprint & latency for >30 min calls.
- Channel labels in TXT/VTT are trustworthy, enabling immediate QA/analytics value.
- Implementation complexity moves into a dedicated audio pre-processing module but is required for stability anyway.
