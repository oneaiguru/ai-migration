# Roadmap — ASR-First Strategy (2025-11-12)

**Source:** Deep-research report (lines 201‑220) + demo script (5:00–10:00)

## Phase 0 — Transcription MVP (Week 0 → Week 2)
- Ship FastAPI upload portal with `language=auto`, queue visibility, TXT/VTT downloads.
- Provide operational Excel (call details, issue snippets, team summary).
- Expose REST API + API-key auth; watchers ingest nightly folders.
- KPI: 300k minutes/month transcription capacity; demo-ready portal.

## Phase 1 — Data Labeling & Feedback (Week 3 → Week 6)
- Operations use TXT/VTT to manually tag objections, compliance failures, greetings.
- Collect labels directly in Excel (Issues sheet) to seed analytics training data.
- Track minutes processed per client to validate pricing model.

## Phase 2 — Analytics Layer (Week 6 → Week 10)
- Add rule-based detectors for greeting, identification, next-step, objection handling, sentiment.
- Produce the same Excel but with automated flags + scoring columns.
- Release manager dashboards (per-team KPIs) and API endpoints for analytics JSON.

## Benefits of ASR-first
1. **Fast deployment:** audio ingestion + transcription is a contained engineering scope.
2. **Feedback loop:** real transcripts let QA define analytics requirements.
3. **Training data:** labeled transcripts bootstrap ML classifiers for objections/compliance.
4. **Layering complexity:** isolates transcription issues from analytics logic.

## Dependencies / Links
- Architecture: `docs/architecture/ASR_MVP.md`
- ADRs: 0009–0017 describe persistence, auth, VAD, observability, security.
- Demo runbook: `docs/System/Demo_Runbook.md`
