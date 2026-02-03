# Context Engineering for Production
## Infrastructure Patterns for Long-Running Agents

---

## The 12-Factor Agents Framework

Human Layer's approach to production agents rests on 12 core principles:

1. **Natural Language to Tool Calls**: Direct conversion to structured JSON
2. **Own Your Prompts**: Full control over exact tokens sent to LLMs
3. **Own Your Context Window**: Everything is context engineering
4. **Tools Are Just Structured Outputs**: Demystify tool use
5. **Unify Execution and Business State**: Manage state outside the LLM
6. **Launch/Pause/Resume with Simple APIs**: Stateless, interruptible operations
7. **Contact Humans with Tool Calls**: Structured human-in-the-loop
8. **Own Your Control Flow**: Direct control over workflow orchestration
9. **Compact Errors into Context**: Intelligent error handling and learning
10. **Small, Focused Agents**: <100 tools, <20 steps for reliability
11. **Trigger from Anywhere**: Deploy where users work (Slack, email)
12. **Make Your Agent a Stateless Reducer**: Pure functions with externalized state

**Core Insight**: LLMs are stateless functions. The only variable affecting quality is what goes in. Success requires externalizing all state outside the LLM.

---

## Stateless Reducer Pattern

This is the foundational architecture for any agent running longer than a few minutes:

### The Concept

Treat agents as pure functions:

```
agent_step(context_window, external_state) → next_action
```

The agent's output depends *only* on these inputs, nothing else. This enables pause/resume/recovery.

### Implementation Pattern

```python
def agent_step(context_window, external_state):
    """Agent as pure function - determines next action"""
    # Input: current context window + current external state
    # Output: next action to take
    return determine_next_action(context_window, external_state)

def pause_agent(context_window, external_state):
    """Save complete state for later resume"""
    return serialize({
        'context': context_window,
        'state': external_state,
        'timestamp': now()
    })

def resume_agent(serialized_state):
    """Resume from saved state"""
    {context_window, external_state} = deserialize(serialized_state)
    return agent_step(context_window, external_state)
```

### Why This Matters for Production

With this pattern:
- **Resume across restarts**: Serialize state, restart infrastructure, deserialize, continue
- **Pause for humans**: Agent can stop, wait for approval, resume exactly where it left off
- **Prevent hallucination**: Agent can't reference internal state it made up
- **Easy testing**: Pure functions are testable
- **Cost control**: Can schedule agents, pay for execution time only

### The MCP Warning

A critical note: If you have one of those MCPs dumping JSON and UUIDs into your context window, you are doing all your work in the dumb zone and you're never going to get good results.

More MCPs doesn't mean more capability. It means less context available for actual problem-solving. Each MCP output consumes tokens that could be used for reasoning. A single overzealous MCP spewing unfiltered data can push you from smart zone (40% utilization) to dumb zone (65%+) in minutes.

**Strategy**: Be ruthless about MCP outputs. Filter relentlessly. Only load MCPs for specific phases. Remove unused MCPs from context.

### Session Continuity Pattern

For agents running across multiple days:

1. Agent runs with full context window
2. Every 4 hours (or at natural stopping point), serialize state
3. New session starts with:
   - Compressed summary of previous session
   - Current external state
   - Fresh 168k tokens available
4. Agent resumes work seamlessly

This enables the "7-day agent" pattern: agent that works continuously for a week without degradation.

---

## File System as Unlimited Context

One of the most powerful patterns in context engineering: use the file system as an extension of the context window.

### The Pattern

```python
def externalize_large_content(content, context_limit=8000):
    """Use file system for large content"""
    
    if len(content) > context_limit:
        filename = f"research_{hash(content)}.txt"
        write_file(filename, content)
        return f"Content saved to {filename} - use read_file tool"
    
    return content
```

### Why This Works

- **Files are reliable**: Always accurate, never hallucinate
- **Unlimited size**: Store 100k lines if needed
- **Directly operable**: Agent can read, modify, search files
- **Persistent**: Survives across sessions
- **Reference-safe**: "See file X" never causes confusion

### The Todo.md Pattern

Keep a living todo.md that tracks what's been done and what's next:

```markdown
# Session 1 - Research Phase

## Completed
- [x] Understand provider initialization flow
- [x] Document all edge cases
- [x] Found test patterns

## In Progress
- [ ] Review research with human
- [ ] Get approval to plan

## Next
- Plan implementation
- Begin coding
```

Rewrite this continuously. It provides:
- External tracking (never lose context of progress)
- Attention manipulation (agent focuses on what's marked "In Progress")
- Session continuity (resume session, read todo.md, know exactly where you are)

---

## Context Isolation for Subagents

When spawning subagents for specific tasks:

1. **Give only necessary context**: No research history, just the question
2. **Single tool focus**: One specialized capability, not a toolkit
3. **Explicit success criteria**: "Return file paths and line numbers, nothing else"
4. **Expected response size**: "Keep response under 500 tokens"
5. **Timeout**: Prevent runaway agents

### Subagent Result Integration

When subagent completes:
- Receive structured output
- Validate output shape
- Integrate into parent context
- Continue with recovered tokens

Example:

```python
async def delegate_search(parent_context, query):
    """Delegate to specialist subagent"""
    
    subagent_task = {
        "task": "Find all error handling implementations",
        "query": query,
        "max_response_tokens": 500,
        "return_format": {
            "files": ["path:line_range"],
            "summary": "string"
        }
    }
    
    result = await subagent.execute(subagent_task)
    
    # Parent now has ~130k tokens instead of 50k
    # And knows exactly where to look
    return result['files'], result['summary']
```

---

## Error Recovery and Learning

Production agents fail. The question is how they recover.

### Context-Aware Error Recovery

When an error occurs:

1. **Capture the error**: Exception message, stack trace
2. **Add to context**: "When you tried X, you got Y"
3. **Extract lesson**: "This means Z"
4. **Adapt context**: Modify state to avoid repeating error

```python
class ContextAwareRetryManager:
    async def execute_with_retry(self, action, context):
        """Execute with context-aware error recovery"""
        
        for attempt in range(self.max_retries):
            try:
                result = await action.execute(context)
                return result
                
            except Exception as e:
                # Don't hide failures - add to context for learning
                context = self.add_failure_to_context(context, {
                    "error": str(e),
                    "action": action.name,
                    "lesson": self.extract_lesson(e),
                    "attempt": attempt + 1
                })
                
                if attempt < self.max_retries - 1:
                    context = self.adapt_context_from_failures(context)
                    await asyncio.sleep(2 ** attempt)
                else:
                    return {"status": "failed", "errors": context['failures']}
```

### What Not to Do

- Don't hide errors (model can't learn)
- Don't retry with identical context (will fail identically)
- Don't retry endlessly (set reasonable limits)
- Don't escalate to human at wrong time (let agent try 2-3 times first)

---

## Intentional Context Compaction

Don't wait until you're at 90% utilization. Compact proactively.

### Compaction Triggers

- **Time-based**: Every 2-4 hours
- **Token-based**: When exceeding 60% utilization
- **Event-based**: After completing research, planning, or major milestone
- **Signal-based**: When agent starts repeating itself

### Compaction Procedure

1. Agent writes full session to markdown file (session_1.md)
2. Human reviews: "Is this progress correct?"
3. Agent creates compression: key findings, decisions, current state
4. Compression becomes initial context for next session
5. Session_1.md archived, new session_2.md created

### Compression Example

**Before** (80k tokens):
```
Full conversation history showing:
- Exploration attempts
- Failures and corrections
- Multiple perspectives considered
- Final understanding reached
```

**After** (3k tokens):
```markdown
## Session 1 Summary

### What We Discovered
- System uses 3 provider types (A, B, C)
- Config is loaded from /config/providers
- Edge case: Provider X requires special handling

### Key Files
- src/config/providers.ts (initialization)
- src/services/scm/factory.ts (factory pattern)
- src/types/provider.ts (interface definitions)

### Current Understanding
Ready to plan implementation of feature X.
No blockers identified.
```

This compression is worth 40-50k tokens of freed context.

---

## Production Monitoring Checklist

Track these metrics for production agents:

### Token Efficiency
- [ ] Average tokens per session (target: <80k)
- [ ] Context window utilization (target: 40-65%)
- [ ] Compaction frequency (target: every 2-4 hours)
- [ ] Token reduction ratio (target: 40-60% via compaction)

### Quality Signals
- [ ] Task completion rate (target: >90%)
- [ ] Bugs found in production vs tests
- [ ] Rework ratio (target: 20-30%)
- [ ] Human approval rate (target: >85% first submission)

### Reliability Signals
- [ ] Error recovery success rate (target: >78%)
- [ ] Session resumption success (target: >95%)
- [ ] Cascading failure prevention (errors don't compound)
- [ ] Timeout handling (no hung agents)

### Team Signals
- [ ] Senior engineer engagement (should stay constant)
- [ ] Code review time (should not increase)
- [ ] Architectural alignment (team agrees on direction)
- [ ] Junior learning curve (improving code understanding)

---

## Tool Management for Production

Not all tools should be available all the time.

### Tool Selection Strategy

```python
def select_tools_for_agent(agent_role, context):
    """Dynamically select tools based on context"""
    
    if context['phase'] == 'research':
        return [file_reader, code_searcher, git_log]
    
    elif context['phase'] == 'planning':
        return [file_reader, schema_validator]
    
    elif context['phase'] == 'implementation':
        return [file_editor, test_runner, compiler]
    
    elif context['phase'] == 'debugging':
        return [debugger, log_reader, profiler]
```

This keeps context window dedicated to tools relevant to current phase.

### Principles

- **Minimal tools**: 5-10 tools per phase, not 50 total
- **Context-aware**: Different tools at different times
- **Explicit grants**: Only use tools granted for current task
- **Timeout protection**: All tools have reasonable timeouts

---

## Production Deployment Architecture

### Components

**Agent State Manager**
- Serializes/deserializes agent state
- Manages pause/resume
- Tracks session history

**Context Compaction Service**
- Monitors token utilization
- Triggers compression at 60% threshold
- Manages archived sessions

**Error Recovery Manager**
- Captures errors to context
- Suggests adaptations
- Limits retry attempts

**Human Interface**
- Approval gates for research/planning
- Interrupt signals (pause agent)
- State visualization

**Monitoring & Logging**
- Token usage tracking
- Success/failure rates
- Performance metrics

### Deployment Pattern

```
Request → Agent State Manager → Agent Execution
  ↓                              ↓
Context Compaction Service   Tool Execution
  ↓                              ↓
Error Recovery Manager ← Tool Results
  ↓
[Success] → Archive, return result
[Human Needed] → Pause, wait for input
[Error] → Retry with adapted context
[Timeout] → Escalate, preserve state
```

---

## Real Production Results

Organizations implementing these patterns report:

- **Cost reduction**: 47-90% via KV-cache optimization and compaction
- **Speed improvement**: 2-50x faster task completion
- **Success rate**: 90%+ task completion without human intervention
- **Session length**: 7-14 day continuous operations without degradation
- **Rework ratio**: 20-30% (down from 50-80%)

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Implement stateless reducer pattern
- [ ] Set up serialization for pause/resume
- [ ] Create monitoring for token usage

### Week 2: Compaction
- [ ] Implement intentional compaction triggers
- [ ] Create compression procedure
- [ ] Add archive management

### Week 3: Reliability
- [ ] Implement error recovery system
- [ ] Add context-aware retry logic
- [ ] Set up human escalation gates

### Week 4: Optimization
- [ ] Fine-tune compaction triggers
- [ ] Monitor tool selection efficiency
- [ ] Adjust session length targets

---

## Common Mistakes to Avoid

- **Loading all context at start**: Start minimal, load on-demand
- **Ignoring errors**: Every error teaches something
- **Compacting too late**: Proactive beats reactive
- **Too many tools**: Less is more
- **Forgetting to resume**: State without resumption is waste
- **Unclear success criteria**: Agent doesn't know when to stop

---

## Conclusion

Production agents require infrastructure discipline. The patterns here—stateless reducers, proactive compaction, context isolation, error learning—enable agents to run reliably for hours or days while staying in the smart zone.

This is not optional for production. This is how professional systems work.
