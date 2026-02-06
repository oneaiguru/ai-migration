## UAT Findings → Execution Task (WFM Employee Portal)

Meta
- Demo: WFM Employee Portal
- Source URL: https://wfm-employee-portal.vercel.app
- Pack(s): parity_static.md, trimmed_smoke.md
- Evidence: screenshot aliases (see docs/SCREENSHOT_INDEX.md)

Findings Table
| ID | Check | Pass/Fail | Notes | Screenshot |
| -- | ----- | --------- | ----- | ---------- |
| EP-1 | Vacation-requests filters/sorting | Pass | parity_static + trimmed_smoke (2025-10-26) against https://wfm-employee-portal.vercel.app added a single row only (All counter 5→6). Playwright log `test-results/portal-uat-results-2025-10-26.json` reports `duplicateCount: 1`; submit flow guarded in `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:216-255`. All surface copy already in RU — no localisation action pending. | - |

Fix Plan (behaviour only)
- Changes (files/lines): Deduped submit pipeline already merged (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:216-255`) with cloned fallback data (`${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:395-454`).
- Tests/Stories: Regression covered in `${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:1-180` (asserts length increments by 1).
- Docs to update: System reports, canonical checklist, CodeMap, SESSION_HANDOFF (synced this pass).

Acceptance
- Re-deploy URL: https://wfm-employee-portal.vercel.app (post-fix)
- Pack(s) re-run: parity_static.md, trimmed_smoke.md rerun with submit flow → Pass (count 5→6 only)
- Docs updated as listed

Outcome
- Status: Completed – UAT Pass
