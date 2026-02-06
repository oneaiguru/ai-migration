# BDD Handoff: Next-Gen Rework

Context
- Source BDD spec: `projects/anglo/docs/bdd/duolingoru_feature_files-3.md` (in repo).
- This file contains many `## features/...` headings with Gherkin blocks.
- The file includes duplicate summary sections with conflicting counts; ignore summaries.

Goal
- Use the spec above as the source of truth for feature files.
- Run BDD via Cucumber so Gherkin is parsed (no vitest filename-mapping tests).

Instructions
1) Extract each `## features/...` heading and its code block.
2) Create matching files under `projects/anglo/apps/pwa/tests/features/...` with identical Gherkin content.
3) If a feature file already exists, replace its contents.
4) Do not create feature files from the summary sections; only from explicit `## features/...` headings.
5) Preserve file names exactly (e.g., `features/onboarding/anonymous-start.feature`).
6) Keep feature content intact (including non-ASCII strings).
7) Ensure `projects/anglo/apps/pwa/cucumber.cjs` points to `tests/features/**/*.feature` and
   step definitions under `tests/bdd/**`.
8) Update `projects/anglo/tasks/master-tasks-phase-3.md` "FEATURE FILES" section to reference
   `projects/anglo/docs/bdd/duolingoru_feature_files-3.md` and list the generated files.

Scope note
- If time-limited, prioritize core domains (ui, onboarding, lessons, gamification,
  settings/social/support, offline). Remaining feature files can land as the spec
  even before step definitions exist.

Checklist
- All feature files in `projects/anglo/apps/pwa/tests/features/` exist and match the source spec.
- Cucumber config references `tests/features/**/*.feature` and `tests/bdd/**`.
- Spec stored at `projects/anglo/docs/bdd/duolingoru_feature_files-3.md` with no local-only paths.

Supplemental
- Review checklist: `projects/anglo/docs/ops/BDD_REVIEW_CHECKLIST.md`
- Glossary: `projects/anglo/docs/ops/BDD_GLOSSARY.md`
