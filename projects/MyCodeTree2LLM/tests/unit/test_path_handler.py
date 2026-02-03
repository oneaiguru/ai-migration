import pytest
from pathlib import Path
from src.fileselect.utils.path import PathHandler

@pytest.fixture
def sample_project(tmp_path):
    """Create a temporary project directory with sample files."""
    # Create directory structure
    (tmp_path / 'src').mkdir()
    (tmp_path / 'src' / 'main.py').touch()
    (tmp_path / 'src' / 'utils').mkdir()
    (tmp_path / 'src' / 'utils' / 'helper.py').touch()
    (tmp_path / 'tests').mkdir()
    (tmp_path / 'tests' / 'test_main.py').touch()
    (tmp_path / 'tests' / 'file10.txt').touch()
    (tmp_path / 'tests' / 'file1.txt').touch()
    (tmp_path / 'tests' / 'file2.txt').touch()
    return tmp_path

def test_path_handler_initialization(sample_project):
    """Test PathHandler initialization"""
    ph = PathHandler(sample_project)
    assert ph.root_dir == sample_project
    assert isinstance(ph.root_dir, Path)

def test_relative_path_conversion(sample_project):
    """Test converting absolute paths to relative"""
    ph = PathHandler(sample_project)
    abs_path = sample_project / 'src' / 'main.py'
    rel_path = ph.get_relative_path(abs_path)
    
    assert isinstance(rel_path, Path)
    assert str(rel_path) == 'src/main.py'
    assert not rel_path.is_absolute()

def test_absolute_path_conversion(sample_project):
    """Test converting relative paths to absolute"""
    ph = PathHandler(sample_project)
    rel_path = Path('src/main.py')
    abs_path = ph.get_absolute_path(rel_path)
    
    assert isinstance(abs_path, Path)
    assert abs_path == sample_project / 'src' / 'main.py'
    assert abs_path.is_absolute()

def test_file_listing(sample_project):
    """Test listing files with pattern matching"""
    ph = PathHandler(sample_project)
    
    # List Python files
    py_files = ph.list_files('*.py')
    assert len(py_files) > 0  # We created .py files in the fixture
    assert all(f.suffix == '.py' for f in py_files)
    
    # List all files
    all_files = ph.list_files()
    assert len(all_files) >= len(py_files)

def test_folder_grouping(sample_project):
    """Test grouping files by folders"""
    ph = PathHandler(sample_project)
    files = ph.list_files()
    grouped = ph.group_by_folders(files)
    
    assert isinstance(grouped, dict)
    assert all(isinstance(k, Path) for k in grouped.keys())
    assert all(isinstance(v, list) for v in grouped.values())
    
    # Verify grouping logic
    for folder, folder_files in grouped.items():
        assert all(f.parent == folder for f in folder_files)

def test_path_handler_with_nonexistent_directory():
    """Test PathHandler behavior with nonexistent directory"""
    with pytest.raises(ValueError):
        PathHandler(Path('nonexistent/directory'))

def test_path_handler_with_file_as_root():
    """Test PathHandler behavior when initialized with a file path"""
    with pytest.raises(ValueError):
        PathHandler(Path(__file__))

def test_hidden_file_detection(sample_project):
    """Test detection of hidden files"""
    ph = PathHandler(sample_project)
    
    # Create a hidden file
    hidden_file = sample_project / '.hidden'
    hidden_file.touch()
    
    assert ph.is_hidden(hidden_file)
    assert not ph.is_hidden(sample_project / 'src' / 'main.py')

def test_path_filtering(sample_project):
    """Test filtering paths"""
    ph = PathHandler(sample_project)
    
    # Create some test files
    (sample_project / '.hidden_file').touch()
    (sample_project / 'normal_file').touch()
    
    all_paths = list(sample_project.iterdir())
    filtered_paths = ph.filter_paths(all_paths, include_hidden=False)
    
    assert len(filtered_paths) < len(all_paths)
    assert not any(ph.is_hidden(p) for p in filtered_paths)

def test_sort_paths(sample_project):
    """Test path sorting functionality with numeric prefixes"""
    ph = PathHandler(sample_project)
    paths = [
        Path('tests/file2.txt'),
        Path('tests/file10.txt'),
        Path('tests/file1.txt'),
    ]
    sorted_paths = ph.sort_paths(paths)
    
    assert sorted_paths == [
        Path('tests/file1.txt'),
        Path('tests/file2.txt'),
        Path('tests/file10.txt'),
    ]

def test_group_and_sort_paths():
    """Test grouping and sorting paths"""
    ph = PathHandler(Path('.'))  # Use current directory for testing
    paths = [Path('folder1/file2.txt'), Path('folder1/file1.txt'), Path('folder2/file3.txt')]
    grouped_sorted = ph.group_and_sort_paths(paths)
    
    assert len(grouped_sorted) == 2  # Two folders
    assert list(grouped_sorted.keys()) == [Path('folder1'), Path('folder2')]
    assert grouped_sorted[Path('folder1')] == [Path('folder1/file1.txt'), Path('folder1/file2.txt')]
    assert grouped_sorted[Path('folder2')] == [Path('folder2/file3.txt')]

def test_recursive_path_sorting():
    """Test sorting with nested folders"""
    ph = PathHandler(Path('.'))  # Use current directory for testing
    paths = [Path('folder1/file1.txt'), Path('folder2/file2.txt'), Path('folder1/subfolder/file3.txt')]
    sorted_paths = ph.sort_paths(paths)
    
    assert sorted_paths == [Path('folder1/file1.txt'), Path('folder1/subfolder/file3.txt'), Path('folder2/file2.txt')]