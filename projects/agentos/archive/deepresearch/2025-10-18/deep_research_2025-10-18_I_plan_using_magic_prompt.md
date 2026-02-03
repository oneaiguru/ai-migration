# I_PLAN-USING-MAGIC-PROMPT.md

# 🎯 PLANNING MAGIC PROMPT - MANDATORY PATTERN

## THIS IS THE PLAN-USING-MAGIC-PROMPT.md FILE

When you see prompt keywords like: "plan", "design", "architect", "specify", "structure" – use the following structured approach without deviation:

### 1. BASE ON RESEARCH FINDINGS

* Never start planning from scratch or assumptions
  
* Incorporate discoveries and data (use file:line references to existing info)
  
* Reuse known patterns from prior analysis or code
  

### 2. SPECIFY EXACT FILES

* List specific files that will be created or modified
  
* Provide exact paths and even line numbers if relevant
  
* Reference the current code structure or project layout
  

### 3. PROVIDE LINE-BY-LINE CHANGES

* Present concrete code diffs or additions
  
* Show the exact lines to add/modify (this makes it easier to apply)
  
* Include before/after code snippets when appropriate for clarity
  

### 4. USE SIMPLEST APPROACH

* Prefer templates and configuration over complex algorithms
  
* Use facades or wrappers rather than rewriting large systems
  
* Avoid over-engineering – solve the problem with minimal changes
  

### 5. KEEP CONTEXT UNDER 40%

* Focus on the parts that need to change (avoid dumping entire files)
  
* Include only the relevant sections of code or design
  
* If context is large, refer to it abstractly or provide a summary instead of full content
  
* Leverage "message files" for lengthy context (reference them instead of inlining everything)
  

## MANDATORY PLAN STRUCTURE (exact template from context_engineering_prompts.md)

Your plan output **must** follow this outline:

### **Desired End State**

_A clear description of what the system/code should look like after this plan is executed, and how to verify it._

### **Key Discoveries:**

* [Discovery 1 with source reference (file:line)]
  
* [Discovery 2: any pattern or snippet to follow]
  
* [Discovery 3: constraints or requirements from prior context]
  

### **What We're NOT Doing**

_A list of out-of-scope items or explicit non-goals, to avoid scope creep._

### **Implementation Approach**

_A high-level explanation of the strategy – how you will achieve the desired end state, referencing the discoveries._

### *_Phase 1: [Descriptive Name]_

#### Overview

_What this phase achieves._

#### Changes Required:

1. **[Component/File Group]**
   
    * **File:** `path/to/file.ext`
      
    * **Changes:** short summary of changes in this file
      
    
    ```<language>
    // code snippet showing the specific changes  
    ```
    

_(Repeat sub-points for each file or component to be modified in Phase 1.)_

_(Then include Phase 2, 3, etc., if the plan is multi-phase, each with overview and specific changes.)_

## CRITICAL RULES

* **NEVER** begin planning unless the research phase is complete (ensure you have all necessary info first)
  
* **ALWAYS** reference existing code or config patterns – do not invent new ones if a solution exists in the project
  
* **USE** templates and configurations instead of complex new code where possible
  
* **AVOID** introducing complicated algorithms – keep solutions straightforward
  
* **INCLUDE** any domain-specific requirements (e.g., if Russian localization/compliance was mentioned, ensure it's not overlooked in planning if relevant)
  

_(This planning prompt template ensures consistency and completeness in design outputs. It should be used verbatim as a guide when the agent is asked to produce a plan.)_

