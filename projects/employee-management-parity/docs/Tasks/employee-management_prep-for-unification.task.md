## Employee Management – Prep for Unification (Package Export)

Objective
- Make the demo mountable as a workspace package for the unified shell.

Do
- Export `Root` from `${EMPLOYEE_MGMT_REPO}` (new `src/Root.tsx`) without internal BrowserRouter; accept shell routing.
- Isolate RU registrar into `setupRU()` and call it from the shell.
- Verify local build; list externals in package.json.

Deliver
- Branch + PR with `Root` export and registrar isolation.
- Short README on how to mount.
