# Phased Roadmap — From Measurement to Routing

This document captures the strategic reframing from the 2025‑10‑20 review. Use it when prioritising backlog items or crafting future plans.

## Core Question
**Which provider + methodology combination delivers the lowest cost per shipped feature while maintaining acceptable quality?**

Everything we build fits into one of three buckets:
1. Infrastructure to answer the question.
2. Automation to reduce the cost of answering it.
3. Polish that improves usability once the answer is trustworthy.

## Layered View
```
┌─────────────────────────────────────┐
│  Product: AI Provider Optimizer     │  ← Future
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Autonomous Routing (Bandits)       │  ← Month 4+
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Automation (Reduce Human Time)     │  ← Month 2–3
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Statistical Decision Framework     │  ← Week 2–4
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Measurement Infrastructure         │  ← Week 0–1 ← **You are here**
└─────────────────────────────────────┘
```

## Phase Breakdown

### Phase 0 — Prove the Concept (Week 0–1)
Goal: one valid provider comparison with confidence intervals.

| Priority | Item | Rationale | Blocks |
| -------- | ---- | --------- | ------ |
| P0 | Data Schemas & Ledgers | canonical store for measurement | All analysis |
| P0 | Outcome & Quality Capture | need quality + churn to interpret cost/feature | Stats, what‑if |
| P0 | Stats/CI & Preview | CIs required for decision making | Routing |
| P1 | Reset Guardrails | ensure non-negative deltas, record `reset_at` | Trust in data |
| P1 | Unified Timeline | troubleshooting when panes drift | Data quality |

**Deliverable:** `tracker preview --window W0-XX` prints provider efficiency, CI, n, and power (e.g. `0.75 features/pp (95% CI 0.68–0.82), n=6`).

### Phase 1 — Statistical Validity (Week 2–4)
Goal: enough data (n≥15 per provider) for confident decisions.

| Priority | Item | Why Now | Enables |
| -------- | ---- | ------- | ------- |
| P0 | Experiment Designs | control confounds, replicate results | Trust in results |
| P1 | What-If Efficiency Estimator | pre-flight provider choice | Better routing |
| P1 | Parser Drift Watchdog | catch UI changes early | Reliability |
| P2 | Coverage & Lint | keep specs honest | Quality gates |

**Deliverable:** ability to state “Use Claude for planning, Codex for building” with statistical backing.

### Phase 2 — Reduce Human Time (Month 2–3)
Goal: operator overhead <10 minutes per window.

| Priority | Item | Value |
| -------- | ---- | ----- |
| P0 | Operator Wrappers | one command start/end/finalise | 15 min saved per window |
| P1 | Token Estimator/Governor | warn before overruns (no blocking) | Fewer interruptions |
| P1 | Plan Compiler 2.0 | auto stubs + budget hints | 10 min saved per feature |
| P2 | Launchd Scheduler | automated /status and ccusage | Eliminates manual triggers |
| P2 | Deliverables Bundler 2.0 | one-click handoff with diff | Faster review |

### Phase 3 — Autonomous Routing (Month 4+)
Goal: system routes 80% of work automatically with ≥90% accuracy.

| Priority | Item | Notes |
| -------- | ---- | ----- |
| P0 | Bandit Roadmap Phase 1 (ε‑greedy) | start exploration with logged data |
| P1 | Bandit Roadmap Phase 2 (Thompson) | better exploration/exploitation |
| P2 | Bandit Roadmap Phase 3 (BwK) | respect capacity constraints |

### Phase 4 — Polish (Month 6+)
Goal: productise; make it easy for others to adopt.

| Priority | Item | Notes |
| -------- | ---- | ----- |
| P2 | Progressive NAV Generator | documentation clarity |
| P2 | Spec Coverage Map | planning aid |
| P2 | Scenario Harvester | auto fill feature log |
| P2 | Snapshot/Restore | safe testing |
| P2 | Telemetry Extensions | optional metrics |

## Triage Checklist (ask before adding anything new)
1. Does this help compare providers? If not, defer.
2. Does it reduce measurement friction? If not, defer.
3. Can we prove it’s worth building? If not, defer until data exists.
4. What’s the simplest version that works? Build that first.

## Immediate Focus (2025-10-21 session)
- Freeze backlog expansion.
- Ship Phase 0 items: schemas, outcome capture, stats/CI, preview.
- Run one Codex + one Claude window, then execute full Week 0.
- **One Thing:** `tracker preview --window W0-XX` shows efficiency + CI (proof we can compare providers).
- Ship Phase 0 items: schemas, outcome capture, stats/CI, preview.
- Run one Codex + one Claude window, then execute full Week 0.

## Upcoming Milestones
- Week 0 report → drives Phase 1 priorities.
- Week 1 post‑mortem → informs Phase 2 automation focus.
- Replay simulator results → gate Bandit Phase 1.

Keep this document in sync with backlog statuses (Draft/Ready/In Progress) and next-session plans.
