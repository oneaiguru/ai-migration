# Assumptions Report Summary

Source: archive/deepresearch/2025-10-18/deep_research_2025-10-18_assumptions.md
## A1. Subscription Model Beats API Model at High Usage (10–20M tokens/month)
**Status:** **Confirmed** – High confidence.

**Evidence:** Providers offer subscription plans that significantly undercut pay-per-token API costs at scale. Z.AI’s GLM-4.6 Coding Plan, for example, delivers “tens of billions of tokens” for a fixed monthly fee, amounting to **~1% of standard API pri...

## A2. Multi-Agent Pipelines (Scout→Plan→Execute→Review) Are More Token-Efficient than Monolithic Prompts
**Status:** **Confirmed** – High confidence (supported by recent research).

**Evidence:** Structured multi-agent or staged prompting significantly reduces token usage compared to one-shot monolithic prompts. A 2025 study “CodeAgents” found that a modular approach (planner + solver + reviewer roles...

## A3. All Providers Support 5-Hour Rolling Session Windows with Compatible Reset Logic
**Status:** **Confirmed** – High confidence.

**Evidence:** OpenAI, Anthropic, and Z.AI all enforce session-based usage limits that **reset on a rolling 5-hour interval**. OpenAI’s ChatGPT Plus/Pro with Codex CLI explicitly allows a certain number of messages per 5-hour window (e.g. 30–150 messages...

## A4. Statistical Methods (Ratio-of-Totals, Fieller’s/BCa CIs, Bandits with Knapsacks) Are Appropriate for Measuring Efficiency and Routing
**Status:** **Partially Confirmed** – Moderate confidence.

**Evidence:** _Multi-armed bandit algorithms_ – including resource-aware variants like **Bandits with Knapsacks (BwK)** – are explicitly advocated in recent research for dynamic LLM routing. A 2025 arXiv paper formulates **LLM selection as...
