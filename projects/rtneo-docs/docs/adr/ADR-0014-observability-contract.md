# ADR-0014 — Observability & Metrics Contract

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE)  
**References:** DR lines 9-11 (scaling) & demo script (“We monitor queue time, GPU time…”)

## Context
- Without instrumentation we cannot prove latency/throughput claims (10k–45k calls/month) or enforce SLAs.

## Decision
- Emit structured logs for each job: `job_id`, `client_id`, `queue_ms`, `gpu_ms`, `total_ms`, `model`, `device`, `status`.
- Expose Prometheus `/metrics` with histograms for queue/gpu/total durations, counters for successes/failures, gauges for backlog depth.
- Wire alerts for sustained queue depth > threshold and GPU saturation.

## Consequences
- Supports capacity planning and demo talking points (“queue time vs GPU time”).
- Adds slight overhead to worker code but reuses existing logging pipeline.
