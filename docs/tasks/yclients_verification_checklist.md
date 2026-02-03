# YClients Lunda Verification Checklist (UI vs parser)

Use this to validate parser output against the live UI for Lunda Padel.

## Target
- URL: `https://b1280372.yclients.com/company/1168982/personal/select-services?o=`

## Steps
1) Open the URL and wait for all service cards to load; page title should contain "Padel".
2) Record every service with price and duration (1h, 1.5h, 2h). Tariffs expected:
   - Morning (Optimal): 6,000 / 9,000 / 12,000 RUB for 60/90/120 min
   - Midday (Mixed): 6,250 / 9,375 / 12,500 RUB
   - Evening (Prime-time): 6,500 / 9,750 / 13,000 RUB
3) Check calendar date range:
   - Count unique dates
   - Note first and last available dates (expect 17+ days, into late Dec/early Jan)
4) Pick a date and list all visible time slots (expect 8+ incl. evening slots 21:00/22:00).
5) Verify price by time:
   - 08:00 should show Morning tariff (~6,000 RUB for 1h)
   - 14:00 should show Midday (~6,250 RUB for 1h)
   - 22:00 should show Evening (~6,500 RUB for 1h)
6) Verify 1.5h and 2h pricing on the same date/time (see tariff matrix above).

## Data to compare with CSV
- Prices: must include 6,000 / 6,250 / 6,500 (1h) and the scaled 1.5h/2h prices above.
- Dates: at least 17 unique dates; include late December and early January.
- Times: include evening slots (e.g., 21:00, 22:00).
- Venue: should read as Lunda Padel (not generic court names from other venues).
