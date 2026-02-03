# Feature File Review Checklist

1. Gherkin syntax is valid (Given/When/Then structure).
2. Terminology is consistent:
   - hearts (not lives)
   - XP (not points)
   - Yazychok (ASCII brand name)
3. @implemented tag appears only on scenarios with step definitions.
4. Scenario names are unique within each feature file.
5. Background steps are truly shared across scenarios.
6. Data tables use pipe delimiters correctly.
7. Scenario Outline placeholders match the Examples table.

Notes
- Feature files may include non-ASCII text; do not rewrite content during review.
