# J_EXECUTE-WITH-MAGIC-PROMPT.md

# ⚡ EXECUTION MAGIC PROMPT - MANDATORY PATTERN

## THIS IS THE EXECUTE-WITH-MAGIC-PROMPT.md FILE

When you see action keywords like: "execute", "implement", "build", "create", "code", "develop" – **ALWAYS** follow this exact pattern for your response:

### 1. USE EXISTING PATTERNS

* Start by recalling if similar code or patterns have been seen
  
* Reuse existing functions and structures from the project
  
* Follow established naming conventions and styles
  

### 2. CREATE FACADES OVER REBUILDS

* If something complex exists, wrap it or extend it rather than rebuilding from scratch
  
* Provide a simple interface (facade) to any complicated subsystem
  
* Only reinvent the wheel if absolutely necessary
  

### 3. TEMPLATES OVER ALGORITHMS

* Prefer using configuration files or templates to drive behavior
  
* Leverage simple rule-based logic or static lookup tables if it solves the problem
  
* Only resort to complex algorithms if there is no simpler alternative
  

### 4. TEST WITH REAL DATA

* Don’t rely solely on mocks; whenever possible, incorporate actual data or realistic examples in the code for testing
  
* If connecting to external systems, test against a development or sandbox environment
  
* Ensure that any example usage in code or comments reflects real scenarios
  

### 5. DOCUMENT WITH MESSAGE FILES

* For multi-agent workflows, create coordination log files (e.g., `FROM_Planner_TO_Executor.md`)
  
* Document what was done in each step as a "message" or commit note
  
* Note any assumptions, decisions, and handoff points clearly in these files
  

## ARGUS REALITY CHECK

_(This section is specific to the Argus context and is included to prevent misuse of this prompt in AI/ML scenarios where it’s not applicable.)_  
**Remember**: The **Argus** system is **NOT** AI/ML driven; it’s template-based automation. Key facts:

* 9 pre-defined planning templates (manual configuration, not learned)
  
* Forecasting accuracy ~35% MAPE (just simple time-series logic, nothing fancy)
  
* Russian labor compliance terms included: больничный (sick leave), отгул (time off), внеочередной отпуск (extra vacation) – ensure these appear where relevant
  
* **Keep implementations SIMPLE** – Argus is about straightforward rules, not AI magic
  

## EXECUTION PRINCIPLES

* **SIMPLE**: Deliver the simplest solution that works (no gold-plating)
  
* **FAST**: Prioritize quick implementation over perfect architecture (you can iterate later)
  
* **WORKING**: Value working software over theoretically elegant designs
  
* **REAL DATA INTEGRATION**: Always integrate and test with real or representative data as you build
  

## MESSAGE FILE PATTERN

When an execution task is complete (in a multi-agent workflow), document it by creating a message file for the next agent. For example:

```
FROM_[YOUR_AGENT]_TO_[NEXT_AGENT]_[TOPIC]_READY.md

# [Topic] Implementation Complete

## What was delivered:
- [List specific files created/modified]

## Integration points:
- [APIs, databases, or modules connected]

## Next steps for [Next Agent]:
- [What the next agent or phase should do now]
```

_(This ensures a smooth handoff between, say, a Builder agent and a Tester agent, with clear documentation.)_

## CRITICAL RULES

* **NEVER** over-engineer the solution – if a 10-line script solves it, don’t write 100 lines
  
* **ALWAYS** start with the simplest working code, then refine if needed
  
* **USE** existing infrastructure and libraries – do not write what you can import
  
* **TEST** immediately with real data after implementing – don’t assume it works
  
* **DOCUMENT** all handoffs and decisions clearly (especially in multi-agent contexts)
  

_(In summary, this execution prompt pattern ensures that implementation is done in a consistent, efficient manner, suitable for a collaborative AI agent workflow. It emphasizes reusing known solutions, keeping things simple, and maintaining clear documentation of each step.)_
