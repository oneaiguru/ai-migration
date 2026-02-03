# ASR Task Map (2025-11-12)

Use this as the bridge between DR findings, demo specs, and backlog tickets.

| Ticket | Description | Spec / ADR | Notes |
|--------|-------------|------------|-------|
| `ASR-BE-001` | Implement PostgreSQL job store + MinIO artifact writer | ADR-0009, docs/architecture/ASR_MVP.md | Includes `/v1/jobs` history endpoint |
| `ASR-BE-002` | API key auth + quotas + `/v1/usage` | ADR-0010, docs/api/ASR_Endpoints.md | Required before sharing API creds |
| `ASR-AUDIO-003` | VAD chunking + stereo channel split module | ADR-0011 | Surface `channel_mode` + channel labels |
| `ASR-BE-004` | Observability metrics (queue/gpu/total) | ADR-0014 | Prometheus endpoint + alerts |
| `ASR-UI-005` | Upload UX (language auto, progress, job list) | docs/prd/Upload_UX_Spec.md | Ties to ADR-0016 |
| `ASR-UI-006` | Transcript detail page | docs/prd/Transcript_Detail_Spec.md | Search + TXT/VTT download |
| `ASR-BE-007` | Excel generator (3 sheets) + nightly cron | docs/prd/Excel_Report_Spec.md | Feeds demo + analytics phase |
| `ASR-API-008` | Finalize OpenAPI for `/v1/audio/transcriptions` | docs/api/ASR_Endpoints.md | Include watcher enqueue endpoint |
| `ASR-BIZ-009` | Pricing slide + contract snippet | docs/contract/asr_pricing.md | Align with demo narration |
| `ASR-DOC-010` | Demo runbook updates + risk matrix | docs/System/Demo_Runbook.md, docs/risk/ASR_Risk_Matrix.md | Ensure operator prep |

This table should be copied into the project tracker (Linear/Jira) so scouts/planners can pull detailed acceptance criteria directly from the linked specs.
