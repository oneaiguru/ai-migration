# Scheduler & Alarm Overview (Stub)

_Planned architecture for automated session scheduling and alarms._

## Components
- Job runner (launchd/cron or custom orchestrator)
- Start/End scripts (capture BEFORE/AFTER, enforce +5m buffer)
- ccusage daily/weekly capture jobs
- Optional bundle + UAT bot hooks

## State & Logs
- Persistent state: `data/automation/state/*.json`
- Logs: `data/automation/logs/<job>.log`
- Lock file: `data/automation/locks/<provider>.lock`

## Notifications
- macOS local notifications (`osascript` / `terminal-notifier`)
- Optional calendar integration (ICS export; Google/CalDAV adapter TBD)

Update this document once automation scripts are implemented.
