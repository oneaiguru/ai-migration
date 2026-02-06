## UAT – Read This First

Two ways to run outbound UAT:

Prompts
- All prompts live in `uat-agent-tasks/`.
- File name format: `<demo-slug>_s<session#>_m<message#>_<YYYYMMDD-HHMM>.md` (example: `manager-portal_s03_m01_20251105-1030.md`).
- Session number increments for each new run on the same demo; message number increments if multiple messages are needed in that session.
- Draft the prompt in that file, upload attachments externally, then paste the text as one message to the tester.

Where to paste results back
- Consolidated demos sweep: `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`
- Forecasting session notes: `uat-agent-tasks/2025-10-26_forecasting-uat.md` (or add a new dated file)
- Unified demo smoke checklist: `uat-agent-tasks/unified-smoke.md`

Notes
- Behaviour only. No pixel checks and **no new screenshots**—capture findings as text (pass/fail notes, console snippets, timestamps).
- Forecasting agents: pair this readme with `docs/UAT_QUICKSTART.md` for the current quick checklist.
