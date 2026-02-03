# TaskFlow.ai Architecture Overview

This document provides a high-level overview of the TaskFlow.ai system architecture.

## Core Components

TaskFlow.ai consists of four main components:

### 1. Task Preparation System (Mobile & Web)
- Create and refine task templates
- Schedule and prioritize tasks
- Generate mobile-ready prompts for Codex

### 2. Execution Queue (Synced between devices)
- Queue L4 operations for when back at desktop
- Preserve context between mobile and desktop
- Batch related tasks for efficient processing

### 3. Mobile-Optimized UI (Progressive Web App)
- Mobile-friendly prompt templates
- One-tap copying for Codex input
- Task status tracking and notifications

### 4. Desktop Runner (CLI tool)
- Executes queued L4 operations when available
- Runs tests on Codex outputs
- Updates task status across devices

## Information Flow

```
┌─────────────────────┐         ┌─────────────────────┐
│                     │         │                     │
│  Mobile Device      │         │  Desktop Computer   │
│  ───────────────    │         │  ───────────────    │
│  • Task preparation │   Git   │  • Task execution   │
│  • Templates        │ ◄────► │  • Testing          │
│  • Planning         │         │  • Integration      │
│                     │         │                     │
└─────────────────────┘         └─────────────────────┘
```

## 3-Folder Structure

TaskFlow.ai organizes information using a 3-folder structure:

### 1. `ai-docs/` - Persistent Knowledge Repository
- Architectural documentation
- Code patterns and standards
- System specifications

### 2. `specs/` - Work Specifications and Plans
- Task specifications
- Feature requirements
- Template specifications

### 3. `.claude/` - Reusable Prompts and Commands
- Context initialization commands
- Task-specific templates
- Workflow sequences

## Synchronization Strategy

TaskFlow.ai uses Git for synchronization between devices:

1. **Prepare tasks on mobile**: Create specifications, templates, and plans
2. **Commit and push**: Save changes to the remote repository
3. **Pull on desktop**: Retrieve prepared tasks
4. **Execute on desktop**: Run tasks that require Claude Code
5. **Commit and push results**: Save completed work
6. **Pull on mobile**: Retrieve completed work

This workflow allows for efficient task preparation on mobile while reserving complex implementation for desktop.

## Task Management

Tasks follow this lifecycle:

1. **Creation**: Tasks are created with a unique ID and specification
2. **Preparation**: Tasks are prepared with templates and context
3. **Queuing**: Tasks are queued for execution
4. **Execution**: Tasks are executed on the appropriate device
5. **Completion**: Results are committed and synchronized
6. **Review**: Optional human review and feedback

## Integration Points

TaskFlow.ai integrates with several external systems:

1. **Git**: For synchronization and version control
2. **OpenAI Codex**: For Level 5 (L5) specialized implementation
3. **Claude Code**: For Level 4 (L4) implementation and testing
4. **Telegram Bot** (optional): For mobile task management

## Security Considerations

1. **Authentication**: Configure Git with appropriate credentials
2. **Authorization**: Use repository permissions for access control
3. **Data Protection**: Be mindful of sensitive data in prompts and commits
4. **API Security**: Follow best practices for API token management
