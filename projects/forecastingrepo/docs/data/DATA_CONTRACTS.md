# Data Contracts

## Encoding & Locales
- UTF‑8; `.` as decimal separator; CSV with header; `\n` line endings.
- **Exception**: Jury wide‑reports use `;` delimiter and `,` decimal separator.

## Keys & IDs
- `district` (string, canonical name), `date` (YYYY‑MM‑DD), `year_month` (YYYY‑MM).

## Schemas
### Daily actuals (`data/daily_waste_by_district.csv`)
| column         | type   | rules                          |
|----------------|--------|--------------------------------|
| date           | date   | required, unique per district  |
| district       | str    | required                       |
| actual_m3   | float  | ≥ 0                            |

**Unique key:** (date, district)

### Monthly actuals (`data/monthly_waste_by_district.csv`)
| column       | type  | rules            |
|--------------|-------|------------------|
| year_month   | str   | YYYY‑MM          |
| district     | str   | required         |
| actual_m3 | float | ≥ 0              |

**Unique key:** (year_month, district)

### Forecast daily (delivered)
| column           | type  | rules                         |
|------------------|-------|-------------------------------|
| date             | date  | matches requested window      |
| level            | str   | "district" or "region"        |
| district         | str   | name or "REGION"              |
| forecast_m3  | float | ≥ 0                           |

### Forecast monthly (delivered)
| column           | type  | rules                         |
|------------------|-------|-------------------------------|
| year_month       | str   | YYYY‑MM                       |
| level            | str   | "district" or "region"        |
| district         | str   | name or "REGION"              |
| forecast_m3  | float | ≥ 0                           |

## Constraints
- Region rows in delivered files **equal sum of districts**.
- No duplicates; no NaN/Inf; leap day handled where present (2024‑02‑29).
- Station→district mappings must be versioned (for weather).
