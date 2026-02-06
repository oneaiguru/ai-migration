# Bug Log

## 2025-10-22 — GLM thinking block mismatch (Haiku via CLI)
- **Environment**: work/sub authorized, trial license active, `claude -p --model haiku` while GLM lane enabled.
- **Error**: API 400 `messages.207.content.0.type: Expected thinking or redacted_thinking`. Raw traces saved by the CLI at:
  - `/Users/m/Desktop/.claude-trace/log-2025-10-22-04-54-39.*`
  - `/Users/m/.claude-trace/log-2025-10-22-09-47-05.*`
- **Follow-up**: switching “thinking” off produced repeated `Unable to connect` retries; CLI auto-ran `/compact`. Likely missing thinking block when GLM mux rewrites conversation. Needs investigation when GLM lane work resumes.
- **Status**: Open. First occurrence captured; monitor for repeats.

Add new entries here with timestamp, lane, repro steps, and where the raw CLI trace lives so the next agent can inspect without reproducing under load.

## 2025-10-22 — CLI `/context` invalid JSON when GLM lane active
- **Environment**: Haiku routed to Z.AI (trial license, shim active).
- **Scenario**: Interactive CLI session (`claude -c` or `claude -p`) with GLM on; issuing `/context` command.
- **Error**: CLI prints `SyntaxError: Unexpected token '', ""... is not valid JSON`, `/context` fails twice.
- **Notes**: Occurs only when the session is routed through GLM; Sonnet/Anth lane does not repro. Need to inspect how `/context` pulls history after GLM reformatting.
- **Artifacts**: Session traces under `~/.claude-trace/` at runtime (see timestamp 2025-10-22 ~05:00). Capture future occurrences for diff.
- **Status**: Open.

## 2025-10-28 — CLI `/context` failures in mixed Haiku (Z.ai) ⇄ Sonnet (Anth) session
- **Environment**: prod profile, shim on :8082; trial license active (Haiku→Z.ai enabled); Accept-Encoding normalization enabled on Z.ai lane only; CLI launched from a non-repo folder.
- **CLI trace paths** (printed by the CLI during repro):
  - `/Users/m/Documents/replica/.claude-trace/log-2025-10-28-13-54-58.{jsonl,html}`
- **Repro** (interactive):
  1. `claude`
  2. `> /model claude-haiku-4-5-20251001`
  3. `> /context` → Anthropic 400 invalid_request_error: "temperature may only be set to 1 when thinking is enabled"
  4. `> /model claude-sonnet-4-5-20250929`
  5. `> /context` → `SyntaxError: Unexpected token '', ""... is not valid JSON`
- **Expected**: `/context` returns valid JSON context/details in both model states.
- **Observed**:
  - Haiku/Z.ai phase: 400 from upstream (CLI sets temperature in a way Anthropic rejects without thinking enabled). Not a routing failure.
  - Sonnet/Anth phase: JSON parse error in the CLI; likely due to gzip/streamed response content while CLI expects identity JSON for this meta-command.
- **Routing evidence around the window** (Z.ai successes present):
  - `logs/prod/usage.jsonl:2573` … lane:"zai", status:200, header_mode:"authorization"
  - `logs/prod/usage.jsonl:2574` … lane:"zai", status:200, header_mode:"authorization"
  - `logs/prod/usage.jsonl:2575` … lane:"zai", status:200, header_mode:"authorization"
- **Hypothesis**:
  - The `/context` path expects plain JSON; Anth lane may respond gzip/stream. We only normalize `Accept-Encoding: identity` on the Z.ai lane; interactive meta-commands on Anth lane can surface gzip to the CLI, which then fails to parse.
  - The 400 for temperature/thinking is a CLI parameter constraint (not proxy); unrelated to routing.
- **Proposed fix**:
  - Mirror header normalization on Anth lane for `/v1/messages`: set `Accept-Encoding: identity` when forwarding JSON calls (non-stream).
  - Add a guarded header/body debug (behind `SHIM_DEBUG_HEADERS=1`) for `/context` calls to record `content-type` and `content-encoding` for future triage.
  - Document CLI constraints for `/context` (thinking/temperature) in the SOP.
- **Status**: Open — implement encoding normalization on Anth lane and re-test `/context` Haiku→Sonnet sequence.

## 2025-10-28 — CLI tool_use JSON parse during stream (“Unexpected end of JSON input”)
- **Environment**: prod profile, shim on :8082; interactive Claude Code session in `~/Documents/replica/qa`; Sonnet lane (Anthropic) responding via SSE.
- **Symptom**: CLI shows a tool banner (e.g., `Search(pattern: "...", path: "...", head_limit: 10)`) followed by `API Error: Unexpected end of JSON input`. UI may briefly flicker while the tool input is being constructed.
- **Routing evidence**: Upstream is healthy; `logs/prod/usage.jsonl` shows `status:200`, `op:"stream"`, and non‑zero `ttft_ms/stream_ms` for the same `rid`. Example session around the time of the error:
  - `logs/prod/usage.jsonl` rid `868eab99` — Sonnet streaming with normal timings.
  - `logs/prod/partials/868eab99.partial` — contains `input_json_delta` chunks for tool_use blocks (e.g., `TodoWrite`, `Write`), gradually assembling JSON payloads.
- **Cause (classification)**: `client_parse` — the CLI attempted to parse tool input JSON before the stream reached `content_block_stop`/`message_stop`, so the JSON was incomplete at parse time.
- **Notes**: This is client‑side; not a gzip/encoding issue (Anth lane uses `Accept-Encoding: identity` for JSON and the transport has compression disabled). No upstream error in `ccp.out`.
- **Operator guidance**: Retry once after the tool banner settles, or split the request into smaller parts. Collect the `.partial` file and usage entries for future CLI fixes (buffering until the end of the block).
- **Status**: Open — track recurrences; propose client fix to defer parsing tool input JSON until the block stop event.

## 2025-10-31 — `/context` failures (temperature + JSON parse)
- **Environment**: mixed Sonnet/Haiku sessions via shim on :8082; license active (Haiku→Z.ai enabled); interactive CLI.
- **Errors**:
  - `400 invalid_request_error`: "`temperature` may only be set to 1 when thinking is enabled" (Anthropic constraint on `/context`).
  - `SyntaxError: Unexpected end of JSON input` after `/context` (client parsed before JSON finished assembling).
- **Notes**:
  - The 400 is a CLI parameter constraint on `/context` (not proxy); must align temperature/thinking for this meta-command.
  - The parse error matches prior tool_use streaming case: client parsed partial JSON mid-stream.
- **Evidence to capture**:
  - Matching `rid` entries in `logs/prod/usage.jsonl` around the `/context` calls.
  - Partial stream file under `logs/prod/partials/<rid>.partial` if the CLI started streaming.
- **Next**:
  - Document CLI constraints for `/context` under SOP troubleshooting.
  - Consider a client-side fix to buffer `/context` JSON fully before parse.
  - Keep `Accept-Encoding: identity` normalization (already in shim) to rule out gzip.

## 2025-11-01 — Session flips after Z.ai 502 → Sonnet “Context low”
- **Environment**: interactive sessions via shim (:8082), Haiku routed to Z.ai (license active), model switches between Haiku and Sonnet.
- **Observed**:
  - After a burst of Z.ai 502s, switching to Sonnet leads to `Context low · Run /compact to compact & continue` banners, and 400s on Anth lane for follow-ups.
  - Example window (trimmed):
    - `{... "lane":"zai","status":200,...}` followed by `Anth 400` and repeated Sonnet `400` on resume.
  - Operator report: fresh sessions (new terminal) work; longer sessions with heavy file reads trigger the pattern.
- **Hypothesis (to investigate; do not treat as fact)**:
  - Z.ai stalls occur first; then the CLI’s `/context` fetch or resume path gets into an invalid state (temperature/thinking mismatch or partial JSON), leading to Sonnet 400 and "Context low" prompts.
- **Evidence to capture**:
  - Matching `rid` for the last Z.ai 502 and the first Sonnet 400; CLI partials under `logs/prod/partials/<rid>.partial` if streaming started.
  - CLI trace files for the session (`~/.claude-trace/...`), especially around `/context` invocations.
- **Next**:
  - Short-session vs long-session A/B under H2 (fallback off) to reproduce reliably.
  - Append exact snippets (rids + two or three adjacent lines) in the next entry when captured.

## 2025-11-02 — 502 appears before context is full (suspected upstream unreliability)
- **Environment**: interactive Haiku via shim; license active; fallback OFF; H2.
- **Observed**: 502 upstream error occurs even without “context low” banners; direct Z.ai curl tests (HTTP/1.1) succeed in separate shells → suggests intermittent upstream/H2 path stalls.
- **Evidence**: tails show repeated `net/http: timeout awaiting response headers` on lane="zai" before `/context` warnings appear.
- **Next**: keep H2; prefer shorter sessions; capture precise rid + timestamps; if reproducible in short sessions, revisit H2 stability experiments (canceled plan outline saved).

## 2025-11-02 — Flicker/hang after `/context` then model switch
- **Environment**: interactive CLI; `/context` used; then model switch (Haiku↔Sonnet).
- **Observed**: the terminal flickers and “hangs”, rapidly erasing typed input until Ctrl‑C; sometimes follows a `/context` 400 or partial JSON parse error.
- **Hypothesis**: client UI is parsing/streaming mid‑state after `/context`; switching models destabilizes the input mode state until a clean reset.
- **Evidence to capture**: CLI trace files (`~/.claude-trace/...`), rid for last `/context`, matching `logs/prod/partials/<rid>.partial` if streaming started.
- **Workaround**: `/compact` or exit and start a fresh session; prefer shorter sessions; document for follow‑up.
