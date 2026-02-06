## Scheduling – Prep for Unification (Package Export)

Objective
- Make the demo mountable as a workspace package for the unified shell.

Do
- Export `Root` from `${SCHEDULE_REPO}` (new `src/Root.tsx`) without internal BrowserRouter; accept shell routing and basename.
- Isolate RU registrar into `setupRU()` and call it from the shell.
- Verify day/period + overlays work under `/schedule` route.

Deliver
- Branch + PR with `Root` export and registrar isolation.
- Short README on how to mount.
