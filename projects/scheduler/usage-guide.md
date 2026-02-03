# DeepSeek Scheduler - Quick Start Guide

After running the setup script, here's how to use the DeepSeek Scheduler:

## Basic Usage

### 1. Manual Execution

For a one-time run of the scheduler:

```bash
source venv/bin/activate  # Activate the virtual environment
python main_scheduler.py  # Run the scheduler
```

This will:
- Collect tasks from all input sources
- Process and prioritize them
- Schedule execution based on priorities and timing
- Execute scheduled tasks

### 2. Automated Execution

To run the scheduler with optimized timing:

```bash
./run-scheduler.sh
```

This script will:
- Run urgent tasks immediately
- Wait for off-peak hours if necessary
- Run non-urgent, reasoning-intensive tasks during off-peak hours for cost optimization

### 3. Setting Up Scheduled Execution

Use your preferred scheduler (cron/systemd) to run `python main_scheduler.py` on your cadence. A convenience script is not included in this repo.

## Working with Inputs

### Adding Projects

Populate a single JSON file at `data/projects.json` following this format:

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

### Adding Bug Reports

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

### Adding Voice Transcripts

Create text files in the `data/transcripts/` directory.

### Adding Communications

Create text files in the `data/communications/` directory.

## Viewing Outputs

After execution, check the `outputs/` directory for:
- Task action plans
- Generated proposals
- Bug fix suggestions
- Communication responses
- Processed notes

## Advanced Configuration

Edit `config.json` to customize:
- API settings
- Scheduling preferences
- File paths
- Task priorities

For more detailed information, refer to `Implementation_Guide.md`.
