# Phase 5 TWA Handoff

## Read these files first
- projects/anglo/PRD_Enhanced_v1_3.md
- projects/anglo/tasks/master-tasks-phase-1.md
- projects/anglo/tasks/master-tasks-phase-3.md
- projects/anglo/tasks/master-tasks-phase-4.md
- projects/anglo/tasks/master-tasks-phase-5.md
- projects/anglo/prd-task-alignment-updated.md

## Key decisions before execution
- Production PWA host (domain) used by the wrapper and asset links.
- Android applicationId/package name (must match asset links).
- Release keystore path + alias (do not commit the keystore).
- RuStore listing metadata (app name, descriptions, support links).

## Execution summary
1) Phase 5 AGENT_29: update PWA manifest fields for TWA compatibility.
2) Phase 5 AGENT_30: generate release keystore, compute SHA-256 fingerprint, publish assetlinks.json, and scaffold the TWA wrapper using bubblewrap.
3) Phase 5 AGENT_31: follow the RuStore release checklist and validate the AAB on device.

## Validation checklist
- PWA build succeeds with updated manifest fields.
- Asset links are reachable at /.well-known/assetlinks.json and match the release keystore fingerprint.
- Placeholder validation passes for bubblewrap.json and assetlinks.json.
- TWA opens the PWA in full-screen and keeps in-scope navigation in-app.
- Web-based payments flow returns to the TWA after checkout.
- SBP bank-app handoff + return works in TWA.
- Web push notifications still work from the PWA inside TWA.

## Notes
- If the production host is not ready, delay bubblewrap init until the host is live and serves manifest.webmanifest.
- Keep the keystore out of git; only commit assetlinks.json with the release fingerprint.
