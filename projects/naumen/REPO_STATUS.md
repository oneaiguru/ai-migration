# Local Demo Repositories – Status Overview (Oct 6 2025)

## Root: `~/git/client`
- `naumen/` – full clone of `github.com/granin/naumen`
  - `employee-management/` – active replica under documentation and planning
  - `employee-portal/`, `forecasting-analytics/`, `reports-analytics/`, `schedule-grid-system/`, etc. (untouched yet)
- `employee-management-demo/` – earlier standalone copy (no git history)
- `naumen_incomplete/` – aborted clone (only `.git` directory)

## Employee Management
- Path: `~/git/client/naumen/employee-management`
- Status: documentation committed (`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/SESSION_HANDOFF.md`, `docs/ENVIRONMENT_FIX_TODO.md`, `docs/SESSION_SUMMARY.md`)
- Pending: environment fix, parity implementation, staging repo/Vercel setup

## Other Demos (to replicate later)
- `employee-portal`
- `forecasting-analytics`
- `reports-analytics`
- `schedule-grid-system`
- `wfm-integration`
- (others under `~/git/client/naumen/`)

## Action Items
- See `naumen/TODO.md` for housekeeping (delete `naumen_incomplete`, decide on `employee-management-demo`, mirror parity report, replicate plans for other demos).
- Use same planning pattern when starting each demo: copy app -> create docs -> commit -> then begin feature parity work.
