Additions

* Counters

  * ccp_reroute_attempts_total{from_lane,to_lane,reason}
  * ccp_quota_blocks_total{model,kind=rolling|weekly}
* /v1/usage schema v1

  * speeds: elr_out_tps_rolling, dirty_out_tps_rolling, hod_* arrays
  * calibration: gaps[], warn_pct_auto, min_samples_reached
  * invariants: hours never block; tokens‑only enforcement

---