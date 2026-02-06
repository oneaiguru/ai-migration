Additions (new scenarios)

* Fallback_429_reroute_once: Given a providers matrix with an injected 429, When I run a streamed request, Then I see decision:"fallback" and one reroute counter, And ELR TPS > 0.
* Tokens_only_enforcement: Given quotas weekly type=hours and tokens limits, When I exceed hours but not tokens, Then no block occurs and only telemetry is updated.
* Calibration_cooldown: Given min_samples not reached, Then warn_pct_auto remains stable; After more samples, warn_pct_auto adjusts once and stays within bounds.

---