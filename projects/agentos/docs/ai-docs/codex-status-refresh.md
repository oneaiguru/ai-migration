# Codex `/status` Refresh Behavior (2025-10-19)

## Observation
- During the W0-20 AFTER capture on 2025-10-19, Codex continued to report the old five-hour bar even after the window reset time (14:01 local).
- Multiple `/status` calls between 14:01:00 and 14:02:00 returned the stale "3% used (resets 14:01)" reading. Only after ~60 seconds did the pane drop to `0%` with a new reset timestamp (`resets 19:01`).
- Exact sample: see `/Users/m/Desktop/5.markdown` (mirrored under `tests/fixtures/codex/live_cases/W0-20_after_multi_status.txt`).

## Implications
- Operators must keep polling `/status` until the UI reflects the reset; a single call at the scheduled reset minute is not reliable.
- Tracker ingestion must be robust when a stdin blob contains multiple pane dumps—only the final block should be stored.
- Aliases (`oe`, `ox`) should resist ingesting the intermediate snapshot to avoid double-counting capacity.

## Follow-up Tasks
1. Extend `parse_codex_status` to accept multi-pane input and return the latest block.
2. Add pytest/Behave coverage using the new fixture.
3. Update SOPs to remind operators to expect a ~60s lag before AFTER readings stabilize.
