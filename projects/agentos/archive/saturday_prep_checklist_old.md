# Saturday Prep Checklist

## Morning (9:00-12:00)

### ✅ Validate Shell Scripts
```bash
# Test both modes work
./cc.sh sub -p
# Verify it loads with subscription auth
# Exit with Ctrl+C

./cc.sh zai -p  
# Should work if you have .env.zai configured
# Or error if no Z.ai subscription yet (expected)
# Exit
```

### ✅ Validate Tracing
```bash
# Ensure claude-trace wrapper is active
which claude
# Should show your wrapper, not system claude

# Test trace generation
claude -p <<<'test trace' 
# Check it created file in ~/.claude-trace/
ls -lt ~/.claude-trace/ | head -5
```

### ✅ Install Tools
```bash
# Claude monitor (if not done)
uv tool install claude-monitor

# Test it works
claude-monitor --view realtime --help

# ccusage (if not done)  
brew install ccusage
# OR: npm install -g ccusage

# Test it
ccusage --help
```

## Afternoon (14:00-17:00)

### ✅ Give PRD to Pro for Implementation

**Prompt for Pro:**
```
Using PRD v1.3 (attached), implement the tracker system.

Requirements:
1. Start with parser tests (BDD)
2. Use fixtures I provided (Codex/Claude outputs)
3. Implement parsers that pass those tests
4. Build CLI with commands shown in runbook
5. Keep it simple - flat files, JSONL only

Generate:
- tracker/ folder structure with stub .py files
- tests/ with BDD features and step definitions
- CLI entry point with argparse
- README with installation instructions

Use pytest, behave, or both for BDD.
Output each file as a separate artifact.
```

### ✅ Review Pro's Output
Check for:
- Proper module structure
- Parser regex handles your narrow/wrapped cases
- BDD tests reference your actual fixtures
- CLI commands match the protocol

### ✅ Test Tracker Locally
```bash
# Install in dev mode
cd tracker/
uv venv
source .venv/bin/activate
pip install -e .

# Run tests
pytest tests/

# Try one manual ingestion
echo "your codex /status output" | \
  tracker ingest codex --phase before --window TEST --stdin
```

## Evening (19:00-21:00)

### ✅ Prepare Feature Specs

Select 10 similar BDD specs:
```
features/
  AUTH-01-login.feature         (~50 lines)
  AUTH-02-logout.feature        (~50 lines)
  AUTH-03-password-reset.feature (~50 lines)
  FEED-01-list-items.feature    (~50 lines)
  FEED-02-create-item.feature   (~50 lines)
  ... (5 more)
```

Criteria:
- Similar complexity
- Independent (can implement in any order)
- Clear pass/fail (automated tests exist)

### ✅ Set Up Workspace
```bash
mkdir -p week0-workspace/{codex,claude}
cd week0-workspace/codex
# Put feature specs here

cd ../claude  
# Same specs (or you can share one folder)
```

### ✅ Calendar Reminders
Add alarms for:
- Sun 20:45 (prep for first window)
- Mon 08:45, 14:45 (window starts)
- Tue 08:45, 14:45
- Wed 08:45, 14:45

---

## Final Check (20:30)

- [ ] Both shell scripts tested
- [ ] Tracing confirmed working
- [ ] Tools installed (claude-monitor, ccusage)
- [ ] Tracker built and tests pass
- [ ] 10 feature specs ready
- [ ] Calendar alarms set
- [ ] Spin-off validation done (if you chose to do it)

**If all checked:** You