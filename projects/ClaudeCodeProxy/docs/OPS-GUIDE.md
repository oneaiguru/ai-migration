# Claude Code + Z.AI Offload — Operator Guide

This guide explains (1) how your Sonnet session routes Haiku work through the MITM proxy, (2) what the key commands (`make summarize`, `make verify-routing`, `make bundle`) actually do, and (3) how to run the system like a product on this machine. Each section has an **ELI16** block — “explain like I’m 16” — so junior operators can follow without reverse‑engineering scripts.

---

See also: `docs/HANDOFF-DUAL-TERMINAL-PILOT.md` for the two‑terminal production pilot flow (proxied + stock).

## 1. Mental model

```mermaid
sequenceDiagram
    autonumber
    participant You
    participant Claude
    participant MITM as MITM Router (scripts/run-mitm.sh)
    participant ZAI as Z.AI (api.z.ai)
    participant Anth as Anthropic (api.anthropic.com)
    Note over You,Claude: Sonnet orchestrates; Haiku subagent for throughput
    You->>Claude: prompt (/model sonnet → delegate to haiku-subagent)
    Claude->>MITM: POST /v1/messages
    alt model includes "haiku"
        MITM->>ZAI: Rewrite host + auth (x-api-key or bearer)
        ZAI-->>MITM: streaming / JSON response
    else Sonnet or other model
        MITM->>Anth: Pass-through request (Anthropic auth only)
        Anth-->>MITM: streaming / JSON response
    end
    MITM-->>Claude: Response
```

**ELI16:** Think of MITM as a traffic cop. If it sees the word “haiku” in the request’s `model`, it sends that turn to Z.AI (using the Z.AI key). Everything else keeps going to Anthropic. Logs, metrics, and bundles are produced from whatever the cop sees.

---

## 2. Bring the system up

```bash
cd /Users/m/git/tools/ClaudeCodeProxy
MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm
source scripts/sub-env.sh 8082   # sets HTTPS_PROXY + trusted CA; unsets direct Anthropic env
export CLAUDE_CODE_SUBAGENT_MODEL=haiku
claude                         # /model sonnet; delegate scans to haiku-subagent
```

**ELI16:**
- `make mitm` launches `mitmdump` on port 8082 with our router addon.
- `sub-env.sh` tells the Claude CLI to use the local proxy and trust its certificate.
- `CLAUDE_CODE_SUBAGENT_MODEL=haiku` forces subagents to default to Haiku, so they offload automatically.
- If you prefer the one-command workflow, run `ccc-on 8082` (from `scripts/shell/ccc-aliases.sh`). It builds/starts the Go shim, writes the env file, and prints the usage banner in one shot.

Tip: Keep a second shell with `unset HTTPS_PROXY …` for “stock” Anthropic usage when you need it.

If you need to override defaults, copy `configs/providers.example.yaml` to `configs/providers.yaml` (or `~/.config/ccp/providers.yaml` for per-user overrides) and adjust the provider entries. Run `cc providers` to confirm the merged view.

---

## 3. Key commands explained

### 3.1 `make summarize`
- Runs `node scripts/summarize-usage.js logs/usage.jsonl`
- Creates/overwrites `results/METRICS.json`
- Aggregates counts, token totals, latency percentiles (p50/p95) by lane, op (stream/nonstream), header_mode, h1 vs h2, etc.

**ELI16:** It reads the raw JSONL log and produces a scoreboard (per provider, per stream type) so you instantly know how fast and healthy each lane was.

### 3.2 `make verify-routing`
- Executes `node scripts/verify-routing.js logs/usage.jsonl`
- Prints two lines: `% of decisions sent to Z.AI` and completions per lane (anthropic / zai / unknown)

**ELI16:** It’s a traffic audit — a quick check that Haiku calls really went to Z.AI and Sonnet calls stayed on Anthropic.

### 3.3 `make bundle`
- Runs `bash scripts/review-bundle.sh`
- Packages results/TESTS.md, results/METRICS.json, review outputs, logs/usage.jsonl, key docs, addon code, etc. into `~/Downloads/agentos_tmp_review-<timestamp>` and a `.tgz`

**ELI16:** It collects everything you’d send to a teammate or reviewer — metrics, logs, docs, and code — in one folder and a tarball.

### 3.4 Other helpful make targets
- `make repo-map` / `make repo-map-md` → file manifest + Markdown summary (pairs with Haiku subagent for repo snapshots)
- `make longrun-model-only` → scripted soak/alternation loop (use when running long stability tests)
- `make tee-on` / `make tee-off` → enable/disable body sampling (keep OFF by default in prod)

### 3.5 `cc model`
- Runs `cc model <name>` to persist the preferred default model at `~/.config/ccp/model`.

**ELI16:** It’s your quick toggle — pick `gpt-5-pro`, `claude-3.5-sonnet`, or any other route target once, and the CLI remembers it for the next `claude -p` session. The shim treats this as a routing hint (it doesn’t rewrite the body); decision logs include `decision:"manual_override"` when active.

### 3.6 `cc providers`
- Prints the merged catalog (source, auth env/scopes, header mode, base URLs, routes) in a table so you can sanity-check overrides.

**ELI16:** Think of it as a wiring diagram: it shows exactly which host each lane hits, which env var supplies credentials, and where the data came from (`policy` vs `configs/providers.yaml`).

---

## 4. Observability quick checklist

```bash
# Quotas / usage snapshot (per-model rolling/weekly, flags)
./bin/cc status            # table view: roll %, warn/block, WARN_AUTO%, TPS, peak hour (add --debug-quota for gap stats)

# High-level meter (tokens vs budget, per-lane counts)
./bin/cc usage            # full report
./bin/cc usage --banner   # one-line meter (also printed when ccc-on runs)

# Ready probes & Prometheus metrics
curl -s http://127.0.0.1:8082/healthz
curl -s http://127.0.0.1:8082/readyz | jq   # per-provider readiness JSON
curl -s http://127.0.0.1:8082/metrics | head

# Inspect partial outputs left behind after crashes (per-request stream dumps)
./bin/cc partials         # list logs/partials/*.partial

# See live routing decisions
rg -n '"lane":"zai"' logs/usage.jsonl | rg -i 'haiku' | tail -n 5
rg -n '"lane":"anthropic"' logs/usage.jsonl | rg -i 'haiku' || echo "OK: none"
rg -n '"lane":"anthropic".*"header_mode":"x-api-key"' logs/usage.jsonl || echo "OK: no Z.AI header on Anthropic"

# Full snapshot
tail -n 20 logs/usage.jsonl
make summarize && make verify-routing
```

**ELI16:**
- `cc usage` is your fuel gauge: tokens consumed, completion counts, and per-lane totals compared to the configured budget. The banner version is printed automatically whenever you run `ccc-on`/`ccp-start`.
- `cc status` now surfaces tokens/sec and `WARN_AUTO%`/confidence. The `ROLL OUT (elr/dirty)` column compares pure stream throughput vs wall time. Use `--debug-quota` to also see the calibration gaps (`gap_seconds_p50/p95`) and sample counts.
- `/healthz`, `/readyz`, and `/metrics` expose probe-ready endpoints for automation and Prometheus scraping. New counters include `ccp_preferred_attempt_total`, `ccp_rerouted_on_limit_total`, and `ccp_wasted_retry_ms_total` to track quota-driven reroutes.
- `cc partials` shows any partial-response files the proxy preserved when a stream ended abruptly. Clean them with `cc partials clean` once you’ve inspected the leftovers.
- The `rg` lines are your smoke tests: Haiku entries should show lane=`zai`; there should be zero Haiku entries on Anthropic; the Z.AI header must not appear on Anthropic lines.
- `tail` gives you the latest raw events.
- `make summarize && make verify-routing` prints the scoreboard and traffic audit.

Note on `/readyz` semantics
- The readiness probe treats HTTP status codes in the 200–405 range as “reachable.” Some providers prefer `HEAD`/`OPTIONS` over `GET`, which can return 405 Method Not Allowed despite a healthy upstream. The JSON payload includes a brief `reason` explaining why a non-200 response is still considered OK (e.g., `method_not_allowed`).

---

## 5. Bundles & sharing

When you’re done with a pilot block:

```bash
make summarize && make verify-routing
make bundle
# -> ~/Downloads/agentos_tmp_review-<timestamp> and .tgz ready to send/attach
```

**ELI16:** Produce metrics and the bundle at the end of every session so reviewers (or future you) have everything without rerunning commands.

---

## 6. Parallel usage tips

- Multi-terminal: open separate shells, each with `source scripts/sub-env.sh 8082`, run different Haiku jobs simultaneously.
- Scripted parallel: `bash scripts/parallel-subagents.sh 4` (4 Haiku prompts in parallel). If you hit rate limits, export `MITM_ENABLE_BACKOFF=1` and reduce the number.

---

## 7. Failsafes & toggles (copy/paste)

```bash
# Z.AI 401s? Swap header mode and restart MITM
export ZAI_HEADER_MODE=authorization
MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm

# HTTP/2 retarget jitter? Force H1 and restart
export MITM_FORCE_H1=1
MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm

# Emergency kill switch (all traffic to Anthropic)
export OFFLOAD_PAUSED=1
# roll back when done
offset OFFLOAD_PAUSED

# Timeout knobs (optional; set before starting shim)
export CCP_JSON_TIMEOUT=45s        # non-streaming request timeout
export CCP_SSE_IDLE_TIMEOUT=180s   # stream idle cutoff
export CCP_DIAL_TIMEOUT=5s         # TCP connect deadline
export CCP_DIAL_KEEPALIVE=30s      # TCP keepalive interval
export CCP_TLS_TIMEOUT=5s          # TLS handshake timeout
export CCP_HEADER_TIMEOUT=15s      # response header timeout
```

**ELI16:** These are panic buttons. If Z.AI refuses auth, try bearer tokens. If connections flake because of HTTP/2 host swapping, fall back to HTTP/1. Setting `OFFLOAD_PAUSED` is a kill switch — everything returns to Anthropic instantly.

---

## 8. Keeping prod and dev separate (same machine)

| Mode | Start | Env | Usage |
| --- | --- | --- | --- |
| GLM offload (pilot) | `MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm` | `source scripts/sub-env.sh 8082` | Sonnet orchestrates; Haiku subagent offloads; metrics/bundle from logs |
| Stock Anthropic | *(no MITM)* | `unset HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_*` | Pure Claude behavior; use when you don’t want offload |
| Direct Z.AI test | *(no MITM)* | `export ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic; export ANTHROPIC_AUTH_TOKEN=$ZAI_API_KEY` | Quick A/B or debugging without the proxy |

Note on Claude CLI auth
- When invoking the Claude CLI (`claude -p`) the CLI supplies its own Authorization header from its login/session.
- For CLI‑driven UAT against CCP, you typically only need to point the base URL: `ANTHROPIC_BASE_URL=http://127.0.0.1:<port> claude -p "Say ok"`.
- You do not need to export `ANTHROPIC_AUTH_TOKEN` for CLI runs; that’s only needed for raw `curl` tests or non‑CLI clients.

**ELI16:** You’re running everything on one laptop. Use environment blocks to flip between “production with offload” and “pure Claude.” No external users are affected.

---

## 9. Handy aliases (optional)

### Persistence (R4)
- SQLite persistence is enabled by default. DB: `logs/ccp.sqlite3` (override with `CCP_DB_PATH`).
- New read endpoints (additive):
  - `GET /v1/usage/samples?since=<epoch>&model=<opt>`
  - `GET /v1/usage/rollups?granularity=hour|day&model=<opt>&since=<opt>`
- Rollups run in the background (`CCP_ROLLUP_INTERVAL`, default `5m`).
- Metrics to scrape: `ccp_store_writes_total`, `ccp_store_write_errors_total`, `ccp_rollup_duration_seconds`, `ccp_store_size_bytes`.
- Sample retention: `CCP_SAMPLE_TTL_DAYS` (default `7`) prunes old samples.
- CLI helpers (optional):
  - `./bin/ccp db status` → JSON summary (counts, min/max ts, rollup rows, file size)
  - `./bin/ccp db export --csv /path/out.csv` → export samples
  - `./bin/ccp db import --jsonl logs/usage.jsonl` → import legacy JSONL

#### Cross-process aggregator (optional)
- Build: `cd services/go-anth-shim && go build ./cmd/ccp-agg`
- Merge DBs in a directory: `./ccp-agg -dir logs -out results/rollups`
- Outputs: `results/rollups/rollup_hour.json`, `results/rollups/rollup_day.json` (shape matches the API).

### Licensing & Community Mode
- We are not shipping a licensed product yet. Everything needed to run locally is in this repo.
- If no license is provided, CCP runs in community mode — all endpoints, metrics, persistence and rollups work.
- Optional features (e.g., `zai_offload`) are license-gated; in community mode Z.AI offload is disabled. Samples show `decision:"license_block"` when routing would otherwise choose the Z.AI lane.
- For UAT using the Claude CLI, you do NOT need to export `ANTHROPIC_AUTH_TOKEN`; the CLI supplies Authorization automatically. Point the CLI at CCP via `ANTHROPIC_BASE_URL=http://127.0.0.1:<port>`.

Verify license is active
- Check startup log: `[license] plan=<plan> features=[..., zai_offload, ...]`.
- GET `/readyz` includes a `license` object: `{ ok: true, plan: "...", features: ["zai_offload", ...] }`.
- Run a Haiku prompt; samples should record `lane:"zai"` and no `license_block`. Metrics show `ccp_requests_total{lane="zai",...}` incrementing.


Add to `~/wiki/dotfiles/claude-mitm.aliases.sh` and source in `~/.zshrc`:

```sh
ccmitm()  { MITM_FILTER_CHAIN=1 MITM_PORT=${1:-8082} FORCE_HAIKU_TO_ZAI=1 make -C /Users/m/git/tools/ClaudeCodeProxy mitm; }
ccsub()   { source /Users/m/git/tools/ClaudeCodeProxy/scripts/sub-env.sh ${1:-8082}; export CLAUDE_CODE_SUBAGENT_MODEL=haiku; }
cclogs()  { tail -f /Users/m/git/tools/ClaudeCodeProxy/logs/usage.jsonl; }
ccverify(){ (cd /Users/m/git/tools/ClaudeCodeProxy && make summarize && make verify-routing); }
ccbundle(){ make -C /Users/m/git/tools/ClaudeCodeProxy bundle; }
ccstop()  { pkill -f "mitmdump.*-p ${1:-8082}" || true; }
ccstock() { unset HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN; claude; }
cczai()   { export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"; export ANTHROPIC_AUTH_TOKEN="${ZAI_API_KEY:-}"; claude; }
```

## 10. Quotas Ops (quick)

- ./bin/cc status            # snapshot (roll %, warn/block, TPS, fastest hour)
- ./bin/cc quotas reload     # hot-reload active quotas (optional [FILE] path)
- curl -s :8082/v1/quotas | jq  # show active config + source path

ELI16: Use status to see how close models are to their rolling/weekly caps. If you adjust the quotas file, run cc quotas reload to apply it without restarting the shim.

**ELI16:** These aliases reduce the whole flow to single commands (`ccmitm`, `ccsub`, `cclogs`, etc.) so you don’t forget steps.

---

## 10. Next actions checklist (human approval)

1. Apply optional hardening (already done in repo): safe 401 fallback, H2 guard, path prefix.
2. Run at least one real code-review + refactor task today using the pilot flow.
3. When done, run `make summarize && make verify-routing` and `make bundle`.
4. Capture owner sign-off (Routing ✓, Safety ✓, Observability ✓, Stability ✓) in docs/SESSION_HANDOFF.md.

That’s it — the system is in “pilot-ready” shape. Follow the ELI16 cues whenever you hand this off to another teammate.
