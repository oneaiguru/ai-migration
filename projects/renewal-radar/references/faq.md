# Renewal Radar - FAQ

## General Questions

**Q: What is Renewal Radar?**
A: A tool that predicts which advertiser accounts are at risk of churning based on engagement patterns.

**Q: How far ahead can it predict?**
A: 1-365 days, with 30 days being the default for renewal planning.

**Q: How accurate is it?**
A: The model identifies accounts with declining engagement patterns. Accuracy depends on data quality and should be validated against actual churn outcomes.

## Data Questions

**Q: What data do I need?**
A: Two files:
- `accounts.csv`: Account IDs, company names, ARR, renewal dates
- `touchpoints.csv`: Account engagement events (email opens, clicks, replies, meetings)

**Q: How often should I update the data?**
A: Weekly or daily for best results. The model uses a 90-day trailing window.

**Q: What if an account has no engagement data?**
A: They will be flagged as high risk. No engagement is a strong churn signal.

## Output Questions

**Q: What does churn_prob_end mean?**
A: The probability of churn at the end of the forecast period. Use this for prioritization.

**Q: Why do some accounts spike mid-horizon but end healthy?**
A: They may have seasonal engagement patterns. Check the `watchlist` report for these cases.

**Q: How do I prioritize outreach?**
A: Focus on accounts with high churn_prob_end AND high ARR.

## Technical Questions

**Q: Can I adjust the sensitivity?**
A: Yes, modify the `churn_threshold` parameter (default 0.5). Lower = more sensitive.

**Q: Can I customize the decay rate?**
A: Yes, modify `decay_rate_per_day` (default 0.02 = 2% per day).

**Q: How do I integrate with my CRM?**
A: See `references/integrations.md` for examples.
