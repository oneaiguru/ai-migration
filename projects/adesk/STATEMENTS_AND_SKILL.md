# Bank Statements and XLS Skill

## Raw statements (32 files)
All bank statements are under:
```
/Users/m/Documents/accounting/bank/renamed-statements/
```
Examples:
- USD Q1 2023: USD-BIZ-4068_2023-01-01_2023-03-31.xlsx
- USD Q3 2023: USD-BIZ-4068_2023-07-01_2023-09-30.xlsx
- KGS/EUR/RUB Q1 2023: KGS-BIZ-3967_2023-01-01_2023-03-31.xlsx, EUR-BIZ-4169_2023-01-01_2023-03-31.xlsx, RUB-BIZ-4270_2023-01-01_2023-03-31.xlsx
- Additional quarterly files for each account through 2024

## XLS skill (from skill.md)
- Zero formula errors; preserve templates/format.
- Use official NBKR exchange rate on the recognition date for currency conversion to KGS.
- No hardcoding of calculated values; use formulas if editing.
- Common workflows: pandas for data read/analysis; openpyxl for formulas/formatting; recalc with LibreOffice if needed.

## Quick extraction pattern (Python/pandas)
```python
import pandas as pd
raw = pd.read_excel('/Users/m/Documents/accounting/bank/renamed-statements/USD-BIZ-4068_2023-01-01_2023-03-31.xlsx', header=None)
# Find header row containing 'Operation #'
start = next((i for i,r in raw.iterrows() if isinstance(r[0], str) and 'Operation #' in r[0]), 9)
cols = ['op','date','counterparty','description','amount','balance']
ops = raw.iloc[start+1:].copy()
ops.columns = cols
ops = ops.dropna(subset=['op'])
ops['amount'] = pd.to_numeric(ops['amount'], errors='coerce')
ops['balance'] = pd.to_numeric(ops['balance'], errors='coerce')
print(ops[['op','date','amount','balance','description']].head())
```

## Known USD amounts from statements (import fix)
- 2023-01-16: +4,975.00 USD (CONSULTANCY FEES) → Dipesh Handa
- 2023-07-27: +24,967.50 USD (BNY CUST) → Avi Ashkenazi
