# Phase 8 Discovery – Trimmed Demo Variant

> **Status:** In progress — discovery drafted 2025-10-20 before Phase 8 planning

## References Reviewed
- [x] `PROGRESS.md` (`PROGRESS.md:4-54`) – Confirms Phase 7 is closed and no active plan is queued.
- [x] `docs/Archive/Demo-Modules-Trim-Plan.md` (`docs/Archive/Demo-Modules-Trim-Plan.md:1-31`) – Prior trim checklist and rationale for removing demo-only tabs.
- [x] `docs/System/parity-roadmap.md` (`docs/System/parity-roadmap.md:63-77`) – Phase 8 scope notes and links to discovery/plan artifacts.
- [x] `docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-7b28yt9nh.md` (`docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-7b28yt9nh.md:80-109`) – UAT triage listing the five demo modules slated for trimming.
- [x] `docs/Tasks/phase-8-trimmed-demo-task.md` (`docs/Tasks/phase-8-trimmed-demo-task.md:1-73`) – Current task brief and discovery requirements.
- [x] `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` (`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md:1-76`) – Navigation overview and outstanding Phase 7/8 context.
- [x] `docs/System/trimmed-demo-repo-strategy.md` (`docs/System/trimmed-demo-repo-strategy.md:1-37`) – Dual-repo deployment strategy and sync guidance.
- [x] `ai-docs/README.md` (`ai-docs/README.md:1-51`) – Workspace map and ground rules for referencing migration assets.
- [x] `ai-docs/MANIFEST.md` (`ai-docs/MANIFEST.md:6-63`) – Inventory of harvested docs/snippets relevant to shared wrappers.
- [x] `ai-docs/RESEARCH_BRIEF.md` (`ai-docs/RESEARCH_BRIEF.md:5-39`) – Library guidance (Radix, TanStack, Playwright) that trimmed repo must continue to follow.
- [x] `ai-docs/QUESTIONS.md` (`ai-docs/QUESTIONS.md:6-11`) – Outstanding doc gaps (resolved) to watch when citing AI workspace assets.
- [x] `docs/System/ai-docs-index.md` (`docs/System/ai-docs-index.md:1-68`) – Index for locating wrapper drafts and reference snippets during later phases.

## Trim Impact Inventory
| Area | File | Action | Notes |
| --- | --- | --- | --- |
| Navigation | `src/App.tsx:1410-1457` | Remove demo tab entries from `views` and nav | Current array renders Фото галерея/Показатели/Статусы/Сертификации/Навыки; trimmed build should expose only the Employees list (`src/App.tsx:1411-1416`). |
| Navigation | `src/App.tsx:1471-1481` | Delete conditional renders for demo modules | Once nav tabs are gone, drop the branch renders so these components are not bundled. Maintain the list view + quick add flow. |
| Components | `src/components/EmployeePhotoGallery.tsx:128-143` | Exclude from trimmed repo | Module is explicitly labelled “Демонстрационный модуль” with non-functional Mass upload/Export (`src/components/EmployeePhotoGallery.tsx:138-143`). Stage 6 report flags this as deferred work (`docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-7b28yt9nh.md:80-88`). |
| Components | `src/components/PerformanceMetricsView.tsx:107-210` | Exclude or hide | KPI dashboard fabricates data via `Math.random()` (`src/components/PerformanceMetricsView.tsx:118-126`) and is tagged as demo (`src/components/PerformanceMetricsView.tsx:205-211`). Keep `EmployeePerformance` fields in types/drawers (`src/types/employee.ts:111-167`). |
| Components | `src/components/EmployeeStatusManager.tsx:241-259` | Exclude | Status console still marked demo and exposes placeholder actions (`src/components/EmployeeStatusManager.tsx:241-259`). Stage 6 triage lists it as optional. |
| Components | `src/components/CertificationTracker.tsx:347-369` | Exclude | Training/compliance dashboard carries a demo badge (`src/components/CertificationTracker.tsx:353-358`), with extensive mock data. Removing avoids unused flows in production repo. |
| Components | `src/components/EmployeeComparisonTool.tsx:1-160` | Evaluate removal from bundle | Not routed today but heavy placeholder analytics; trim plan (`docs/Archive/Demo-Modules-Trim-Plan.md:17-18`) recommends pruning unused exports for a lean build. |
| Tests | `tests/employee-list.spec.ts:1-160` | Retain suite; verify nav assumptions | Playwright specs exercise only the Employees list (`tests/employee-list.spec.ts:36-160`); confirm no selectors rely on removed tabs after trim. |
| Docs/Screenshots | `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md:47-55` | Update nav references | Plan still documents six-tab header; trimmed repo needs a section explaining the reduced navigation. |
| Docs/Screenshots | `docs/Archive/Demo-Modules-Trim-Plan.md:11-28` | Keep as canonical checklist | Discovery aligns with this playbook; ensure planner references it when drafting the execution plan. |
| Deploy | `docs/System/trimmed-demo-repo-strategy.md:3-37` | Stand up production repo + Vercel target | Dual-repo flow requires unique secrets and cherry-pick workflow; record trimmed URL during execution handoff. |

## Shared Asset Considerations
- [x] Employee dataset & persistence – `src/App.tsx:1-116` seeds employees with `performance`, certifications, and timeline data used by the edit drawer/quick add; trimmed repo must clone these helpers so Playwright flows stay green.
- [x] Type definitions – `src/types/employee.ts:111-177` keeps KPI, certification, and status fields that the Employees drawer already surfaces; even without dashboards the data must remain in sync for forms/imports.
- [x] Shared utilities – `src/utils/task.ts:1-27` and employee list subcomponents still back quick add, bulk edit, and imports; production repo will need identical wrappers/tests to avoid divergence when cherry-picking fixes.

## Open Questions / Risks
1. How aggressively do we prune unused components? Trim playbook suggests deleting files, but keeping them in the demo repo while excluding from production may ease future feature work (`docs/Archive/Demo-Modules-Trim-Plan.md:17-18`). Need stakeholder call on hard deletion vs. keeping behind a branch. *(Resolved 2025-10-20: production repo deletes demo components; demo repo retains them for roadmap work.)*
2. Documentation strategy: parity plan and roadmap still showcase the full-tab experience (`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md:47-55`, `docs/System/parity-roadmap.md:63-77`). Decide whether the trimmed repo owns its own README/plan or if we maintain a shared note pointing back to demo features. *(Updated 2025-10-20: production repo docs add a trimmed-variant note; revisit if a dedicated README is requested.)*
3. Sync workflow checklist in `docs/System/trimmed-demo-repo-strategy.md:34-37` is still unchecked. We need concrete owners/process for copying datasets, screenshots, and AI-doc references between repos before planners execute. *(Resolved 2025-10-20: checklist checked off with discovery references; follow actual sync by creating `CHANGELOG.md` once GitHub remote is live.)*

## Handoff Checklist
- [x] Update `docs/SESSION_HANDOFF.md` with discovery findings.
- [x] Flag any new blockers or follow-ups in `PROGRESS.md` once discovery is reviewed. *(2025-10-20: Active plan set to `plans/2025-10-20_trimmed-demo.plan.md`.)*
- [x] Link this document in the future Phase 8 plan (`plans/2025-10-20_trimmed-demo.plan.md`).
