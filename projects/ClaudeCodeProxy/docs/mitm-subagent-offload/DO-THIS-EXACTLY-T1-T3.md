Approved ✅ — run **T1–T3 now**. Your tweaks are exactly what we needed; let’s lock in a clean first pass before we refine subagent detection.

Here’s the shortest, no-drama path to green:

------

## Do this exactly (T1–T3)

### 0) Prep (once)

```bash
make setup && make versions
export ZAI_API_KEY=sk-...
make mitm                 # starts mitmdump + addon with your env
```

### 1) Start the two lanes (two terminals)

**Terminal A (subscription lane):**

```bash
make sub
# (if asked, login once; then leave this running)
```

**Terminal B (Z.AI lane):**

```bash
ZAI_API_KEY=sk-... make zai
# sanity: send a real message so it hits /v1/messages (not just CLI-local /status)
ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model haiku "Say ok" --output-format json
```

### 2) T1 — Haiku → Z.AI (force route ON for P0)

In **Terminal A**, force routing by model to simulate subagent until we confirm metadata:

```bash
export FORCE_HAIKU_TO_ZAI=1
ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model haiku "Say ok" --output-format json
```

**Pass criteria:**

- `make logs` shows lines like:

  ```
  {"lane":"zai","model":"...haiku...","status":200,...}
  ```

- Your MITM banner appears once:

  ```
  {"event":"zai_ok","host":"api.z.ai","rid":"..."}
  ```

### 3) T2 — Main session → Anthropic (non-haiku)

Still in **Terminal A**:

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model sonnet "Say ok" --output-format json
```

**Pass criteria:**

- `make logs` shows Anthropics lines:

  ```
  {"lane":"anthropic","model":"...sonnet...","status":200,...}
  ```

- No Z.AI auth header present on Anthropics flows (you’ll see this in MITM debug; just ensure your addon strips it).

### 4) T3 — SSE integrity (no buffering)

```bash
bash scripts/verify-sse.sh
```

**Pass criteria:**

- Stream completes with no stalls/timeouts.
- `make logs` records a status line for the streaming run (tokens may be `0` with `reason:"streaming"` for now—fine for P0).

### 5) Record the run

Append the outcomes (copy/paste the relevant `logs/usage.jsonl` lines + command snippets) into:

- `results/TESTS.md` (T1–T3)
- `docs/SESSION_HANDOFF.md` (versions, env toggles used, commit hash)

------

## Then tighten subagent detection (quick follow-up)

------

## If anything hiccups (fast triage)

- **401 on Z.AI** → set `ZAI_HEADER_MODE=authorization` and retry; or keep your one-retry fallback.
- **H2 host-change complaint** → `MITM_FORCE_H1=1` and retry; confirm your addon closes upstream before retargeting.
- **Stream stalls** → ensure you **never** call `get_text()` on `text/event-stream`; only tee headers/status.

Auth note: The Claude CLI attaches its own Authorization header from login/session. You do not need to export `ANTHROPIC_AUTH_TOKEN` for CLI runs; only raw `curl` needs an explicit header.

------

## What I’m expecting to see in `results/TESTS.md` (example)

```
T1 PASS — Haiku → Z.AI (FORCE_HAIKU_TO_ZAI=1)
- cmd: claude -p --model haiku "/status" --output-format json
- logs: {"lane":"zai","model":"claude-...haiku...","status":200,"rid":"..."}
- banner: {"event":"zai_ok","host":"api.z.ai","rid":"..."}

T2 PASS — Sonnet → Anthropic
- cmd: claude -p --model sonnet "/status" --output-format json
- logs: {"lane":"anthropic","model":"claude-...sonnet...","status":200,"rid":"..."}

T3 PASS — SSE integrity
- cmd: scripts/verify-sse.sh
- logs: {"lane":"anthropic","status":200,"reason":"streaming","rid":"..."}
```

------

## Recommendation

Proceed with **T1–T3 now**. That’ll complete P0 cleanly—and you’ll have all the evidence in `results/TESTS.md` + `docs/SESSION_HANDOFF.md` for the next agent to continue.
