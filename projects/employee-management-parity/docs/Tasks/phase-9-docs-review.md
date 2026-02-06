# Task – Phase 9 Docs Structure & Governance Review (Final Check)

Role
- Reviewer (docs only; no code)
- Timebox: 45–60 minutes

Scope
- Verify the new docs structure, governance rules, and link integrity.
- Ensure Phase 9 Scheduling docs use path variables (no absolute paths in active files).
- Confirm System reports and curated UAT placement.

What To Review
- Governance & SOP
  - `docs/START_HERE.md` (governance banner)
  - `docs/SESSION_HANDOFF.md` (governance banner)
  - `docs/SOP/directory-governance.md` (no new folders without approval)
- Indexes & entry points
  - `docs/System/documentation-index.md` (Start, Dashboard, UAT index, Troubleshooting, Directory Governance, Path Conventions, Metrics, Long‑term Strategy, System reports)
  - `docs/README.md` (Start Here + SOP pointers)
- Reports & UAT
  - System reports: `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, `docs/System/APPENDIX1_SCOPE_CROSSWALK.md`, `docs/System/DEMO_EXECUTION_DECISION.md`
  - MVP checklist (canonical): `docs/Reports/PARITY_MVP_CHECKLISTS.md` (System mirror exists; keep in sync)
  - UAT curated: `docs/UAT/active/AI-UAT_Scheduling_No-Demo-Visible_2025-10-12.md`, `docs/UAT/active/AI-UAT_Scheduling_Initial-Comparison_2025-10-12.md`
  - UAT raw: `docs/Archive/ai-uat/*`
- Phase 9 normalization
  - `docs/Tasks/phase-9-scheduling-behavior-parity.md` (uses `${SCHEDULE_REPO}`, `${EMPLOYEE_MGMT_REPO}`)
  - `docs/System/path-conventions.md` (variables defined)

Checks
- Run `./docs/scripts/health-check.sh`
  - Accept: Archive/legacy docs may still contain absolute paths. Active SOPs, Phase 9 docs should not.
- `rg -n "docs/Reports/" docs plans`
  - Accept: `docs/Reports/PARITY_MVP_CHECKLISTS.md` and attachments (FeatureParity_2025-10-20/, Trimmed_2025-10-20/)
- Open a few key links from `docs/System/documentation-index.md` to validate targets open.

Acceptance Criteria
- Governance banners present and correct.
- All links open from Start and Documentation Index.
- System reports render correctly.
- MVP checklist present in `docs/Reports/`; System mirror matches.
- UAT curated + raw in correct locations; `docs/SESSION_HANDOFF.md` references updated to System paths.
- Phase 9 task uses variables; no absolute paths in active SOPs/Phase 9 docs.
- Health check: no critical issues in active docs.

If Issues Found
- Fix links or replace remaining absolute paths with variables.
- Folder-level changes require a mini plan per `docs/SOP/directory-governance.md` and owner approval.

Optional
- Add a final note to `PROGRESS.md` summarizing “Docs structure/Governance review completed” with date.
