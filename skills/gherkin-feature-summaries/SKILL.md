---
name: gherkin-feature-summaries
description: Generate markdown summaries and condensed one-line indexes from Gherkin .feature files. Use when asked to summarize BDD feature files, produce scenario summaries, or create per-feature one-line overviews.
---

# Gherkin Feature Summaries

## Workflow

1. Run `scripts/summarize_features.py` with `--features-dir` and at least one output path.
2. Use `--full-out` for multi-line scenario summaries.
3. Use `--one-line-out` for a condensed, one-line-per-feature index.
4. Adjust `--summary-step-count` and `--one-line-title-count` when the user requests a different density.

## Output formats

- **Full summary**: One section per feature file with scenario titles and short step-based summaries.
- **One-line summary**: One line per feature file with scenario count and titles.

## Defaults

- Scenario summaries use the first 2 step lines (skipping tags and tables).
- One-line summaries include the first 3 scenario titles, then `(+N more)`.

## Examples

Generate both outputs:

```bash
python /path/to/skills/gherkin-feature-summaries/scripts/summarize_features.py \
  --features-dir /path/to/features \
  --full-out /path/to/feature_summaries.md \
  --one-line-out /path/to/feature_summaries_one_line.md
```

Only a condensed index:

```bash
python /path/to/skills/gherkin-feature-summaries/scripts/summarize_features.py \
  --features-dir /path/to/features \
  --one-line-out /path/to/feature_summaries_one_line.md
```
