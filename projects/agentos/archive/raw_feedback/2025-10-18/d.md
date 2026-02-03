Got it. I reread the whole A1–A10 report with a “what still needs proof vs. what we can lock” lens. Below is a clean triage plus the briefs you asked for so you can spin up focused research where it matters.

* * *

## Executive triage (what needs deep work vs. what’s ready)

| ID      | Assumption                                                   | My confidence | Decision now                            | Why                                                          |
| ------- | ------------------------------------------------------------ | ------------- | --------------------------------------- | ------------------------------------------------------------ |
| **A1**  | Subscriptions beat API at high usage                         | **High**      | **Light confirm** (limits change often) | Math is straightforward, but plans/quotas move; re-check official plan pages & caps for current month before using in PRD 1.4. |
| **A2**  | Multi‑agent short cycles are more token‑efficient            | **High**      | **Conclude**                            | Multiple papers + vendor guidance point the same way. Your own Week‑0 logs will reconfirm per stage. |
| **A3**  | 5‑hour windows align across providers                        | **Med‑High**  | **Light confirm**                       | The pattern is consistent, but wording and weekly overlays differ; run one real reset test per provider in Week‑0. |
| **A4**  | Ratio‑of‑totals + Fieller/BCa + bandits (with caps) are the right analytics | **Medium**    | **Deep research**                       | Correct family of methods, but the exact estimator + routing policy need simulation with your workload, variance, caps, and rework delays. |
| **A5**  | Spec‑first (requirements→BDD→code) with LLM validation yields measurable quality | **Medium**    | **Deep research**                       | Strong theory/practice hints; you need a compact experiment plan to quantify “quality by construction” and guard against coverage gaming. |
| **A6**  | Normalized churn predicts defects                            | **High**      | **Conclude**                            | Longstanding evidence; just define normalization windows and prototype the metric. |
| **A7**  | Context editing / memory cut token overhead                  | **Med‑High**  | **Light confirm**                       | Features exist; verify they’re available in your subscription CLIs and measure savings on your repos. |
| **A8**  | NASA/ESA practices adapt to BDD discipline                   | **Medium**    | **Light research** _(non‑blocking)_     | Feasible, but you need the minimal template set and sign‑off rubric; not needed to start Week‑0. |
| **A9**  | WFM has 1000+ BDD‑definable tasks                            | **High**      | **Conclude**                            | Common at enterprise scale; just keep task taxonomy consistent. |
| **A10** | Model quality differs by stage (cheap scout, strong planner) | **Med‑High**  | **Light confirm**                       | Known pattern; confirm with your golden set + per‑stage metrics in Week‑0/1. |

**Bottom line:** Spin up **separate deep research** for **A4** and **A5**. Do **quick confirmations** for **A1, A3, A7, A10**. The rest can be **locked** and implemented.