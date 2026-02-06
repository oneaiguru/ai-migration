# docs/Architecture/SECURITY_PERFORMANCE_NOTES.md

Security
- Header isolation: keep explicit strip on alt-lane retry; add unit test asserting no `x-api-key` on Anth requests.
- Input validation: add `http.MaxBytesReader(w, r.Body, 5<<20)` for non-stream JSON requests to bound memory (provider JSON responses are small; this is for our POSTs if we expose any).
- Timeouts: ensure http.Client has both `Timeout` and per-request Context cancel; keep H1 fallback knob.
- License surface: treat `license_pack` as sensitive only in memory; avoid writing to disk beyond ~/.config/ccp/license.pack; chmod 0600.

Performance
- Switch usage logging to a buffered channel with a single writer goroutine (R3+); enables batching and non-blocking writes.
- Consider `bufio.Writer` with periodic flush; preserve crash safety by flushing on exit via `defer` + signal handler.
- Avoid per-chunk allocations in SSE loop by reusing buffers with `bytes.Buffer` and `Reader.Read` into a fixed slice; current ReadBytes('
') is acceptable at low RPS.

Obfuscation / anti-copy
- Do not rely on obfuscation for security; if desired, use `garble` for minimal symbol obfuscation in distributed binaries (document how to disable for debugging).
- Protect IP with signed policy packs and license gating (ADR-0011/0012). Keep core routing heuristics in policy, not code.

Architecture clarifications
- “Decision” is orthogonal to “Completion”. Always log the decision event (lane, headerMode, retry/backoff flags) **before dialing**; log completion/error separately; this is already implemented — keep it invariant.
- Token accounting is best-effort and provider-specific; never block requests solely on failure to parse tokens; fall back to time-based quotas.

