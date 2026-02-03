# Quality Rubric (1–5)

Use at window finalize; record `quality_score` and `outcome` (pass/partial/fail). Snapshot churn should match the rubric.

| Score | Description | Example |
| ----- | ----------- | ------- |
| 5 | Pass, no rework needed; minimal churn | Specs shipped, tests green, no manual fixes required |
| 4 | Pass with trivial rework; minor churn | Small lint fix or doc tweak post-window |
| 3 | Partial; needs fix before declaring done | Scenario failing; requires follow-up window |
| 2 | Major rework; outputs unstable | Multiple retries, high churn (lines added/removed) |
| 1 | Fail; scrap and redo | Attempt abandoned, nothing shipped |

Link this rubric from Definition of Done and any outcome/quality backlog items.
