# UAT – Master Workflow Index

Pick your UAT mode, then follow the linked SOP.

- Manual UI walkthrough
  - `docs/SOP/ui-walkthrough-checklist.md`
- Delta‑focused (verify only changes)
  - `docs/SOP/uat-delta-walkthrough-sop.md`
- AI‑assisted browser agent
  - `docs/SOP/ai-uat-browser-agent.md`

Notes
- For Scheduling, visual parity is out‑of‑scope; focus on behavior.
- Record Pass/Fail and URL at the top of the demo repo’s mapping doc.
- UAT must run on deployed builds (preview/prod URLs). Agents—especially the AI browser agent—cannot reach local dev servers or repository file systems.
