import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from pathlib import Path
from src.fileselect.selectors.files import FileSelector
from src.fileselect.storage import SelectionStorage


@pytest.fixture
def test_dir(tmp_path):
    """Create a temporary test directory with sample files."""
    # Create test files
    test_files = ['test_file1.txt', 'test_file2.txt', 'test_file3.txt']
    for file in test_files:
        (tmp_path / file).touch()
    return tmp_path

@pytest.fixture
def file_selector(test_dir):
    """Initialize FileSelector with test directory."""
    files = list(test_dir.glob('*.txt'))
    return FileSelector(files)

@pytest.fixture
def storage(test_dir):
    """Initialize SelectionStorage with test directory."""
    return SelectionStorage(test_dir)

@given('the file selector is initialized with test directory')
def file_selector_init(file_selector):
    assert file_selector is not None
    assert len(file_selector.list_files()) > 0

@when(parsers.parse('I press key "{key}" to select "{filename}"'))
def select_single_file(file_selector, key, filename):
    file_selector.select_file(key)

@then(parsers.parse('"{filename}" should be marked as selected'))
def verify_file_selected(file_selector, filename, test_dir):
    selected = file_selector.get_selected_files()
    assert any(f.name == filename for f in selected)

@then(parsers.parse('the selection count should be {count:d}'))
def verify_selection_count(file_selector, count):
    assert len(file_selector.get_selected_files()) == count

@when(parsers.parse('I select multiple files:\n{table}'))
def select_multiple_files(file_selector, table):
    # Parse the table data into a list of dictionaries
    table_data = []
    for line in table.split('\n'):
        line = line.strip()
        if '|' in line:
            parts = [part.strip() for part in line.split('|') if part.strip()]
            if len(parts) >= 2:
                table_data.append({
                    'key': parts[0],
                    'filename': parts[1]
                })
    
    # Make sure keyboard mappings are assigned
    file_selector.assign_keys()
    
    # Process each row
    for row in table_data:
        if row['key'] and row['filename']:
            # Select the file using the key
            file_selector.select_file(row['key'])

@then('both files should be marked as selected')
def verify_multiple_selection(file_selector):
    selected = file_selector.get_selected_files()
    assert len(selected) == 2

@given('I have selected multiple files')
def setup_multiple_selection(file_selector):
    file_selector.select_file('1')
    file_selector.select_file('2')
    assert len(file_selector.get_selected_files()) == 2

@when('I save the current selection')
def save_selection(file_selector, storage):
    storage.save_selection(file_selector.get_selected_files())

@when('I load the saved selection')
def load_selection(storage):
    storage.load_selection()

@then('the loaded selection should match the original selection')
def verify_loaded_selection(file_selector, storage):
    original = set(str(f) for f in file_selector.get_selected_files())
    loaded = set(str(f) for f in storage.load_selection())
    assert original == loaded

@when(parsers.parse('I create tag "{tag}" for the selection'))
def create_tag(file_selector, storage, tag):
    storage.save_tag(tag, file_selector.get_selected_files())

@then(parsers.parse('all selected files should have the "{tag}" tag'))
def verify_tag_applied(file_selector, storage, tag):
    selected_files = set(str(f) for f in file_selector.get_selected_files())
    tagged_files = set(str(f) for f in storage.load_tag(tag))
    assert selected_files == tagged_files

@then(parsers.parse('I should be able to load files by the "{tag}" tag'))
def verify_tag_loading(storage, tag):
    tagged_files = storage.load_tag(tag)
    assert len(tagged_files) > 0