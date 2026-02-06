Got it. I read your latest notes and the earlier R3 plan. Here’s a tight verification + action plan you can hand straight to the coding agent, plus the licensing track and the “browser‑agent” testing you asked about.

---

## TL;DR

* **Enforcement**: keep quotas **token‑based only** (warn/block). “Hours” stays **telemetry**.
* **What we add now**: first‑class **speed metrics** so users see their own “mileage”:

  * **ELR** (streaming rate): out‑tokens/sec from first streamed byte to last.
  * **Dirty rate**: out‑tokens/sec over the full wall‑clock request (decision→final byte).
  * Also track **TTFT** (time‑to‑first‑token), **input TPS**, **total TPS**, and **hour‑of‑day (24 bins)** per model.
* **Why**: these are the observability primitives that correlate with perceived responsiveness, queueing, and “best hours” to run heavy jobs.
* **Where this lands**: extend in‑memory samples, `/v1/usage` JSON, Prometheus, and `bin/cc` HUD.
* **Next**: implement now under R3; persist & cross‑process aggregation + charts in **R4**.
* **Licensing** runs **in parallel** (separate track): choose license, stamp third‑party notices, set policy switches; nothing blocks R3 coding.

---

## Quick “research sanity check” (what the data & practice say)

* **What matters operationally**: TTFT, stream throughput (tokens/sec), end‑to‑end latency, and variance. These are the four signals that best explain user‑perceived speed.
* **Token quotas** align with vendor caps and cost; **time quotas do not** (no major provider meters in wall‑hours). Treat walltime as ops telemetry only.
* **Streaming** needs two clocks: *E2E dirty* (decision→final byte) and *ELR* (first→last streamed byte). Both are useful; their **gap** surfaces network/queue/backoff overhead.
* **Per‑hour trend** (24 bins) is effective to surface “fast windows,” provided you **ignore bins with too few samples** and **clip outliers**.

Conclusion: your ELR/Dirty design is exactly what we want. Add TTFT & a few guardrails (smoothing, min‑samples), and you’re set.

---

## Exact definitions (lock these for docs & tests)

* **dirty_s**: wall seconds from *decision logged* → *final byte received* (streams or non‑streams). Includes retries within the same request.
* **stream_s**: wall seconds from *first write of streamed body* → *last write*. For non‑stream responses, set `stream_s = dirty_s`.
* **ttft_ms**: milliseconds from *decision logged* → *first write* (0 for non‑streams).
* **input_tokens / output_tokens**: from provider usage block when available; otherwise 0 (we still compute time‑based metrics).
* **Rolling window**: reuse `rolling_seconds`. **Weekly window**: reuse `weekly_seconds`.
* **Averages**:

  * `elr_out_tps = sum(out_tokens) / sum(stream_s)` over the window (only include samples with `stream_s>0`).
  * `dirty_out_tps = sum(out_tokens) / sum(dirty_s)` (include all).
  * `input_tps`, `total_tps` follow the same form, swapping numerator.
* **TTFT**:

  * keep `ttft_ms_p50/p90/p99` per model (rolling window).
* **Hour‑of‑day bins**: 24 bins by **server local time** (configurable later); each bin aggregates ELR and Dirty TPS with:

  * **min_samples_per_bin** (default 10),
  * **EWMA smoothing** (α=0.2) to stabilize visuals,
  * **winsorize** durations/tokens at p1/p99 to resist spikes.

---

## Wire‑up plan (files, structs, API, CLI)

### 1) Data model (Go)

* **Add to request sample struct** (where you store rolling/weekly samples):

  ```go
  type UsageSample struct {
      Model         string
      InputTokens   int
      OutputTokens  int
      StartedAt     time.Time // decision logged
      DirtySeconds  float64   // decision -> final byte
      StreamSeconds float64   // first write -> last write (non-stream: equals DirtySeconds)
      TTFTMillis    int       // 0 for non-stream
  }
  ```
* **SSE writer wrapper** (low overhead):

  ```go
  type streamRecorder struct {
      http.ResponseWriter
      firstWrite time.Time
      lastWrite  time.Time
      wrote      bool
  }
  func (sr *streamRecorder) Write(p []byte) (int, error) {
      now := time.Now()
      if !sr.wrote {
          sr.wrote = true
          sr.firstWrite = now
      }
      sr.lastWrite = now
      return sr.ResponseWriter.Write(p)
  }
  ```

  * Wrap only for endpoints that stream; capture `TTFTMillis` from `firstWrite - StartedAt`. At request end, set `StreamSeconds` from `firstWrite..lastWrite` if streamed; else set equal to `DirtySeconds`.

### 2) Aggregators

* **Rolling & weekly**: reuse your pruning logic; extend reducers to compute:

  * `elr_out_tps_rolling`, `dirty_out_tps_rolling`, `input_tps_rolling`, `total_tps_rolling`.
  * `ttft_ms_p50/p90/p99`.
* **Hour‑of‑day**: maintain 24 counters per model for `sum_tokens`, `sum_stream_s`, `sum_dirty_s`, `count`. Export TPS per bin when `count >= min_samples_per_bin`.

### 3) API: `/v1/usage` (add `speeds`)

Example response fragment per model:

```json
{
  "model": "anthropic/sonnet",
  "rolling": {
    "tokens_in": 12345,
    "tokens_out": 23456,
    "rolling_pct": 0.42,
    "eta_to_reset_s": 287
  },
  "weekly": {
    "limit_type": "tokens",
    "pct": 0.11
  },
  "speeds": {
    "tps": {
      "out_elr_rolling": 38.7,
      "out_dirty_rolling": 29.2,
      "in_rolling": 15.4,
      "total_rolling": 54.1
    },
    "ttft_ms": { "p50": 210, "p90": 460, "p99": 900 },
    "hod_out_elr_tps": [ null, null, 31.2, 35.0, 42.1, 44.0, 41.8, 39.0, 36.7, 33.4, 30.2, 28.9, 29.1, 30.3, 31.0, 33.8, 37.6, 41.9, 45.2, 46.0, 44.7, 40.5, 36.2, 33.0 ],
    "hod_out_dirty_tps": [ ... ],
    "sample_counts": { "rolling": 412, "weekly": 2691 }
  }
}
```

Notes:

* `null` for bins without enough samples.
* Keep floats to 1 decimal place; document rounding.

### 4) Prometheus

* New counters/gauges:

  * `ccp_input_tokens_total{model,lane}`
  * `ccp_output_tokens_total{model,lane}`
  * `ccp_stream_seconds_total{model,lane}`
  * `ccp_dirty_seconds_total{model,lane}`
  * `ccp_ttft_ms{model,quantile="p50|p90|p99"}` (export from your quantile estimator or pre‑computed).
* Optional: export 24‑bin ELR TPS as a **summary** string metric or a JSON blob on a debug endpoint; Prometheus isn’t great for 24‑bucket arrays.

### 5) CLI (`bin/cc`)

* **`cc status --speeds`** (table):

  ```
  MODEL                ROLL%  OUT_TPS(ELR)  OUT_TPS(DIRTY)  TTFT p50/p90/p99  BEST_HOURS(ELR)
  anthropic/sonnet     0.42   38.7          29.2            210/460/900       04:00,05:00,19:00
  zai/xlarge           0.15   25.1          21.8            320/700/1400      03:00,06:00,07:00
  ```
* **`cc hud`**: add a “Speeds” panel with live ELR/Dirty TPS and TTFT gauges; `--hod` prints the 24‑bin line.

### 6) Config & docs

* In your R3 configs: set `weekly_limit_type: "tokens"` everywhere; set `"hours": 0` or omit to disable blocking path.
* **Docs** to update (R3):

  * `QUOTAS.md`: mark “hours” as **telemetry**; add speed definitions.
  * `OPS-GUIDE.md`: how to read **ELR vs Dirty** and **TTFT**, and how to interpret 24‑hour bins.
  * `SESSION_HANDOFF.md`: example `cc status --speeds` and `/v1/usage` snippet.
  * `R3_PLAN.md`: add “Speeds” epic + acceptance bullets.

---

## Coding agent work items (ready as tickets)

**Epic: R3 Speeds & Telemetry**

1. **Instrument stream timing**

   * Add `streamRecorder` wrapper; record `TTFTMillis`, `StreamSeconds`.
   * Non‑stream sets `StreamSeconds = DirtySeconds`.
   * **Acceptance**: synthetic streamed handler produces `TTFTMillis > 0`, `StreamSeconds ≈ expected`.

2. **Extend sample struct & pruner**

   * Include `DirtySeconds`, `StreamSeconds`, `TTFTMillis`.
   * Ensure pruning keeps window sizes bounded; no leaks under high QPS.
   * **Acceptance**: memory stays flat in soak test; item counts limited by time windows.

3. **Reducers & aggregations**

   * Compute ELR/Dirty TPS (input/total variants) + TTFT quantiles.
   * Implement **min_samples_per_bin**, **winsorization**, **EWMA** for 24‑bin series.
   * **Acceptance**: unit tests hit known numerics; bins suppress when `count<min_samples`.

4. **API: `/v1/usage` speeds block**

   * JSON shape as above; rounding policy; null bins when insufficient data.
   * **Acceptance**: OpenAPI example updated; integration test parses and validates schema.

5. **Prometheus metrics**

   * Expose cumulative token/seconds counters; TTFT quantiles.
   * **Acceptance**: scrape succeeds; counters increase monotonically; labels stable.

6. **CLI updates**

   * `cc status --speeds` + HUD panel; print top‑3 fastest hours (ELR) with sample counts.
   * **Acceptance**: TTY table rendering; CI snapshot test against fixture.

7. **Docs & examples**

   * Update listed docs; add screenshots or pasted JSON.
   * **Acceptance**: `make docs` / lint passes; examples reflect current API.

8. **Flip quotas to tokens‑only enforcement**

   * Ensure “hours” cannot block; it’s displayed under telemetry.
   * **Acceptance**: quota block triggers only on token thresholds in deterministic tests.

**Size tags** (for planning, not time estimates):
1‑3: M each, 4: M, 5: S, 6: M, 7: S, 8: S.

---

## “Browser agent” testing you asked about

You hadn’t assigned it earlier; here’s a ready task set:

* **Goal**: Black‑box verify stream timing & TPS using a headless browser to exercise the exact SSE path and flush behavior.

**Tasks**

1. **Playwright smoke for SSE**

   * Open a page that connects to your SSE endpoint (or local mock) and appends events.
   * Record high‑resolution timestamps on `open`, first event, subsequent events, `close`.
   * Assert `TTFTMillis > 0` on streamed models; total duration ≥ sum of inter‑event deltas.
   * Export a small JSON artifact per run with timings + token counts (if echoed).

2. **Throughput validation**

   * Use a deterministic fixture endpoint that emits **N tokens** over **T milliseconds** with known gaps.
   * Expect `elr_out_tps ≈ N/(T/1000)` within tolerance; expect Dirty vs ELR gap equals injected pre‑stream delay.

3. **Hour‑of‑day bins**

   * Simulate timestamps across multiple hours (set server TZ or allow an override header).
   * Assert bins fill correctly and others stay `null` until min samples are met.

4. **Abort cases**

   * Close the SSE mid‑stream; ensure sample still closes (DirtySeconds set; StreamSeconds up to last write).
   * No panics; counters remain consistent.

Artifacts: save JSON in `artifacts/sse-smoke/*.json` and compare against thresholds in CI.

---

## R3 vs R4 split

* **R3 (ship now)**

  * Speeds instrumentation (ELR, Dirty, TTFT).
  * `/v1/usage` + HUD + Prometheus.
  * Quotas tokens‑only enforcement.
  * Docs.

* **R4 (next)**

  * **Persistence**: rollups to local SQLite / file‑backed WAL; optional export to Prometheus pushgateway.
  * **Cross‑process aggregation**: stateless worker + reducer or metrics scraper that merges per‑node.
  * **Charts**: `cc hud --chart hod` and/or a tiny web UI.
  * **Per‑tenant / per‑key subjects** (not just per‑model).
  * **Spend‑based budgets** (tokens × pricing), if pricing config is present.

---

## Licensing track (parallel, unblock coding)

**Decision options**

* **Apache‑2.0** (most permissive with patent grant) — easiest for adoption.
* **MIT** (permissive, no patent grant) — also fine if you’re comfortable.
* **BSL/BUSL** (source‑available, restricts production use) — if you want to limit competitors; more friction.

**My default recommendation**: **Apache‑2.0** at repo root, with a **NOTICE** file.

**Tasks**

1. **Choose & stamp license**

   * Add `LICENSE` (Apache‑2.0) and `NOTICE`.
   * Add license headers to Go sources (header script).

2. **Third‑party attributions**

   * Generate dependency report:

     * Go: `go env GOPATH` + `go list -m all` → pipe to `go-licenses` (or similar) to collect LICENSE texts.
   * Commit under `THIRD_PARTY_NOTICES/`.

3. **Provider ToS alignment (policy doc)**

   * Short doc `docs/LEGAL/PROVIDER_TOS.md` clarifying:

     * Storing of token usage (yes).
     * No logging of raw content beyond configured retention.
     * Benchmarking disclosures if you publish comparative numbers (label “internal ops telemetry” by default).

4. **Contribution policy**

   * `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, optional CLA pointer.

5. **Compliance CI**

   * Add a CI job that fails if new deps have unknown or copyleft licenses (deny GPL‑3.0+ unless explicitly approved).

6. **Trademarks & naming**

   * If you use provider names in strings/UI, add a one‑liner disclaimer in `NOTICE`.

**Outputs**: LICENSE, NOTICE, THIRD_PARTY_NOTICES/, docs/LEGAL/*, CI job.

---

## Overlap with your “other project”

I still need the repo/path to do a concrete diff. Meanwhile, here’s the **side‑by‑side template** I’ll fill once you share it:

* **Subjects**: {per‑model | per‑tenant | per‑key}
* **Windows**: rolling tokens / weekly tokens / weekly walltime
* **Enforcement**: {warn/block | reroute | throttle}
* **Persistence**: {in‑memory | local durable | distributed}
* **Config**: format, hot‑reload behavior, precedence rules
* **Telemetry**: TTFT, ELR/Dirty TPS, percentiles, HOD bins
* **APIs**: usage endpoints shape; quotas reload
* **Ops UX**: CLI / HUD / dashboards
* **Auth & multitenancy**: how subjects are keyed
* **Failure modes**: what happens at 100% (reroute, backoff, 429, etc.)

From that matrix we can identify reuse or consolidate to a single quotas/telemetry module.

---

## Housekeeping (from your earlier note)

* If fixtures are integrated, **prune** `inbox/tmp-services-20251023-210618/…` to keep master clean.
* Keep `configs/providers.r3.min.yaml` and `providers.r3.429.yaml` as optional seeds; they’re consistent with tokens‑only.

---

## “Hand me the baton” summary for the coding agent

* Create branch: `feature/r3-speeds`
* Touch points:

  * `services/go-anth-shim/...` (SSE writer wrapper, sample struct, reducers)
  * `/v1/usage` handler (extend JSON)
  * `metrics/prometheus.go` (new counters + TTFT)
  * `cmd/cc/status.go` & HUD
  * `docs/*` (QUOTAS, OPS, SESSION_HANDOFF, R3_PLAN)
* Add tests:

  * unit: reducers math, TTFT, non‑stream path
  * integ: deterministic SSE fixture
  * browser: Playwright smoke (artifacts JSON)

If you want me to draft the actual code skeletons and the doc stubs next, say **GO SPEEDS** and I’ll produce the scaffolding (files, function signatures, and test fixtures) you can drop in. For the overlap review, send the other repo path and I’ll do the diff against the template above.

