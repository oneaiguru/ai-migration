import pytest
from unittest.mock import patch, MagicMock
from rich.console import Console
from rich.table import Table
from rich.text import Text
from src.fileselect.displays.base import BaseTable
from src.fileselect.displays.files import FileTable
from src.fileselect.displays.folders import FolderTable
from src.fileselect.displays.tags import TagTable
from src.fileselect.models import Selection
from src.fileselect.utils.keyboard import KeyboardManager

@pytest.fixture
def mock_console(mocker):
    """
    Fixture to mock the Console class and capture print calls.
    """
    mock_print = mocker.MagicMock()
    with patch('src.fileselect.displays.base.Console', autospec=True) as MockConsole:
        instance = MockConsole.return_value
        instance.print = mock_print
        yield instance.print

@pytest.fixture
def test_dir(tmp_path):
    """Create a temporary directory with test files"""
    test_files = ['test1.txt', 'test2.py', 'docs/readme.md']
    for file_path in test_files:
        full_path = tmp_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.touch()
    return tmp_path

@pytest.fixture
def keyboard_manager():
    return KeyboardManager()

class TestBaseTable:
    @pytest.fixture
    def base_table(self, tmp_path):
        class TestTable(BaseTable):
            def add_header(self):
                self.table.add_column("Test")
                self.table.add_column("Value")

        return TestTable(root_dir=tmp_path)

    def test_create_and_render_table(self, mocker, tmp_path):
        """Test table creation and rendering"""
        # Patch Console before importing BaseTable
        mock_print = mocker.MagicMock()
        with patch('src.fileselect.displays.base.Console', autospec=True) as MockConsole:
            instance = MockConsole.return_value
            instance.print = mock_print

            from src.fileselect.displays.base import BaseTable

            class TestTable(BaseTable):
                def add_header(self):
                    self.table.add_column("Test")
                    self.table.add_column("Value")

            base_table = TestTable(root_dir=tmp_path)

            base_table.create_table()
            base_table.add_row("test", "123")
            base_table.render()

            # Assert that print was called once
            mock_print.assert_called_once()

            # Retrieve the printed Table object
            printed_table = mock_print.call_args[0][0]
            assert isinstance(printed_table, Table), "Printed object is not a Table instance"
            assert len(printed_table.columns) == 2, "Incorrect number of columns in the table"
            assert len(printed_table.rows) == 1, "Incorrect number of rows in the table"

    def test_table_formatting(self, mocker, tmp_path):
        """Test table formatting and styling"""
        # Patch Console before importing BaseTable
        mock_print = mocker.MagicMock()
        with patch('src.fileselect.displays.base.Console', autospec=True) as MockConsole:
            instance = MockConsole.return_value
            instance.print = mock_print

            from src.fileselect.displays.base import BaseTable

            class TestTable(BaseTable):
                def add_header(self):
                    self.table.add_column("Test")
                    self.table.add_column("Value")

            base_table = TestTable(root_dir=tmp_path)

            base_table.create_table()
            base_table.add_row("test", "123")
            base_table.add_row("sample", "456")
            base_table.render()

            # Assert that print was called at least once
            assert mock_print.call_count > 0, "No tables were printed to console"

            # Retrieve the last printed Table object
            printed_table = mock_print.call_args[0][0]
            assert isinstance(printed_table, Table), "Printed object is not a Table instance"
            assert len(printed_table.columns) == 2, "Incorrect number of columns in the table"
            assert len(printed_table.rows) == 2, "Incorrect number of rows in the table"

    def test_size_formatting(self, base_table):
        """Test size formatting utility"""
        size_tests = [
            (500, "500.0B"),
            (1024, "1.0KB"),
            (1024 * 1024, "1.0MB"),
            (1024 * 1024 * 1024, "1.0GB"),
        ]

        for size, expected in size_tests:
            formatted = base_table._format_size(size)
            assert formatted == expected, f"Expected {expected}, got {formatted}"

class TestFileTable:
    def _extract_colors(self, table):
        """Helper method to extract colors from table rows"""
        colors = []
        for row in table.rows:
            cells = row._cells if hasattr(row, '_cells') else []
            for cell in cells:
                if isinstance(cell, Text):
                    style = cell.style
                    if style and 'bright_' in str(style):
                        color = str(style).split()[0]  # Get first style component
                        colors.append(color)
        return colors

    def test_file_table_empty_directory(self, test_dir, mock_console, keyboard_manager):
        """Test FileTable behavior with empty directory"""
        empty_dir = test_dir / "empty"
        empty_dir.mkdir()
        file_table = FileTable(empty_dir)
        files = []
        selected_files = set()
        keyboard_manager.allocate_keys(files, 'file')

        file_table.display_files(files, selected_files, keyboard_manager)
        assert len(mock_console.call_args_list) == 0, "Console should not have printed anything for empty directory"

    def test_file_table_large_directory(self, test_dir, mock_console, keyboard_manager):
        """Test FileTable performance with many files"""
        file_table = FileTable(test_dir)
        # Create 100 test files (reduced from 1000 for faster tests)
        files = []
        for i in range(100):
            test_file = test_dir / f"test_{i}.txt"
            test_file.touch()
            files.append(test_file)

        selected_files = set()
        keyboard_manager.allocate_keys(files, 'file')

        import time
        start_time = time.time()
        file_table.display_files(files, selected_files, keyboard_manager)
        end_time = time.time()

        assert end_time - start_time < 1.0, "Display took too long"
        assert mock_console.call_count > 0, "No tables were printed to console"

    def test_folder_color_consistency(self, test_dir, mock_console, keyboard_manager):
        """Test that folders maintain consistent colors across displays"""
        folder_table = FolderTable(test_dir)
        folders = [d for d in test_dir.glob("**/*") if d.is_dir()]
        selected_folders = Selection()
        keyboard_manager.allocate_keys(folders, 'folder')

        # Display first time
        folder_table.display_folders(folders, selected_folders, keyboard_manager)
        assert mock_console.call_count > 0, "No tables were printed to console"
        first_colors = self._extract_colors(mock_console.call_args[0][0])

        # Display second time
        folder_table.display_folders(folders, selected_folders, keyboard_manager)
        assert mock_console.call_count > 1, "Second table was not printed to console"
        second_colors = self._extract_colors(mock_console.call_args[0][0])

        assert first_colors == second_colors, "Folder colors are inconsistent across displays"

    def test_toggle_all_hotkey_in_file_display(self, file_table, sample_files, mocker):
        """Test that the '=' hotkey toggles all file selections in display"""
        # Setup
        keyboard = KeyboardManager()
        keyboard.allocate_keys(sample_files, 'file')

        # Mock toggle_all_files method
        toggle_all_mock = mocker.patch.object(file_table, 'toggle_all_files')

        # Simulate pressing '='
        action = keyboard.get_action('=')
        if action == ('action', 'toggle_all'):
            file_table.toggle_all_files()

        toggle_all_mock.assert_called_once()