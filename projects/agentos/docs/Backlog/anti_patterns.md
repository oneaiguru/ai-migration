# Anti-Patterns & Guardrails

Keep these pitfalls in mind when implementing backlog items:

- **Blocking Token Governor**
  - Governor must warn, not block. Always allow `--force` and log the override.

- **Placeholder Specs Shipping**
  - Generated stubs (plan compiler) must be replaced before calling a feature “done” (see DoD). Remove placeholder steps like “When nothing happens.”

- **Drift Watchdog Noise**
  - Tune thresholds and maintain ignore lists. False positives require human review before failing builds.

- **Automation Collisions**
  - Launchd scheduler is optional. Provide instructions to disable or skip for manual sessions/non-mac environments.

- **Low-N Statistics**
  - What-if estimator and CI shouldn’t route decisions when `n < 3`. Defer with “insufficient data.”

- **Bandit Overreach**
  - Stage roll-out. Each phase needs replay validation + sign-off before live routing.

- **Event Log Privacy**
  - For local, infra-only repos, over-engineering redaction slows iteration. Keep event logs under a `.gitignore`d path; defer redaction until we plan to share logs or push them to remote. Add a simple toggle later ("secure mode").

- **Double Execution of Start/Close**
  - Operator wrappers should check if automation or launchd jobs are already running to avoid duplicate captures.

- **Hard-coded Reset Hours**
  - Don’t bake in provider reset times (e.g., 05:00/06:00). Codex 5h limits roll minute-by-minute; ccusage daily windows vary. Prefer empirical timeline inference and explicit `reset_at` fields over constants.

- **Over-nesting Docs**
  - Deep hierarchies stifle speed and creativity. Keep docs flat; add links (integration map, contracts) rather than new folders.

- **Data‑Padding Features**
  - Do not propose or implement features whose only value is to inflate “feature counts.” New work must trace to PRD priorities: measurement (Stats/CI), quality capture, UPS alignment, churn instrumentation, or operator time reduction via concrete automation.
