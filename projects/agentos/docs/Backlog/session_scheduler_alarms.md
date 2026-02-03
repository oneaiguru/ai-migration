# Session Scheduler & Alarms [Draft]

## 🎯 Why Now
- Ensure windows start/end on time, capture BEFORE/AFTER panes, and run ccusage jobs without manual intervention.

## 🔗 Contracts (Depends, Emits)
- Depends: `scripts/automation/*`, alias CLI, UAT opener.
- Emits: scheduled runs, logs in `data/automation/`, ICS calendar entries.

## 🧭 Diagram
```mermaid
flowchart TD
  calendar[Calendar/ICS] --> runner[Job Runner]
  runner --> start[start_window.sh]
  runner --> end[close_window.sh]
  runner --> ccusage[ccusage daily/weekly]
  runner --> uat[UAT bot]
```

## ✅ Acceptance
- Week‑long schedule runs alarms + jobs for start/end/ccusage without collisions.
- Missed run triggers backfill and logs `backfill` note.

## 🧪 Operator Quick Cue
- Command: `scheduler/run_day.sh --day Monday`
- Check: notifications fire, logs written, BEFORE/AFTER snapshots recorded with `source=automation`

## ⏱ Token Budget
- 20K

## 🛠 Steps
1. Build job runner + locking
2. Hook start/end scripts
3. Schedule ccusage daily/weekly
4. Write docs, add to SOP

## ⚠ Risks
- Collisions with manual runs → lockfile + warning

## 📎 Links
- `docs/SOP/scheduling_and_alerts.md`, `docs/Recipes/session_hooks.md`
