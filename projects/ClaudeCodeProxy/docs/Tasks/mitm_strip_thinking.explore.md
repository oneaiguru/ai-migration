# GLM → Anthropic Thinking-Block Sanitizer (Exploration)

## Problem Statement
When a session starts on the Z.AI/GLM lane (e.g., `--model haiku`) and later routes back to an Anthropic model (Sonnet, Opus, ultrathink, etc.), the proxy replays the previous assistant response—including GLM-emitted `thinking` blocks with a Z.AI `signature`. Anthropic validates the signature and rejects the turn with `400 messages.*.thinking.signature: Invalid signature`.

## Goal (P0)
Ship a proof of concept in the shim/MITM that **strips or neutralises GLM thinking blocks before forwarding requests to Anthropic**, so cross-lane switches “just work” without 400s.

### Minimum Viable Behaviour
- When the active lane differs from the lane that produced an assistant message, remove any `type="thinking"` (or `redacted_thinking`) entries before replaying the transcript to Anthropic.
- Preserve the assistant’s visible text so the conversation remains coherent.
- Ensure we never send a `signature` field that Anthropic didn’t issue.

## Key Questions
1. Should we maintain **per-lane transcripts** (Anthropic vs GLM) and swap between them?
2. What is the safest transformation? Options:
   - Drop entire `thinking` blocks.
   - Convert them to a neutral `text` note such as “(reasoning omitted)” but omit `signature`.
3. How do we detect the lane that produced each assistant turn? (Likely stored alongside usage logs.)
4. Do we need a migration path for existing logs/conversation buffers?

## Acceptance Criteria for the POC
- Reproduces the failing scenario today (GLM session → switch to Sonnet) without sanitising → 400.
- With sanitising enabled, the same flow succeeds (Anthropic returns 200) and no invalid signatures are forwarded.
- Tests/documentation cover the transformation and the lane-switching guard.

## Out of Scope (for now)
- Re-signing thinking blocks or decrypting GLM signatures.
- Long-term storage format changes (e.g., database schema).
- Token accounting differences between the providers.

## Next Steps
1. Instrument the shim to annotate each assistant message with `lane` metadata.
2. Implement a middleware that, on lane switch (GLM → Anth or vice-versa), purges thinking blocks from the replay buffer.
3. Add regression tests + logging to confirm sanitiser behaviour.
4. Evaluate if we need a user-facing warning when context is trimmed.

_Once the POC proves stable we can fold it into the main routing pipeline and update docs._

---

## Understanding Check (hypotheses to falsify)

- H1 (most likely): Anthropic validates the `signature` inside any `type:"thinking"` block that appears in prior assistant messages. A GLM‑issued signature will not validate → 400 on Anth lane.
- H2: Even if we remove the GLM signature, leaving a `thinking` block without a valid signature still fails.
- H3: If we set request `thinking=disabled` for the first Anth turn after a lane switch, Anthropic does not require previous assistant thinking blocks and accepts a transcript without them.
- H4: The error can also appear without ultrathink; any `--model sonnet|opus` after GLM in the same session will reproduce.

We will prove/falsify H1–H3 with targeted repro runs and a unit‑level harness.

## Reproduction (precise)

Preflight
- Start shim with Z.AI key + license (Z.AI lane active):
  - `cd /Users/m/git/tools/ClaudeCodeProxy && make go-proxy && source scripts/go-env.sh 8082`
- Proxied terminal: ensure `HTTPS_PROXY/NODE_EXTRA_CA_CERTS` are set by `scripts/go-env.sh`.

Steps
1) Begin on GLM (Haiku):
   - `claude -p --model haiku "Say hi" --output-format json`
   - Expect 200; logs should show: `"lane":"zai"` and a completion.
2) Switch to Anthropic (Sonnet):
   - In the same session: `/model sonnet` then `"Next step?"`
   - Expect a 400 in the CLI similar to:
     - `messages.N.content.0: Invalid signature in thinking block`, or
     - `Expected thinking/redacted_thinking but found text`.
3) Proof greps (repo root):
   - `rg -n '"decision":"pass_through"|"decision":"license_block"|"decision":"forced_model"' logs/usage.jsonl | tail -n 10`
   - Confirm the second turn shows `"lane":"anthropic"` and a non‑200 status.

Observed Output (examples)
```
CLI: API Error: 400 {"type":"error","error":{"type":"invalid_request_error","message":"messages.3.content.0: Invalid `signature` in `thinking` block"}}
log: {"lane":"zai","model":"...haiku...","status":200,"reason":"ok"}
log: {"lane":"anthropic","model":"...sonnet...","status":400,"reason":"4xx"}
```

## Proposed POC (sanitizer on lane switch)

Decision tree
```
       Incoming request
              │
         Decide lane
         (policy+license)
              │
 ┌────────────┴────────────┐
 │                         │
 lane == Anth             else
 │                         │
 Was previous lane GLM?    Forward unmodified
 │
 ├─ Yes →
 │   - Strip all assistant `thinking`/`redacted_thinking` blocks
 │   - Set request `thinking=disabled` for this turn only
 │   - Add log: {event:"sanitize_thinking", lane_switch:"zai→anth"}
 │
 └─ No → Forward unmodified
```

Implementation notes
- P0 simplicity: do not attempt to re‑sign; always remove foreign thinking before Anth turns when the previous turn was GLM.
- Thinking mode suppression: include `"thinking": {"type":"disabled"}` (or the current API disable shape) at top‑level request when sanitising.
- Resume normal behaviour on the following Anth turn (do not force disable after the first successful Anth response).

Env toggles (guards)
- `THINKING_SANITIZE_ON_SWITCH=1` (default on)
- `THINKING_SWITCH_MODE=disabled|drop_only` (default `disabled`)
- `THINKING_LOG_DEBUG=0|1` (redacted header/body hints only)

## Test Plan

Unit (shim)
- Build a synthetic `/v1/messages` request with `messages=[...,{"role":"assistant","content":[{"type":"thinking","signature":"fake"},{"type":"text","text":"ok"}]}]` and route to Anth lane.
- Assert the outgoing (mutated) request has:
  - No `type:"thinking"` blocks in prior assistant messages.
  - `thinking=disabled` present for this call.

Integration (manual, token light)
1. GLM turn → Sonnet turn (no sanitizer): confirm 400.
2. Enable sanitizer + disable thinking on switch: confirm Sonnet 200.
3. Next Sonnet turn (sanitizer no longer forces disable): confirm 200 and that prior Anth thinking (if any) remains intact.

## Edge Cases
- User flips Anth → GLM: GLM may accept transcripts without Anth signatures; for symmetry we can drop foreign thinking on both directions (configurable).
- Streaming: the sanitizer runs before the upstream call; no need to alter SSE handling.
- Users explicitly requesting extended thinking: if a user forces thinking on for Sonnet immediately after switch, we still sanitize the legacy GLM blocks and allow Anth to generate its own thinking for the new turn.

## Open Questions
- Do we have a stable per‑session identifier to detect lane switches robustly, or should P0 infer it purely from inbound `messages` + chosen lane?
- Exact disable shape: track the canonical `thinking` API field to ensure forward compatibility.

## Acceptance Criteria (updated)
- Mixed GLM→Sonnet session no longer 400s; first Anth turn succeeds with sanitizer.
- Logs include a single `sanitize_thinking` event when the switch occurs.
- Feature is gated behind env toggles and can be turned off quickly.
