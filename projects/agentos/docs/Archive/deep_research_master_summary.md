# Deep Research Action Log (2025-10)

This log consolidates the outstanding directives, findings, and open questions from the deep-research packets provided on 2025-10-17 and 2025-10-18. Each entry links back to the original source and the curated copy stored in this repository.

## Source Index

| Date       | Topic / Title                                                                 | Local Copy                                                      | Original Path |
|------------|-------------------------------------------------------------------------------|-----------------------------------------------------------------|---------------|
| 2025-10-18 | "do_this_deep_resrarch_now_all_a_j_parts_follow_ins" (comprehensive bundle)  | `outbox/deep_research_2025-10-18_part3_full.md`                 | `/Users/m/Documents/replica/deep-research-reports/10-18-3_do_this_deep_resrarch_now_all_a_j_parts_follow_ins.md` |
| 2025-10-18 | "Normalized Code Churn as a Predictor of Defect Density"                      | `outbox/deep_research_2025-10-18_churn.md`                      | `/Users/m/Documents/replica/deep-research-reports/10-18-2_Normalized_Code_Churn_as_a_Predictor_of_Defect_Density.md` |
| 2025-10-18 | "Verification of Key Assumptions for AI Subscription Cost"                    | `outbox/deep_research_2025-10-18_assumptions.md`                | `/Users/m/Documents/replica/deep-research-reports/10-18-1_Verification_of_Key_Assumptions_for_AI_Subscription_Cost.md` |
| 2025-10-17 | "Deep Research Task 3 – Subscription Mode Usage Tracker (Claude focus)"       | `outbox/deep_research_2025-10-17_tracker_repo_survey.md`       | `/Users/m/Documents/replica/deep-research-reports/10-17-2_Deep_Research_Task_3_SubscriptionMode_Usage_Tracker_Claude.md` |
| 2025-10-16 | "dr_task3_repos_result" (additional tracker repo analysis)                     | `outbox/deep_research_2025-10-16_tracker_repo_summary.md`      | `/Users/m/Documents/replica/deep-research-reports/dr_task3_repos_result.markdown` |
| 2025-10-17 | "now_do_this_resrah_articulated_maximally_to_what_i" (Claude usage mechanics) | `outbox/deep_research_2025-10-17_claude_usage_findings.md`     | `/Users/m/Documents/replica/deep-research-reports/10-17-1_now_do_this_resrah_articulated_maximally_to_what_i.md` |

## Consolidated Instructions & Follow-Ups

### 1. Comprehensive Review Bundle (2025-10-18 Part 3)
- **Implementation to-dos**: Build the tracker CLI with wrap-tolerant parsers, BDD fixtures, append-only JSONL logs, and CLI UX for error cases (see Sections C & G of the bundle).
- **Operational prep**: Follow the Saturday prep checklist to validate wrappers (`cc.sh`, `claude-trace`), install `claude-monitor` and `ccusage`, and stage ten ~50 line BDD features.
- **Week 0 protocol**: Execute dual-provider baseline windows with BEFORE/DURING/AFTER ingestion, 5-minute post-window lag, and safety stop at ≥95% bar usage.
- **Open questions for owners**:
  1. Provide actual `cc.sh` and `claude-trace` wrapper scripts referenced in the prep checklist.
  2. Supply canonical Codex/Claude fixture files expected by the BDD suite.
  3. Confirm package names/versions for `claude-monitor` and `ccusage`, or note replacements if tooling changed.
  4. Clarify whether an automated helper exists for the “clone session” workflow described under patch instructions.

### 2. Normalized Code Churn Study (2025-10-18 Part 2)
- **Finding**: Normalized (relative) code churn strongly predicts defect density; Microsoft study achieved ~81% variance explanation and ~89% accuracy when using relative metrics.
- **Action**: Incorporate churn normalization into quality telemetry (`churn_14d` etc.) by scaling per module size/time, and use it to adjust quality-weighted efficiency scores.
- **Follow-up**: Determine data collection hooks in the tracker (`windows.jsonl`) to capture churn inputs for future modeling.

### 3. Assumption Verification Packet (2025-10-18 Part 1)
- **Confirmed assumptions**: Subscription plans beat API costs at ≥10M tokens/month; multi-agent pipelines reduce token burn vs. monolithic prompts.
- **Partially confirmed**: Need precise break-even points per provider and guard against inefficient multi-agent chatter.
- **Action items**: Model per-provider subscription break-even thresholds during Week 0 analysis and codify pipeline roles to retain efficiency gains.

### 4. Tracker Repository Survey (2025-10-17 Part 2)
- **Top repos identified**: `Claude-Code-Usage-Monitor`, `ccusage`, and a lightweight bandit library (details in local copy).
- **Integration guidance**: Fork or extract Claude parser/session logic, reuse `ccusage` JSON outputs, and pair with our optimizer shell to avoid inventing new collectors.
- **Follow-up**: Decide which modules to vendor vs. rewrite, and capture licensing/compliance notes before incorporation.

### 4a. Tracker Repository Summary Addendum (2025-10-16)
- **Additional survey**: Reinforces LiteLLM, Portkey, and MABWiser/PyBandits as key building blocks; confirms no single repo covers tracking + optimization + statistics.
- **Action**: Prototype core loop using LiteLLM as provider shim, design JSON logging schema, and wire in bandit library for provider selection.

### 5. Claude Usage Mechanics Findings (2025-10-17 Part 1)
- **Key findings**: 5-hour rolling, token-based windows; session overlap tricks; unified quota between Claude web and Claude Code; evidence of Opus higher quality vs. GPT-5 despite slower speed; GLM $3 plan prompt quotas.
- **Operational implications**: Align window scheduling to rolling timers, budget for dummy “starter” prompts when overlap is desired, and factor Opus quality advantages into methodology comparisons (rework multiplier).
- **Open questions**: Clarify grace behavior at the 5-hour boundary and gather empirical GLM performance/cost data via trial runs.

## Next Steps
1. Circulate this log to document owners for confirmation on missing assets (wrapper scripts, fixtures, tooling versions).
2. Prioritize outstanding tasks in the Week 0 readiness checklist (tracker build, feature specs, calendar holds).
3. Update PRD v1.6 references once the above clarifications are resolved.

*Prepared by: /Users/m/ai/projects/agentos/outbox*  
*Date: 2025-10-18*
