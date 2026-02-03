"""
Integration tests for the TaskParser and TaskDistributor.
"""
import pytest
from task_parser import TaskParser
from task_distributor import TaskDistributor

@pytest.mark.integration
def test_parse_and_distribute(mock_api_client, sample_projects, sample_bug,
                             sample_transcript, sample_communication):
    """Test that tasks can be parsed and then distributed."""
    # Setup parser and distributor
    parser = TaskParser(api_client=mock_api_client)
    distributor = TaskDistributor()

    # Parse different types of inputs
    tasks = []
    tasks.extend(parser.parse_projects(sample_projects))
    tasks.extend(parser.parse_bug_report(sample_bug, "sample_bug.json"))
    tasks.extend(parser.parse_transcript(sample_transcript, "sample_transcript.txt"))
    tasks.extend(parser.parse_communication(sample_communication, "sample_email.txt"))

    # Distribute tasks
    distributed = distributor.distribute(tasks)

    # Verify distribution
    assert "project_batching" in distributed
    assert "bug_fix_prioritization" in distributed
    assert "notes_processing" in distributed
    assert "communication_handling" in distributed

    # Verify each category has the correct tasks
    for task in distributed["project_batching"]:
        assert task["type"] == "project_batching"

    for task in distributed["bug_fix_prioritization"]:
        assert task["type"] == "bug_fix_prioritization"

    for task in distributed["notes_processing"]:
        assert task["type"] == "notes_processing"

    for task in distributed["communication_handling"]:
        assert task["type"] == "communication_handling"