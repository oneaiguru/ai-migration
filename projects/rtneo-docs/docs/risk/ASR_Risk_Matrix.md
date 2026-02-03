# ASR Risk Matrix (Accuracy / Latency / Data Localization)

| Risk | Impact | Likelihood | Mitigation | References |
|------|--------|------------|------------|------------|
| Accuracy drift vs legacy STT | Medium – demo credibility suffers if transcripts differ wildly from client expectations | Low (faster-whisper validated) | Provide side-by-side sample vs current system; allow manual language override; store raw audio for audit | DR lines 11‑13 (accuracy vs Vosk) |
| Queue latency during spikes | Medium – upload UI stalls, demo feels sluggish | Medium | Enforce quotas (ADR-0010), expose queue ETA, preload sample jobs for demo, autoscale workers | DR lines 9‑11, ADR-0014 |
| GPU failure / resource exhaustion | High – jobs fail mid-demo | Low | Multi-worker pool with retries; fallback STT adapter (ADR-0012); keep preprocessed transcripts | Architecture doc §2 |
| Data residency / compliance | High – cannot process regulated clients | Low | Keep MinIO/PostgreSQL in RU DC; document deletion + retention (ADR-0015/0017); audit logs | ADR-0015/0017 |
| Excel/report generation errors | Low – minor demo hiccup | Medium | Pre-generate sample workbook; show cron pipeline diagram | Demo script backup notes |
