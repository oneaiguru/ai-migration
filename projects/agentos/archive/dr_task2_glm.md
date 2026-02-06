# Deep Research Task 2: z.ai GLM-4.6 Coding Plan Usage Tracking

## Research Goal
Understand how z.ai tracks and displays usage so we can design equivalent measurement protocol.

## Specific Questions (Priority Order)

### P0: Usage Display & Limits
1. **How is usage shown in z.ai?**
   - Is there a web dashboard?
   - CLI command to check usage?
   - Does Claude Code `/usage` work with z.ai backend?
   - Any % bars or just message counts?

2. **What are the actual quotas?**
   - Coding Plan ($3/mo): Exact limits
   - Higher tiers: Limits and pricing
   - 5-hour pools: 120/600/2400 prompts - which tier gets which?
   - Weekly pool: Does one exist or only 5h cycles?

3. **How does quota reset?**
   - 5h reset: Rolling from first prompt or fixed times?
   - Weekly reset (if exists): Fixed day/time or rolling?
   - Timezone handling?

### P1: Integration with Claude Code
4. **Using GLM in Claude Code:**
   - How to configure ANTHROPIC_BASE_URL?
   - Does `/status` show model correctly?
   - Does `/usage` show anything useful?
   - Any z.ai-specific commands?

5. **What counts as usage?**
   - Per prompt/message?
   - Token-based accounting?
   - Do tool calls count extra?
   - File attachments counted?

### P2: Practical Measurement
6. **How to track ΔW equivalent?**
   - If no % bar, what's the proxy? (prompts remaining? time until reset?)
   - Can we estimate "% of weekly capacity used"?
   - Any rate limiting or throttling behavior?

7. **Subscription timing:**
   - If subscribing Sunday evening, when's first reset?
   - Can you start/pause subscriptions to align resets?

8. **Plan comparison:**
   - $3 Coding Plan vs higher tiers: capacity differences
   - Is $3 sufficient for 5-10 windows of testing?

## Evidence Standards

**Accept:**
- z.ai official docs (docs.z.ai, z.ai blog)
- Anthropic docs about third-party integrations
- z.ai support responses
- User guides with screenshots of dashboards/CLI

**Scrutinize:**
- Third-party blog posts (verify claims)
- Reddit/Discord discussions (need corroboration)

**Reject:**
- Marketing fluff without specifics
- Comparisons without methodology

## Output Format

For each question, provide:

```markdown
### Q: [Question]

**Answer:** [Clear statement]

**Evidence:**
- [Source 1]: [URL] - [Quote/Screenshot]
- [Source 2]: [URL] - [Quote/Screenshot]

**Confidence:** HIGH/MEDIUM/LOW

**Workarounds:** [If direct measurement isn't possible, how to approximate]

**Implications for Week 0:** [How this affects measurement protocol]
```

## Critical Unknowns to Resolve

1. **Can we even measure "ΔW" for GLM?**
   - If not, do we measure "prompts consumed per feature"?
   - Then convert to "features per week" capacity?

2. **Is GLM comparable to %-based providers?**
   - Maybe we need separate metrics: 
     - Codex/Claude: units per % of weekly bar
     - GLM: units per prompt quota

3. **Should we get $3 plan NOW for research?**
   - Risk: Mid-week start misaligns resets
   - Benefit: Test integration before Week 0
   - Recommendation: Only if we can confirm reset timing

## Search Tactics

```
site:docs.z.ai "usage" "limit" "quota"
site:docs.z.ai "coding plan" "$3" "prompts"
"z.ai" "glm-4.6" "claude code" integration
"ANTHROPIC_BASE_URL" "z.ai" setup
z.ai dashboard usage tracking
"zhipu ai" api limits quota
glm-4.6 "5 hour" reset
z.ai subscription start date reset schedule
```

## Success Criteria

After this research, we should be able to:
1. Decide if GLM can be included in Week 0 using same protocol
2. Design alternative measurement if % bars don't exist
3. Know whether to subscribe now or wait until Sunday
4. Understand capacity expectations for $3 plan
5. Have exact setup commands for Claude Code + z.ai

