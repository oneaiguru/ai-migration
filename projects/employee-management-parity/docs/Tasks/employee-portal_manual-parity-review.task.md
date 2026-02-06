# Task — Employee Portal Manual Parity Review

## Goal
Re-read the source manuals and archived real-system captures to verify every Employee Portal screen (Dashboard, Vacation Requests, Profile) matches Naumen behaviour and Russian copy without relying on dated UAT notes.

## Inputs
- Manuals (`${MANUALS_ROOT}/estimation/processing_manual/process/chapters/`):
  - `CH2_Login_System.md` — top bar, profile avatar, navigation patterns.
  - `CH3_Employees.md` — personal/contact/emergency fields and save flows.
  - `CH5_Schedule_Build.md` §5.4 Vacation requests overview.
  - `CH5_Schedule_Advanced.md` §§5.6–5.8 (filters, status handling, counters).
  - `CH7_Appendices.md` Appendix 1 employee fields checklist.
- Real-system gallery: `docs/UAT/real-naumen/2025-10-13_xds/` (PNG + LOG_notes.md).
- Current implementation references: `docs/Workspace/Coordinator/employee-portal/CodeMap.md`, `docs/System/APPENDIX1_SCOPE_CROSSWALK.md`, `uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`.

## Scope
- Confirm navigation + header semantics (login, shell, tabs) against CH2 and gallery images.
- Validate Profile tab fields, required status, RU labels align with CH3 + Appendix 1.
- Verify Vacation Requests: tabs, counters, filters, new-request form, status badges per CH5 sections.
- Note any missing behaviours (e.g. attachments, manager notes) or copy mismatches.

## Tasks
1. **Manual Deep Read**
   - Read CH2 §2.1–2.4 focusing on profile access and shell labels; capture relevant Russian strings.
   - Read CH3 §§3.1–3.4 (personal/contact/emergency data) + Appendix tables; list required fields/validation text.
   - Read CH5 sections for vacation requests (build + advanced) covering counters, statuses, submission steps, manager interaction.
   - Annotate page numbers/section markers for each behaviour.
2. **Gallery Alignment**
   - Walk `docs/UAT/real-naumen/2025-10-13_xds/README.md` with images open; map each screenshot to the manual references (note any missing shots needed for fields).
   - Extract copy nuances (button wording, column names) from images if manuals omit specifics.
3. **Portal Cross-check**
   - Run portal locally (`npm run dev -- --port 4180`) and step through Dashboard → Vacation Requests → Profile.
   - Compare every label/behaviour noted in Tasks 1–2; flag deviations (missing field, misnamed column, absent feature).
   - Capture new screenshots if mismatches found for follow-up.
4. **Documentation Updates**
   - Update `docs/Workspace/Coordinator/employee-portal/CodeMap.md` with any new file:line evidence or TODOs.
   - Append findings to `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md` (add rows if gaps discovered).
   - If Appendix statuses change, sync `docs/System/APPENDIX1_SCOPE_CROSSWALK.md` and `docs/System/PARITY_MVP_CHECKLISTS.md`.
   - Log summary in `docs/SESSION_HANDOFF.md` + `PROGRESS.md` once reviewed.

## Acceptance
- Manual sections cited with section identifiers/page numbers in the Code Map or findings.
- Every Employee Portal UI element cross-verified against manual text or real-system screenshot.
- Any mismatches documented with path:line evidence and assigned follow-up.
- No reliance on old UAT assertions—current review stands on manual/gallery proof.

## Notes
- Keep screenshots local (no new cloud URLs); reuse gallery or capture via Playwright if new evidence needed.
- Skip non-portal features (bulk scheduling, forecasting) unless manual sections show dependencies on portal flows.
