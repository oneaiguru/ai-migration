from pytest_bdd import given, then, scenarios
from pathlib import Path

# Link to the feature file
scenarios('../features/common.feature')

@given("a test directory with sample files and folders")
def setup_test_directory(tmp_path):
    """Setup a test directory with sample files and folders."""
    project_dir = tmp_path / "sample_project"
    project_dir.mkdir()
    (project_dir / "test_file1.txt").write_text("Test content 1")
    (project_dir / "test_file2.txt").write_text("Test content 2")
    return project_dir

@then("sample_project should exist")
def check_sample_project_exists(tmp_path):
    """Ensure sample_project directory exists."""
    project_dir = tmp_path / "sample_project"
    assert project_dir.exists()
    assert project_dir.is_dir()

@then("test files should be created correctly")
def check_test_files(tmp_path):
    """Check that test files are created correctly."""
    project_dir = tmp_path / "sample_project"
    assert (project_dir / "test_file1.txt").read_text() == "Test content 1"
    assert (project_dir / "test_file2.txt").read_text() == "Test content 2"
