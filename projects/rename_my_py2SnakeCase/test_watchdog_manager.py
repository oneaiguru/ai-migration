# /Users/m/git/tools/rename_my_py2SnakeCase/test_watchdog_manager.py

import unittest
from unittest.mock import patch, MagicMock
import tempfile
from pathlib import Path
from watchdog_manager import WatchdogManager
import subprocess

class TestWatchdogManager(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for config and scripts
        self.temp_dir = tempfile.TemporaryDirectory()
        self.config_path = Path(self.temp_dir.name) / "watchdog_config.json"
        self.watch_downloads_path = Path(self.temp_dir.name) / "watch_downloads.py"
        self.readme_path = Path(self.temp_dir.name) / "readme.py"
        self.showall_path = Path(self.temp_dir.name) / "showall.py"

        # Create empty script files
        self.watch_downloads_path.touch()
        self.readme_path.touch()
        self.showall_path.touch()

        self.manager = WatchdogManager(self.config_path)
        
    def tearDown(self):
        self.temp_dir.cleanup()
        
    def test_add_script(self):
        with patch('watchdog_manager.subprocess.Popen') as mock_popen:
            mock_process = MagicMock()
            mock_process.pid = 1234
            mock_popen.return_value = mock_process

            script_path = self.readme_path
            self.manager.add_script("readme_script", script_path)

            self.assertIn("readme_script", self.manager.scripts)
            self.assertEqual(self.manager.scripts["readme_script"]["path"], str(script_path))
            self.assertTrue(self.manager.scripts["readme_script"]["enabled"])
            mock_popen.assert_called_with(
                [subprocess.sys.executable, str(script_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        
    def test_remove_script(self):
        with patch('watchdog_manager.subprocess.Popen') as mock_popen:
            mock_process = MagicMock()
            mock_process.pid = 1234
            mock_popen.return_value = mock_process

            script_path = self.readme_path
            self.manager.add_script("readme_script", script_path)
            self.manager.remove_script("readme_script")

            self.assertNotIn("readme_script", self.manager.scripts)
        
    def test_start_script_already_running(self):
        with patch('watchdog_manager.subprocess.Popen') as mock_popen:
            mock_process = MagicMock()
            mock_process.pid = 1234
            self.manager.scripts = {
                "readme_script": {
                    "path": str(self.readme_path),
                    "enabled": True,
                    "pid": 1234
                }
            }
            with patch('watchdog_manager.psutil.Process') as mock_psutil:
                mock_psutil.return_value.is_running.return_value = True
                result = self.manager.start_script("readme_script")
                self.assertTrue(result)
                mock_popen.assert_not_called()
        
    def test_stop_script(self):
        with patch('watchdog_manager.psutil.Process') as mock_psutil:
            mock_process = MagicMock()
            mock_process.is_running.return_value = True
            self.manager.scripts = {
                "readme_script": {
                    "path": str(self.readme_path),
                    "enabled": True,
                    "pid": 1234
                }
            }
            mock_psutil.return_value = mock_process
            result = self.manager.stop_script("readme_script")
            self.assertTrue(result)
            mock_process.terminate.assert_called_once()
            mock_process.wait.assert_called_once_with(timeout=5)
            self.assertIsNone(self.manager.scripts["readme_script"]["pid"])
        
    def test_is_running(self):
        with patch('watchdog_manager.psutil.Process') as mock_psutil:
            mock_process = MagicMock()
            mock_process.is_running.return_value = True
            self.manager.scripts = {
                "readme_script": {
                    "path": str(self.readme_path),
                    "enabled": True,
                    "pid": 1234
                }
            }
            mock_psutil.return_value = mock_process
            self.assertTrue(self.manager.is_running("readme_script"))
        
    def test_start_all_enabled(self):
        with patch('watchdog_manager.subprocess.Popen') as mock_popen:
            mock_process = MagicMock()
            mock_process.pid = 1234
            mock_popen.return_value = mock_process

            self.manager.scripts = {
                "rename_py_files": {
                    "path": str(self.watch_downloads_path),
                    "enabled": True,
                    "pid": None
                },
                "readme_script": {
                    "path": str(self.readme_path),
                    "enabled": True,
                    "pid": None
                },
                "showall_script": {
                    "path": str(self.showall_path),
                    "enabled": False,
                    "pid": None
                }
            }

            self.manager.start_all_enabled()
            mock_popen.assert_any_call(
                [subprocess.sys.executable, str(self.watch_downloads_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            mock_popen.assert_any_call(
                [subprocess.sys.executable, str(self.readme_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.assertEqual(self.manager.scripts["rename_py_files"]["pid"], 1234)
            self.assertEqual(self.manager.scripts["readme_script"]["pid"], 1234)
            self.assertIsNone(self.manager.scripts["showall_script"]["pid"])

if __name__ == '__main__':
    unittest.main()
