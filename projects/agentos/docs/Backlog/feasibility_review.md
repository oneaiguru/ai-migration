# Feasibility & Conflict Review (2025-10-19)

| # | Idea | Feasibility | Complexity | Risks / Conflicts | Notes |
| - | ---- | ----------- | ---------- | ----------------- | ----- |
| 1 | Data Schemas & Ledgers | High | Medium | None; append-only JSONL manageable | Foundation; implement before timeline/stats |
| 2 | Unified Timeline Builder | High | Medium | Needs consistent timestamps; automation must deliver events | Builds on schemas + event sink |
| 3 | Outcome & Quality Capture | High | Low | Requires operator discipline; ensure CLI complete UX | Unlocks stats/bandits |
| 4 | CI/Power Stats & Preview | Medium | Medium | Statistical accuracy; depends on enough data; low n edge cases | Provide naive fallback until n≥3 |
| 5 | Codex Event Sink | Medium | Medium | Must shield secrets; JSON volume | Ensure redaction; rolling files |
| 6 | Reset-Edge Guardrails | High | Low | None; just buffer logic | Already partially implemented; extend |
| 7 | Token Estimator + Governor | Medium | Low | Heuristic accuracy; false alarms if plan underestimates | Start simple; allow override |
| 8 | Plan Compiler | Medium | Low | Must parse plan reliably; maintain templates | Good for spec-first discipline |
| 9 | Parser Drift Watchdog | Medium | Medium | Avoid false positives from small wording changes | Use thresholds + ignore lists |
|10 | Coverage & Plan/Term Lint | High | Low | None; cheap to implement | Quick guardrail |
|11 | Snapshot/Restore State | High | Low | Need to warn if running while automation active | Use lock files |
|12 | Progressive NAV Generator | High | Low | None | Already manual workflow; automation safe |
|13 | Spec Coverage Map | High | Low | None | Works with scenario harvester |
|14 | Scenario Harvester | Medium | Low | Ensure idempotent writes | Pair with coverage map |
|15 | Deliverables Bundler | High | Low | Need relative paths; ensure secrets excluded | Mirror GPT-5 bundles |
|16 | Launchd Scheduler | Medium | Medium | Mac-specific; ensure manual override; non-mac env fallback | Provide instructions not defaults |
|17 | What-If Efficiency Estimator | Medium | Medium | Needs credible stats; rely on features ledger | Start with simple ratio; guard low n |
|18 | Bandit Roadmap | Medium | High | Requires Stats + What-If + accurate data; risk of underpowered decisions | Stage phased roll-out; replay first |
|19 | Experiment Designs | High | Low | None; documentation exercise | Tie into ledger tags |
|20 | Telemetry Extensions | Medium | Medium | Data volume; privacy; require event sink | Staged fields; optional |
|21 | Operator Wrappers | High | Medium | Need to integrate with governor, snapshot, automation | Great UX payoff |

## Cross-Idea Considerations
- **Order matters:** implement Schemas → Outcome/Quality → Event Sink → Timeline → Stats → What-If → Bandits.
- **Governance:** Coverage/Lint, Plan Compiler, Token Governor should land early to enforce spec-first, budget discipline.
- **Conflicts:** Launchd + manual scripts: ensure wrappers respect a `--disable-scheduler` flag so automation doesn't double-run.
- **Data Volume:** Event sink + telemetry may grow logs; add rotation (e.g., gzip older files) but keep raw for replay.
- **Operator Load:** Outcome entry + governor warnings must be fast; provide defaults and override flags to prevent blocking flow.

