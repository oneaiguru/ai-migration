# Purpose
- Import-only bundle of RTNEO data helper scripts (`volume_to_mass.py`, `ingest_jury_volume_excel.py`). No data included.

# Usage
- `python volume_to_mass.py --volume-csv <volumes.csv> --district-monthly <monthly_tonnes.csv> --year-month YYYY-MM --out <out.csv>`
- `python ingest_jury_volume_excel.py --xlsx <source.xlsx> --out <out.csv> [--month YYYY-MM]`
- Set `PYTHONPATH` to this folder if invoking via `python scripts/<file>.py` from elsewhere.

# Notes
- `volume_to_mass.py` now keeps zero-density rows (only skips when density is missing).
- Keep raw XLSX/CSVs outside git (e.g., `_incoming/`); outputs can live next to inputs or a temp folder.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
