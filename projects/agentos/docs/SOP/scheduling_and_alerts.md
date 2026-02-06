# SOP — Scheduling & Alerts (Stub)

_Purpose:_ capture requirements for automated session scheduling, alarms, and missed-run handling. Flesh out once session automation is implemented.

## Planned Jobs (to refine)
- Pre-window reminder (T−10m) — local notification
- Start window: capture BEFORE panes (Codex/Claude), seed state
- End window: enforce +5m lag, capture AFTER panes, finalize window
- ccusage daily snapshot (~23:55 local)
- ccusage weekly snapshot (after weekly reset lag)
- Optional: nightly UAT bot (pytest + behave + preview smoke)

## Safety & Reliability
- Lockfile to avoid collisions with manual runs
- Missed-run backfill procedure (rerun wraps, tag results)
- Logging location: `data/automation/<job>.log`
- Notification escalation if a job fails twice

_Update this SOP when automation scripts and launchd/cron jobs are introduced._
