"""
Step definitions for task parsing feature.
"""
import json
import os
import sys
from pytest_bdd import given, when, then, parsers
from task_parser import TaskParser

@given(parsers.parse("a project list file with {count:d} projects"))
def project_list_file(count, tmp_path):
    """Create a project list file with the specified number of projects."""
    projects = []
    for i in range(count):
        projects.append({
            "id": f"project-{i+1:03d}",
            "name": f"Test Project {i+1}",
            "description": f"Test project description {i+1}",
            "priority": 8,
            "deadline": "2025-04-15T00:00:00Z",
            "tasks": [
                {"description": f"Task {j+1}", "status": "pending"}
                for j in range(2)
            ]
        })

    file_path = tmp_path / "projects.json"
    with open(file_path, 'w') as f:
        json.dump(projects, f)

    return {"file_path": file_path, "projects": projects}

@given("a bug report file for a critical issue")
def bug_report_file(tmp_path):
    """Create a bug report file for a critical issue."""
    bug = {
        "id": "bug-001",
        "project": "project-001",
        "title": "Critical Payment Error",
        "description": "Payment system is completely down",
        "severity": 10,
        "reported_date": "2025-03-15T10:30:00Z",
        "steps_to_reproduce": [
            "Go to checkout page",
            "Enter any payment details",
            "Click Submit"
        ],
        "expected_behavior": "Payment processes successfully",
        "actual_behavior": "System crashes with 500 error"
    }

    file_path = tmp_path / "critical_bug.json"
    with open(file_path, 'w') as f:
        json.dump(bug, f)

    return {"file_path": file_path, "bug": bug}

@when("the task parser processes the file")
def parse_project_file(project_list_file):
    """Process the project list file with the task parser."""
    with open(project_list_file["file_path"], 'r') as f:
        projects = json.load(f)

    parser = TaskParser(api_client=None)
    tasks = parser.parse_projects(projects)

    return {"tasks": tasks}

@when("the task parser processes the bug report")
def parse_bug_report(bug_report_file):
    """Process the bug report file with the task parser."""
    with open(bug_report_file["file_path"], 'r') as f:
        bug = json.load(f)

    parser = TaskParser(api_client=None)
    tasks = parser.parse_bug_report(bug, os.path.basename(bug_report_file["file_path"]))

    return {"tasks": tasks}

@then(parsers.parse("it should extract {count:d} structured tasks"))
def verify_task_count(parse_project_file, count):
    """Verify the number of extracted tasks."""
    assert len(parse_project_file["tasks"]) == count

@then("each task should have the correct priority and deadline")
def verify_task_properties(parse_project_file, project_list_file):
    """Verify the properties of the extracted tasks."""
    tasks = parse_project_file["tasks"]
    projects = project_list_file["projects"]

    for task, project in zip(tasks, projects):
        assert task["priority"] == project["priority"]
        assert task["deadline"] == project["deadline"]

@then("it should extract a task with high priority")
def verify_high_priority(parse_bug_report):
    """Verify that the extracted task has a high priority."""
    tasks = parse_bug_report["tasks"]
    assert len(tasks) > 0
    assert tasks[0]["priority"] >= 8  # High priority

@then(parsers.parse("the task should be categorized as \"{category}\""))
def verify_task_category(parse_bug_report, category):
    """Verify the category of the extracted task."""
    tasks = parse_bug_report["tasks"]
    assert len(tasks) > 0
    assert tasks[0]["type"] == category