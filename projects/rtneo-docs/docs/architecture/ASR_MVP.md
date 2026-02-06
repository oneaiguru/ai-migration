# ASR-Only MVP Architecture (FastAPI + Celery + MinIO)

This document captures the reference architecture validated in the **“ASR-Only MVP for Russian Call Center”** deep-research report (see `/Users/m/Documents/replica/deep-research-reports/11-12-2_ASR_Only_MVP_for_Russian_Call_Center_Architecture.md`, lines 5‑18 & 201‑220). It is the source of truth for engineering discussions, ADRs, and demo collateral.

## 1. High-Level Flow

```
Upload (UI / API / SFTP watcher)
        ↓
FastAPI ingress (validations, auth, rate limits)
        ↓
Celery + Redis/RabbitMQ queue (job metadata in PostgreSQL)
        ↓
GPU/CPU worker pool (faster-whisper with VAD chunking + stereo split)
        ↓
Artifacts:
  - TXT + VTT transcripts in MinIO/S3
  - Metadata rows in PostgreSQL (status, timings, language, channel mode, quotas)
        ↓
Delivery surfaces (UI download, REST API, Excel generator, downstream analytics)
```

Key properties:

- **FastAPI** only handles synchronous validation + enqueueing; long-running work is isolated in workers.
- **Celery** ensures reliable retries and horizontal scaling (workers can be added per GPU or CPU pool).
- **PostgreSQL** is the durable record for jobs, usage accounting, and artifact metadata.
- **MinIO** (S3-compatible) stores audio + transcripts with retention/ACL policies.
- **TXT + VTT** exports are generated for every job; analytics layers consume those artifacts later.

## 2. Reliability & Scalability

- API and worker tiers are loosely coupled via Celery (validated on production pipelines that handle 10k–45k calls per month).
- Queue depth, GPU processing time, and total job latency are captured for autoscaling decisions.
- GPU workers run faster-whisper with **VAD-based chunking**; stereo wavs from Oktell are channel-split so diarization is exact without ML.
- Implement per-client quotas + rate limits at the API layer to protect the queue from spikes.
- The stack is horizontally scalable: add FastAPI replicas behind a load balancer, more Celery workers, or additional GPUs.

## 3. Cost Model

- On-prem GPUs (e.g., RTX 4090) avoid per-minute cloud STT fees. Cloud APIs typically charge $0.20–$1.20 per audio hour; at 45k calls/month that becomes several thousand USD.
- Running faster-whisper locally yields better accuracy than legacy Vosk deployments without increasing cost.
- MinIO + PostgreSQL are open-source, so recurring costs are electricity + hardware amortization instead of vendor licenses.

## 4. Roadmap Hooks

- **Phase 1 (ASR-only)**: deliver TXT/VTT + Excel exports. Metrics and job history already live in PostgreSQL.
- **Phase 2 (Analytics)**: reuse stored transcripts to compute checklist scores, objection detection, sentiment, and dashboards. No re-ingestion required; analytics jobs consume the artifacts already produced above.
- **Optional fallback STT**: the queue can reroute edge cases (poor audio) to paid APIs without changing the client contract.

## 5. References

- DR report sections 1 & 7 describe the evidence for this architecture (reliability, cost, and ASR-first strategy).
- ADR-0009 … ADR-0017 record the binding decisions derived from the same research.
