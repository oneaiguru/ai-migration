# Phase 2 — Enhanced Feature Files (Duolingo-like RU→EN)

This bundle contains updated `.feature` files with **tiering** and **psychological intent** baked into each file header.

## How to read tiering

- The first line of each feature file is one of: `@core`, `@retention`, `@v2`.
- The header comments explain:
  - what the feature is load-bearing for,
  - the psychological effect we must preserve,
  - the minimum viable scope.

If a scenario inside a file is tagged `@v2` or `@retention`, treat it as **explicit future scope**, even if the file is `@core`.

## Phase 2 principles (frozen)

- **No Energy system**.
- **No ad-gated continuation**.
- **Review is always available** (spaced repetition is core).
- **Credibility is signaled** via:
  - CEFR-ish sections (A1/A2/B1),
  - checkpoint tests,
  - story/dialogue nodes,
  - fair answer acceptance + appeals.
- **Streak is sacred but safe**:
  - visible,
  - milestone celebration (Day 10),
  - outage/offline safe,
  - streak protection is earned, not paywalled.

See `FEATURE_TIERING_MATRIX.md` and `PHASE2_CHANGELOG.md` for the overview.

## Feature summaries (generated)

`projects/anglo/apps/pwa/tests/feature_summaries.md` is generated from the
Gherkin feature files. Regenerate from repo root:

```bash
python skills/gherkin-feature-summaries/scripts/summarize_features.py \
  --features-dir projects/anglo/apps/pwa/tests/features \
  --full-out projects/anglo/apps/pwa/tests/feature_summaries.md
```

Do not edit the summary file by hand.
