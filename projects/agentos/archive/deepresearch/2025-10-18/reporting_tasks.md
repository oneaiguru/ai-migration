# Deep Research Follow-Up Tasks

This tracker summarizes outstanding work derived from the deep-research packages now stored in `docs/deepresearch/`. Use it to coordinate upcoming reports, clarifications, and engineering actions.

| Source File | Focus Area | Next Deliverable / Report | Notes |
|-------------|------------|---------------------------|-------|
| `docs/deepresearch/deep_research_master_summary.md` | Consolidated directives | Weekly status update covering all open questions | Awaiting responses on wrappers, fixtures, and tool versions before closing items. |
| `docs/deepresearch/deep_research_2025-10-18_normalized_code_churn.md` | Normalized churn research | Translate findings into actionable telemetry requirements | Requires tracker schema updates (`windows.jsonl`) to capture churn inputs. |
| `docs/deepresearch/deep_research_2025-10-18_I_plan_using_magic_prompt.md` | Planning prompt template | Confirm adoption in planning workflows | Ensure template is referenced where planning agents operate. |
| `docs/deepresearch/deep_research_2025-10-18_J_execute_with_magic_prompt.md` | Execution prompt template | Confirm adoption in execution workflows | Ensure template embedded in execution guidance.
| `docs/deepresearch/deep_research_2025-10-18_assumptions.md` | Assumption validation | Break-even cost analysis per provider (Week 0 output) | Requires post-Week-0 data to formalize thresholds. |
| `docs/deepresearch/deep_research_2025-10-17_claude_usage_findings.md` | Claude usage mechanics | Experiment log on session overlap + GLM trial | Collect empirical data on boundary behavior and GLM cost/quality. |
| `docs/deepresearch/deep_research_2025-10-17_tracker_repo_survey.md` | Tracker repo survey (Claude-focused) | Integration decision memo (vendor vs build) | Evaluate licensing and shortlist modules to import. |
| `docs/deepresearch/deep_research_2025-10-16_tracker_repo_summary.md` | Tracker repo summary addendum | Prototype report for LiteLLM-based core loop | Deliverable: proof-of-concept logging pipeline with bandit selection. |

## Immediate Actions

1. **Collect missing assets**: `cc.sh`, `claude-trace` wrapper scripts, and canonical Codex/Claude fixtures (owners: infrastructure).
2. **Finalize Week 0 tooling**: ensure tracker CLI, `claude-monitor`, and `ccusage` integration points are verified (owners: implementation).
3. **Plan analytics outputs**: define templates for the break-even analysis, churn integration proposal, and LiteLLM prototype report (owners: analytics/research).

Update this file as tasks are delivered so the research log stays current.
