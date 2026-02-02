# Employee Management Replica – Session Handoff

> **Archive Note (07 Oct 2025):** This handoff predates the 9o205nrhz build. Refer to `docs/SESSION_HANDOFF.md` and the comprehensive validation report (`~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`) for the current state.

## 1. Context
- Clone path: `~/git/client/naumen/employee-management` (verbatim copy of the Vercel deployment repo `granin/naumen` → `employee-management` folder).
- No code changes committed yet; work confined to documentation (`docs/`).
- Goal: turn the mock UI into a faithful spec of the real WFM Employee Management module.
- Reference parity research: `/home/oai/share/report.md`, CH3/CH5/CH6/CH7 docs, real-system screenshots, and prototype screenshots.

## 2. Required Reading Before Implementation
1. `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` (roadmap, evidence map, backlog).
2. `docs/SESSION_HANDOFF.md` (this file).
3. Browser-agent parity report (`/home/oai/share/report.md`, mirror into repo if needed).
4. Evidence folders:
   - Real system screenshots: `~/Desktop/shots epml mamgnt/*.png`.
   - Prototype outputs: `~/Desktop/Screenshot 2025-10-05 at ... .png`.
5. Orchestration guidance:
   - `~/Downloads/sort later desktop/HUMAN_LAYER_COMPLETE.md`
   - `~/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md`
   - `~/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
   - `~/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
   - `~/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`

## 3. Snapshot of Current Code
- `App.tsx`: tabbed shell; list tab placeholder; gallery, performance, quick-add render mock data.
- `EmployeeListContainer.tsx`: loads mock employee, displays placeholder card; no grid/filter/drawer implementation yet.
- `QuickAddEmployee.tsx`: 3-step wizard (basic personal + job info); missing login/scheme/skill steps from real system.
- `EmployeePhotoGallery.tsx`: full-featured gallery UI operating on mock dataset.
- `PerformanceMetricsView.tsx`: KPI dashboard with mock/rand data.
- `EmployeeStatusManager.tsx` & other modules: rich scaffolding but still mock-driven.
- `types/employee.ts`: comprehensive models with some duplication (two `ViewModes`, `BulkAction` definitions).

## 4. Evidence Checklist (tick before coding)
- [ ] Read parity plan (`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`).
- [ ] Scan parity report (`/home/oai/share/report.md`).
- [ ] Open each real-system screenshot (commands in parity plan Section 2).
- [ ] Open prototype screenshots to understand current mock output.
- [ ] Skim CH3/CH5/CH6/CH7 documents for field definitions, workflows, imports.
- [ ] Review CE MAGIC PROMPTS + HUMAN_LAYER docs for process/automation rules.

## 5. Implementation TODO (high level)
1. **Fix environment** – remove proxy exports; ensure `npm install`, `npm run build` work.
2. **Model alignment** – refine TypeScript types & mock data to match real required fields.
3. **Employee List** – replace placeholder with functional grid, filters, drawer.
4. **Quick Add Wizard** – expand steps (logins, org structure, schemes, skills, summary) and validation.
5. **Top-bar utilities** – implement column settings, tags, import/export placeholders, dismissed toggle.
6. **Optional modules** – decide on Photo Gallery & Performance pages (retain with specs or remove).
   - ✅ Решение (6 окт 2025): оставить оба модуля как демонстрационные; интеграция с реальными данными вынесена в отдельный будущий бэклог.
7. **Future scope** – capture scheduling/report/reporting requirements for follow-up tasks.

## 6. Next Actions for Incoming Agent
- Complete checklist in Section 4.
- Tackle Phase 1 (environment fix) from the parity plan, then proceed sequentially.
- Update the parity plan after each slice (screenshots, status notes, commit hashes).
- Keep Vite config untouched; no deployment until list & quick-add parity achieved.

## 7. Contact & Escalation Notes
- Original Vercel deployment: `employee-management-sigma-eight.vercel.app` (don’t overwrite).
- New staging deployment to be created after first functional slice.
- Use dedicated GitHub credentials when provided; no pushes until instructed.
