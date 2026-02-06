Purpose

* Land “speeds + telemetry” surfaces fully (ELR, dirty TPS, TTFT, 24‑hour bins).
* Harden reroute policy with “on_failure” default and measured hybrid.
* Lock tokens‑only enforcement; hours become telemetry only.
* Add missing tests & metrics counters; freeze /v1/usage schema v1.

Scope (done when all acceptance pass)

* services/go-anth-shim/cmd/ccp/main.go — stream timing wrapper finalized; decision logging unchanged.
* services/go-anth-shim/cmd/ccp/metrics.go — add reroute/quota counters; validate label set.
* services/go-anth-shim/cmd/ccp/quotas.go — hours no‑block; calibration cooldown; stable usage schema v1.
* tests: fallback_429, header_isolation, ttft_stream, calibration_cooldown.
* docs: QUOTAS.md (hours=telemetry), OPS-GUIDE.md (speeds), METRICS-SCHEMA.md (/v1/usage v1), SESSION_HANDOFF.md (commands and proofs).
* configs: providers.r3.matrix.yaml (+ 429 variant).

Steps

1. Implement stream timing wrapper (TTFT and stream_ms persisted per request).
2. Add ccp_reroute_attempts_total and ccp_quota_blocks_total counters.
3. In quotas.go: enforce weekly_limit_type:"tokens” only; hours never block; add calibration cooldown (min_samples per model=20).
4. Extend /v1/usage to include:

   * speeds: elr_out_tps_rolling, dirty_out_tps_rolling, hod_elr_out_tps[24], hod_dirty_out_tps[24], plus input variants.
   * calibration: gaps[], warn_pct_auto, min_samples_reached.
   * schema: usage_schema:"v1".
5. Tests: add four new *_test.go files as listed below.
6. Operator proof: run cc status, curl /v1/usage, induce a 429 via the 429 provider stub; verify decisions, counters, speeds > 0.

Acceptance

* go test ./... passes; new tests assert counters and decisions.
* /v1/usage returns schema v1 with non‑zero TPS after a stream; QUOTAS.md describes tokens‑only enforcement.
* /metrics shows reroute/quota counters increasing in the 429 scenario.
* SESSION_HANDOFF.md updated with commands, outputs, and file list.

---

# services/go-anth-shim/cmd/ccp/fallback_429_test.go

Goal

* Assert single fallback attempt on injected 429; verify decision, lane switch, and counters.

Approach

* Spin a test server pair: upstream A returns 429 for first call; upstream B returns 200 JSON body with usage tokens.
* Configure providers.r3.429.yaml pointing model X to A (primary) and B (alternate).
* Issue one /v1/messages request; capture:

  * logs: one decision:"fallback" entry; no loops.
  * metrics: ccp_reroute_attempts_total{from_lane="zai",to_lane="anth"}==1.
  * response: 200 with expected model echoed.

Assertions

* Only one alternate attempt is made.
* Header isolation: Anth lane request has no ZAI header; Z.AI lane request has no Anth bearer.

---

# services/go-anth-shim/cmd/ccp/header_isolation_test.go

Goal

* Ensure no cross‑lane credential leaks.

Approach

* Create an inbound request that maliciously includes x-api-key.
* Route to Anth lane and assert outbound headers exclude x-api-key, include Authorization only.
* Mirror test for Z.AI lane.

Assertions

* Outbound headers are lane‑clean.
* Logs never include credential values.

---

# services/go-anth-shim/cmd/ccp/ttft_stream_test.go

Goal

* Validate TTFT and stream duration capture.

Approach

* Mock streaming upstream that writes first chunk after 50ms and last chunk at 250ms.
* Assert ttft_ms ≈ 50ms and stream_ms ≈ 200ms on the completion log and /v1/usage speeds > 0.

---

# services/go-anth-shim/cmd/ccp/calibration_cooldown_test.go

Goal

* Prevent warn_pct_auto oscillation on low samples.

Approach

* Feed a short series of synthetic caps and usage that would bounce warn threshold.
* With min_samples=20, assert warn_pct_auto unchanged; after reaching sample floor, assert monotonic clamp and no flip‑flop within a small window.

---