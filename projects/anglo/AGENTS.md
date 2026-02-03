# AGENTS

## Generated files

`projects/anglo/apps/pwa/tests/feature_summaries.md` is generated from the
Gherkin feature files. Regenerate from repo root:

```bash
python skills/gherkin-feature-summaries/scripts/summarize_features.py \
  --features-dir projects/anglo/apps/pwa/tests/features \
  --full-out projects/anglo/apps/pwa/tests/feature_summaries.md
```

Do not edit the summary file by hand.

## Tagging policy (tier tags)

- File-level tier tags must match `projects/anglo/FEATURE_TIERING_MATRIX.md`.
- Scenario-level tier tags are allowed only when a file mixes tiers; do not normalize or flag this as drift.
- Only flag tag issues when a file-level tag mismatches the matrix or a feature file is missing.
- Source of truth: `projects/anglo/tasks/PHASE0_AGENT_A_COHERENCE_HANDOFF.md:16`.
