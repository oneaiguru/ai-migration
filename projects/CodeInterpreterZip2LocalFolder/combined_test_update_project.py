import unittest
import os
import shutil
import zipfile
import importlib
import json
from pathlib import Path

# Paths for stable test directories
stable_test_project_dir = "/tmp/stable_test_project"
stable_test_downloads_dir = "/tmp/stable_test_downloads"

def reset_test_environment():
    """Reset the project and downloads directories."""
    shutil.rmtree(stable_test_project_dir, ignore_errors=True)
    shutil.rmtree(stable_test_downloads_dir, ignore_errors=True)
    os.makedirs(stable_test_project_dir, exist_ok=True)
    os.makedirs(stable_test_downloads_dir, exist_ok=True)

    # Recreate test.zip and empty.zip in the stable downloads directory
    with zipfile.ZipFile(os.path.join(stable_test_downloads_dir, "test.zip"), "w") as zf:
        zf.writestr("file1.txt", "updated content of file1")
        zf.writestr("file3.txt", "new content of file3")

    with zipfile.ZipFile(os.path.join(stable_test_downloads_dir, "empty.zip"), "w") as zf:
        pass

def prioritize_zip_file(file_name):
    """Ensure the specified ZIP file is the latest by updating its modification time."""
    file_path = os.path.join(stable_test_downloads_dir, file_name)
    os.utime(file_path, None)  # Update modification time

class TestUpdateProjectPreserve(unittest.TestCase):
    def setUp(self):
        """Set up test environment and reset project directory."""
        reset_test_environment()

        # Prepare project directory with initial files
        with open(os.path.join(stable_test_project_dir, "file1.txt"), "w") as f:
            f.write("original content of file1")
        with open(os.path.join(stable_test_project_dir, "file2.txt"), "w") as f:
            f.write("original content of file2")

        # Create config.json with both paths
        self.config_path = os.path.join("/tmp", "config.json")
        config_data = {
            "project_root": stable_test_project_dir,
            "downloads_dir": stable_test_downloads_dir
        }
        with open(self.config_path, "w") as f:
            import json
            json.dump(config_data, f)

    def tearDown(self):
        """Ensure the project directory is reset after each test."""
        reset_test_environment()

    def test_update_preserve_behavior(self):
        """Test that files not in ZIP are preserved, and existing ones are replaced."""
        # Set the module to test the preserve behavior
        os.environ["SCRIPT_TO_TEST"] = "update_project_preserve"
        script_to_test = importlib.import_module(os.environ["SCRIPT_TO_TEST"]).update_project

        # Prioritize `test.zip` for this test
        prioritize_zip_file("test.zip")

        # Run the script with the config path
        script_to_test(config_path=self.config_path)

        # Validate outcomes
        file1_path = os.path.join(stable_test_project_dir, "file1.txt")
        with open(file1_path, "r") as f:
            file1_content = f.read()
            self.assertEqual(file1_content, "updated content of file1")  # Updated

        file2_path = os.path.join(stable_test_project_dir, "file2.txt")
        with open(file2_path, "r") as f:
            file2_content = f.read()
            self.assertEqual(file2_content, "original content of file2")  # Preserved

        file3_path = os.path.join(stable_test_project_dir, "file3.txt")
        with open(file3_path, "r") as f:
            file3_content = f.read()
            self.assertEqual(file3_content, "new content of file3")  # Added

    def test_edge_case_empty_zip(self):
        """Test behavior with an empty ZIP file."""
        # Set the module to test the preserve behavior
        os.environ["SCRIPT_TO_TEST"] = "update_project_preserve"
        script_to_test = importlib.import_module(os.environ["SCRIPT_TO_TEST"]).update_project

        # Prioritize `empty.zip` for this test
        prioritize_zip_file("empty.zip")

        # Run the script with the config path
        script_to_test(config_path=self.config_path)

        # Validate that nothing changes
        file1_path = os.path.join(stable_test_project_dir, "file1.txt")
        with open(file1_path, "r") as f:
            file1_content = f.read()
            self.assertEqual(file1_content, "original content of file1")

        file2_path = os.path.join(stable_test_project_dir, "file2.txt")
        with open(file2_path, "r") as f:
            file2_content = f.read()
            self.assertEqual(file2_content, "original content of file2")

        file3_path = os.path.join(stable_test_project_dir, "file3.txt")
        self.assertFalse(os.path.exists(file3_path))

    def test_exclude_macos_and_pycache_folders(self):
        """Test that __MACOSX and __pycache__ folders are excluded during ZIP extraction."""
        # Completely clear the project directory before test
        for existing_file in os.listdir(stable_test_project_dir):
            file_path = os.path.join(stable_test_project_dir, existing_file)
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)

        # Create a test ZIP with unwanted folders and files
        test_zip_path = os.path.join(stable_test_downloads_dir, "complex_test.zip")
        with zipfile.ZipFile(test_zip_path, "w") as zf:
            # Regular files and directories
            zf.writestr("main.py", "print('Hello World')")
            zf.writestr("src/utils.py", "def helper(): pass")
            zf.writestr("docs/", "")  # Empty directory
            
            # macOS metadata files and folders
            zf.writestr("__MACOSX/some_file.txt", "macOS metadata")
            zf.writestr("__MACOSX/src/._utils.py", "macOS resource fork")
            zf.writestr("._hidden_file.txt", "macOS hidden file")
            zf.writestr("src/._another_hidden.txt", "nested macOS file")
            
            # Python cache folders at different levels
            zf.writestr("__pycache__/main.cpython-39.pyc", b'\x00\x00\x00\x00')
            zf.writestr("src/__pycache__/utils.cpython-39.pyc", b'\x00\x00\x00\x00')
            zf.writestr("src/submodule/__pycache__/core.cpython-39.pyc", b'\x00\x00\x00\x00')
        
        # Update config to use this ZIP
        with open(self.config_path, "w") as f:
            import json
            config_data = {
                "project_root": stable_test_project_dir,
                "downloads_dir": stable_test_downloads_dir
            }
            json.dump(config_data, f)
        
        # Prioritize the complex test ZIP
        prioritize_zip_file("complex_test.zip")
        
        # Set the module to test the preserve behavior
        os.environ["SCRIPT_TO_TEST"] = "update_project_from_zip"
        script_to_test = importlib.import_module(os.environ["SCRIPT_TO_TEST"]).update_project
        
        # Run the script
        script_to_test(config_path=self.config_path)
        
        # Verify only expected files were extracted
        expected_files = {"main.py", "src", "docs"}
        extracted_files = set(os.listdir(stable_test_project_dir))
        self.assertEqual(extracted_files, expected_files)
        
        # Verify src directory contents
        src_files = set(os.listdir(os.path.join(stable_test_project_dir, "src")))
        self.assertEqual(src_files, {"utils.py"})
        
        # Verify no unwanted files or directories exist
        unwanted_paths = [
            os.path.join(stable_test_project_dir, "__MACOSX"),
            os.path.join(stable_test_project_dir, "__pycache__"),
            os.path.join(stable_test_project_dir, "._hidden_file.txt"),
            os.path.join(stable_test_project_dir, "src", "._another_hidden.txt"),
            os.path.join(stable_test_project_dir, "src", "__pycache__"),
            os.path.join(stable_test_project_dir, "src", "submodule", "__pycache__")
        ]
        for path in unwanted_paths:
            self.assertFalse(os.path.exists(path), f"Unwanted path exists: {path}")

    def test_directory_structure_preservation(self):
        """Test that the directory structure is properly preserved during extraction."""
        # Create a test ZIP with nested directories
        test_zip_path = os.path.join(stable_test_downloads_dir, "nested_dirs.zip")
        with zipfile.ZipFile(test_zip_path, "w") as zf:
            zf.writestr("src/", "")
            zf.writestr("src/module1/", "")
            zf.writestr("src/module1/code.py", "print('test')")
            zf.writestr("src/module2/submodule/deep/file.txt", "content")
            zf.writestr("empty_dir/", "")
            
        # Update config and run test
        with open(self.config_path, "w") as f:
            json.dump({
                "project_root": stable_test_project_dir,
                "downloads_dir": stable_test_downloads_dir
            }, f)
            
        prioritize_zip_file("nested_dirs.zip")
        
        os.environ["SCRIPT_TO_TEST"] = "update_project_from_zip"
        script_to_test = importlib.import_module(os.environ["SCRIPT_TO_TEST"]).update_project
        script_to_test(config_path=self.config_path)
        
        # Verify directory structure
        self.assertTrue(os.path.isdir(os.path.join(stable_test_project_dir, "src")))
        self.assertTrue(os.path.isdir(os.path.join(stable_test_project_dir, "src", "module1")))
        self.assertTrue(os.path.isfile(os.path.join(stable_test_project_dir, "src", "module1", "code.py")))
        self.assertTrue(os.path.isdir(os.path.join(stable_test_project_dir, "empty_dir")))
        self.assertTrue(os.path.isfile(os.path.join(stable_test_project_dir, "src", "module2", "submodule", "deep", "file.txt")))

if __name__ == "__main__":
    unittest.main()
