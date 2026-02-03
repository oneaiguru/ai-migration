# Agent-Mode Handoff Notes (consolidated)

This note captures the final hand-off items from PRO and where they live, so no extra Desktop files are needed.

- Desktop references handled:
  - /Users/m/Desktop/inregans — Secure access + setup/runbook
  - /Users/m/Desktop/inregans2 — Work order for coding agent

- Repo/tmp docs and scripts for Agent-Mode:
  - docs/System/AgentMode.md
  - docs/AgentMode/AGENT_MODE_PLAYBOOK.md
  - docs/AgentMode/SITES.md
  - docs/AgentMode/FILES_TO_PRODUCE.md
  - docs/AgentMode/REPORT_TEMPLATES/WEATHER_AB_REPORT_TEMPLATE.md
  - docs/AgentMode/HANDOFF_MANIFEST.md (this is the manifest to ship to the agent)
  - docs/AgentMode/EXTENDED_SITES.md (Earthdata/DEM/NOAA optional flows)
  - docs/data/WEATHER_DATA_CONTRACT.md, REGIONAL_SOURCES_IRKUTSK.md, DATA_REQUEST_IRKUTSK.md
  - docs/eval/METRICS.md, EVALUATION_PLAN.md
  - docs/adr/ADR-007_multiple_seasonality.md, ADR-008_hierarchical_reconciliation_eval_only.md
  - scenarios/weather_idw_tuned.yml
  - scripts/agentmode/* (cds_era5_land_pull.py, meteostat_pull.py, holidays_generate.py, etc.)

- CI docs gate updated to ensure:
  - docs/System/documentation-index.md links to Agent-Mode docs and scenario

Use this note as the single pointer when coordinating Agent-Mode handoff. No additional Desktop files required.
