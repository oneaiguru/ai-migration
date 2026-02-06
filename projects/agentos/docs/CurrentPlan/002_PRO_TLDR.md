# External TLDR (Ingested)

Source: /Users/m/Desktop/TLDR.markdown

You’re right—I rushed. Here’s a **more rigorous pass** that (1) admits where my last reply fell short, (2) tightens the logic around what’s already shipped, (3) closes gaps you called out (clean‑data guarantees, parallel ops, sub‑agent POC measurement), and (4) lays down a **concrete long‑session blueprint** with crisp acceptance gates and artifacts.

------

## 0) What I got wrong / missed

**a) Duplicating shipped items**
 I spoke about “Outcome & quality capture” and UPS alignment as if they were pending. They’re already delivered (preview prints CI/n/power; `complete` stores `quality_score` + `outcome`; schema/tool stamping is in place). I should have treated these as *constraints* to protect, not *work to do*.

**b) No explicit clean‑data guarantees**
 I didn’t specify hard invariants (reset handling, multi‑pane trims, negative deltas, duplicate panes) or where to log anomalies. That’s essential before scaling parallel agents.

**c) Parallelization plan was shallow**
 I suggested multi‑agent aliases but didn’t define the **state isolation**, undo semantics, nor how we’ll schedule windows to avoid 5h reset collisions.

**d) Sub‑agent (Haiku→GLM) POC integration**
 I gave a tracking brief but didn’t define the **telemetry contract** (what the mitm proxy must emit), how those events roll up into UPS and preview, and how we’ll compare costs against Codex/Claude for the same tasks.

**e) Subscription decision gates**
 I didn’t give hard thresholds for when to add capacity (GLM/extra Claude) versus staying lean.

This version fixes those.

------

## 1) Non‑negotiable **Clean‑Data Invariants** (to enforce now)

**Where**: encoded in code + SOPs so every window is auditable.

1. **Append‑only + stamped**
    All records carry `schema_version` + `tool_version` and `source` (`alias|ingest|automation`). Corrections are *new rows*, never edits.
2. **Resets & “after” timing**
    ADR‑004 style: never capture **after** within +5 minutes of observed reset. If the operator must proceed, tag `notes=late-after` and log an anomaly.
3. **Multi‑pane sanitize**
    Codex `/status`: keep only the *last* pane; flag `multi-pane-trimmed` in parsed.errors. This is implemented—ensure Behave tests lock it.
4. **Non‑negative capacity deltas**
    If computed delta < 0 (wrap or data race), set provider delta to `None`, mark `errors=["negative-delta"]`, and log to **`data/week0/live/anomalies.jsonl`**. Preview should call this out.
5. **One “before”, one “after” per provider window**
    Aliases must reject a second “before” unless the first is undone (`delete`). This is pre‑flighted in your alias runtime—keep the guard.
6. **ccusage > bars when in conflict**
    If Codex/Claude percentages disagree with ccusage tokens by >X% (pick X=10% for now), show both and mark `notes=divergent:ccusage`. Preview displays the divergence rather than hiding it.
7. **Window IDs + commits**
    Each finalized window carries `commit_start`, `commit_end`, `methodology` (already added with churn work per your log). This anchors churn and POC attribution.

> **Actionable additions**

- Add **`anomalies.jsonl`** writer in `JsonlStore` (mirrors append semantics).
- In preview, add a one‑liner: `Anomalies: N (see anomalies.jsonl)` when present.

------

## 2) Parallelization that won’t corrupt state

**Goal:** Run **our main line** + **the sub‑agent POC** in the same 5h era without stepping on each other.

**Isolation model**

- Environment knobs:
  - `TRACKER_DATA_DIR=.../data/week0/live`
  - `TRACKER_ALIAS_STATE_DIR=$TRACKER_DATA_DIR/state/${AGENT_ID}`
- Shell wrappers:
  - `source scripts/tracker-aliases.sh`
  - Introduce `AGENT_ID` at the shell level:
    - `AGENT_ID=main … os/oe/ox`
    - `AGENT_ID=sub1 … os/oe/ox` (or `zs/ze/zx` if you prefer GLM naming)
- **State files** for aliases live under `…/state/main` and `…/state/sub1` respectively. JSONL outputs still coalesce under `…/live/` (single truth), but each snapshot row carries `agent_id` in `notes` or a dedicated field.

**Scheduling**

- A small **window schedule file** `docs/System/scheduler/windows.local.txt` (or `.ics`) that both agents follow to avoid after‑reset collisions.
- Minimal script `scripts/automation/window_timer.sh` reads the schedule and triggers the alias wrappers with `--buffer-seconds` set per ADR‑004.

> **Actionable additions**

- Add `agent_id` to snapshot records (`alias_runtime.py` → pass through to `JsonlStore`).
- `scripts/tracker-aliases.sh`: export `AGENT_ID=${AGENT_ID:-main}` and propagate to CLI via `--notes agent:$AGENT_ID`.

------

## 3) Sub‑agent POC (Haiku→GLM) — **measurement‑first integration**

**Telemetry contract (mitm addon must emit)**

- For **each proxied request/response**:
  - `timestamp`, `session_id`, `subagent_id` (haiku), `backend_provider` (`glm|haiku`), `model`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `status`, `trace_id`.
- Session‑level rollup per window:
  - `total_prompts`, `total_tokens`, `%routed_to_glm`, `error_rate`, `mean_latency_ms`.

**Ingestion**

- Add `tracker ingest proxy-telemetry --window W0-CHN --stdin`
   Parser reads newline JSON events and summarizes to `proxy_telemetry.jsonl` (append‑only, stamped).

**Preview additions**

- New block when `proxy_telemetry` exists:

  ```
  Subagent Proxy:
    - routed_to_glm=64% (prompts=128), latency=820 ms p50 / 1600 ms p95, errors=0.9%
  ```

- Efficiency line for GLM becomes comparable because capacity units = prompts/tokens measured at source.

**POC success criteria (acceptance)**

- **Cost**: ≥2× token cost reduction on subagent work vs baseline (Codex/Claude) for matched tasks.
- **Quality**: `quality_score >= 0.8 * baseline` (or “no statistically significant drop” when n≥3).
- **Reliability**: error rate ≤ baseline + 2pp, p95 latency within +30% of baseline, no correctness regressions on deterministic tests.

> **Actionable additions**

- `tracker/src/tracker/sources/proxy_telemetry.py` (parser + rollup).
- `tracker preview` prints the block and folds GLM prompts into efficiency math you already have.

------

## 4) **Experiment design** so comparisons are valid

To avoid “features are bigger on provider X” bias:

1. **Task bank with equivalence**
    Create a bank of 8–12 feature specs of comparable complexity (≈50 lines each, as your Saturday checklist suggests). Use the **same** specs per provider.
2. **Counter‑balanced assignment**
    Randomize provider order per feature (AB/BA). Over the long session:
   - Half of features start on Codex, half on Claude/GLM subagent.
3. **Matched window labeling**
    Use `feature_id` in `windows.jsonl` so we can compare outcome/cost per feature between providers.
4. **Stop rules**
    If any provider shows `negative-delta` anomalies >1 per 3 windows or `ci` non‑finite values, halt that arm and fix capture before continuing.
5. **Sample size gates**
    Don’t draw efficiency conclusions until `n ≥ 3` windows per provider with non‑zero capacity; print `ci=n/a` otherwise (you already do). For a “go expand subscription” decision, require **two consecutive previews** with:
   - `ci_width ≤ 0.30` **and** `power ≥ 0.8`.

------

## 5) **Subscription decision** (clear gates)

**Stay lean now.** You have enough headroom to gather clean data given the new automation + parallelization. Expand *only if*:

- (G1) For any provider, the last **two** windows meet: `n≥3`, `ci_width ≤ 0.30`, `power ≥ 0.8`, and `quality_score ≥ 0.8` of baseline.
- (G2) Backlog pressure: at least **two** ready feature specs blocked only by provider capacity (not tooling or doc debt).
- (G3) Subagent POC meets cost/quality/reliability targets above.

If (G1–G3) hold, green‑light **one** incremental seat (GLM first if POC wins; otherwise Claude Max). Otherwise, keep investing in automation and task bank.

------

## 6) **15h long‑session blueprint** (3× a normal run)

> The goal is **throughput with trustworthy measurement**. Three macro‑commits (not squashed), each independently shippable.

### **Commit A — Data integrity & automation pack**

**Outcome:** Zero‑touch captures with anomaly surfacing.

- `JsonlStore`: add `append_anomaly()` → `anomalies.jsonl`.
- `tracker preview`: print `Anomalies: N`.
- `scripts/automation/ledger_checkpoint.sh`
  - Appends plan/mid/final to `Token_Churn_Ledger.csv`
  - Runs `tracker churn --window <latest>` and appends `Churn_Ledger.csv`
  - Adds file paths to `docs/SESSION_HANDOFF.md`
- `scripts/automation/window_timer.sh` + `docs/System/scheduler/standing_jobs.md`
  - ccusage daily(+weekly), `/status` before/after, claude‑monitor end, ledger checkpoint.
- Add Behave smoke for “automation → tracker ingest → preview shows source=automation”.

**Acceptance:**

- `behave features` green including automation scenarios.
- `preview` shows `Anomalies` line if you inject a fake negative delta.

------

### **Commit B — Parallel agents (state isolation + UX)**

**Outcome:** Two agents can operate concurrently without collisions.

- `alias_runtime.py`: carry `agent_id` (from env) into snapshot rows.
- `scripts/tracker-aliases.sh`: export/propagate `AGENT_ID`, add `*_d` delete helpers respecting agent state.
- Docs: `docs/Tasks/tracker_cli_aliases.md` + wiki note on multi‑agent setup.

**Acceptance:**

- Behave scenario: Agent A/B both record `before` in same minute → state dirs are distinct; preview shows both providers with correct latest `before/after` pairs; no rewrite.

------

### **Commit C — Subagent proxy telemetry + POC analysis hooks**

**Outcome:** POC emits measurable, comparable data in preview.

- `tracker ingest proxy-telemetry --stdin` → `proxy_telemetry.jsonl`
- `preview`: “Subagent Proxy” block with `% routed`, latency, error rate.
- Quick calc script: `scripts/tools/proxy_cost_compare.py` to print GLM vs baseline token totals for matched features.
- Docs: `docs/Tasks/subagent_poc_tracking.md` (fields + commands + acceptance).

**Acceptance:**

- Ingest sample events → preview shows proxy stats.
- Run comparison script → prints per‑feature cost deltas.

