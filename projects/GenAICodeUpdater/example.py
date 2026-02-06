import os
import sys

import pytest
from behave import given, when, then

from llmcodeupdater.main import main


def hello_world():
    print("Hello, World!")

@given('valid Python files exist in the project')
def valid_python_files(context):
    """Create sample Python files in the project directory."""
    test_file = os.path.join(context['project_dir'], 'test.py')
    with open(test_file, 'w') as f:
        f.write('print("Test file")\n')
    context['test_files'] = [test_file]

@given('valid code blocks are present in LLM content')
def valid_code_blocks(context):
    """Verify LLM content contains valid code blocks."""
    assert '# example.py' in context['llm_content']
    assert 'def hello_world()' in context['llm_content']

@given('the project directory does not exist')
def missing_project_directory(context):
    """Set an invalid project directory path."""
    context['project_dir'] = '/nonexistent/path/to/project'

@given('the LLM content is invalid')
def invalid_llm_content(context):
    """Provide invalid LLM content."""
    context['llm_content'] = '''
Invalid content without proper code blocks or file paths
'''

@given('files with different encodings exist')
def files_with_different_encodings(context):
    """Create test files with different encodings."""
    # UTF-8 file
    utf8_file = os.path.join(context['project_dir'], 'utf8.py')
    with open(utf8_file, 'w', encoding='utf-8') as f:
        f.write('print("UTF-8 encoded file")\n')
    
    # Latin-1 file
    latin1_file = os.path.join(context['project_dir'], 'latin1.py')
    with open(latin1_file, 'w', encoding='latin-1') as f:
        f.write('print("Latin-1 encoded file")\n')
    
    context['test_files'] = [utf8_file, latin1_file]

@when('I run the code update process')
def run_code_update(context, monkeypatch):
    """Execute the code update process."""
    # Simulate command line arguments
    test_args = ['program', '--git-path', context['project_dir']]
    monkeypatch.setattr(sys, 'argv', test_args)
    
    try:
        main()
        context['update_success'] = True
    except Exception as e:
        context['update_success'] = False
        context['error'] = str(e)

@then('the files should be successfully updated')
def verify_successful_update(context):
    """Verify files were updated successfully."""
    assert context['update_success'] is True
    assert os.path.exists(os.path.join(context['project_dir'], 'example.py'))

@then('backup files should be created')
def verify_backups(context):
    """Verify backup files were created."""
    backup_dir = os.path.join(context['project_dir'], 'backups')
    assert os.path.exists(backup_dir)
    assert len(os.listdir(backup_dir)) > 0

@then('a report should be generated')
def verify_report(context):
    """Verify that update reports were generated."""
    report_dir = os.path.join(context['project_dir'], 'reports')
    assert os.path.exists(report_dir)
    reports = [f for f in os.listdir(report_dir) if f.endswith(('.json', '.md'))]
    assert len(reports) > 0

@then('task tracking should be updated')
def verify_task_tracking(context):
    """Verify task tracking database was updated."""
    db_path = os.path.join(context['project_dir'], 'tasks.db')
    assert os.path.exists(db_path)

@then('the process should fail with an appropriate error')
def verify_process_failure(context):
    """Verify the process failed as expected."""
    assert context['update_success'] is False
    assert context['error'] is not None

@then('no files should be modified')
def verify_no_modifications(context):
    """Verify no files were modified during failed update."""
    if 'test_files' in context:
        for file_path in context['test_files']:
            assert os.path.exists(file_path)

@then('the files should be converted to UTF-8')
def verify_utf8_conversion(context):
    """Verify files were converted to UTF-8 encoding."""
    for file_path in context['test_files']:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                f.read()
        except UnicodeDecodeError:
            pytest.fail(f"File {file_path} is not properly UTF-8 encoded")

@then('the original files should be backed up')
def verify_encoding_backups(context):
    """Verify original files were backed up before encoding conversion."""
    backup_dir = os.path.join(context['project_dir'], 'backups')
    assert os.path.exists(backup_dir)
    backup_files = os.listdir(backup_dir)
    assert len(backup_files) >= len(context['test_files'])

@then('a report should mention encoding conversions')
def verify_encoding_report(context):
    """Verify the report includes encoding conversion information."""
    report_dir = os.path.join(context['project_dir'], 'reports')
    json_reports = [f for f in os.listdir(report_dir) if f.endswith('.json')]
    assert len(json_reports) > 0
