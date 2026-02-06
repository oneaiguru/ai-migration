# docs/Tasks/R2_AGENT_FINAL.md

Objective
Finish R2 thin slice to “green”: rotation guard + token accounting + doc/test polish.

Checklist (do in order; commit after each)
1) Rotation guard
- File: services/go-anth-shim/cmd/ccp/logrotate.go
- Add: package-level `var rotateMu sync.Mutex`.
- Wrap rotateUsageLogIfNeeded() and rotateAnomalyLogIfNeeded() bodies with rotateMu.Lock/Unlock.
- Test: add a burst test in logrotate_test.go that concurrently calls rotateUsageLogIfNeeded() (100 goroutines) against a temp file with small max size; assert no error, last file exists.

2) Token accounting hooks
- File: services/go-anth-shim/cmd/ccp/main.go
- In both Anth lane and Z.AI lane, after reading full JSON body for non-stream, and in SSE finalization, attempt to parse provider-specific usage:
  - Anthropic: look for `{"usage":{"input_tokens":N,"output_tokens":M}}`.
  - Z.AI: look for `X-*` headers or JSON `usage` if present (gracefully handle absence).
- Thread values to `usageEntry` (InputTokens/OutputTokens, StreamMs, TTFTMs) and to `q.RecordUsage(model, inTok, outTok, dirtyDur, streamDur, ttftDur)`.
- Failure to parse is OK — leave zeros.

3) Ready/metrics/doc polish
- docs/OPS-GUIDE.md: add explicit note that /readyz treats 200–405 as “OK (provider policy)”.
- docs/QUOTAS.md: clarify current quotas.json exact-match behavior (no globs) and add token support note.
- /metrics: clamp negatives; if any float is NaN/Inf, skip sample.

4) Tests
- services/go-anth-shim/cmd/ccp/quotas_test.go:
  - Add test for weekly hours path (WeeklyLimitType: "hours") using sim-usage with seconds>0.
  - Add test that POST /v1/quotas/reload with a bad JSON returns 400.
- New test: services/go-anth-shim/cmd/ccp/usage_tokens_test.go
  - Feed a stub Anthropic JSON response with usage block to a helper parse; assert in/out token extraction.

5) Session handoff
- docs/SESSION_HANDOFF.md: append “R2 closeout” with commands run and file diffs.

Acceptance
- `go test ./...` passes.
- `./bin/cc status` shows non-zero tokens when provider returns usage.
- `/v1/usage` reflects warn/block via tokens when configured accordingly.
- No rotation errors in burst test; log files rotate correctly.
