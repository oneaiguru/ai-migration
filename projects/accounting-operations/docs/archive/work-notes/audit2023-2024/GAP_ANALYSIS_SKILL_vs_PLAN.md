# Gap Analysis: SKILL vs PROJECT_CLEANUP_PLAN

## Checklist: Is Everything Aligned?

### Foundation Layer ✓
- [x] accounts.toml documented
- [x] 8 accounts listed
- [x] TOML format explained
- [x] Editing guide included
- [x] Source of truth explained

### Script 1: verify_statement.py ✓
- [x] Purpose clear
- [x] Command shown
- [x] Examples provided
- [x] Output explained
- [x] When to use

### Script 2: copy_rename_statements.py ✓
- [x] Purpose clear
- [x] Command shown
- [x] Filename format shown
- [x] How it works explained
- [x] When to use
- [x] Loads from accounts.toml mentioned

### Script 3: generate_reports.py ✓
- [x] Purpose clear
- [x] Command shown
- [x] Outputs listed
- [x] How it works explained
- [x] Calls load_accounts_data() mentioned
- [x] When to use

### Script 4: metadata/build_statements.py ✓
- [x] Purpose clear
- [x] Command shown
- [x] Output format shown
- [x] Fields explained
- [x] When to use
- [x] Query examples provided

### Complete Workflow ✓
- [x] 6 steps documented
- [x] One-command version provided
- [x] Sequential order correct

### Directory Structure ✓
- [x] Project structure shown
- [x] File locations clear
- [x] Directory purposes explained

### Advanced Usage ✓
- [x] Metadata queries
- [x] Export examples
- [x] Gap finding code

### Common Tasks ✓
- [x] Add account
- [x] Change alias
- [x] Archive account
- [x] Download new statements

### Troubleshooting ✓
- [x] 4 common issues covered
- [x] Solutions provided

### Testing ✓
- [x] 4 verification tests
- [x] Each test explained

---

## Remaining Gaps/Improvements

### GAP 1: generate_reports.py Functions Not Documented
**Status:** ⚠️ MISSING FROM SKILL

The SKILL mentions that functions need to be added but doesn't show them explicitly.

**Should add section:**
```markdown
## Appendix: Functions in generate_reports.py

### New Functions Required

The following functions must be added to generate_reports.py for the TOML-based workflow:

#### display_name(acc_id: str, label: str) -> str
Returns alias from ALIAS_MAP or falls back to label.

#### load_accounts_data(path: Path) -> List[dict]
Loads accounts.toml and populates global maps.

### Global Maps
- ALIAS_MAP — account_id → alias
- TYPE_MAP — account_id → type
- CURRENCY_MAP — account_id → currency
- STATUS_MAP — account_id → status

These are populated by load_accounts_data().
```

**Recommendation:** Add this as Appendix A

---

### GAP 2: Dependencies Installation Not Clear
**Status:** ⚠️ MENTIONED BUT VAGUE

Section says "pip install openpyxl tomli" but doesn't explain when or how.

**Should clarify:**
```bash
# One-time setup
pip install openpyxl tomli

# Verify installation
python3 -c "import openpyxl, tomli; print('✓ Ready')"
```

**Recommendation:** Add installation section before "Notes"

---

### GAP 3: Backup/Version Control Not Mentioned
**Status:** ⚠️ NOT COVERED

No guidance on backing up or versioning the configuration.

**Should add:**
```markdown
## Backup & Version Control

### Backup accounts.toml
```bash
cp accounts.toml accounts.toml.backup.$(date +%Y%m%d)
```

### Track Changes
Consider git for tracking:
```bash
git init
git add accounts.toml
git commit -m "Initial accounts configuration"
```

### Restore Previous Version
```bash
cp accounts.toml.backup.20250101 accounts.toml
```
```

**Recommendation:** Add "Backup & Version Control" section

---

### GAP 4: Data Types Not Explained
**Status:** ⚠️ UNCLEAR

Doesn't explain what data types statements.toml will contain.

**Should clarify:**
```markdown
### Data Types in statements.toml

- `src` (string) — File path
- `account_id` (string) — Numeric account ID
- `alias` (string) — Friendly name
- `start` (string ISO date) — YYYY-MM-DD
- `end` (string ISO date) — YYYY-MM-DD
- `dest` (string path) — Target filename

All are strings in TOML format.
```

**Recommendation:** Add to build_statements.py section

---

### GAP 5: Error Handling Not Explained
**Status:** ⚠️ NOT DETAILED

What happens if TOML is malformed? If a file has wrong account?

**Should add:**
```markdown
## Error Handling

### Malformed accounts.toml
If TOML syntax is wrong, scripts will fail to load accounts.
```bash
python3 -c "from generate_reports import load_accounts_data; load_accounts_data('accounts.toml')"
```
This will show the error.

### Unknown Account in File
If a file has account_id not in accounts.toml, it will:
- Still be verified (shows account number)
- Still be organized (uses account_id as fallback to alias)
- Not appear in reports (only mapped accounts shown)

### Missing dates in File
If verify_statement.py can't find period, output shows:
```
❌ Could not extract account or period from file
```
File may be corrupted or not a KICB statement.
```

**Recommendation:** Add "Error Handling" section

---

### GAP 6: Performance/Scalability Not Mentioned
**Status:** ⚠️ NOT ADDRESSED

What if there are 1000 files? Will it be slow?

**Should clarify:**
```markdown
## Performance Notes

- `verify_statement.py`: ~0.1-0.2s per file
- `copy_rename_statements.py`: ~1-2s total
- `generate_reports.py`: ~2-5s total
- `build_statements.py`: ~1-2s total

All operations are fast even with hundreds of files.
```

**Recommendation:** Add "Performance" note

---

### GAP 7: Permissions/Access Control Not Mentioned
**Status:** ⚠️ NOT COVERED

What if local agent doesn't have write permissions?

**Should add:**
```markdown
## File Permissions

Required:
- Read: accounts.toml, all XLSX files
- Write: renamed-statements/, metadata/

Check permissions:
```bash
ls -la accounts.toml
ls -ld renamed-statements/
ls -ld metadata/
```

All should be readable and writable by current user.
```

**Recommendation:** Add "File Permissions" section

---

### GAP 8: Verification Examples Too Generic
**Status:** ⚠️ COULD BE SPECIFIC

Testing section doesn't show actual output examples.

**Should add:**
```markdown
### Test 1 Example Output
```
✓ Account: 1280026055073967
✓ Period:  01.01.2023 - 31.03.2023
✓ Account: 1280026055074068
✓ Period:  01.01.2023 - 31.03.2023
```

### Test 4 Example Output
```
File: metadata/statements.toml
Size: ~4.5 KB
Lines: ~250 (19 statements × ~13 lines each)
```
```

**Recommendation:** Add sample outputs to testing section

---

### GAP 9: Maintenance Schedule Not Explained
**Status:** ⚠️ NOT DOCUMENTED

When should you run these scripts? Daily? Weekly?

**Should add:**
```markdown
## Maintenance Schedule

**Weekly (or after new downloads):**
1. Verify new files
2. Organize with copy_rename_statements.py
3. Build metadata
4. Generate reports
5. Review tasks-2024-gaps.md

**Monthly:**
- Backup accounts.toml
- Review archived accounts
- Check for unused accounts

**Ad-hoc:**
- When adding new account: edit accounts.toml + regenerate
- When changing alias: regenerate all
```

**Recommendation:** Add "Maintenance Schedule" section

---

### GAP 10: Integration Examples Missing
**Status:** ⚠️ ADVANCED USE NOT CLEAR

How would external system actually use statements.toml?

**Should add:**
```markdown
## Integration Examples

### Example 1: Accounting System Import
```python
import toml
import csv

# Load statements
with open("metadata/statements.toml") as f:
    data = toml.load(f)

# Export as CSV for spreadsheet
with open("statements.csv", "w") as f:
    writer = csv.DictWriter(f, 
        fieldnames=["alias", "start", "end", "src"])
    writer.writeheader()
    for stmt in data["statement"]:
        writer.writerow({
            "alias": stmt["alias"],
            "start": stmt["start"],
            "end": stmt["end"],
            "src": stmt["src"]
        })
```

### Example 2: Notification System
```python
import toml
from datetime import datetime, timedelta

with open("metadata/statements.toml") as f:
    data = toml.load(f)

# Find statements from last 7 days
recent = [
    s for s in data["statement"]
    if datetime.fromisoformat(s["end"]) > (datetime.now() - timedelta(days=7))
]

for stmt in recent:
    print(f"New: {stmt['alias']} ({stmt['start']} to {stmt['end']})")
```
```

**Recommendation:** Add "Integration Examples" section

---

## Summary: What to Add to SKILL

| Gap | Type | Section | Priority |
|-----|------|---------|----------|
| Functions not shown | Documentation | Appendix A | HIGH |
| Installation unclear | Setup | Before Notes | HIGH |
| No backup guide | Operations | New Section | MEDIUM |
| Data types unexplained | Reference | Build Metadata | MEDIUM |
| Error handling missing | Troubleshooting | New Section | MEDIUM |
| Performance not mentioned | Reference | New Section | LOW |
| Permissions not covered | Setup | New Section | MEDIUM |
| Test outputs vague | Testing | Testing Section | LOW |
| Maintenance schedule absent | Operations | New Section | MEDIUM |
| Integration examples missing | Advanced | Advanced Usage | LOW |

---

## Recommendation: Updated SKILL Structure

```markdown
# KICB Statement Verification & Reporting Skill

## Foundation: accounts.toml
(existing)

## 1. Verify Downloaded Statements
(existing)

## 2. Organize Statements
(existing)

## 3. Build Metadata Inventory
(existing)

## 4. Generate Coverage Reports
(existing)

## Complete Workflow
(existing)

## Project Directory Structure
(existing)

## Key Principles
(existing)

## Installation & Setup
(NEW) - dependencies, permissions

## File Permissions
(NEW) - what needs to be writable

## Maintenance Schedule
(NEW) - when to run what

## Advanced Usage
(existing, enhance with examples)

## Integration Examples
(NEW) - how external systems use statements.toml

## Common Tasks
(existing)

## Troubleshooting
(existing, expand error handling)

## Error Handling
(NEW) - what goes wrong and why

## Testing Verification
(existing, add sample outputs)

## Performance Notes
(NEW) - is it slow?

## Backup & Version Control
(NEW) - how to protect config

## Appendix A: Function Reference
(NEW) - display_name(), load_accounts_data()

## File Locations Summary
(existing)

## Dependencies
(existing, expand with installation)

## Notes
(existing)
```

---

## Verdict

**SKILL_REFINED.md is ~85% complete.** 

**Missing 10 improvements** identified above. 

**Recommended action:** Add the HIGH and MEDIUM priority items before sharing with local agent.

