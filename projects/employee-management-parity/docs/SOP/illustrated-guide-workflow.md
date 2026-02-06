# SOP — Converting Raw Captures into an Illustrated Guide

Use this SOP whenever you receive an unstructured folder of production screenshots/notes (e.g. `/Users/*/Desktop/<capture>/`) and need to turn it into a reusable parity guide.

## 1. Intake & Review
1. Copy the entire capture folder to a working location in the repo (or keep it on the Desktop if instructed) without renaming anything yet.
2. Read any accompanying logs/markdown (`l.markdown`, `ctrace.markdown`, etc.) to understand the capture order and context.
3. Skim the relevant manual chapters; note the sections each capture relates to.

## 2. De-duplicate & Normalise Filenames
1. Run `shasum *.png` (or your OS equivalent) to detect duplicates; remove the `*-1.png` variants once you confirm duplicates.
2. Rename each remaining image with a descriptive slug using lowercase + hyphen (e.g. `real-naumen_build-forecast_queue-tree.png`).
3. Keep renamed files in the working folder until the guide is published; do not scatter them across the repo.

## 3. Build the Mapping Table
1. Create (or update) a task file under `docs/Tasks/` describing the workstream (e.g. `forecasting-analytics_illustrated-guide.task.md`).
2. Inside the task file, list each screenshot with:
   - Manual chapter/section reference
   - Production behaviour summary
   - Current demo behaviour (code path) / known delta
3. Record open questions or missing captures under a “Scout Notes” heading.

## 4. Publish Assets
1. Copy the renamed screenshots into `docs/System/images/<area>/` (create the subfolder if needed).
2. Author the illustrated guide in `docs/System/` (Markdown) embedding the screenshots.
   - Structure: manual cite → production behaviour → demo references (file:line) → parity actions.
   - Append a condensed UAT checklist for agents.
3. Update the task file status (scout/planner/executor) with links to the guide.

## 5. Wire into Documentation & UAT Flow
1. Add the new SOP/guide to the documentation index (`docs/System/documentation-index.md`) so others can find it.
2. If UAT bundles are required, copy the renamed screenshots + relevant markdown into the outbound desktop folder (flat structure, no subdirectories).
3. Reference the guide in any related task plans or parity packs so future work reuses it.

## 6. Close-out
1. Once the guide is live and linked, archive or delete the temporary capture folder if no longer needed.
2. Capture notes in `docs/SESSION_HANDOFF.md` summarising what was produced and where the guide lives.
3. During post-change reviews, keep the guide updated when new screenshots/manual references arrive.

_Follows: `docs/SOP/directory-governance.md` (naming/placement rules) and the UAT outbound SOP (`docs/SOP/uat-outbound-package.md`)._
