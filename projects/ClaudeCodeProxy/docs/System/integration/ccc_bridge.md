Title
Agent‑OS Bridge for CCC — ingest, normalize, render

What this adds to Agent‑OS

• A tiny Python module (`tracker/bridges/ccc.py`) that fetches `http://127.0.0.1:8082/v1/usage`, validates against `ccp.usage.v1`, and appends into `windows.jsonl` as a new “CCC snapshot” record with `provider:"ccc"`.
• Rendering additions in `preview` to show: tokens %, warn/block, speeds (ELR/dirty), TTFT, fallbacks, hour‑of‑day rates.
• No pane parsers involved; this simply overlays CCC telemetry beside existing “Providers” and “Outcome” blocks.

Steps

1. Add `tracker/bridges/ccc.py` and a loader test with `fixtures/usage/ccc_usage_with_speeds.json`.
2. Extend `preview` printer to include a “CCC” section.
3. Ensure `Week‑0` cadence (BEFORE/AFTER readings + 5‑minute lag) is preserved; CCC readings should follow the same timing.

Acceptance

• `tracker preview` prints a CCC block with speeds and quotas for each model when the shim is running.
• Commit tags (`xfeat::`) continue to anchor windows; CCC data is additive.