# Freelance Project Automation Scheduler
## Implementation and Usage Guide

This guide provides instructions for setting up and using the automated scheduling system to manage freelance projects, personal tasks, communications, and more using DeepSeek API for intelligent processing.

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Cost Optimization](#cost-optimization)
7. [Extending the System](#extending-the-system)
8. [Troubleshooting](#troubleshooting)

## Overview

The Freelance Project Automation Scheduler is designed to automate and optimize your workflow by:

- Processing inputs from multiple sources (project lists, communications, bug reports, voice notes)
- Intelligently categorizing and prioritizing tasks
- Scheduling tasks optimally based on deadlines, priorities, and cost considerations
- Leveraging DeepSeek's AI models for advanced reasoning and generation
- Optimizing API usage to take advantage of off-peak pricing discounts

## System Architecture

The system consists of several key components:

1. **Task Parser**: Extracts actionable tasks from various input sources
2. **Task Distributor**: Categorizes tasks and routes them to appropriate processors
3. **Processors**: Specialized handlers for different task types:
   - Project Batcher
   - Proposal Generator
   - Bug Fix Prioritizer
   - Communication Handler
   - Notes Processor
4. **API Client**: Manages interactions with DeepSeek's API
5. **Task Scheduler**: Optimizes task execution timing
6. **Main Scheduler**: Orchestrates the entire workflow

## Installation

### Prerequisites
- Python 3.8+
- DeepSeek API access (API key)

### Setup Steps
1. Clone the repository
   ```
   git clone https://github.com/yourusername/freelance-automation-scheduler.git
   cd freelance-automation-scheduler
   ```

2. Create and activate a virtual environment
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Configure your API key
   Edit `config.json` to add your DeepSeek API key.

5. Create directory structure
   ```
   mkdir -p data/transcripts data/bugs data/communications outputs logs prompts
   ```

6. Add prompt templates
   Copy the provided prompt templates to the `prompts` directory:
   - `project_batching.txt`
   - `proposal_generation.txt`
   - `bug_fix_prioritization.txt`
   - `communication_handling.txt`
   - `notes_processing.txt`

## Configuration

The system is configured through the `config.json` file. Key configuration sections include:

### API Configuration
```json
"api_config": {
  "base_url": "https://api.deepseek.com",
  "api_key": "YOUR_API_KEY",
  "models": {
    "reasoning": "deepseek-reasoner",
    "general": "deepseek-chat"
  }
}
```

### Scheduling Configuration
```json
"scheduling": {
  "peak_hours": {
    "start": "00:30",
    "end": "16:30",
    "timezone": "UTC"
  },
  "off_peak_hours": {
    "start": "16:30",
    "end": "00:30",
    "timezone": "UTC"
  },
  "task_priority": {
    "urgent_client_work": 10,
    "client_deadlines": 9,
    "bug_fixes_critical": 8,
    "proposal_deadlines": 7,
    "communication_responses": 6,
    "bug_fixes_normal": 5,
    "new_proposals": 4,
    "note_processing": 3,
    "personal_projects": 2,
    "exploration": 1
  }
}
```

### File Paths Configuration
```json
"file_paths": {
  "project_list": "./data/projects.json",
  "voice_transcripts": "./data/transcripts/",
  "bug_reports": "./data/bugs/",
  "communications": "./data/communications/",
  "output_directory": "./outputs/"
}
```

## Usage

### Basic Usage
Run the scheduler manually:
```
python main_scheduler.py
```

### Automated Execution
Use the provided bash script for automated execution:
```
./run-scheduler.sh
```

This script will:
1. Run urgent tasks immediately
2. Wait for off-peak hours if needed
3. Run all remaining tasks during off-peak hours for cost optimization

### Input Formats

#### Project List Format
Create a `projects.json` file in the data directory:
```json
[
  {
    "id": "project-123",
    "name": "Client Website Redesign",
    "description": "Redesign the client's e-commerce website",
    "priority": 8,
    "deadline": "2025-04-15T00:00:00Z",
    "tasks": [
      {"description": "Wireframe homepage", "status": "pending"},
      {"description": "Design product pages", "status": "pending"}
    ]
  }
]
```

#### Bug Report Format
Create JSON files in the `data/bugs/` directory:
```json
{
  "id": "bug-456",
  "project": "project-123",
  "title": "Payment form validation error",
  "description": "Credit card validation fails for valid cards",
  "severity": 8,
  "reported_date": "2025-03-15T10:30:00Z",
  "steps_to_reproduce": [
    "Go to checkout page",
    "Enter valid credit card details",
    "Submit form"
  ],
  "expected_behavior": "Form submits successfully",
  "actual_behavior": "Validation error is shown"
}
```

#### Voice Transcript Format
Create text files in the `data/transcripts/` directory:
```
Meeting notes from client call on March 15:
- Client wants to add a new product category
- Need to finish the shopping cart by April 1
- Schedule follow-up call next week
- Remember to send them the design mockups by Wednesday
```

#### Communication Format
Create text files in the `data/communications/` directory:
```
From: client@example.com
Subject: Website Feedback
Date: March 16, 2025

Hi,

I reviewed the initial designs you sent over. I like the overall direction, but I have a few concerns about the mobile layout. The navigation seems crowded on smaller screens.

Could we schedule a call this week to discuss some alternatives? I'm available Wednesday afternoon or Thursday morning.

Also, what's the timeline for the next milestone?

Thanks,
John
```

## Cost Optimization

The system is designed to optimize costs by:

1. **Scheduling for Off-Peak Hours**: Tasks that don't need immediate execution are scheduled during DeepSeek's off-peak hours (16:30-00:30 UTC) to take advantage of discounts:
   - DeepSeek-V3: 50% off during off-peak
   - DeepSeek-R1: 75% off during off-peak

2. **Model Selection**: The system chooses the appropriate model based on task complexity:
   - DeepSeek-R1 (reasoner) for complex reasoning tasks
   - DeepSeek-V3 (chat) for straightforward tasks and code generation

3. **Workload Batching**: Similar tasks are batched together to reduce the number of API calls

## Extending the System

### Adding New Task Types
To add a new task type:

1. Create a new processor class in `processors.py` that inherits from `BaseProcessor`
2. Add the new processor to the initialization in `main_scheduler.py`
3. Create a prompt template for the new task type
4. Update the `task_distributor.py` to recognize and route the new task type

### Customizing Prompts
Modify the prompt templates in the `prompts` directory to customize the system's behavior for different task types.

## Troubleshooting

### Common Issues

#### API Authentication Errors
- Check that your API key is correctly set in `config.json`
- Verify your DeepSeek account has sufficient balance

#### Scheduling Issues
- Check that time zones are correctly configured in `config.json`
- Verify that file paths are correctly set

#### Performance Optimization
- For large workloads, consider increasing task batching
- Adjust the scheduling parameters for more aggressive off-peak utilization

### Logging
The system logs detailed information to:
- `scheduler.log`: Main system log
- `logs/scheduler_YYYYMMDD.log`: Daily logs from the automated job script

Use these logs to diagnose issues and optimize performance.
