# Codex Context Pruning Notes (2025-10-20)

## Observation
- During the 2025-10-20 tracker session we watched Codex reclaim context headroom automatically.
- Snapshot 1 (after long alias + ingestion work): `/status` showed **20% context remaining** (218K tokens used / 272K).
- Snapshot 2 (one minute later, no manual pruning): `/status` reported **39% remaining** (169K tokens used / 272K).
- The only activity between the two panes was the automation script emitting `/status`; Codex trimmed older reasoning turns on its own to keep the session alive.

## Implications for Operators
- Expect Codex to garbage-collect earlier reasoning summaries when the transcript grows large; context headroom may bounce back without ending the session.
- Do **not** assume a sharply dropping context % means you must reset immediately—poll `/status` again before aborting a window.
- When logging snapshots, capture both the "heavy" pane and the follow-up so we can quantify how much headroom is reclaimed (example preserved in session logs).

## Tracker / SOP Impact
- Automation scripts (`scripts/automation/codex_status.sh`) should keep emitting the raw pane so we can see the rebound in `data/week0/live/snapshots.jsonl`.
- When scripting safeguards (e.g., future governors), allow a second `/status` pass before forcing a reset so the system can prune itself.
- Reference: `tests/fixtures/automation/codex_status_before.txt` (38% left) and the live pane collected at 2025-10-20 14:02 showing 39% remaining.

## Next Steps
1. Add a tracker metric that logs "context reclaimed" deltas between two successive panes for the same window.
2. Consider documenting the behaviour in operator SOPs (e.g., Saturday prep) so Humans know to double-check before restarting Codex.

## Operator Checklist
- Capture both the high-usage pane and a follow-up `/status` within ~1 minute to record pruning.
- When operating near reset, run `/status` twice (before and after the expected reset minute).
- Note the timestamp and percent differences in the progress log so later analysis can quantify reclaimed context.


## Reset Anomaly (Oct 2025)
- Early `/status` panes during Week-0 showed `resets 21:11 on 25 Oct`, but the actual reset landed late on Saturday (24 Oct, ~19:01) — one day earlier than the pane suggested.
- Always capture an AFTER pane around the expected reset and poll again; the UI may lag and the printed date may not match reality.
- File reference: `tests/fixtures/automation/codex_status_after.txt` (pane still showing 21:11) vs live Saturday pane recorded in Experiment 001 (CLA/2025-10-20).
