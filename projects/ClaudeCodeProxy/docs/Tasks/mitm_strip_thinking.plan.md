# Plan: MITM/Shim Thinking-Block Sanitizer

## Context
- Issue: GLM (Haiku via Z.AI) emits `thinking` blocks with Z.AI signatures; when the same transcript is replayed to Anthropic (Sonnet/Opus/etc.), Anthropic validates the signature and returns 400.
- Goal: sanitize history when the active lane switches to Anthropic so no foreign `thinking` block reaches the Anthropic API.
- Out of scope: Python MITM parity, re-signing thinking blocks, storage schema changes.

## Preconditions
1. Worktree: `/Users/m/git/tools/ClaudeCodeProxy`.
2. Current changes reviewed (license UX + loopback complete).
3. Baseline tests pass: `cd services/go-anth-shim && go test ./...`.
4. Read `docs/Tasks/mitm_strip_thinking.explore.md` for background and hypotheses.

## Implementation Steps
1. **Feature toggles & configuration**
   - Add env-controlled settings in the Go shim:
     - `THINKING_SANITIZE_ON_SWITCH` (default `1`).
     - `THINKING_SANITIZE_MODE` with values `disable` (default) or `drop_only`.
   - Extend `server` struct to hold `sanitizeThinking bool` and `sanitizeMode string` loaded during startup.
2. **Lane attribution for assistant turns**
   - Ensure each assistant response sent to the client carries metadata describing the lane that produced it.
   - Minimal approach: before forwarding the upstream response, add a hidden marker to the JSON (e.g., envelope field in our per-request context) or maintain an in-memory map keyed by conversation/session id.
   - Prefer: embed in the stored request context (the shim already has access to incoming `messages`; we can inject a lightweight tool annotation like `{"type":"metadata","lane":"zai"}`).
3. **Sanitizer hook before outbound Anthropic calls**
   - When `sanitizeThinking` is true and the chosen lane is Anthropic, inspect the incoming request’s `messages` array.
   - Identify assistant messages whose metadata indicates a non-Anthropic lane.
   - For those messages:
     - Remove any `type:"thinking"` or `type:"redacted_thinking"` entries.
     - If `THINKING_SANITIZE_MODE=disable`, set `body."thinking" = {"type":"disabled"}` for the *current* request.
     - Optionally replace removed blocks with a short `text` marker `(reasoning omitted)` if UX requires (default: drop entirely).
4. **Logging & observability**
   - Emit a structured usage log entry: `{event:"sanitize_thinking", from:"zai", to:"anth", sanitized_messages:n}`.
   - Add debug logs (behind `THINKING_SANITIZE_DEBUG=1`) dumping sanitized message ids (avoid user content).
5. **Configurable suppression window** (optional but low effort)
   - Track whether the sanitizer has run in the current session; disable automatic `thinking=disabled` after the first successful Anthropic response to avoid permanently disabling thinking.
6. **Docs**
   - Create `docs/ops/mitm-thinking-sanitizer.md` summarising behaviour, toggles, and known caveats.
   - Update `docs/PROD-TESTS.md` and `docs/SESSION_HANDOFF.md` with new toggles and validation steps.
7. **Smoke / helper scripts**
  - Add a targeted script (e.g., `scripts/smoke-thinking.sh`) that runs a Haiku call followed by a Sonnet call and asserts 200 with sanitizer on/off (off should reproduce 400, on should pass). Guard with `ALLOW_REAL_API`.
  - Reference docs: `~/wiki/dotfiles/claude-proxy.aliases.sh` (alias reference) and `~/wiki/WikiPrinciples.md` (linking guidelines) for how the flow is orchestrated today.
8. **Unit tests**
   - Add table-driven tests in `services/go-anth-shim/cmd/ccp/main_test.go` covering:
     - Lane switch sanitizes thinking blocks.
     - `drop_only` mode leaves text content untouched without injecting `thinking=disabled`.
     - Sanitizer is skipped when env flag off or when lane does not change.
9. **Integration verification**
   - Run `go test ./...` within `services/go-anth-shim`.
   - (Optional) Manual CLI sanity: Haiku turn → Sonnet turn should now succeed (200). Document command outputs if executed.

## Testing Checklist
- [ ] `go test ./...` in `services/go-anth-shim`.
- [ ] Unit tests for sanitizer logic pass.
- [ ] Smoke script (`ALLOW_REAL_API=1 THINKING_SANITIZE_ON_SWITCH={0,1} scripts/smoke-thinking.sh`) demonstrates failure without sanitizer and success with it.

## Rollback Strategy
- Runtime: set `THINKING_SANITIZE_ON_SWITCH=0` to disable the feature immediately.
- Code: `git checkout --` for modified files (core shim, tests, docs, scripts) and rerun baseline tests.

## Follow-ups / Stretch
- Implement equivalent sanitizer in the Python MITM once Go path stabilises.
- Persist sanitized metrics (count per session) for observability dashboards.
- Explore secure re-signing if Anthropic provides API support in the future.
