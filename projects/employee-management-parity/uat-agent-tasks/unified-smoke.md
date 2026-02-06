## Unified Demo – Smoke Checklist (Employees + Scheduling)

Target
- Unified shell deploy: <UNIFIED_DEMO_URL>

Checks
- /employees renders without console errors; RU formatting visible (dates/numbers)
- /schedule renders without console errors; Day/Period toggles work; Σ/123 overlays behave correctly
- Nav between routes feels cohesive (behaviour only; no pixel checks)

Reply table
| Route | Check | Pass/Fail | Notes | Screenshot |
| --- | --- | --- | --- | --- |
| /employees | Render + RU formatting |  |  |  |
| /schedule | Render + toggles + overlays |  |  |  |

After run
- Add a short entry to `docs/SESSION_HANDOFF.md` with the unified deploy URL and results
