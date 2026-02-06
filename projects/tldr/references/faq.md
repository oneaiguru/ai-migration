# FAQ

## How do I handle seasonal patterns?

Default behavior assumes a constant decay rate. If your business is seasonal, tune by date range
or by segment (tier).

## Can I use different decay rates per tier?

Yes. A reasonable starting point is:
- enterprise: `decay_rate_per_day=0.015` (1.5% per day)
- startup: `decay_rate_per_day=0.03` (3% per day)

Implement this in `src/account_health/churn_forecast.py` by selecting a decay rate per account.

## What if an account goes silent?

Accounts with no recent touchpoints will decay toward the threshold and be flagged as at-risk.
This is usually desired behavior for a CSM workflow.

## How often should I run it?

Weekly is fine for most teams. Daily is useful if you want a fast alerting loop.

## Can I add product usage or support signals?

Yes. Convert additional signals into rows in `touchpoints.csv` with a numeric `interaction_value`
and (optionally) an `interaction_type` for debugging.

