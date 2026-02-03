"""
Test fixtures for DeepSeek Scheduler tests.
"""
import os
import sys
import json
import pytest
from unittest.mock import MagicMock

# Add parent directory to sys.path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Path helper
@pytest.fixture
def fixtures_path():
    return os.path.join(os.path.dirname(__file__), "fixtures")

# Mock API client
@pytest.fixture
def mock_api_client():
    mock_client = MagicMock()
    mock_client.call_api.return_value = json.dumps({"status": "success", "result": "test"})
    mock_client.is_off_peak_hours.return_value = True
    return mock_client

# Sample project data
@pytest.fixture
def sample_projects():
    return [
        {
            "id": "project-001",
            "name": "Website Redesign",
            "description": "Redesign client website with new branding",
            "priority": 8,
            "deadline": "2025-04-15T00:00:00Z"
        },
        {
            "id": "project-002",
            "name": "Bug Fixing Sprint",
            "description": "Fix critical bugs in the app",
            "priority": 9,
            "deadline": "2025-03-25T00:00:00Z"
        }
    ]

# Sample bug data
@pytest.fixture
def sample_bug():
    return {
        "id": "bug-001",
        "project": "project-002",
        "title": "Payment processing error",
        "description": "Users receive an error when trying to complete payment",
        "severity": 8
    }

# Sample transcript text
@pytest.fixture
def sample_transcript():
    return """Meeting notes from client call on March 15:
- Client wants to revise the color scheme for the website
- Need to add a new product category for summer items
- Deadline for the first draft is April 1"""

# Sample communication text
@pytest.fixture
def sample_communication():
    return """From: client@example.com
Subject: Website Feedback
Date: March 16, 2025

Hi there,

I reviewed the initial designs you sent over. I like the overall direction."""

# Mock config
@pytest.fixture
def test_config():
    return {
        "api_config": {
            "base_url": "https://api.deepseek.com",
            "api_key": "test_key",
            "models": {
                "reasoning": "deepseek-reasoner",
                "general": "deepseek-chat"
            }
        },
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
                "bug_fixes_critical": 8
            }
        },
        "file_paths": {
            "project_list": "./tests/fixtures/projects.json",
            "voice_transcripts": "./tests/fixtures/transcripts/",
            "bug_reports": "./tests/fixtures/bugs/",
            "communications": "./tests/fixtures/communications/",
            "output_directory": "./tests/fixtures/outputs/"
        }
    }