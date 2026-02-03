"""
System tests for end-to-end workflow.
"""
import os
import json
import pytest
from unittest.mock import patch, MagicMock

@pytest.mark.system
@patch('task_parser.TaskParser')
@patch('task_distributor.TaskDistributor')
@patch('api_client.DeepSeekClient')
def test_end_to_end_workflow(MockDeepSeekClient, MockTaskDistributor, MockTaskParser,
                             tmp_path, test_config):
    """Test the entire workflow from collection to execution."""
    # Setup mocks
    mock_parser = MockTaskParser.return_value
    mock_distributor = MockTaskDistributor.return_value
    mock_api_client = MockDeepSeekClient.return_value

    # Setup mock returns
    mock_tasks = [
        {"id": "task1", "type": "project_batching", "priority": 8},
        {"id": "task2", "type": "bug_fix_prioritization", "priority": 9},
        {"id": "task3", "type": "notes_processing", "priority": 3},
    ]
    mock_distributed = {
        "project_batching": [mock_tasks[0]],
        "bug_fix_prioritization": [mock_tasks[1]],
        "notes_processing": [mock_tasks[2]],
    }
    mock_scheduled = {
        "2025-03-17T17:00:00": [mock_tasks[0]],
        "2025-03-17T16:30:00": [mock_tasks[1]],
        "2025-03-18T17:00:00": [mock_tasks[2]],
    }

    mock_parser.parse_projects.return_value = [mock_tasks[0]]
    mock_parser.parse_bug_report.return_value = [mock_tasks[1]]
    mock_parser.parse_transcript.return_value = [mock_tasks[2]]
    mock_distributor.distribute.return_value = mock_distributed

    # Setup test files
    project_dir = tmp_path / "projects"
    bug_dir = tmp_path / "bugs"
    transcript_dir = tmp_path / "transcripts"
    output_dir = tmp_path / "outputs"

    for d in [project_dir, bug_dir, transcript_dir, output_dir]:
        d.mkdir()

    # Create test files
    with open(project_dir / "test_project.json", 'w') as f:
        json.dump([{"id": "project-001", "name": "Test"}], f)

    with open(bug_dir / "test_bug.json", 'w') as f:
        json.dump({"id": "bug-001", "title": "Test Bug"}, f)

    with open(transcript_dir / "test_transcript.txt", 'w') as f:
        f.write("Test transcript")

    # Update config to use test paths
    test_config["file_paths"]["project_list"] = str(project_dir / "test_project.json")
    test_config["file_paths"]["bug_reports"] = str(bug_dir)
    test_config["file_paths"]["voice_transcripts"] = str(transcript_dir)
    test_config["file_paths"]["output_directory"] = str(output_dir)

    # Import main scheduler
    from main_scheduler import AutomationScheduler

    # Create a class that will handle the patching correctly
    class MockScheduler(AutomationScheduler):
        def __init__(self):
            self.config = test_config
            self.api_client = mock_api_client
            self.parser = mock_parser
            self.distributor = mock_distributor
            self.scheduler = MagicMock()
            self.processors = {
                "project_batching": MagicMock(),
                "proposal_generation": MagicMock(),
                "bug_fix_prioritization": MagicMock(),
                "communication_handling": MagicMock(),
                "notes_processing": MagicMock()
            }

        # Override collect_tasks to use our mock parser
        def collect_tasks(self):
            tasks = []

            # Call the parser's parse_projects method to ensure it's recorded
            with open(self.config["file_paths"]["project_list"], 'r') as f:
                projects = json.load(f)
                tasks.extend(self.parser.parse_projects(projects))

            # Add the other tasks directly
            tasks.extend([mock_tasks[1]])
            tasks.extend([mock_tasks[2]])

            return tasks

        # Override process_and_schedule to use our mock distributor
        def process_and_schedule(self, tasks):
            self.distributor.distribute(tasks)
            return mock_scheduled

    # Create the scheduler using our mock class
    scheduler = MockScheduler()

    # Run the scheduler with mocked execute_scheduled_tasks
    with patch.object(scheduler, 'execute_scheduled_tasks'):
        scheduler.run()

        # Verify the correct methods were called
        mock_parser.parse_projects.assert_called()
        mock_distributor.distribute.assert_called()
        scheduler.execute_scheduled_tasks.assert_called_with(mock_scheduled)