# Deep Research Task 1: OpenAI Codex CLI Usage Mechanics

## Research Goal
Establish complete understanding of Codex CLI `/status` semantics to enable Week 0 baseline measurement.

## Specific Questions (Priority Order)

### P0: Bar Accounting Basics
1. **What exactly is "5h limit" vs "Weekly limit"?**
   - Are they separate quotas or nested?
   - Does 5h reset rolling or fixed time?
   - Does Weekly reset on fixed day/time or rolling?
   - If fixed, what day/time and timezone?

2. **What counts as usage?**
   - Per message/prompt?
   - Token-based like Claude?
   - Does reasoning level (low/med/high) affect consumption?
   - Do approvals mode (auto vs on-request) affect accounting?
   - Do MCP tools/file operations count separately?

3. **How is usage displayed?**
   - Integer % only or fractional?
   - Update frequency/lag after prompts?
   - Does CLI `/status` match web dashboard?

### P1: Reset Behavior
4. **Reset mechanics:**
   - What happens at 5h mark if work in progress?
   - What happens at weekly reset if work in progress?
   - Is there grace period or hard cutoff?
   - Can you "bank" unused quota?

5. **Reset timing:**
   - If starting ChatGPT Pro subscription Sunday 21:00, when is first weekly reset?
   - How does DST affect reset times?

### P2: Edge Cases
6. **Concurrent usage:**
   - Can multiple terminal sessions run on one account?
   - Do they share quota or have separate pools?
   - Rate limiting behavior?

7. **Context effects:**
   - Does prompt length affect % consumption non-linearly?
   - Do file attachments inflate usage?
   - Caching behavior (if any)?

8. **Plan specifics:**
   - ChatGPT Pro ($200) documented capacity in tokens or messages?
   - Any published benchmarks of "messages per week" typical usage?

## Evidence Standards

**Accept:**
- OpenAI official docs (help.openai.com, platform.openai.com)
- Codex GitHub repo documentation
- OpenAI support responses (if quoted with context)
- User logs with `/status` screenshots AND workload description

**Scrutinize:**
- Blog posts (verify against official sources)
- Reddit/forum posts (need corroboration)

**Reject:**
- Speculation without evidence
- Outdated info (pre-2024)

## Output Format

For each question, provide:

```markdown
### Q: [Question]

**Answer:** [Clear statement]

**Evidence:**
- [Source 1]: [URL] - [Quote/Screenshot]
- [Source 2]: [URL] - [Quote/Screenshot]

**Confidence:** HIGH/MEDIUM/LOW

**Gaps:** [What's still unknown]

**Implications for Week 0:** [How this affects measurement protocol]
```

## Success Criteria

After this research, we should be able to:
1. Write exact commands to measure ΔW for Codex
2. Know how long to wait after window for bar update
3. Predict number of windows possible in a week
4. Understand if different reasoning levels require different measurement
5. Design safety margins (R) based on observed variance

## Search Tactics

```
"codex cli" "/status" "5h limit" "weekly limit"
"chatgpt pro" "usage limit" "$200" "codex"
site:help.openai.com codex usage
site:github.com/openai/codex "status" "limit"
"gpt-5-codex" "reasoning low" usage
codex cli "reset" weekly 5h
```

