# Renewal Radar in Claude Cowork (macOS)

This is a practical runbook for non-technical users.

## 1) Set Up Cowork

1) Download + unzip the Renewal Radar folder.
2) Open Claude (macOS app) and click `Cowork`.
3) Add the Renewal Radar folder as the shared folder (Claude can only see what you share).

## 2) First Run (Demo Data)

In Cowork, ask Claude to run:
```bash
python3 -m pip install -r requirements.txt
python3 demo_renewal_radar.py
```

Then open:
- `reports/renewal_radar_at_risk_2025-01-24.csv` (the demo uses a fixed cutoff date)

## 3) Real Data Run (One-Click)

1) Export two CSVs from your systems and place them in `exports/`:
- `exports/accounts_raw.csv`
- `exports/events_raw.csv`

2) Run:
```bash
python3 scripts/cowork_one_click.py --open
```

On first run this will generate:
- `config/renewal_radar_mapping.json` (column names + event weights)

If you get a "column mismatch" error:
```bash
python3 scripts/inspect_exports.py --write-mapping config/renewal_radar_mapping.json
```
Then edit the mapping file and re-run `cowork_one_click.py`.

## 4) What To Share With Your Team

The two most useful outputs are:
- `reports/renewal_radar_at_risk_<cutoff>.csv`
- `reports/renewal_radar_summary_<cutoff>.md`

## 5) Copy/Paste Prompts For Cowork

Prompt A (get me to the at-risk list fast):
```
I put exports/accounts_raw.csv and exports/events_raw.csv in the shared folder.
Run Renewal Radar end-to-end and open the at-risk CSV when done.
If mapping is needed, generate config/renewal_radar_mapping.json and tell me what to edit.
```

Prompt B (help me map our event types):
```
Run python3 scripts/inspect_exports.py and show me the top 20 event types.
Propose a 1.0/2.0/3.0 weighting, then write config/renewal_radar_mapping.json.
```
