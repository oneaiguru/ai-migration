# Post-Demo Follow-ups

Use this list once the current demo freeze lifts. Each item points to the files/anchors that need attention.

## 1. Monorepo polish
- **Goal:** keep backend + both UIs in one repo with predictable layout.
- **Actions:**
  - Document the tree in `docs/System/Onboarding.md` (add a “Repo map” table).
  - Ensure `scripts/dev/start_stack.sh` is the only entry point; update other readmes (e.g., `docs/Tasks/BE_START_HERE.md`) to reference it.
  - Add `.gitignore` entries for `ui/*/node_modules/`.

## 2. Demo site selector refresh
- **Goal:** replace the interim eight presets with the vetted list (`docs/Notes/demo_site_catalog.md`).
- **Files:** `ui/mytko-forecast-demo/src/constants/demoSites.ts`, `docs/System/Demo_Data.md`.
- **Validation:** `npm run build`, `bash scripts/dev/start_stack.sh`, load each preset and confirm WAPE card shows the expected % from the catalog.

## 3. Derived fill_pct fallback
- **Goal:** avoid blank “Заполнение” bars when `fill_pct` is missing but `forecast_m3` exists.
- **File:** `ui/mytko-forecast-demo/src/hooks/useContainerHistory.ts`.
- **Implementation:** if `row.fill_pct` is `None`, derive `forecast_m3 / vehicleVolume` (clamped to [0,1]) before returning.

## 4. Stack self-test
- **Goal:** provide a single command to verify API + both UIs before handoff.
- **Files:** new `scripts/dev/self_test.sh`; mention it in `docs/SOP/standard-operating-procedures.md`.
- **Behavior:** start stack, probe `api/metrics`, HEAD 4173/5174, hit `/api/mytko/site_accuracy` for one preset, stop stack. Exit non-zero on failure, print log pointers.

## 5. Session handoff template
- **Goal:** match the clarity of `ClaudeCodeProxy/docs/SESSION_HANDOFF.md`.
- **Actions:**
  - After the template block in `docs/SESSION_HANDOFF.md`, add headings for “Changed paths” and “Commands run”.
  - Future entries must include both lists plus bundles created.

## 6. Monorepo doc (future)
- **Goal:** capture lessons from `/Users/m/git/tools/agentos` role gating.
- **Action:** create `AGENTS.md` with the Scout/Planner/Executor table (CE prompts + SOP links) so new agents know which prompt file to read.
