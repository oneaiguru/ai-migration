# Employee Management Parity – Agent Playbook

This repo hosts the "living" employee-management demo that we update regularly. A second Vercel project keeps the original demo intact—**never touch it**. All day-to-day work happens here.

---
## Environment
- **Repo path**: `~/git/client/employee-management-parity`
- **Node**: project uses the version declared in `package.json` (`"node": "^18 || ^20"`). Any recent Node 20.x works.
- **Install dependencies**: `npm install`
- **Local build**: `npm run build`
- **Preview (optional)**: `npm run preview -- --host 127.0.0.1 --port 4174`
  - Vite will choose the first free port if 4174 is busy—watch the CLI output.

---
## Deployment Pipeline
1. **Develop & test locally**
   - Modify files in this repo.
   - Run `npm run build`. Only commit once the build succeeds.
2. **Commit & push**
   - `git add`, `git commit`, then `git push origin main`.
3. **Deploy via Vercel CLI**
   - `vercel deploy --prod --yes`
   - New production URL prints at the end (format: `https://employee-management-parity-<id>.vercel.app`).

> NOTE: The legacy demo lives elsewhere; only this project should be updated going forward.

---
## Quick Local Smoke Check
```
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4174
```
> Only run preview when the repo owner explicitly requests it; stop the server once checks finish.

Open the printed URL and ensure:
- Employee list loads; row click toggles selection and the toolbar icons enable/disable correctly.
- Opening the edit drawer via the employee name button works and reflects the selected record.
- Quick add drawer (логин/пароль) adds a draft employee and immediately opens the edit drawer for follow-up fields.
- Toolbar modals (теги/импорт/экспорт) open and show expected copy.

---
## Role Selection & Required Reading
1. Start with `PROGRESS.md` to confirm the active plan and identify which role is expected (Scout, Planner, or Executor). If the role is unclear, stop and ask for direction before touching files.
2. Read the CE_MAGIC prompts for your role plus the shared `SIMPLE-INSTRUCTIONS.md` (see table below).
3. Read the SOP tied to that role, then open every item in the plan’s Required Reading list—including `ai-docs/` entries. Spend time in the knowledge base (`ai-docs/README.md`, `MANIFEST.md`, `RESEARCH_BRIEF.md`, `QUESTIONS.md`, playground/reference examples) before you act.

| Role | Prompts | SOP | Deliverable |
| --- | --- | --- | --- |
| Scout | `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`<br>`${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md` | `docs/SOP/code-change-plan-sop.md` (Exploration) | Discovery notes + `docs/SESSION_HANDOFF.md` entry |
| Planner | `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`<br>`${CE_MAGIC_PROMPTS_DIR}/PLAN-USING-MAGIC-PROMPT.md` | `docs/SOP/code-change-plan-sop.md` (Plan authoring) | `plans/YYYY-MM-DD_<task>.plan.md` + handoff update |
| Executor | `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`<br>`${CE_MAGIC_PROMPTS_DIR}/EXECUTE-WITH-MAGIC-PROMPT.md` | `docs/SOP/plan-execution-sop.md` | Code changes, tests, documentation updates |

See `docs/System/context-engineering.md` for the full context engineering playbook. Path variables are defined in `docs/System/path-conventions.md`.

---
## References & Docs
- `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` – current backlog & status.
- `docs/SCREENSHOT_INDEX.md` – alias ↔ screenshot mapping.
- `docs/AGENT_PARITY_REPORT.md` – browser-agent comparison report.
- `docs/Tasks/parity-backlog-and-plan.md` – pointer to the archived backlog (Phase 1–5 history).
- `docs/Archive/Tasks/03_phase-3-crud-and-data-parity-prd.md` – Phase 3 scope (CRUD/bulk edit/import-export).
- `docs/Archive/Tasks/04_phase-4-accessibility-and-final-parity.md` – Phase 4 a11y sweep & final parity polish.
- `docs/SOP/standard-operating-procedures.md` – workflow checklist (UI, tests, deploys).
- `docs/SOP/ui-walkthrough-checklist.md` – step-by-step validation script.
- `docs/SOP/session-prep-and-handoff.md` – pre-handoff checklist.
- `docs/System/employee-management-overview.md` – module/data summary.
- `docs/System/parity-roadmap.md` – upcoming module staging notes.
- `docs/ENVIRONMENT_FIX_TODO.md` – shell/Node/preview guidance.
- `docs/System/ui-guidelines.md` – copy conventions (no “демо” labels, no tech names in UI).
- `docs/System/ai-docs-index.md` – quick map of the `ai-docs/` workspace; read before citing AI-doc assets.
- `ai-docs/` – Phase 6 research workspace (playground, wrapper drafts, harvested reference docs, open questions).

---
## Agent Login (Real System)
For side-by-side validation, use:
- **OIDC URL**: see parity plan or latest agent prompt.
- **Username**: `user20082025`
- **Password**: `user20082025`
Follow the login macro (Ctrl+L → paste OIDC URL → enter credentials → wait). Further details are in the parity plan.

---
## Summary
- All active work happens in this repo.
- Always verify with `npm run build` before committing.
- Deploy via `vercel deploy --prod --yes`.
- Keep the older Vercel project as a read-only reference.
