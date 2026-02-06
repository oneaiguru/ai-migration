## Agent ID Conventions (human‑readable)

Purpose
- Make ownership easy to read now and a year from now, across tracker rows, PRs, Subtasks, and UAT Findings.

Format
- `<demo-slug>-<role>-<yyyy-mm-dd>-<handle>[ -pN ][ -sha7 ]`
  - `demo-slug` ∈ {`manager-portal`, `analytics-dashboard`, `employee-portal`, `forecasting-analytics`}
  - `role` ∈ {`exec`, `plan`, `scout`}
  - `yyyy-mm-dd` = UTC date of the pass start
  - `handle` = initials or short handle (kebab/lowercase)
  - Optional: `-pN` pass number for the day, `-sha7` short commit

Examples
- `manager-portal-exec-2025-10-13-am`
- `analytics-dashboard-exec-2025-10-13-jd`
- `employee-portal-plan-2025-10-14-ak-p2`
- `forecasting-analytics-exec-2025-10-14-rk-1a2b3c4`

Usage
- Tracker (Agent column): use the ID string
- Subtask files (Agent line) and PR titles: include the ID
- UAT Findings / Handoff: may include `[ID]` at the start of the summary

Notes
- Lowercase, kebab‑case; avoid spaces/underscores
- Keep to < 80 characters overall
