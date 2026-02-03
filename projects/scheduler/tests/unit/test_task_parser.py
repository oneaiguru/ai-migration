"""
Unit tests for the TaskParser module.
"""
import json
import pytest
from task_parser import TaskParser

@pytest.mark.unit
def test_parse_projects(mock_api_client, sample_projects):
    """Test that projects are correctly parsed into tasks."""
    parser = TaskParser(api_client=mock_api_client)
    tasks = parser.parse_projects(sample_projects)

    assert len(tasks) == len(sample_projects)
    for task in tasks:
        assert "id" in task
        assert task["type"] == "project_batching"
        assert "priority" in task
        assert "deadline" in task

@pytest.mark.unit
def test_parse_transcript(mock_api_client, sample_transcript):
    """Test that transcripts are correctly parsed into tasks."""
    parser = TaskParser(api_client=mock_api_client)
    tasks = parser.parse_transcript(sample_transcript, "sample.txt")

    assert len(tasks) > 0
    assert tasks[0]["type"] == "notes_processing"
    assert "source" in tasks[0]
    assert tasks[0]["source"] == "sample.txt"

@pytest.mark.unit
def test_parse_bug_report(mock_api_client, sample_bug):
    """Test that bug reports are correctly parsed into tasks."""
    parser = TaskParser(api_client=mock_api_client)
    tasks = parser.parse_bug_report(sample_bug, "sample_bug.json")

    assert len(tasks) > 0
    assert tasks[0]["type"] == "bug_fix_prioritization"
    assert "priority" in tasks[0]
    assert "project" in tasks[0]

@pytest.mark.unit
def test_parse_communication(mock_api_client, sample_communication):
    """Test that communications are correctly parsed into tasks."""
    parser = TaskParser(api_client=mock_api_client)
    tasks = parser.parse_communication(sample_communication, "sample_email.txt")

    assert len(tasks) > 0
    assert tasks[0]["type"] == "communication_handling"
    assert "priority" in tasks[0]
    assert tasks[0]["source"] == "sample_email.txt"

@pytest.mark.unit
def test_no_api_client_fallback():
    """Test that parser works in fallback mode without API client."""
    parser = TaskParser(api_client=None)
    tasks = parser.parse_projects([{
        "id": "test-project",
        "name": "Test Project",
        "priority": 5,
        "deadline": "2025-04-01T00:00:00Z"
    }])

    assert len(tasks) == 1
    assert tasks[0]["type"] == "project_batching"