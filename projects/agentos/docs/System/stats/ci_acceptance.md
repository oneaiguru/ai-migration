# Preview CI Acceptance Criteria

- Display per-provider efficiency along with 95% confidence interval, sample size `n`, and statistical power.
- Gate: if `n < 3`, hide CI and power (print `ci=n/a`, `power=n/a`).
- Use a consistent estimator (e.g., ratio-of-totals) and document assumptions.
- Provide unit and behave coverage for edge cases (low-n, zero capacity, identical providers).
- Update `docs/Backlog/provider_scoreboard.md` and preview code when implementing.
