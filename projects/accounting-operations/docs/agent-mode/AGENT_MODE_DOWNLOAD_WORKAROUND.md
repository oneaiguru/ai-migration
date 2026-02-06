# Agent Mode Workaround: KICB Statement Downloads

## Problem
Agent mode cannot download files from KICB i-bank (scripts blocked, no download capability in browser environment).

## Solution
**Split workflow:** Agent navigates + prepares → User downloads → Agent verifies + organizes

---

## Workflow

### Step 1: Agent Navigates (Agent does this)
```
Agent:
1. Go to KICB i-bank
2. Navigate to statement export
3. Select account (e.g., 1280026055074270)
4. Select dates (e.g., 01.01.2023 - 31.03.2023)
5. Select format: XLS
6. STOP (don't click download - it will fail)
7. Report: "Ready for EUR-BIZ account, Q1 2024, XLS format selected"
8. Take screenshot showing exact page state
```

### Step 2: User Downloads (You do this)
```
User:
1. Get screenshot from agent showing ready state
2. Replicate exact same selections in your own KICB browser
3. Click Download
4. Files saved to your computer
5. Upload files to agent → back to Step 1
```

### Step 3: Agent Verifies & Organizes (Agent does this)
```
Agent:
1. Receive files from user
2. Run: python3 verify_statement.py file.xlsx
3. Confirm: correct account, correct dates
4. Organize: python3 copy_rename_statements.py
5. Repeat for next statement needed
```

---

## Template for Agent to Report "Ready"

When agent says download is ready, they should report:

```
READY FOR DOWNLOAD
─────────────────
Account: 1280026055074270 (RUB-BIZ-4270)
Dates: 01.01.2023 - 31.03.2023
Format: XLS
Status: Page ready, waiting for user download

Steps for user:
1. Log into KICB i-bank
2. Navigate to Statement Export
3. Select account: 1280026055074270
4. Set From: 1.1.2023
5. Set To: 31.3.2023
6. Format: XLS
7. Click Download
8. Upload received file
```

---

## Why This Works

✓ Agent: Can navigate, select, prepare, verify, organize  
✓ User: Can download using your own browser  
✓ Both: Never blocked - each does what their environment allows  

---

## Speed Impact

- Each statement: ~1-2 minutes (navigate + prepare, then download)
- 4 quarterly statements: ~8 minutes total
- Not fast, but **reliable**

---

## For Documentation

Add to project README:
```
## Note: Agent Mode Download Limitation

Agent mode cannot directly download from KICB i-bank (browser scripts blocked).

**Workaround:**
1. Agent navigates to KICB and prepares export (account + dates selected)
2. Agent reports ready + takes screenshot
3. You replicate selections in your browser and download
4. Upload files → Agent verifies and organizes

This ensures files are still downloaded and verified systematically.
```

---

## Should We Use This?

✓ YES - It's the only reliable method that works with agent limitations
✓ Slower than direct download, but 100% reliable
✓ Maintains verification workflow
✓ No manual TOML editing needed

Approve? Then I'll add to project docs.
