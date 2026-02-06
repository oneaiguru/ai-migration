Purpose

* How AgentOS consumes CCC signals and turns them into developer‑productivity metrics.

What AgentOS reads

* /v1/usage (schema v1): quotas, speeds, calibration.
* /metrics: counters for reroutes, quota blocks, latencies.
* JSONL usage log (optional, local only) when running on the same host.

Privacy tiers

* minimized: totals and rates only; no per‑prompt metadata.
* standard: include model names, lane decisions.
* enriched (opt‑in): link rid to high‑level scenario id (no content).

Smoke (5 steps)

* Start CCC with providers.r3.matrix.yaml
* Run two requests: streamed haiku + nonstream sonnet
* Verify cc status speeds > 0
* Induce 429 fallback; verify counters
* Persist a snapshot for AgentOS ingest

---