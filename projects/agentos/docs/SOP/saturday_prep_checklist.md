# Saturday Prep Checklist

**Prepare for Week 0 Sunday 21:00 start**

> Cross-check `~/wiki/replica/work/KnownQuirks.md` and related wiki entries (see links inside) before running these steps.

---

## Morning (9:00–12:00)

### ✅ Validate Shell Scripts

```bash
# Test subscription mode
./cc.sh sub -p
# Expect: Claude Pro loads without errors
# Exit with Ctrl+C after confirming

# Test z.ai mode (if configured)
./cc.sh zai -p
# Expect: works if .env.zai configured, or errors (expected if no sub)
# Exit after checking
```

### ✅ Validate Tracing

```bash
# Ensure claude-trace wrapper is active
which claude
# Should show custom wrapper, not system default

# Test trace generation
claude -p <<<'test trace'

# Check trace file created
ls -lt ~/.claude-trace/ | head -5
# Expect: new file with recent timestamp
```

### ✅ Install Tools

```bash
# Claude monitor (verified mode: --view daily)
uv tool install claude-monitor

# Test it runs
claude-monitor --view daily --help

# ccusage (for ChatGPT/Codex tracking)
brew install ccusage
# OR: npm install -g ccusage

# Test ccusage
ccusage --help
```

---

## Afternoon (14:00–17:00)

### ✅ Prepare Feature Specs

Select **10 similar BDD feature specs** for experiment:

```
features/
   AUTH-01-login.feature          (~50 lines)
   AUTH-02-logout.feature         (~50 lines)
   AUTH-03-password-reset.feature (~50 lines)
   FEED-01-list-items.feature     (~50 lines)
   FEED-02-create-item.feature    (~50 lines)
   ... (5 more feature files ~50 lines each)
```

**Criteria:**
* Similar complexity and size (comparable work units)
* Independent (can be implemented in isolation)
* Clear pass/fail outcomes

**Commit tag format for specs:**
```
xfeat::AUTH-01::W0-001::SPEC
xfeat::AUTH-02::W0-002::SPEC
```

**For prototypes (exclude from churn):**
```
xproto::UI-MOCK::W-P1::MOCK
xproto::DATA-MIG::W-M2::TEMP
```

### ✅ Set Up Workspace

```bash
mkdir -p week0-workspace/{codex,claude}
cd week0-workspace/codex
# Place feature specs here (or symlink)

cd ../claude
# Same specs (or symlink to shared folder)
```

### ✅ Verify Tracker Installation

```bash
# If Pro built tracker from PRD:
cd tracker/
uv venv .venv
source .venv/bin/activate
uv pip install -e .[dev]

# Run tests
pytest
pytest tests/test_ccusage.py

# Try manual ingestion test (alias automation wrapper)
scripts/automation/codex_status.sh \
  --phase before \
  --window TEST \
  --pipe-alias os \
  --data-dir data/week0/live \
  --buffer-seconds 0
# Re-run for an AFTER pane and poll twice—the pane may lag ~60s before showing the reset (see `docs/ai-docs/codex-status-refresh.md` and `docs/ai-docs/codex/context_pruning.md`).
# Verify snapshots recorded without errors (`tracker preview --window TEST`)
```

---

## Evening (19:00–21:00)

### ✅ Calendar Reminders

Set alarms for window start times:
* Sun 20:45 (15 min before first window)
* Mon 08:45, 14:45
* Tue 08:45, 14:45
* Wed 08:45, 14:45

### ✅ Create Data Directories

```bash
mkdir -p data/week0/{logs,snapshots,windows}
mkdir -p tests/fixtures/{codex,claude,glm}
```

### ✅ Test Parsers with Fixtures

```bash
# If you have sample /status and /usage outputs:
# Save them as fixtures
cat > tests/fixtures/codex/wide_status_82_1.txt <<EOF
<paste your Codex /status output>
EOF

cat > tests/fixtures/claude/usage_wide_90_1_0.txt <<EOF
<paste your Claude /usage output>
EOF

ccusage blocks --json > tests/fixtures/glm/ccusage_sample.json

# Run parser tests
pytest tests/bdd/
```

### ✅ Enable Tracker Aliases

```bash
source scripts/tracker-aliases.sh
# Confirm baseline commands resolve
echo "alias smoke" | os --window W0-SMOKE
# Exercise undo flow (removes mock snapshot)
od --window W0-SMOKE --phase before
# Clean up smoke entry if created (optional)
```

Review `docs/SOP/standard-operating-procedures.md#bdd-workflow-tracker-tooling` so the spec/test cadence is fresh before running the tracker drills.

Document the sourced script path in your shell profile or `~/wiki/.../TrackerAliases.md` so follow-on agents can reproduce the setup without re-reading this checklist.

### ✅ Dry-run Tracker CLI

```bash
cd tracker
. .venv/bin/activate
uv pip install -e .[dev]
pytest                     # ensure tracker unit tests pass
pytest tests/test_ccusage.py
PYTHONPATH=tracker/src behave features            # ensure BDD scenarios pass (set PYTHONPATH if venv not activated)

# Smoke test ingest + preview with fixtures
< ../tests/fixtures/codex/alt_reset_64_0.txt tracker ingest codex --window W0-DRY --phase before --stdin
< ../tests/fixtures/codex/wide_status_82_1.txt tracker ingest codex --window W0-DRY --phase after --stdin
< ../tests/fixtures/claude/usage_wide_90_1_0.txt tracker ingest claude --window W0-DRY --phase before --stdin
< ../tests/fixtures/claude/usage_narrow_90_1_0.txt tracker ingest claude --window W0-DRY --phase after --stdin
< ../tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-DRY --stdin
< ../tests/fixtures/ccusage/codex_sessions_sample.json tracker ingest codex-ccusage --window W0-DRY --scope session --stdin
tracker complete --window W0-DRY --codex-features 0 --claude-features 0 --glm-features 0 --quality 1.0 --outcome pass
tracker preview --window W0-DRY
```

---

## Final Check (20:30 Saturday)

- [ ] Shell scripts tested (sub mode works)
- [ ] Tracing confirmed (claude wrapper active)
- [ ] Tools installed (claude-monitor --view daily, ccusage)
- [ ] Tracker built and tests pass
- [ ] 10 feature specs prepared and tagged
- [ ] Calendar alarms set
- [ ] Data directories created
- [ ] Commit tag format documented (`xfeat::`/`xproto::`)
- [ ] Tracker preview command confirmed with fixtures (`tracker preview --window ...` shows codex/claude/glm lines)

**Optional dry-run:**
```bash
# Test one complete feature through pipeline
# Codex: spec → plan → build → review
# Claude: same feature, same steps
# Verify tracker captures data correctly
```

---

## Quick Reference

**Commit tags:**
```bash
# Regular features (count toward churn/efficiency)
xfeat::<FeatureID>::<WindowID>::<Stage>

# Prototypes/mocks (exclude from churn)
xproto::<FeatureID>::<WindowID>::<Stage>
```

**Churn calculation:**
```bash
# Count only real feature churn
git log --grep="^xfeat::" --not --grep="^xproto::" --numstat
```

**Provider tools:**
* Codex: `/status` in CLI
* Claude: `hi` then `/usage` in CLI
* Monitor: `claude-monitor --view daily` (verified mode)
* Usage: `ccusage blocks --json`
* Tracker: `tracker preview --window W0-TEST`

---

**If all checked:** Ready for Week 0 Sunday 21:00!
