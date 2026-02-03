import pytest
from pathlib import Path
from unittest.mock import Mock, patch
from rich.console import Console
from rich.table import Table
from src.fileselect.displays.console import clear_screen, display_help
from src.fileselect.displays.base import BaseDisplay, BaseTable

@pytest.fixture
def mock_console(mocker):
    console = Mock(spec=Console)
    console.print = Mock()
    return console

class TestBaseTable:
    @pytest.fixture
    def base_table(self, tmp_path, mock_console):
        class TestTable(BaseTable):
            def add_header(self):
                self.table.add_column("Test")

        table = TestTable(root_dir=tmp_path)
        table.console = mock_console
        return table

    def test_create_and_render_table(self, base_table, mock_console):
        """Test table creation and rendering"""
        base_table.create_table()
        base_table.add_row("test", "123")
        base_table.render()

        # Verify that console.print was called with a Table object
        mock_console.print.assert_called_once()
        table = mock_console.print.call_args[0][0]
        assert isinstance(table, Table)

    def test_format_size(self, base_table):
        """Test size formatting functionality"""
        assert base_table._format_size(500) == "500.0B"
        assert base_table._format_size(1024) == "1.0KB"
        assert base_table._format_size(1024 * 1024) == "1.0MB"
        assert base_table._format_size(1024 * 1024 * 1024) == "1.0GB"

    def test_get_folder_colors(self, base_table):
        """Test that folder colors are returned"""
        colors = base_table._get_folder_colors()
        assert isinstance(colors, list)
        assert len(colors) > 0
        assert all(isinstance(color, str) for color in colors)

def test_display_help(monkeypatch, capsys):
    """Test the display_help function outputs the correct help text"""
    # Mock input to prevent blocking
    monkeypatch.setattr('builtins.input', lambda _: None)

    display_help()

    captured = capsys.readouterr()
    assert "File Selection Tool Help" in captured.out

def test_clear_screen(mocker):
    """Test that clear_screen calls the appropriate system command"""
    mock_os = mocker.patch('os.system')

    # Simulate Windows
    mock_os.return_value = 0
    with patch('os.name', 'nt'):
        clear_screen()
        mock_os.assert_called_with('cls')

    # Simulate Unix/Linux/MacOS
    mock_os.reset_mock()
    with patch('os.name', 'posix'):
        clear_screen()
        mock_os.assert_called_with('clear')