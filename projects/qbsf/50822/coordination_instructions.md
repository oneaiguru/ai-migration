# 🎯 COORDINATION INSTRUCTIONS

## 📋 WHAT TO DO NOW

### 1️⃣ Save These 4 Files to Claude Code Project Folder:
- `CURRENT_SITUATION_ASSESSMENT.md` ✅
- `SAFARI_SF_PRODUCTION_CHECKS.md` ✅  
- `CLAUDE_CODE_SERVER_TASKS.md` ✅
- `COORDINATION_INSTRUCTIONS.md` ✅ (this file)

### 2️⃣ Give Claude Code This Simple Prompt:
```
Read CURRENT_SITUATION_ASSESSMENT.md and CLAUDE_CODE_SERVER_TASKS.md

Execute all server assessment tasks and create CLAUDE_CODE_SERVER_FINDINGS.md with your results.

Focus on:
- Current server status and configuration
- OAuth redirect URI issues
- Integration logic (Invoice vs Opportunity confusion)
- Any errors in logs when Roman tests integration

Work systematically through each task and document everything.
```

### 3️⃣ You Do Safari SF Checks:
- Open `SAFARI_SF_PRODUCTION_CHECKS.md`
- Go through each check in your Safari SF session
- Create `SAFARI_SF_FINDINGS.md` with results
- Save it for Claude Code to read

### 4️⃣ After Both Complete Assessment:
Give Claude Code this prompt:
```
Read both SAFARI_SF_FINDINGS.md and your CLAUDE_CODE_SERVER_FINDINGS.md

Compare the findings and identify:
1. What's missing in SF production vs what server expects
2. OAuth configuration issues  
3. Why integration fails when Roman tests
4. Specific fixes needed

Create ASSESSMENT_SUMMARY.md with:
- Root cause analysis
- Priority fixes needed
- Deployment plan (sandbox → production)
- Test coverage strategy

Then create specific fix artifacts for each issue found.
```

---

## 🎯 EXPECTED OUTCOME

After assessment, we'll have:
- ✅ Complete picture of current state
- ✅ Root cause of integration failure  
- ✅ Specific action plan to fix issues
- ✅ Clear path to deployment and testing

## 🚨 KEY QUESTIONS TO ANSWER

1. **Are OAuth redirect URIs properly configured?** (Claude Code checks)
2. **What triggers/classes exist in SF production?** (You check in Safari)
3. **Is server expecting Invoice or Opportunity data?** (Claude Code checks code)
4. **What happens when Roman tests opportunity stage change?** (You test in Safari)
5. **Do we need to deploy from sandbox first?** (Compare findings)

---

## ⚡ START THE ASSESSMENT NOW

**You**: Do Safari SF checks → create SAFARI_SF_FINDINGS.md
**Claude Code**: Do server checks → create CLAUDE_CODE_SERVER_FINDINGS.md  
**Then**: Coordinate next steps based on findings

This systematic approach will identify exactly why Roman's integration isn't working and create a clear path to fix it! 🚀