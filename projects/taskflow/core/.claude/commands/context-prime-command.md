# Context Prime Command

## Purpose
Initialize Claude with a comprehensive understanding of the project for effective assistance.

## Instructions

### 1. First, understand the project overview
Read the project README.md for high-level understanding of:
- Project purpose
- Key features
- Architecture overview
- Setup instructions

### 2. Next, examine the project structure
Run these commands to understand the codebase organization:
```bash
find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | sort
find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | sort
```

### 3. Examine the most important files
Read these critical files to understand core components:

#### Project Configuration
```bash
cat package.json
```

#### Application Entry Points
```bash
# [Add relevant entry point files here]
```

### 4. Analyze code patterns
Examine key patterns by reviewing documentation:

```bash
find core/ai-docs -type f -name "*.md" | xargs cat
```

### 5. Understand current task
```bash
cat core/specs/tasks/[task-id].md
```

## Output Format
After processing the information, provide:

1. **Project Understanding**: Brief summary of what you understand about the project
2. **Task Understanding**: Summary of the current task
3. **Approach**: How you plan to address the task
4. **Questions**: Any clarifying questions you have

## Example

```
Based on my review of the project:

Project Understanding:
TaskFlow.ai is an agent orchestration platform that helps developers maximize the effectiveness of AI coding tools like Codex and Claude Code. It uses a 3-folder structure (ai-docs, specs, .claude) and bridges mobile and desktop environments through Git.

Task Understanding:
The current task is to implement a component that handles task synchronization between mobile and desktop environments.

Approach:
I'll implement this component following the error handling pattern in core/ai-docs/patterns/error-handling.md and the architecture guidelines in core/ai-docs/architecture/README.md.

Questions:
1. Should this component handle conflict resolution automatically or prompt the user?
2. What authentication mechanism should be used for secure synchronization?
```
