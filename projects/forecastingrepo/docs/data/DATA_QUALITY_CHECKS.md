# Data Quality Checks

## Coverage & Continuity
- Daily: no missing dates within requested windows per district.
- Monthly: all months within windows; year_month formatting strict.

## Integrity
- Non‑negative values; no NaN/Inf.
- No duplicate (key) rows.

## Reconciliation
- Region rows equal sum of districts per date/month.

## Provenance
- Record input filenames, SHA256, detected periods, scenario ID, cutoff.