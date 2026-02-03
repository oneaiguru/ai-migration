# Task Plan: BDD Spec Wiring + Feature File Generation

Goal
- Wire the in-repo BDD spec into Phase 3 tasks and handoffs, and provide a
  deterministic list of feature files to create under `projects/anglo/apps/pwa/tests/features/`.

Scope
- Only BDD spec/feature-file wiring and documentation updates.
- No changes to non-BDD implementation tasks.

Inputs
- `projects/anglo/docs/bdd/duolingoru_feature_files-3.md`
- `projects/anglo/tasks/master-tasks-phase-3.md`
- `projects/anglo/docs/ops/BDD_HANDOFF.md`
- `projects/anglo/docs/ops/HANDOFF.md`

Plan
1) Confirm spec file is in-repo
   - Ensure `projects/anglo/docs/bdd/duolingoru_feature_files-3.md` exists.
   - If the file is missing, copy it into that path and do not keep a local-only path.

2) Update `projects/anglo/docs/ops/BDD_HANDOFF.md`
   - Reference the in-repo spec path only.
   - Reaffirm that only `## features/...` headings should be used (ignore summaries).
   - Keep note: tests only map to filenames; do not change tests to assert Cyrillic.

3) Update `projects/anglo/tasks/master-tasks-phase-3.md` (BDD section)
   - Replace the inline stub Gherkin content under “FEATURE FILES (CREATE ONCE)”
     with instructions to extract feature files directly from the spec file.
   - Provide the full list of `projects/anglo/apps/pwa/tests/features/...` files to create,
     matching every `## features/...` heading in the spec.
   - Keep the directory creation command.
   - Add a short note to preserve filenames exactly and avoid local file paths.

4) Update `projects/anglo/docs/ops/HANDOFF.md`
   - Ensure it points to `projects/anglo/docs/ops/BDD_HANDOFF.md` as the source of truth for
     the BDD spec + feature-file workflow.

Verification
- `rg -n "New Folder With Items|/Users/m/Downloads" .` returns no hits.
- `rg -n "^## features/" projects/anglo/docs/bdd/duolingoru_feature_files-3.md` list
  matches the feature file list in `projects/anglo/tasks/master-tasks-phase-3.md`.
- `rg -n "FEATURE FILES \\(CREATE ONCE\\)" projects/anglo/tasks/master-tasks-phase-3.md`
  shows the spec-based instructions (no inline stub Gherkin blocks).
